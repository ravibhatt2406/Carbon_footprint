const badgeController = require('../../controllers/badgeController');
const dbMock = require('../../utils/dbMock');

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

describe('badgeController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { uid: 'u1' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getBadges', () => {
    it('evaluates and returns the user badges list with unlocked states', async () => {
      dbMock.find.mockImplementation((col) => {
        if (col === 'badges') return [{ userId: 'u1', badgeType: 'beginner', unlockedAt: '2026-06-12' }];
        if (col === 'footprints') return [{ total: 200, date: '2026-06-01' }];
        if (col === 'challenges') return [];
        return [];
      });

      await badgeController.getBadges(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ badgeType: 'beginner', unlocked: true }),
          expect.objectContaining({ badgeType: 'eco_explorer', unlocked: false })
        ])
      );
    });
  });

  describe('evaluateFootprintBadges', () => {
    it('awards green_warrior and carbon_hero when footprint reductions match criteria', async () => {
      dbMock.find.mockImplementation((col) => {
        if (col === 'badges') return [];
        if (col === 'footprints') {
          return [
            { total: 200, date: '2026-06-01' },
            { total: 80, date: '2026-06-12' } // 60% reduction
          ];
        }
        if (col === 'challenges') return [];
        return [];
      });

      await badgeController.evaluateFootprintBadges('u1');

      expect(dbMock.insert).toHaveBeenCalledWith('badges', expect.objectContaining({
        badgeType: 'beginner'
      }));
      expect(dbMock.insert).toHaveBeenCalledWith('badges', expect.objectContaining({
        badgeType: 'green_warrior'
      }));
      expect(dbMock.insert).toHaveBeenCalledWith('badges', expect.objectContaining({
        badgeType: 'carbon_hero'
      }));
    });
  });
});
