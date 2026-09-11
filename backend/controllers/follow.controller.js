const followService = require('../services/follow.service')

async function followUser(req, res) {
    const { followingId } = req.body
    const followerId = req.userId

    if (!followingId) {
        return res.status(400).json({ error: 'followingId es requerido' })
    }

    if (followerId === followingId) {
        return res.status(400).json({ error: 'A user cannot follow themselves' })
    }

    try {
        await followService.followUser(followerId, followingId)
        res.status(200).json({ message: 'User followed successfully' })
    } catch (error) {
        const msg = error.message
        if (msg === 'Follower user not found' || msg === 'Following user not found') {
            return res.status(404).json({ error: msg })
        }
        if (msg === 'User is already following this user') {
            return res.status(409).json({ error: msg })
        }
        res.status(500).json({ error: msg })
    }
}

async function unfollowUser(req, res) {
    const { followingId } = req.body
    const followerId = req.userId

    if (!followingId) {
        return res.status(400).json({ error: 'followingId es requerido' })
    }

    try {
        await followService.unfollowUser(followerId, followingId)
        res.status(200).json({ message: 'User unfollowed successfully' })
    } catch (error) {
        const msg = error.message
        if (msg === 'User is not following this user') {
            return res.status(404).json({ error: msg })
        }
        res.status(500).json({ error: msg })
    }
}

module.exports = {
    followUser,
    unfollowUser
}
