const jwt = require('jsonwebtoken');

function optionalAuth(req, _res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.userId = undefined;
        return next();
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        req.userId = undefined;
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
    } catch (_) {
        req.userId = undefined;
    }
    next();
}

module.exports = optionalAuth;
