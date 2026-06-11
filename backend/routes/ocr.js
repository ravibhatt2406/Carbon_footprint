const express = require('express');
const multer = require('multer');
const ocrController = require('../controllers/ocrController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.use(authMiddleware);

router.post('/parse', upload.single('file'), ocrController.parse);

module.exports = router;
