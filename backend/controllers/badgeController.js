const { db, useSimulation } = require('../config/firebase');
const dbMock = require('../utils/dbMock');

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
   * Retrieves all badges unlocked by the user
   */
  async getBadges(req, res) {
    try {
      const { uid } = req.user;
      let unlocked = [];

      // Run a quick evaluation check to ensure badges are up to date
      await badgeController.evaluateFootprintBadges(uid);

      if (useSimulation) {
        unlocked = dbMock.find('badges', b => b.userId === uid);
      } else {
        const snapshot = await db.collection('badges')
          .where('userId', '==', uid)
          .get();
        snapshot.forEach(doc => {
          unlocked.push({ id: doc.id, ...doc.data() });
        });
      }

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
   * Evaluates carbon logs and challenge logs to award new badges
   */
  async evaluateFootprintBadges(userId) {
    try {
      let footprints = [];
      let completedChallengesCount = 0;
      let existingBadges = [];

      // 1. Fetch current user data from DB
      if (useSimulation) {
        footprints = dbMock.find('footprints', f => f.userId === userId);
        footprints.sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological order

        const challenges = dbMock.find('challenges', c => c.userId === userId && c.completed === true);
        completedChallengesCount = challenges.length;

        existingBadges = dbMock.find('badges', b => b.userId === userId);
      } else {
        // Firestore fetch
        const footprintsSnap = await db.collection('footprints')
          .where('userId', '==', userId)
          .orderBy('date', 'asc')
          .get();
        footprintsSnap.forEach(doc => footprints.push({ id: doc.id, ...doc.data() }));

        const challengesSnap = await db.collection('challenges')
          .where('userId', '==', userId)
          .where('completed', '==', true)
          .get();
        completedChallengesCount = challengesSnap.size;

        const badgesSnap = await db.collection('badges')
          .where('userId', '==', userId)
          .get();
        badgesSnap.forEach(doc => existingBadges.push({ id: doc.id, ...doc.data() }));
      }

      const hasBadge = (type) => existingBadges.some(b => b.badgeType === type);
      const awardBadge = async (type) => {
        const badgeData = {
          userId,
          badgeType: type,
          title: BADGES_CONFIG[type].title,
          description: BADGES_CONFIG[type].description,
          unlockedAt: new Date().toISOString()
        };

        if (useSimulation) {
          dbMock.insert('badges', badgeData);
        } else {
          await db.collection('badges').add(badgeData);
        }
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
