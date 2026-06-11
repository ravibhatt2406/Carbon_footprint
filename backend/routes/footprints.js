const express = require('express');
const footprintController = require('../controllers/footprintController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', footprintController.create);
router.get('/history', footprintController.getHistory);
router.get('/summary', footprintController.getSummary);

module.exports = router;
