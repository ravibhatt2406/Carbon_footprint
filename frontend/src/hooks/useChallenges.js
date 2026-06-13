/**
 * @module useChallenges
 * Custom hook encapsulating weekly challenge fetching and completion logic.
 * Replaces inline state management and API calls previously in Challenges.jsx.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchChallenges, completeChallenge } from '../services/challengeService';
import { useAuth } from '../context/AuthContext';

/** @typedef {import('../types/index').Challenge} Challenge */

/**
 * Manages challenge list, completion state, and derived completion count.
 * @returns {Object} Challenge state and operations
 */
export function useChallenges() {
  const { refreshPoints } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingId, setCompletingId] = useState(null);

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchChallenges();
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setError('Could not fetch weekly challenges. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  /**
   * Marks a challenge as completed and updates local + server state.
   * @param {string} challengeId - The challenge ID to complete
   */
  const handleComplete = useCallback(async (challengeId) => {
    setCompletingId(challengeId);
    setError('');

    try {
      await completeChallenge(challengeId);
      setChallenges(prev =>
        prev.map(ch =>
          ch.id === challengeId ? { ...ch, completed: true } : ch
        )
      );
      await refreshPoints();
    } catch (err) {
      console.error('Failed to complete challenge:', err);
      setError('Error updating challenge completion. Please retry.');
    } finally {
      setCompletingId(null);
    }
  }, [refreshPoints]);

  /** Count of completed challenges in the current week */
  const completedCount = useMemo(() => challenges.filter(c => c.completed).length, [challenges]);

  return {
    challenges,
    loading,
    error,
    completingId,
    completedCount,
    handleComplete,
  };
}
