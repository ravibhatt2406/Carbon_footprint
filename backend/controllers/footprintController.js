const { findDocuments, insertDocument, findOneDocument, useSimulation } = require('../utils/dataAccess');
const { calculateFootprint } = require('../utils/emissionFactors');
const geminiService = require('../services/geminiService');

const footprintController = {
  /**
   * Calculates carbon footprint, requests Gemini advice, and saves the log.
   * Awards the "Beginner" badge on first calculation.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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

      const savedRecord = await insertDocument('footprints', footprintData);

      // Check for "Beginner" badge awarding if it's the first calculation
      const priorFootprints = await findDocuments('footprints', {
        filterFn: f => f.userId === uid,
        where: [{ field: 'userId', op: '==', value: uid }],
        limit: 2
      });

      if (priorFootprints.length === 1) {
        const existingBadge = await findOneDocument(
          'badges',
          b => b.userId === uid && b.badgeType === 'beginner'
        );

        if (!existingBadge) {
          await insertDocument('badges', {
            userId: uid,
            badgeType: 'beginner',
            title: 'Eco Beginner',
            description: 'Completed your first carbon footprint calculation!',
            unlockedAt: new Date().toISOString()
          });
        }
      }

      res.status(201).json(savedRecord);
    } catch (error) {
      console.error('Create footprint log error:', error);
      res.status(500).json({ error: 'Failed to record carbon footprint' });
    }
  },

  /**
   * Fetches all carbon calculation logs for the authenticated user.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getHistory(req, res) {
    try {
      const { uid } = req.user;
      const logs = await findDocuments('footprints', {
        filterFn: f => f.userId === uid,
        where: [{ field: 'userId', op: '==', value: uid }],
        orderBy: 'date',
        orderDir: 'desc'
      });

      res.json(logs);
    } catch (error) {
      console.error('Get footprint history error:', error);
      res.status(500).json({ error: 'Failed to retrieve history' });
    }
  },

  /**
   * Calculates dashboard summary (latest, previous, difference, percentage change).
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getSummary(req, res) {
    try {
      const { uid } = req.user;
      const logs = await findDocuments('footprints', {
        filterFn: f => f.userId === uid,
        where: [{ field: 'userId', op: '==', value: uid }],
        orderBy: 'date',
        orderDir: 'desc',
        limit: useSimulation ? undefined : 2
      });

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
