const express = require('express');

const router = express.Router();

router.post('/register', require('../controllers/auth.controller').register);

router.post('/login', require('../controllers/auth.controller').login);

module.exports = router;