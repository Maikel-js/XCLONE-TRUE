const prisma = require('../lib/prismaClient')
const { emitFollowNotification, emitUnfollowNotification } = require('../websocket/wsEvents')

async function followUser(followerId, followingId) {
    
    if (followerId === followingId) {
        throw new Error('A user cannot follow themselves')
    }

    const follower = await prisma.user.findUnique({
        where: {
            id: followerId
        }
    })

    if (!follower) {
        throw new Error('Follower user not found')
    }

    const following = await prisma.user.findUnique({
        where: {
            id: followingId
        }
    })

    if (!following) {
        throw new Error('Following user not found')
    }

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId
            }
        }
    })

    if (existingFollow) {
        throw new Error('User is already following this user')
    }

    await prisma.follow.create({
        data: {
            followerId,
            followingId
        }
    })

    try {
        emitFollowNotification({
            followedId: followingId,
            followerId
        })
    } catch (e) {
        console.error('[follow] fallo al emitir notificacion WS:', e.message)
    }
}

async function unfollowUser(followerId, followingId) {
    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId
            }
        }
    })

    if (!existingFollow) {
        throw new Error('User is not following this user')
    }

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId,
                followingId
            }
        }
    })

    try {
        emitUnfollowNotification({
            followedId: followingId,
            followerId
        })
    } catch (e) {
        console.error('[follow] fallo al emitir notificacion WS:', e.message)
    }
}

module.exports = {
    followUser,
    unfollowUser
}