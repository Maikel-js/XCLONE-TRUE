const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', require('../controllers/auth.controller').register);

router.post('/login', require('../controllers/auth.controller').login);

router.get('/me', authMiddleware, require('../controllers/auth.controller').me);

module.exports = router;