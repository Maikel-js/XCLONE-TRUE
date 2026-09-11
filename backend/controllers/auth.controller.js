const authService = require('../services/auth.service');

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

    const { email, password } = req.body;

    if (
        typeof email !== 'string' ||
        typeof password !== 'string'
    ) {
        return res.status(400).json({
            error: 'Email y password son requeridos'
        });
    }

    try {

        const token = await authService.login(
            email,
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
    login
};