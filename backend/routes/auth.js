const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../middleware/validators');

const router = express.Router();

// Public simulation routes
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);

// Protected profile route (supports both Firebase and Simulation)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
