    const express = require('express');
    
    const router = express.Router();
    
    const userController = require('../controllers/user.controller');

    const authMiddleware = require('../middlewares/auth.middleware');

    router.get('/:id', userController.getUserById);
    
    router.post('/', userController.createUser);

    router.patch('/:id',authMiddleware, userController.updateUser);

    router.delete('/:id', authMiddleware, userController.deleteUser);
    
    module.exports = router;