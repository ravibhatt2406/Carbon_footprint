const request = require('supertest');
const app = require('../../server');
const dbMock = require('../../utils/dbMock');
const bcrypt = require('bcryptjs');

jest.mock('../../config/firebase', () => ({
  useSimulation: true,
  db: null,
  auth: null
}));

jest.mock('../../utils/dbMock', () => ({
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
  findById: jest.fn()
}));

describe('Auth Routes Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns 200 with online status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('online');
      expect(res.body.simulationMode).toBe(true);
    });
  });

  describe('POST /api/auth/register', () => {
    it('returns 400 if validation fails (short password)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@x.com', password: '123' })
        .expect(400);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].msg).toBe('Password must be at least 6 characters long');
    });

    it('registers user successfully on valid parameters', async () => {
      dbMock.findOne.mockReturnValue(null);
      dbMock.insert.mockImplementation((col, doc) => {
        if (col === 'users') {
          return { id: 'u123', email: doc.email, displayName: doc.displayName, points: 0 };
        }
        return {};
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@example.com', password: 'password123', displayName: 'Alex' })
        .expect(201);

      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('new@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 if invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bademail', password: '123' })
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('authenticates user successfully on valid login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      dbMock.findOne.mockReturnValue({
        id: 'u123',
        email: 'user@example.com',
        password: hashedPassword,
        displayName: 'User',
        points: 0
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(200);

      expect(res.body.token).toBeDefined();
      expect(res.body.user.uid).toBe('u123');
    });
  });
});
