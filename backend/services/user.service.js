const prisma = require('../lib/prismaClient');
const bcrypt = require('bcrypt');
const { encodeCursor, decodeCursor } = require('../lib/cursor');
const {
    emitUserCreated,
    emitUserUpdated,
    emitUserDeleted
} = require('../websocket/wsEvents');

const PUBLIC_USER_SELECT = {
    id: true,
    username: true,
    email: true,
    displayName: true,
    bio: true,
    avatar: true,
    createdAt: true
};

async function getUserById(userId) {

    return await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
}

async function getUserProfile(userId, viewerId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: PUBLIC_USER_SELECT
    });
    if (!user) return null;
    const counts = await getUserFollowCounts(userId);
    const following = await isFollowing(viewerId, userId);
    return { ...user, ...counts, following };
}

async function searchUsers(q, limit = 20) {
    if (!q || !q.trim()) return [];
    const term = q.trim();
    return prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: term, mode: 'insensitive' } },
                { displayName: { contains: term, mode: 'insensitive' } }
            ]
        },
        select: PUBLIC_USER_SELECT,
        take: Math.min(Math.max(limit || 20, 1), 50),
        orderBy: [{ displayName: 'asc' }]
    });
}

async function getUserPosts(userId, { cursor, limit = 20, viewerId } = {}) {
    let decoded = null;
    if (cursor) {
        try {
            decoded = decodeCursor(cursor);
        } catch (_) {
            throw new Error('Cursor invalido');
        }
    }

    let where = { authorId: userId };
    if (decoded) {
        where = {
            AND: [
                { authorId: userId },
                {
                    OR: [
                        { createdAt: { lt: decoded.createdAt } },
                        {
                            AND: [
                                { createdAt: decoded.createdAt },
                                { id: { lt: decoded.id } }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    const rows = await prisma.post.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
        include: {
            author: { select: PUBLIC_USER_SELECT },
            _count: { select: { likes: true } }
        }
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    let likedSet = new Set();
    if (page.length > 0 && viewerId) {
        const myLikes = await prisma.like.findMany({
            where: { userId: viewerId, postId: { in: page.map((p) => p.id) } },
            select: { postId: true }
        });
        likedSet = new Set(myLikes.map((l) => l.postId));
    }

    const items = page.map((p) => ({
        id: p.id,
        content: p.content,
        createdAt: p.createdAt,
        authorId: p.authorId,
        author: {
            id: p.author.id,
            username: p.author.username,
            displayName: p.author.displayName,
            avatar: p.author.avatar
        },
        likesCount: p._count.likes,
        likedByMe: likedSet.has(p.id)
    }));

    const nextCursor = hasMore
        ? encodeCursor({
            createdAt: page[page.length - 1].createdAt,
            id: page[page.length - 1].id
        })
        : null;

    return { items, nextCursor };
}

async function getUserFollowCounts(userId) {
    const [followers, followingCount, posts] = await Promise.all([
        prisma.follow.count({ where: { followingId: userId } }),
        prisma.follow.count({ where: { followerId: userId } }),
        prisma.post.count({ where: { authorId: userId } })
    ]);
    return { followers, followingCount, posts };
}

async function isFollowing(followerId, followingId) {
    if (!followerId || !followingId) return false;
    const row = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } }
    });
    return !!row;
}

async function getSuggestedUsers(viewerId, limit = 10) {
    const excludedIds = [];
    if (viewerId) excludedIds.push(viewerId);

    let followingIds = [];
    if (viewerId) {
        const rows = await prisma.follow.findMany({
            where: { followerId: viewerId },
            select: { followingId: true }
        });
        followingIds = rows.map((r) => r.followingId);
        excludedIds.push(...followingIds);
    }

    const users = await prisma.user.findMany({
        where: {
            id: excludedIds.length ? { notIn: excludedIds } : undefined
        },
        select: PUBLIC_USER_SELECT,
        take: Math.min(Math.max(limit || 10, 1), 50),
        orderBy: { createdAt: 'desc' }
    });

    if (users.length === 0) return [];

    const counts = await Promise.all(
        users.map((u) => prisma.follow.count({ where: { followingId: u.id } }))
    );

    return users
        .map((u, i) => ({ ...u, followers: counts[i] }))
        .sort((a, b) => b.followers - a.followers);
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
    getUserProfile,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getUserPosts,
    getUserFollowCounts,
    isFollowing,
    getSuggestedUsers
};