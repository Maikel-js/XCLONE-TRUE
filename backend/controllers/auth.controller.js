const authService = require('../services/auth.service');
const userService = require('../services/user.service');

async function me(req, res) {
    try {
        const user = await userService.getUserById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const { passwordHash, ...publicUser } = user;
        return res.status(200).json(publicUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al validar sesión' });
    }
}

async function register(req, res) {

    const { username, email, displayName, password } = req.body;

    if (
        typeof username !== 'string' ||
        typeof email !== 'string' ||
        typeof displayName !== 'string' ||
        typeof password !== 'string'
    ) {
        return res.status(400).json({
            error: 'Username, email y password son requeridos'
        });
    }

    try {

        const user = await authService.register({
            username,
            email,
            displayName,
            password
        });

        const { passwordHash, ...publicUser } = user;

        return res.status(201).json(publicUser);

    } catch (error) {

        console.error(error);

        if (error.message === 'Email already in use') {
            return res.status(409).json({
                error: error.message
            });
        }

        return res.status(500).json({
            error: error.message
        });
    }
}


async function login(req, res) {

    const identifier = req.body.identifier || req.body.email;
    const { password } = req.body;

    if (
        typeof identifier !== 'string' ||
        typeof password !== 'string'
    ) {
        return res.status(400).json({
            error: 'Email o username y password son requeridos'
        });
    }

    try {

        const token = await authService.login(
            identifier,
            password
        );

        return res.status(200).json({
            token
        });

    } catch (error) {

        if (error.message === 'Invalid credentials') {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        return res.status(500).json({
            error: error.message
        });
    }
}


module.exports = {
    register,
    login,
    me
};
