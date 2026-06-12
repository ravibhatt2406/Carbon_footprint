const request = require('supertest');
const app = require('../../server');

jest.mock('../../config/firebase', () => ({
  useSimulation: true,
  db: null,
  auth: null
}));

describe('CORS Integration Tests', () => {
  const allowedOrigins = [
    'https://ecolensaicarbonfootprint.netlify.app',
    'http://localhost:5173'
  ];
  const disallowedOrigin = 'https://unauthorized-domain.com';

  describe('Actual Requests (GET /health)', () => {
    it.each(allowedOrigins)('should allow and set correct CORS headers for allowed origin: %s', async (origin) => {
      const res = await request(app)
        .get('/health')
        .set('Origin', origin)
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBe(origin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should not return access-control headers for disallowed origin', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', disallowedOrigin)
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should allow requests without an Origin header (e.g. server-to-server or curl)', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Preflight OPTIONS Requests', () => {
    it.each(allowedOrigins)('should respond correctly to OPTIONS preflight for allowed origin: %s', async (origin) => {
      const res = await request(app)
        .options('/api/auth/profile')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Authorization')
        .expect(204);

      expect(res.headers['access-control-allow-origin']).toBe(origin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.headers['access-control-allow-methods'].toUpperCase()).toContain('GET');
      expect(res.headers['access-control-allow-methods'].toUpperCase()).toContain('OPTIONS');
      expect(res.headers['access-control-allow-headers'].toLowerCase()).toContain('authorization');
    });

    it('should not return access-control headers on OPTIONS for disallowed origin', async () => {
      const res = await request(app)
        .options('/api/auth/profile')
        .set('Origin', disallowedOrigin)
        .set('Access-Control-Request-Method', 'GET');

      expect([200, 204]).toContain(res.status);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
