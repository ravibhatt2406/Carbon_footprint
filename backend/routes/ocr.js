const express = require('express');
const multer = require('multer');
const ocrController = require('../controllers/ocrController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/** Allowed MIME types for OCR upload security */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.'), false);
    }
  }
});

router.use(authMiddleware);

router.post('/parse', upload.single('file'), ocrController.parse);

module.exports = router;
