const express = require('express');
const badgeController = require('../controllers/badgeController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', badgeController.getBadges);

module.exports = router;
