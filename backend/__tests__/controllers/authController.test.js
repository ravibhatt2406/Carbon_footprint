const authController = require('../../controllers/authController');
const dbMock = require('../../utils/dbMock');
const bcrypt = require('bcryptjs');

// Mock firebase configuration to force simulation mode
jest.mock('../../config/firebase', () => ({
  useSimulation: true,
  db: null,
  auth: null
}));

// Mock dbMock
jest.mock('../../utils/dbMock', () => ({
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  findById: jest.fn()
}));

describe('authController (Simulation mode)', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('register', () => {
    it('returns 400 if email or password is missing', async () => {
      req.body = { email: '', password: '' };
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Email and password are required'
      }));
    });

    it('returns 400 if user with email already exists', async () => {
      req.body = { email: 'existing@example.com', password: 'password123' };
      dbMock.findOne.mockReturnValue({ email: 'existing@example.com' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'A user with this email already exists'
      }));
    });

    it('creates a user and returns a token on success', async () => {
      req.body = { email: 'new@example.com', password: 'password123', displayName: 'New User' };
      dbMock.findOne.mockReturnValue(null);
      dbMock.insert.mockImplementation((col, doc) => {
        if (col === 'users') {
          return { id: 'u1', email: doc.email, displayName: doc.displayName, points: 0 };
        }
        return {};
      });

      await authController.register(req, res);

      expect(dbMock.insert).toHaveBeenCalledWith('users', expect.objectContaining({
        email: 'new@example.com'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          email: 'new@example.com',
          displayName: 'New User'
        })
      }));
    });
  });

  describe('login', () => {
    it('returns 400 if email or password missing', async () => {
      req.body = { email: '', password: '' };
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 for invalid email or password', async () => {
      req.body = { email: 'user@example.com', password: 'wrongpassword' };
      dbMock.findOne.mockReturnValue(null); // No user found

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
    });

    it('returns token and user details on correct login', async () => {
      req.body = { email: 'user@example.com', password: 'correctpassword' };
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      dbMock.findOne.mockReturnValue({
        id: 'u1',
        email: 'user@example.com',
        password: hashedPassword,
        displayName: 'User',
        points: 20
      });

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          email: 'user@example.com',
          points: 20
        })
      }));
    });
  });

  describe('getProfile', () => {
    it('returns 404 if profile not found', async () => {
      req.user = { uid: 'u999', email: 'ghost@example.com' };
      dbMock.findOne.mockReturnValue(null);

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns user profile details', async () => {
      req.user = { uid: 'u1', email: 'user@example.com' };
      dbMock.findOne.mockReturnValue({
        id: 'u1',
        email: 'user@example.com',
        displayName: 'User',
        points: 40
      });

      await authController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        uid: 'u1',
        points: 40
      }));
    });
  });
});
