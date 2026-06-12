const challengeController = require('../../controllers/challengeController');
const dbMock = require('../../utils/dbMock');
const geminiService = require('../../services/geminiService');
const badgeController = require('../../controllers/badgeController');

jest.mock('../../config/firebase', () => ({
  useSimulation: true,
  db: null,
  auth: null
}));

jest.mock('../../utils/dbMock', () => ({
  insert: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  update: jest.fn()
}));

jest.mock('../../services/geminiService', () => ({
  generateWeeklyChallenges: jest.fn().mockResolvedValue([
    { title: 'Plant a Seed', description: 'Plant it', points: 15 }
  ])
}));

jest.mock('../../controllers/badgeController', () => ({
  evaluateFootprintBadges: jest.fn().mockResolvedValue()
}));

describe('challengeController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { uid: 'u1' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getWeekly', () => {
    it('returns existing challenges for the current week', async () => {
      dbMock.findOne.mockReturnValue({ id: 'u1', points: 40 });
      const mockChallenges = [{ id: 'ch1', title: 'Cycle to work', completed: false }];
      dbMock.find.mockReturnValue(mockChallenges);

      await challengeController.getWeekly(req, res);

      expect(res.json).toHaveBeenCalledWith(mockChallenges);
      expect(geminiService.generateWeeklyChallenges).not.toHaveBeenCalled();
    });

    it('generates and saves challenges using Gemini if none exist for current week', async () => {
      dbMock.findOne.mockReturnValue({ id: 'u1', points: 40 });
      dbMock.find.mockReturnValue([]); // No existing challenges
      dbMock.insert.mockImplementation((col, doc) => ({ id: 'ch_new', ...doc }));

      await challengeController.getWeekly(req, res);

      expect(geminiService.generateWeeklyChallenges).toHaveBeenCalledWith(40);
      expect(dbMock.insert).toHaveBeenCalledWith('challenges', expect.objectContaining({
        title: 'Plant a Seed',
        points: 15
      }));
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'ch_new', title: 'Plant a Seed' })
      ]);
    });
  });

  describe('complete', () => {
    it('returns 404 if challenge is not found', async () => {
      req.params = { id: 'ch999' };
      dbMock.findById.mockReturnValue(null);

      await challengeController.complete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Challenge not found' });
    });

    it('returns 400 if challenge is already completed', async () => {
      req.params = { id: 'ch1' };
      dbMock.findById.mockReturnValue({ id: 'ch1', userId: 'u1', completed: true });

      await challengeController.complete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Challenge is already completed' });
    });

    it('completes the challenge, awards points, and evaluates badges', async () => {
      req.params = { id: 'ch1' };
      dbMock.findById.mockReturnValue({ id: 'ch1', userId: 'u1', points: 20, completed: false });
      dbMock.findOne.mockReturnValue({ id: 'u1', points: 100 });
      dbMock.update.mockImplementation((col, id, updates) => ({ id, ...updates }));

      await challengeController.complete(req, res);

      expect(dbMock.update).toHaveBeenCalledWith('challenges', 'ch1', expect.objectContaining({
        completed: true
      }));
      expect(dbMock.update).toHaveBeenCalledWith('users', 'u1', { points: 120 });
      expect(badgeController.evaluateFootprintBadges).toHaveBeenCalledWith('u1');
    });
  });
});
