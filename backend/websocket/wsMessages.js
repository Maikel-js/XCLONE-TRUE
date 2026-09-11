function envelope(type, payload) {
    return {
        type,
        payload,
        ts: new Date().toISOString()
    };
}

module.exports = { envelope };
