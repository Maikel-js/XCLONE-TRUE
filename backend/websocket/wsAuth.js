const jwt = require('jsonwebtoken');

function verifyTokenFromQuery(req) {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
        const err = new Error('Token no proporcionado');
        err.code = 'NO_TOKEN';
        throw err;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: decoded.id };
    } catch (e) {
        const err = new Error('Token inválido o expirado');
        err.code = 'INVALID_TOKEN';
        throw err;
    }
}

module.exports = { verifyTokenFromQuery };
