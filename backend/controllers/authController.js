const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, useSimulation } = require('../config/firebase');
const dbMock = require('../utils/dbMock');

const JWT_SECRET = process.env.JWT_SECRET || 'ecolens_secret_key_123';

const authController = {
  /**
   * Registers a new user (Simulation Mode only)
   */
  async register(req, res) {
    try {
      const { email, password, displayName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (!useSimulation) {
        return res.status(400).json({ 
          error: 'Registration through API is disabled in Firebase production mode. Register via Frontend SDK.' 
        });
      }

      // Check if user exists
      const existingUser = dbMock.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: 'A user with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = dbMock.insert('users', {
        email: email.toLowerCase(),
        password: hashedPassword,
        displayName: displayName || email.split('@')[0],
        points: 0
      });

      // Award "Beginner" badge template in db mock
      dbMock.insert('badges', {
        userId: newUser.id,
        badgeType: 'beginner',
        title: 'Eco Beginner',
        description: 'Welcome to the eco-journey!',
        unlockedAt: new Date().toISOString()
      });

      const token = jwt.sign({ uid: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: {
          uid: newUser.id,
          email: newUser.email,
          displayName: newUser.displayName,
          points: newUser.points
        }
      });
    } catch (error) {
      console.error('API Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  /**
   * Logs in a user (Simulation Mode only)
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (!useSimulation) {
        return res.status(400).json({ 
          error: 'Login through API is disabled in Firebase production mode. Log in via Frontend SDK.' 
        });
      }

      const user = dbMock.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          uid: user.id,
          email: user.email,
          displayName: user.displayName,
          points: user.points || 0
        }
      });
    } catch (error) {
      console.error('API Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  /**
   * Syncs / updates a user's details inside Firestore (Firebase Mode)
   * or retrieves current profile details (in either mode).
   */
  async getProfile(req, res) {
    try {
      const { uid, email, displayName } = req.user;

      if (useSimulation) {
        // Mock profile sync/get
        let user = dbMock.findOne('users', u => u.id === uid);
        if (!user) {
          return res.status(404).json({ error: 'User profile not found' });
        }
        return res.json({
          uid: user.id,
          email: user.email,
          displayName: user.displayName,
          points: user.points || 0
        });
      } else {
        // Firebase Firestore mode
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        let userData = {
          uid,
          email,
          displayName,
          points: 0,
          updatedAt: new Date().toISOString()
        };

        if (!userDoc.exists) {
          // Initialize user profile in Firestore
          userData.createdAt = new Date().toISOString();
          await userRef.set(userData);
          
          // Add Beginner badge
          await db.collection('badges').add({
            userId: uid,
            badgeType: 'beginner',
            title: 'Eco Beginner',
            description: 'Welcome to the eco-journey!',
            unlockedAt: new Date().toISOString()
          });
        } else {
          userData = { ...userDoc.data(), ...userData, points: userDoc.data().points || 0 };
        }

        return res.json(userData);
      }
    } catch (error) {
      console.error('Get/Sync Profile error:', error);
      res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
  }
};

module.exports = authController;
