const userService = require('../services/user.service');

const usernameRegex = /^[a-zA-Z0-9_]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


async function getUserById(req, res) {

    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({
            error: 'ID del usuario no proporcionado'
        });
    }

    try {

        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        const { passwordHash, ...publicUser } = user;

        return res.status(200).json(publicUser);

    } catch (error) {

        return res.status(500).json({
            error: 'Error al obtener el usuario'
        });

    }
}


async function createUser(req, res) {

    const userData = req.body;

    if (!userData || Object.keys(userData).length === 0) {
        return res.status(400).json({
            error: 'Datos del usuario no proporcionados'
        });
    }

    const { username, email, displayName, password } = userData;

    if (
        typeof username !== 'string' ||
        typeof email !== 'string' ||
        typeof displayName !== 'string' ||
        typeof password !== 'string'
    ) {
        return res.status(400).json({
            error: 'Los datos del usuario tienen un formato inválido'
        });
    }

    if (
        username.length < 3 ||
        username.length > 10 ||
        !usernameRegex.test(username)
    ) {
        return res.status(400).json({
            error: 'El nombre de usuario debe tener entre 3 y 10 caracteres y solo puede contener letras, números y _'
        });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'El correo electrónico no es válido'
        });
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
        });
    }

    const allowedUserData = {
        username,
        email,
        displayName,
        password
    };

    try {

        const newUser = await userService.createUser(allowedUserData);

        const { passwordHash, ...publicUser } = newUser;

        return res.status(201).json(publicUser);

    } catch (error) {

        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'El username o email ya está registrado'
            });
        }

        return res.status(500).json({
            error: 'Error al crear el usuario'
        });

    }
}


async function updateUser(req, res) {

    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({
            error: 'ID del usuario no proporcionado'
        });
    }

    const userData = req.body;

    if (!userData || Object.keys(userData).length === 0) {
        return res.status(400).json({
            error: 'Datos del usuario no proporcionados'
        });
    }

    const allowedFields = [
        'username',
        'email',
        'displayName',
        'bio',
        'avatar'
    ];

    const receivedFields = Object.keys(userData);

    const invalidFields = receivedFields.filter(
        field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        return res.status(400).json({
            error: 'Se intentaron modificar campos no permitidos',
            fields: invalidFields
        });
    }

    const updateData = {};

    for (const field of allowedFields) {

        if (userData[field] !== undefined) {
            updateData[field] = userData[field];
        }

    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
            error: 'No se proporcionaron campos válidos para actualizar'
        });
    }

    if (updateData.username !== undefined) {

        if (
            typeof updateData.username !== 'string' ||
            updateData.username.length < 3 ||
            updateData.username.length > 10 ||
            !usernameRegex.test(updateData.username)
        ) {
            return res.status(400).json({
                error: 'El nombre de usuario no es válido'
            });
        }

    }

    if (updateData.email !== undefined) {

        if (
            typeof updateData.email !== 'string' ||
            !emailRegex.test(updateData.email)
        ) {
            return res.status(400).json({
                error: 'El correo electrónico no es válido'
            });
        }

    }

    if (updateData.displayName !== undefined) {

        if (typeof updateData.displayName !== 'string') {
            return res.status(400).json({
                error: 'El nombre de display debe ser un texto'
            });
        }

    }

    if (updateData.bio !== undefined) {

        if (typeof updateData.bio !== 'string') {
            return res.status(400).json({
                error: 'La biografía debe ser un texto'
            });
        }

    }

    if (updateData.avatar !== undefined) {

        if (typeof updateData.avatar !== 'string') {
            return res.status(400).json({
                error: 'El avatar debe ser un texto'
            });
        }

    }

    try {

        const updatedUser = await userService.updateUser(
            userId,
            updateData
        );

        const { passwordHash, ...publicUser } = updatedUser;

        return res.status(200).json(publicUser);

    } catch (error) {

        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'El username o email ya está registrado'
            });
        }

        return res.status(500).json({
            error: 'Error al actualizar el usuario'
        });

    }
}


async function deleteUser(req, res) {

    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({
            error: 'ID del usuario no proporcionado'
        });
    }

    try {

        await userService.deleteUser(userId);

        return res.status(200).json({
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {

        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        return res.status(500).json({
            error: 'Error al eliminar el usuario'
        });

    }
}


module.exports = {
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
