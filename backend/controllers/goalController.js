const { db, useSimulation } = require('../config/firebase');
const dbMock = require('../utils/dbMock');
const badgeController = require('./badgeController');

const goalController = {
  /**
   * Creates a new carbon reduction goal
   */
  async create(req, res) {
    try {
      const { uid } = req.user;
      const { targetValue, endDate } = req.body;

      if (!targetValue || Number(targetValue) <= 0) {
        return res.status(400).json({ error: 'Target reduction value must be greater than zero' });
      }

      const goalData = {
        userId: uid,
        targetValue: Number(targetValue),
        currentProgress: 0,
        startDate: new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // default 30 days
        completed: false
      };

      let savedGoal;

      if (useSimulation) {
        savedGoal = dbMock.insert('goals', goalData);
      } else {
        const ref = await db.collection('goals').add(goalData);
        savedGoal = { id: ref.id, ...goalData };
      }

      res.status(201).json(savedGoal);
    } catch (error) {
      console.error('Create goal error:', error);
      res.status(500).json({ error: 'Failed to create monthly carbon goal' });
    }
  },

  /**
   * Retrieves all goals of a user
   */
  async getGoals(req, res) {
    try {
      const { uid } = req.user;
      let goals = [];

      if (useSimulation) {
        goals = dbMock.find('goals', g => g.userId === uid);
        // Sort by startDate descending
        goals.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      } else {
        const snapshot = await db.collection('goals')
          .where('userId', '==', uid)
          .orderBy('startDate', 'desc')
          .get();
        snapshot.forEach(doc => {
          goals.push({ id: doc.id, ...doc.data() });
        });
      }

      res.json(goals);
    } catch (error) {
      console.error('Get goals list error:', error);
      res.status(500).json({ error: 'Failed to retrieve goals' });
    }
  },

  /**
   * Updates progress on an active goal
   */
  async updateProgress(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const { currentProgress } = req.body;

      if (currentProgress === undefined || Number(currentProgress) < 0) {
        return res.status(400).json({ error: 'Progress value must be non-negative' });
      }

      let goal = null;

      if (useSimulation) {
        goal = dbMock.findById('goals', id);
        if (!goal || goal.userId !== uid) {
          return res.status(404).json({ error: 'Goal not found' });
        }

        const isCompletedNow = Number(currentProgress) >= goal.targetValue;
        const updates = {
          currentProgress: Number(currentProgress),
          completed: isCompletedNow
        };

        const updatedGoal = dbMock.update('goals', id, updates);
        
        // Trigger badge evaluation checks
        await badgeController.evaluateFootprintBadges(uid);

        return res.json(updatedGoal);
      } else {
        const ref = db.collection('goals').doc(id);
        const doc = await ref.get();
        if (!doc.exists || doc.data().userId !== uid) {
          return res.status(404).json({ error: 'Goal not found' });
        }

        const goalData = doc.data();
        const isCompletedNow = Number(currentProgress) >= goalData.targetValue;
        const updates = {
          currentProgress: Number(currentProgress),
          completed: isCompletedNow
        };

        await ref.update(updates);
        
        // Trigger badge checks
        await badgeController.evaluateFootprintBadges(uid);

        return res.json({ id, ...goalData, ...updates });
      }
    } catch (error) {
      console.error('Update goal progress error:', error);
      res.status(500).json({ error: 'Failed to update goal progress' });
    }
  }
};

module.exports = goalController;
