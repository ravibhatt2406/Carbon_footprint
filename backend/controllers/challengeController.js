const { findDocuments, findOneDocument, insertDocument, updateDocument } = require('../utils/dataAccess');
const geminiService = require('../services/geminiService');
const badgeController = require('./badgeController');

/**
 * Returns the ISO date string of Monday of the current week.
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  // Set to Monday of this week
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const challengeController = {
  /**
   * Retrieves the current week's challenges. If none exist, generates them via Gemini AI.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getWeekly(req, res) {
    try {
      const { uid } = req.user;
      const weekStart = getStartOfWeek();

      // 1. Fetch user profile to get points for prompt personalization
      const user = await findOneDocument('users', u => u.id === uid, uid);
      const userPoints = user ? (user.points || 0) : 0;

      // 2. Fetch existing challenges for the current week
      let activeChallenges = await findDocuments('challenges', {
        filterFn: c => c.userId === uid && c.weekStartDate === weekStart,
        where: [
          { field: 'userId', op: '==', value: uid },
          { field: 'weekStartDate', op: '==', value: weekStart }
        ]
      });

      // 3. If no challenges exist for this week, generate them using Gemini / fallback
      if (activeChallenges.length === 0) {
        console.log(`Generating new weekly challenges for user ${uid} for week ${weekStart}`);
        const generated = await geminiService.generateWeeklyChallenges(userPoints);

        const listToSave = generated.map(ch => ({
          userId: uid,
          title: ch.title,
          description: ch.description,
          points: Number(ch.points) || 10,
          completed: false,
          weekStartDate: weekStart
        }));

        activeChallenges = [];
        for (const chData of listToSave) {
          const saved = await insertDocument('challenges', chData);
          activeChallenges.push(saved);
        }
      }

      res.json(activeChallenges);
    } catch (error) {
      console.error('Get weekly challenges error:', error);
      res.status(500).json({ error: 'Failed to retrieve weekly challenges' });
    }
  },

  /**
   * Marks a challenge as completed and awards points to the user.
   * Triggers badge evaluation after awarding points.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async complete(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;

      const challenge = await findOneDocument('challenges', c => c.id === id, id);
      if (!challenge || challenge.userId !== uid) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      if (challenge.completed) {
        return res.status(400).json({ error: 'Challenge is already completed' });
      }

      // 1. Mark challenge complete
      const updatedChallenge = await updateDocument('challenges', id, {
        completed: true,
        dateCompleted: new Date().toISOString()
      });

      // 2. Award points to user
      const user = await findOneDocument('users', u => u.id === uid, uid);
      if (user) {
        const currentPoints = user.points || 0;
        await updateDocument('users', uid, { points: currentPoints + challenge.points });
      }

      // 3. Evaluate badges
      await badgeController.evaluateFootprintBadges(uid);

      return res.json(updatedChallenge);
    } catch (error) {
      console.error('Complete challenge error:', error);
      res.status(500).json({ error: 'Failed to complete challenge' });
    }
  }
};

module.exports = challengeController;
