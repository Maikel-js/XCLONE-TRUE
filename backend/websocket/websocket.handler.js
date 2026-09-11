const registry = require('./wsRegistry');
const heartbeat = require('./wsHeartbeat');
const { envelope } = require('./wsMessages');

function send(ws, type, payload) {
    try {
        ws.send(JSON.stringify(envelope(type, payload)));
    } catch (e) {
        console.error('[ws] fallo al serializar/enviar:', e.message);
    }
}

function handleConnection(ws, { userId }) {
    if (!userId) {
        ws.close(1008, 'userId requerido');
        return;
    }

    registry.add(userId, ws);
    heartbeat.start(ws);

    console.log(`[ws] conectado userId=${userId} (total=${registry.stats().sockets})`);

    send(ws, 'connection.ready', { userId });

    ws.on('message', (data) => {
        let message;
        try {
            message = JSON.parse(data.toString());
        } catch (_) {
            send(ws, 'error', { reason: 'JSON inválido' });
            return;
        }

        if (!message || typeof message !== 'object' || typeof message.type !== 'string') {
            send(ws, 'error', { reason: 'Envelope inválido' });
            return;
        }

        if (message.type === 'ping') {
            send(ws, 'pong', { ts: Date.now() });
            return;
        }

        send(ws, 'error', { reason: `Tipo no soportado: ${message.type}` });
    });

    ws.on('close', (code, reason) => {
        registry.remove(userId, ws);
        console.log(`[ws] desconectado userId=${userId} code=${code} (total=${registry.stats().sockets})`);
    });

    ws.on('error', (error) => {
        console.error(`[ws] error userId=${userId}:`, error.message);
    });
}

module.exports = { handleConnection };
