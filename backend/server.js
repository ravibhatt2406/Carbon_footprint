const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/auth');
const footprintRoutes = require('./routes/footprints');
const goalRoutes = require('./routes/goals');
const challengeRoutes = require('./routes/challenges');
const badgeRoutes = require('./routes/badges');
const ocrRoutes = require('./routes/ocr');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security: HTTP headers hardening
app.use(helmet());

// Security: Rate limiting — general API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(generalLimiter);

// Security: Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Enable CORS with explicit origins
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body-parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Routing Middleware
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/footprints', authRoutes); // Ensure compatibility with auth profile routes
app.use('/api/footprint-logs', footprintRoutes); // Main footprint tracker routes
app.use('/api/goals', goalRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/ocr', ocrRoutes);

// Health check and environment state status
app.get('/health', (req, res) => {
  const { useSimulation } = require('./config/firebase');
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    simulationMode: useSimulation,
    environment: {
      firebaseProject: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'missing (simulation fallback)',
      geminiKey: process.env.GEMINI_API_KEY ? 'configured' : 'missing (simulation fallback)'
    }
  });
});

// Centralized error handler (must be last middleware)
app.use(errorHandler);

// Start Express Listener
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  EcoLens AI Backend running on port ${PORT} `);
    console.log(`=========================================`);
  });
}

module.exports = app;
