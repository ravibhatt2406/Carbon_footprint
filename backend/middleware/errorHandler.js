/**
 * Centralized error handling middleware.
 * Catches unhandled errors, logs them server-side,
 * and returns a sanitized response to the client.
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log full error server-side for debugging
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed by CORS policy' });
  }

  // Multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File size exceeds the 5MB limit' });
  }

  // Multer unexpected field errors
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field' });
  }

  // Default: return generic error (do not leak internal details)
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500
      ? 'An internal server error occurred'
      : err.message || 'An error occurred'
  });
}

module.exports = errorHandler;
