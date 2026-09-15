const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const feedController = require('../controllers/feed.controller')

router.get('/', authMiddleware, feedController.getFeed)

module.exports = router