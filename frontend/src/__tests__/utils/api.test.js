import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, apiRequest } from '../../utils/api';

describe('API Utility (api.js)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('performs GET request and resolves response JSON', async () => {
    const mockData = { data: 'test-data' };
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await api.get('/test-endpoint');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-endpoint'),
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('attaches Authorization bearer token if present in localStorage', async () => {
    localStorage.setItem('ecolens_token', 'my-secret-jwt-token');
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.get('/test-endpoint');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer my-secret-jwt-token',
        },
      })
    );
  });

  it('does not set Content-Type header when body is FormData', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const formData = new FormData();
    formData.append('file', 'test');

    await api.post('/upload', formData);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: formData,
        headers: expect.not.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('throws custom error when response is not ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Custom API error message' }),
    });

    await expect(api.get('/bad-endpoint')).rejects.toThrow('Custom API error message');
  });

  it('throws fallback error when response is not ok and json is empty', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Cannot parse JSON')),
    });

    await expect(api.get('/bad-endpoint')).rejects.toThrow('HTTP error! Status: 500');
  });
});
