const likeService = require('../services/like.service')

function likePost(req, res) {
    const { postId } = req.body
    const userId = req.userId

    if (!postId) {
        return res.status(400).json({ message: 'postId es requerido' })
    }

    likeService.likePost(postId, userId)
        .then(() => {
            res.status(200).json({ message: 'Post liked successfully' })
        })
        .catch((error) => {
            const msg = error.message
            if (msg === 'User not found' || msg === 'Post not found') {
                return res.status(404).json({ message: msg })
            }
            if (msg === 'User has already liked this post') {
                return res.status(409).json({ message: msg })
            }
            res.status(500).json({ message: msg })
        })
}

function unlikePost(req, res) {
    const { postId } = req.body
    const userId = req.userId

    if (!postId) {
        return res.status(400).json({ message: 'postId es requerido' })
    }

    likeService.unlikePost(postId, userId)
        .then(() => {
            res.status(200).json({ message: 'Post unliked successfully' })
        })
        .catch((error) => {
            const msg = error.message
            if (msg === 'User not found' || msg === 'Post not found') {
                return res.status(404).json({ message: msg })
            }
            if (msg === 'User has not liked this post') {
                return res.status(404).json({ message: msg })
            }
            res.status(500).json({ message: msg })
        })
}

module.exports = {
    likePost,
    unlikePost
}
