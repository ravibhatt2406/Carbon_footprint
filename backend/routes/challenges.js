const express = require('express');
const challengeController = require('../controllers/challengeController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', challengeController.getWeekly);
router.post('/:id/complete', challengeController.complete);

module.exports = router;
