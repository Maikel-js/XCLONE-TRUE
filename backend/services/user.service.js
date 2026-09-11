const prisma = require('../lib/prismaClient');
const bcrypt = require('bcrypt');
const {
    emitUserCreated,
    emitUserUpdated,
    emitUserDeleted
} = require('../websocket/wsEvents');

async function getUserById(userId) {

    return await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
}

async function createUser(userData) {

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const newUser = await prisma.user.create({
        data: {
            username: userData.username,
            email: userData.email,
            displayName: userData.displayName,
            passwordHash: passwordHash
        }
    });

    try {
        emitUserCreated({
            userId: newUser.id,
            username: newUser.username,
            displayName: newUser.displayName,
            bio: newUser.bio,
            avatar: newUser.avatar
        });
    } catch (e) {
        console.error('[user] fallo al emitir notificacion WS:', e.message);
    }

    return newUser;
}


async function updateUser(userId, userData) {

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: userData
    });

    try {
        emitUserUpdated({
            userId: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            displayName: updatedUser.displayName,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar
        });
    } catch (e) {
        console.error('[user] fallo al emitir notificacion WS:', e.message);
    }

    return updatedUser;
}

async function deleteUser(userId) {
    const deletedUser = await prisma.user.delete({
        where: {
            id: userId
        }
    });

    try {
        emitUserDeleted({ userId: deletedUser.id });
    } catch (e) {
        console.error('[user] fallo al emitir notificacion WS:', e.message);
    }

    return deletedUser;
}

module.exports = {
    getUserById,
    createUser,
    updateUser,
    deleteUser
};