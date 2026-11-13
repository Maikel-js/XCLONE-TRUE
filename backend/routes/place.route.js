const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { searchPlaces } = require('../controllers/place.controller');

router.get('/search', authMiddleware, searchPlaces);

module.exports = router;