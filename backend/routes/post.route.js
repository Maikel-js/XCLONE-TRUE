const express = require('express');
const router = express.Router();

const postController = require('../controllers/post.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const { uploadPostImage } = require('../middlewares/upload.middleware')

router.get('/:id', postController.getPostById);

router.post('/', authMiddleware, uploadPostImage, postController.createPost);

router.patch('/:id', authMiddleware, postController.updatePost);

router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;