const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/auth');
const footprintRoutes = require('./routes/footprints');
const goalRoutes = require('./routes/goals');
const challengeRoutes = require('./routes/challenges');
const badgeRoutes = require('./routes/badges');
const ocrRoutes = require('./routes/ocr');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow any client (React Vite) to connect
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body-parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing Middleware
app.use('/api/auth', authRoutes);
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

// Start Express Listener
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  EcoLens AI Backend running on port ${PORT} `);
  console.log(`=========================================`);
});
