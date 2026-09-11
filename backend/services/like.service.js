const prisma = require('../lib/prismaClient');
const { emitLikeNotification, emitUnlikeNotification } = require('../websocket/wsEvents');

async function likePost(postId, userId) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const post = await prisma.post.findUnique({
        where: {
            id: postId
        }
    });

    if (!post) {
        throw new Error('Post not found');
    }

    const existingLike = await prisma.like.findUnique({
        where: {
            userId_postId: {
                userId,
                postId
            }
        }
    });

    if (existingLike) {
        throw new Error('User has already liked this post');
    }

    await prisma.like.create({
        data: {
            userId,
            postId
        }
    });

    try {
        emitLikeNotification({
            postAuthorId: post.authorId,
            likerId: userId,
            postId
        });
    } catch (e) {
        console.error('[like] fallo al emitir notificacion WS:', e.message);
    }
}

async function unlikePost(postId, userId) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const post = await prisma.post.findUnique({
        where: {
            id: postId
        }
    });

    if (!post) {
        throw new Error('Post not found');
    }

    const existingLike = await prisma.like.findUnique({
        where: {
            userId_postId: {
                userId,
                postId
            }
        }
    });

    if (!existingLike) {
        throw new Error('User has not liked this post');
    }

    await prisma.like.delete({
        where: {
            userId_postId: {
                userId,
                postId
            }
        }
    });

    try {
        emitUnlikeNotification({
            postAuthorId: post.authorId,
            likerId: userId,
            postId
        });
    } catch (e) {
        console.error('[like] fallo al emitir notificacion WS:', e.message);
    }
}

module.exports = {
    likePost,
    unlikePost
};