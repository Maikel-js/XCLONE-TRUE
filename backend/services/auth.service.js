const prisma = require('../lib/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    emitUserRegistered,
    emitUserLoggedIn
} = require('../websocket/wsEvents');

async function register(userData) {

    const existingUser = await prisma.user.findUnique({
        where: {
            email: userData.email
        }
    });

    if (existingUser) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
        data: {
            username: userData.username,
            email: userData.email,
            displayName: userData.displayName,
            passwordHash: hashedPassword
        }
    });

    try {
        emitUserRegistered({
            userId: user.id,
            username: user.username,
            displayName: user.displayName
        });
    } catch (e) {
        console.error('[auth] fallo al emitir notificacion WS:', e.message);
    }

    return user;
}


async function login(email, password) {

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    try {
        emitUserLoggedIn({
            userId: user.id,
            username: user.username
        });
    } catch (e) {
        console.error('[auth] fallo al emitir notificacion WS:', e.message);
    }

    return token;
}


module.exports = {
    register,
    login
};