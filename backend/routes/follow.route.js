const express = require('express')
const router = express.Router()

const followController = require('../controllers/follow.controller')

const authMiddleware = require('../middlewares/auth.middleware')

router.post('/follow', authMiddleware, followController.followUser)

router.post('/unfollow', authMiddleware, followController.unfollowUser)

module.exports = router