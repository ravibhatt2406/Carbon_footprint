const express = require('express');
const goalController = require('../controllers/goalController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', goalController.create);
router.get('/', goalController.getGoals);
router.put('/:id', goalController.updateProgress);

module.exports = router;
