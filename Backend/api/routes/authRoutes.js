const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const verifyToken = require('../middlewares/verifyToken');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', verifyToken, authController.getCurrentUser);

// Update user profile (protected route)
router.patch('/update-profile', verifyToken, authController.updateProfile);

module.exports = router; 