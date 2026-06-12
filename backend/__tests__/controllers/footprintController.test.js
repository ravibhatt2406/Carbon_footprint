const footprintController = require('../../controllers/footprintController');
const dbMock = require('../../utils/dbMock');
const geminiService = require('../../services/geminiService');

jest.mock('../../config/firebase', () => ({
  useSimulation: true,
  db: null,
  auth: null
}));

jest.mock('../../utils/dbMock', () => ({
  insert: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn()
}));

jest.mock('../../services/geminiService', () => ({
  getCarbonAdvice: jest.fn().mockResolvedValue('Simulated advice from Gemini.')
}));

describe('footprintController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { uid: 'u1' },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('create', () => {
    it('returns 400 if foodHabit or shoppingHabit is missing', async () => {
      req.body = { carKm: 100 };
      await footprintController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Food habits and shopping habits are required fields' });
    });

    it('calculates, queries Gemini, saves, and returns the log', async () => {
      req.body = {
        carKm: 100,
        bikeKm: 10,
        busKm: 0,
        trainKm: 0,
        electricityKwh: 120,
        foodHabit: 'vegetarian',
        shoppingHabit: 'low'
      };

      dbMock.insert.mockImplementation((col, doc) => doc);
      dbMock.find.mockReturnValue([]); // No prior footprints

      await footprintController.create(req, res);

      expect(geminiService.getCarbonAdvice).toHaveBeenCalled();
      expect(dbMock.insert).toHaveBeenCalledWith('footprints', expect.objectContaining({
        userId: 'u1',
        total: expect.any(Number)
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getHistory', () => {
    it('returns sorted footprint logs for the user', async () => {
      const mockLogs = [
        { id: '1', date: '2026-06-01T00:00:00.000Z', total: 200 },
        { id: '2', date: '2026-06-12T00:00:00.000Z', total: 150 }
      ];
      dbMock.find.mockReturnValue(mockLogs);

      await footprintController.getHistory(req, res);

      // Verify sorting by date descending
      expect(res.json).toHaveBeenCalledWith([
        { id: '2', date: '2026-06-12T00:00:00.000Z', total: 150 },
        { id: '1', date: '2026-06-01T00:00:00.000Z', total: 200 }
      ]);
    });
  });

  describe('getSummary', () => {
    it('returns empty summary if user has no footprint records', async () => {
      dbMock.find.mockReturnValue([]);

      await footprintController.getSummary(req, res);

      expect(res.json).toHaveBeenCalledWith({
        current: null,
        previous: null,
        difference: 0,
        percentageChange: 0
      });
    });

    it('calculates metrics difference correctly when previous logs exist', async () => {
      const mockLogs = [
        { id: '1', date: '2026-06-12T00:00:00.000Z', total: 200 },
        { id: '2', date: '2026-06-01T00:00:00.000Z', total: 250 }
      ];
      dbMock.find.mockReturnValue(mockLogs);

      await footprintController.getSummary(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        difference: -50,
        percentageChange: -20
      }));
    });
  });
});
