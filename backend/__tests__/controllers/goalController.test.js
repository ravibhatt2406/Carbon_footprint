const goalController = require('../../controllers/goalController');
const dbMock = require('../../utils/dbMock');
const badgeController = require('../../controllers/badgeController');

jest.mock('../../config/firebase', () => ({
  useSimulation: true,
  db: null,
  auth: null
}));

jest.mock('../../utils/dbMock', () => ({
  insert: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  update: jest.fn()
}));

jest.mock('../../controllers/badgeController', () => ({
  evaluateFootprintBadges: jest.fn().mockResolvedValue()
}));

describe('goalController', () => {
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

  describe('create', () => {
    it('returns 400 if targetValue is missing or invalid', async () => {
      req.body = { targetValue: -5 };
      await goalController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Target reduction value must be greater than zero' });
    });

    it('saves a valid goal and returns 201', async () => {
      req.body = { targetValue: 100, endDate: '2026-07-12T00:00:00.000Z' };
      dbMock.insert.mockImplementation((col, doc) => doc);

      await goalController.create(req, res);

      expect(dbMock.insert).toHaveBeenCalledWith('goals', expect.objectContaining({
        targetValue: 100,
        completed: false
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getGoals', () => {
    it('returns goals list sorted by startDate descending', async () => {
      const mockGoals = [
        { id: '1', startDate: '2026-06-01T00:00:00.000Z' },
        { id: '2', startDate: '2026-06-12T00:00:00.000Z' }
      ];
      dbMock.find.mockReturnValue(mockGoals);

      await goalController.getGoals(req, res);

      expect(res.json).toHaveBeenCalledWith([
        { id: '2', startDate: '2026-06-12T00:00:00.000Z' },
        { id: '1', startDate: '2026-06-01T00:00:00.000Z' }
      ]);
    });
  });

  describe('updateProgress', () => {
    it('returns 400 if progress is negative or missing', async () => {
      req.params = { id: 'g1' };
      req.body = { currentProgress: -10 };
      await goalController.updateProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Progress value must be non-negative' });
    });

    it('returns 404 if goal is not found or does not belong to user', async () => {
      req.params = { id: 'g999' };
      req.body = { currentProgress: 20 };
      dbMock.findById.mockReturnValue(null);

      await goalController.updateProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('updates goal progress and checks for completion badges', async () => {
      req.params = { id: 'g1' };
      req.body = { currentProgress: 110 };
      dbMock.findById.mockReturnValue({
        id: 'g1',
        userId: 'u1',
        targetValue: 100,
        currentProgress: 30,
        completed: false
      });
      dbMock.update.mockImplementation((col, id, updates) => ({ id, ...updates }));

      await goalController.updateProgress(req, res);

      expect(dbMock.update).toHaveBeenCalledWith('goals', 'g1', expect.objectContaining({
        currentProgress: 110,
        completed: true // completed should be true since 110 >= 100
      }));
      expect(badgeController.evaluateFootprintBadges).toHaveBeenCalledWith('u1');
    });
  });
});
