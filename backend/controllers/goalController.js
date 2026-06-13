const { findDocuments, findOneDocument, insertDocument, updateDocument } = require('../utils/dataAccess');
const badgeController = require('./badgeController');

const goalController = {
  /**
   * Creates a new carbon reduction goal.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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
        endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      };

      const savedGoal = await insertDocument('goals', goalData);
      res.status(201).json(savedGoal);
    } catch (error) {
      console.error('Create goal error:', error);
      res.status(500).json({ error: 'Failed to create monthly carbon goal' });
    }
  },

  /**
   * Retrieves all goals of the authenticated user, sorted by start date descending.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getGoals(req, res) {
    try {
      const { uid } = req.user;
      const goals = await findDocuments('goals', {
        filterFn: g => g.userId === uid,
        where: [{ field: 'userId', op: '==', value: uid }],
        orderBy: 'startDate',
        orderDir: 'desc'
      });

      res.json(goals);
    } catch (error) {
      console.error('Get goals list error:', error);
      res.status(500).json({ error: 'Failed to retrieve goals' });
    }
  },

  /**
   * Updates progress on an active goal. Marks as completed if target is met.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async updateProgress(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const { currentProgress } = req.body;

      if (currentProgress === undefined || Number(currentProgress) < 0) {
        return res.status(400).json({ error: 'Progress value must be non-negative' });
      }

      const goal = await findOneDocument('goals', g => g.id === id, id);
      if (!goal || goal.userId !== uid) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      const isCompletedNow = Number(currentProgress) >= goal.targetValue;
      const updates = {
        currentProgress: Number(currentProgress),
        completed: isCompletedNow
      };

      const updatedGoal = await updateDocument('goals', id, updates);

      // Trigger badge evaluation checks
      await badgeController.evaluateFootprintBadges(uid);

      return res.json(updatedGoal);
    } catch (error) {
      console.error('Update goal progress error:', error);
      res.status(500).json({ error: 'Failed to update goal progress' });
    }
  }
};

module.exports = goalController;
