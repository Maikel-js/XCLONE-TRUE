const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', require('../controllers/auth.controller').register);

router.post('/login', require('../controllers/auth.controller').login);

router.get('/me', authMiddleware, require('../controllers/auth.controller').me);

router.get('/oauth/:provider', require('../controllers/oauth.controller').start);

router.get('/oauth/:provider/callback', require('../controllers/oauth.controller').callback);

module.exports = router;
