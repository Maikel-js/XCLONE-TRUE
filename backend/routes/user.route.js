    const express = require('express');
    
    const router = express.Router();
    
    const userController = require('../controllers/user.controller');

    const authMiddleware = require('../middlewares/auth.middleware');
    const optionalAuth = require('../middlewares/optionalAuth.middleware');

    router.get('/search', optionalAuth, userController.searchUsers);

    router.get('/suggestions', optionalAuth, userController.getSuggestions);

    router.get('/me', authMiddleware, userController.getCurrentUser);

    router.get('/:id/posts', optionalAuth, userController.getUserPosts);

    router.get('/:id', optionalAuth, userController.getUserById);
    
    router.post('/', userController.createUser);

    router.patch('/:id',authMiddleware, userController.updateUser);

    router.delete('/:id', authMiddleware, userController.deleteUser);
    
    module.exports = router;
