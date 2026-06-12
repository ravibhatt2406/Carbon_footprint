const jwt = require('jsonwebtoken');
const { auth: firebaseAuth, useSimulation } = require('../config/firebase');
const dbMock = require('../utils/dbMock');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && useSimulation) {
  console.warn('[SECURITY WARNING] JWT_SECRET not set in environment. Using insecure default for simulation mode only.');
}

/**
 * Authentication middleware. Validates JWT (simulation mode) or Firebase ID token.
 * Attaches req.user with uid, email, displayName.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header is missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    if (useSimulation) {
      // Simulation Mode: Verify custom JWT
      const secret = JWT_SECRET || 'ecolens_dev_only_secret';
      try {
        const decoded = jwt.verify(token, secret);
        
        // Find user in dbMock
        const user = dbMock.findOne('users', u => u.id === decoded.uid);
        if (!user) {
          return res.status(401).json({ error: 'User not found in simulated database' });
        }

        req.user = {
          uid: user.id,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          simulation: true
        };
        return next();
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired simulation token' });
      }
    } else {
      // Firebase Mode: Verify Firebase ID Token
      if (!JWT_SECRET) {
        console.error('[SECURITY] JWT_SECRET must be set in production mode');
      }
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name || decodedToken.email.split('@')[0],
          simulation: false
        };
        return next();
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired Firebase ID token', details: err.message });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server authorization error' });
  }
};
