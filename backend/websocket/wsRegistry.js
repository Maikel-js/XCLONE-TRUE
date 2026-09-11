const connections = new Map();

function add(userId, ws) {
    if (!connections.has(userId)) {
        connections.set(userId, new Set());
    }
    connections.get(userId).add(ws);
}

function remove(userId, ws) {
    const set = connections.get(userId);
    if (!set) return;
    set.delete(ws);
    if (set.size === 0) {
        connections.delete(userId);
    }
}

function sendToUser(userId, message) {
    const set = connections.get(userId);
    if (!set) return 0;
    const payload = JSON.stringify(message);
    let sent = 0;
    for (const ws of set) {
        if (ws.readyState === ws.OPEN) {
            ws.send(payload);
            sent++;
        }
    }
    return sent;
}

function broadcast(message) {
    const payload = JSON.stringify(message);
    for (const set of connections.values()) {
        for (const ws of set) {
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        }
    }
}

function stats() {
    let total = 0;
    for (const set of connections.values()) total += set.size;
    return { users: connections.size, sockets: total };
}

function closeUser(userId, code = 4001, reason = '') {
    const set = connections.get(userId);
    if (!set) return 0;
    let closed = 0;
    for (const ws of set) {
        try {
            ws.close(code, reason);
            closed++;
        } catch (_) {}
    }
    connections.delete(userId);
    return closed;
}

function closeAll() {
    for (const set of connections.values()) {
        for (const ws of set) {
            try { ws.close(1001, 'Server shutting down'); } catch (_) {}
        }
    }
    connections.clear();
}

module.exports = { add, remove, sendToUser, broadcast, stats, closeUser, closeAll };
