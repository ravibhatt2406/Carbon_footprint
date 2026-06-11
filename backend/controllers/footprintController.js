const { db, useSimulation } = require('../config/firebase');
const dbMock = require('../utils/dbMock');
const { calculateFootprint } = require('../utils/emissionFactors');
const geminiService = require('../services/geminiService');

const footprintController = {
  /**
   * Calculates carbon footprint, requests Gemini advice, and saves the log
   */
  async create(req, res) {
    try {
      const { uid } = req.user;
      const { carKm, bikeKm, busKm, trainKm, electricityKwh, foodHabit, shoppingHabit } = req.body;

      // Validate inputs
      if (foodHabit === undefined || shoppingHabit === undefined) {
        return res.status(400).json({ error: 'Food habits and shopping habits are required fields' });
      }

      const inputs = { carKm, bikeKm, busKm, trainKm, electricityKwh, foodHabit, shoppingHabit };
      const { total, breakdown } = calculateFootprint(inputs);

      // Call Gemini for advice
      const advice = await geminiService.getCarbonAdvice(inputs, breakdown, total);

      const footprintData = {
        userId: uid,
        inputs,
        breakdown,
        total,
        advice,
        date: new Date().toISOString()
      };

      let savedRecord;

      if (useSimulation) {
        // Mock save
        savedRecord = dbMock.insert('footprints', footprintData);

        // Check for "Beginner" badge awarding if it's the first calculation
        const priorFootprints = dbMock.find('footprints', f => f.userId === uid);
        if (priorFootprints.length === 1) { // Only the newly added one exists
          const existingBadge = dbMock.findOne('badges', b => b.userId === uid && b.badgeType === 'beginner');
          if (!existingBadge) {
            dbMock.insert('badges', {
              userId: uid,
              badgeType: 'beginner',
              title: 'Eco Beginner',
              description: 'Completed your first carbon footprint calculation!',
              unlockedAt: new Date().toISOString()
            });
          }
        }
      } else {
        // Firebase Firestore save
        const ref = await db.collection('footprints').add(footprintData);
        savedRecord = { id: ref.id, ...footprintData };

        // Badge check: First footprint calculation
        const userFootprints = await db.collection('footprints').where('userId', '==', uid).limit(2).get();
        if (userFootprints.size === 1) {
          const badgesQuery = await db.collection('badges')
            .where('userId', '==', uid)
            .where('badgeType', '==', 'beginner')
            .get();

          if (badgesQuery.empty) {
            await db.collection('badges').add({
              userId: uid,
              badgeType: 'beginner',
              title: 'Eco Beginner',
              description: 'Completed your first carbon footprint calculation!',
              unlockedAt: new Date().toISOString()
            });
          }
        }
      }

      res.status(201).json(savedRecord);
    } catch (error) {
      console.error('Create footprint log error:', error);
      res.status(500).json({ error: 'Failed to record carbon footprint' });
    }
  },

  /**
   * Fetches all carbon calculation logs for the user
   */
  async getHistory(req, res) {
    try {
      const { uid } = req.user;
      let logs = [];

      if (useSimulation) {
        logs = dbMock.find('footprints', f => f.userId === uid);
        // Sort by date descending
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else {
        const snapshot = await db.collection('footprints')
          .where('userId', '==', uid)
          .orderBy('date', 'desc')
          .get();
        
        snapshot.forEach(doc => {
          logs.push({ id: doc.id, ...doc.data() });
        });
      }

      res.json(logs);
    } catch (error) {
      console.error('Get footprint history error:', error);
      res.status(500).json({ error: 'Failed to retrieve history' });
    }
  },

  /**
   * Calculates dashboard summary (latest, previous, difference)
   */
  async getSummary(req, res) {
    try {
      const { uid } = req.user;
      let logs = [];

      if (useSimulation) {
        logs = dbMock.find('footprints', f => f.userId === uid);
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else {
        const snapshot = await db.collection('footprints')
          .where('userId', '==', uid)
          .orderBy('date', 'desc')
          .limit(2)
          .get();
        snapshot.forEach(doc => {
          logs.push({ id: doc.id, ...doc.data() });
        });
      }

      if (logs.length === 0) {
        return res.json({
          current: null,
          previous: null,
          difference: 0,
          percentageChange: 0
        });
      }

      const current = logs[0];
      const previous = logs[1] || null;
      let difference = 0;
      let percentageChange = 0;

      if (previous) {
        difference = Math.round((current.total - previous.total) * 100) / 100;
        percentageChange = Math.round(((current.total - previous.total) / previous.total) * 10000) / 100;
      }

      res.json({
        current,
        previous,
        difference,
        percentageChange
      });
    } catch (error) {
      console.error('Get summary stats error:', error);
      res.status(500).json({ error: 'Failed to calculate carbon summary statistics' });
    }
  }
};

module.exports = footprintController;
