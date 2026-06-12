const express = require('express');
const goalController = require('../controllers/goalController');
const authMiddleware = require('../middleware/auth');
const { goalValidator, goalProgressValidator } = require('../middleware/validators');

const router = express.Router();

router.use(authMiddleware);

router.post('/', goalValidator, goalController.create);
router.get('/', goalController.getGoals);
router.put('/:id', goalProgressValidator, goalController.updateProgress);

module.exports = router;
