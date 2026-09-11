const express = require("express");

const router = express.Router();

const likeController = require("../controllers/like.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.post("/like", authMiddleware, likeController.likePost);

router.post("/unlike", authMiddleware, likeController.unlikePost);

module.exports = router;