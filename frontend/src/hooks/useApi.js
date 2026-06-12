import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

/**
 * Custom hook for managing API GET requests with state tracking.
 * @param {string} endpoint - The API endpoint to fetch
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.immediate=true] - Run fetch immediately on mount
 * @returns {Object} State and operations: { data, loading, error, execute, setData }
 */
export function useApi(endpoint, options = { immediate: true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(options.immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get(endpoint);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (options.immediate) {
      execute().catch(() => {});
    }
  }, [execute, options.immediate]);

  return { data, loading, error, execute, setData };
}
