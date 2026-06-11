const { db, useSimulation } = require('../config/firebase');
const dbMock = require('../utils/dbMock');
const geminiService = require('../services/geminiService');
const badgeController = require('./badgeController');

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
   * Retrieves the current week's challenges. If none exist, generates them.
   */
  async getWeekly(req, res) {
    try {
      const { uid } = req.user;
      const weekStart = getStartOfWeek();
      let activeChallenges = [];

      // 1. Fetch user profile to get points for prompt personalization
      let userPoints = 0;
      if (useSimulation) {
        const user = dbMock.findOne('users', u => u.id === uid);
        userPoints = user ? (user.points || 0) : 0;
      } else {
        const userDoc = await db.collection('users').doc(uid).get();
        userPoints = userDoc.exists ? (userDoc.data().points || 0) : 0;
      }

      // 2. Fetch existing challenges for the current week
      if (useSimulation) {
        activeChallenges = dbMock.find('challenges', c => c.userId === uid && c.weekStartDate === weekStart);
      } else {
        const snapshot = await db.collection('challenges')
          .where('userId', '==', uid)
          .where('weekStartDate', '==', weekStart)
          .get();
        snapshot.forEach(doc => {
          activeChallenges.push({ id: doc.id, ...doc.data() });
        });
      }

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
          if (useSimulation) {
            const saved = dbMock.insert('challenges', chData);
            activeChallenges.push(saved);
          } else {
            const ref = await db.collection('challenges').add(chData);
            activeChallenges.push({ id: ref.id, ...chData });
          }
        }
      }

      res.json(activeChallenges);
    } catch (error) {
      console.error('Get weekly challenges error:', error);
      res.status(500).json({ error: 'Failed to retrieve weekly challenges' });
    }
  },

  /**
   * Marks a challenge as completed and awards points to the user
   */
  async complete(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      let challenge = null;

      if (useSimulation) {
        challenge = dbMock.findById('challenges', id);
        if (!challenge || challenge.userId !== uid) {
          return res.status(404).json({ error: 'Challenge not found' });
        }

        if (challenge.completed) {
          return res.status(400).json({ error: 'Challenge is already completed' });
        }

        // 1. Mark challenge complete
        const updatedChallenge = dbMock.update('challenges', id, {
          completed: true,
          dateCompleted: new Date().toISOString()
        });

        // 2. Award points to user
        const user = dbMock.findOne('users', u => u.id === uid);
        if (user) {
          const currentPoints = user.points || 0;
          dbMock.update('users', uid, { points: currentPoints + challenge.points });
        }

        // 3. Evaluate badges
        await badgeController.evaluateFootprintBadges(uid);

        return res.json(updatedChallenge);
      } else {
        // Firestore mode
        const challengeRef = db.collection('challenges').doc(id);
        const challengeDoc = await challengeRef.get();

        if (!challengeDoc.exists || challengeDoc.data().userId !== uid) {
          return res.status(404).json({ error: 'Challenge not found' });
        }

        const data = challengeDoc.data();
        if (data.completed) {
          return res.status(400).json({ error: 'Challenge is already completed' });
        }

        // 1. Mark complete
        await challengeRef.update({
          completed: true,
          dateCompleted: new Date().toISOString()
        });

        // 2. Award points
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const currentPoints = userDoc.data().points || 0;
          await userRef.update({ points: currentPoints + data.points });
        }

        // 3. Evaluate badges
        await badgeController.evaluateFootprintBadges(uid);

        return res.json({
          id,
          ...data,
          completed: true,
          dateCompleted: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Complete challenge error:', error);
      res.status(500).json({ error: 'Failed to complete challenge' });
    }
  }
};

module.exports = challengeController;
