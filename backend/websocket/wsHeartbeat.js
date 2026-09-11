const PING_INTERVAL_MS = 30_000;
const PONG_TIMEOUT_MS = 10_000;

function start(ws) {
    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    const interval = setInterval(() => {
        if (!ws.isAlive) {
            try { ws.terminate(); } catch (_) {}
            return;
        }
        ws.isAlive = false;
        try { ws.ping(); } catch (_) {}
    }, PING_INTERVAL_MS);

    const timeout = setTimeout(() => {
        if (!ws.isAlive) {
            try { ws.terminate(); } catch (_) {}
        }
    }, PONG_TIMEOUT_MS);

    ws.on('close', () => {
        clearInterval(interval);
        clearTimeout(timeout);
    });
}

module.exports = { start, PING_INTERVAL_MS, PONG_TIMEOUT_MS };
