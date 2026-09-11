const http = require('http');
const { WebSocketServer } = require('ws');

const app = require('../app');
const { handleConnection } = require('./websocket.handler');
const { verifyTokenFromQuery } = require('./wsAuth');
const registry = require('./wsRegistry');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const wss = new WebSocketServer({
    server,
    maxPayload: 64 * 1024,
    perMessageDeflate: false,
    verifyClient: ({ req }, callback) => {
        try {
            const { userId } = verifyTokenFromQuery(req);
            req.wsUserId = userId;
            callback(true);
        } catch (err) {
            callback(false, 401, err.message);
        }
    }
});

wss.on('connection', (ws, req) => {
    const userId = req.wsUserId;
    handleConnection(ws, { userId });
});

function shutdown(signal) {
    console.log(`[ws] ${signal} received, closing...`);
    registry.closeAll();
    wss.close(() => {
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 5000).unref();
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Servidor WebSocket escuchando en el puerto ${PORT}`);
    });
}

module.exports = { server, wss };
