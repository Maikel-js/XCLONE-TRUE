const prisma = require('../lib/prismaClient');
const {
    emitPostCreated,
    emitPostUpdated,
    emitPostDeleted
} = require('../websocket/wsEvents');

async function getPostById(postId) {
    const post = await prisma.post.findUnique({
        where: {
            id: postId
        }
    });
    return post;
}

async function createPost(postData) {
    const newPost = await prisma.post.create({
        data: postData
    });

    if (!newPost) {
        return null;
    }

    try {
        emitPostCreated({
            postId: newPost.id,
            authorId: newPost.authorId,
            content: newPost.content,
            createdAt: newPost.createdAt
        });
    } catch (e) {
        console.error('[post] fallo al emitir notificacion WS:', e.message);
    }

    return newPost;
}

async function updatePost(postId, postData) {
    const updatedPost = await prisma.post.update({
        where: {
            id: postId
        },
        data: postData
    });

    try {
        emitPostUpdated({
            postId: updatedPost.id,
            authorId: updatedPost.authorId,
            content: updatedPost.content,
            createdAt: updatedPost.createdAt
        });
    } catch (e) {
        console.error('[post] fallo al emitir notificacion WS:', e.message);
    }

    return updatedPost;
}

async function deletePost(postId) {
    const deletedPost = await prisma.post.delete({
        where: {
            id: postId
        }
    });

    try {
        emitPostDeleted({
            postId: deletedPost.id,
            authorId: deletedPost.authorId
        });
    } catch (e) {
        console.error('[post] fallo al emitir notificacion WS:', e.message);
    }

    return deletedPost;
}

module.exports = {
    getPostById,
    createPost,
    updatePost,
    deletePost
};