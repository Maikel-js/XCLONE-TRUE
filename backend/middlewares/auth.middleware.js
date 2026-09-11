const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {

    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            error: 'Token no proporcionado'
        });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Formato de token inválido'
        });
    }

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Token no proporcionado'
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.id;
            
        next();

    } catch (error) {
        return res.status(401).json({
            error: 'Formato de token inválido'
        });
    }
}

module.exports = authMiddleware;