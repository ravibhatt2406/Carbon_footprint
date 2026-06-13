const { findDocuments, countDocuments, insertDocument } = require('../utils/dataAccess');

/** Badge type definitions with titles and descriptions */
const BADGES_CONFIG = {
  beginner: {
    title: 'Eco Beginner',
    description: 'Calculated your carbon footprint for the first time.'
  },
  eco_explorer: {
    title: 'Eco Explorer',
    description: 'Successfully completed at least 5 weekly eco challenges.'
  },
  green_warrior: {
    title: 'Green Warrior',
    description: 'Reduced your monthly carbon footprint by 20% or more.'
  },
  carbon_hero: {
    title: 'Carbon Hero',
    description: 'Reduced your monthly carbon footprint by 50% or more.'
  }
};

const badgeController = {
  /**
   * Retrieves all badges (unlocked and locked) for the authenticated user.
   * Runs a badge evaluation check first to ensure badges are up to date.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getBadges(req, res) {
    try {
      const { uid } = req.user;

      // Run a quick evaluation check to ensure badges are up to date
      await badgeController.evaluateFootprintBadges(uid);

      const unlocked = await findDocuments('badges', {
        filterFn: b => b.userId === uid,
        where: [{ field: 'userId', op: '==', value: uid }]
      });

      // Format response, making sure all possible badges are returned with status
      const badgesResult = Object.keys(BADGES_CONFIG).map(type => {
        const unlockRecord = unlocked.find(u => u.badgeType === type);
        return {
          badgeType: type,
          title: BADGES_CONFIG[type].title,
          description: BADGES_CONFIG[type].description,
          unlocked: !!unlockRecord,
          unlockedAt: unlockRecord ? unlockRecord.unlockedAt : null
        };
      });

      res.json(badgesResult);
    } catch (error) {
      console.error('Get badges error:', error);
      res.status(500).json({ error: 'Failed to retrieve achievements' });
    }
  },

  /**
   * Evaluates carbon logs and challenge logs to determine if new badges should be awarded.
   * Called after footprint calculations, challenge completions, and goal updates.
   * @param {string} userId - The user ID to evaluate badges for
   */
  async evaluateFootprintBadges(userId) {
    try {
      // 1. Fetch current user data from DB
      const footprints = await findDocuments('footprints', {
        filterFn: f => f.userId === userId,
        where: [{ field: 'userId', op: '==', value: userId }],
        orderBy: 'date',
        orderDir: 'asc'
      });

      const completedChallengesCount = await countDocuments(
        'challenges',
        c => c.userId === userId && c.completed === true,
        [
          { field: 'userId', op: '==', value: userId },
          { field: 'completed', op: '==', value: true }
        ]
      );

      const existingBadges = await findDocuments('badges', {
        filterFn: b => b.userId === userId,
        where: [{ field: 'userId', op: '==', value: userId }]
      });

      const hasBadge = (type) => existingBadges.some(b => b.badgeType === type);

      /**
       * Awards a badge to the user if not already earned.
       * @param {string} type - Badge type key
       */
      const awardBadge = async (type) => {
        const badgeData = {
          userId,
          badgeType: type,
          title: BADGES_CONFIG[type].title,
          description: BADGES_CONFIG[type].description,
          unlockedAt: new Date().toISOString()
        };
        await insertDocument('badges', badgeData);
        console.log(`User ${userId} awarded badge: ${type}`);
      };

      // 2. Evaluate Beginner badge (>= 1 calculation)
      if (footprints.length >= 1 && !hasBadge('beginner')) {
        await awardBadge('beginner');
      }

      // 3. Evaluate Eco Explorer badge (>= 5 challenges completed)
      if (completedChallengesCount >= 5 && !hasBadge('eco_explorer')) {
        await awardBadge('eco_explorer');
      }

      // 4. Evaluate Green Warrior (20% reduction) and Carbon Hero (50% reduction)
      if (footprints.length >= 2) {
        const firstFootprint = footprints[0].total;
        const latestFootprint = footprints[footprints.length - 1].total;

        if (firstFootprint > 0) {
          const reductionRatio = (firstFootprint - latestFootprint) / firstFootprint;

          if (reductionRatio >= 0.20 && !hasBadge('green_warrior')) {
            await awardBadge('green_warrior');
          }

          if (reductionRatio >= 0.50 && !hasBadge('carbon_hero')) {
            await awardBadge('carbon_hero');
          }
        }
      }
    } catch (err) {
      console.error('Error during badge evaluation:', err);
    }
  }
};

module.exports = badgeController;
