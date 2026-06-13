/**
 * @module useGoals
 * Custom hook encapsulating goal CRUD logic and state management.
 * Replaces inline state management and API calls previously in Goals.jsx.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchGoals, createGoal, updateGoalProgress } from '../services/goalService';
import { useAuth } from '../context/AuthContext';

/** @typedef {import('../types/index').Goal} Goal */

/**
 * Manages goals list, creation, progress updates, and derived active/completed sets.
 * @returns {Object} Goals state and operations
 */
export function useGoals() {
  const { refreshPoints } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [days, setDays] = useState('30');
  const [submitting, setSubmitting] = useState(false);
  const [updateVal, setUpdateVal] = useState({});

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals:', err);
      setError('Could not fetch goals list. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  /**
   * Creates a new carbon reduction goal.
   * @param {Event} e - Form submit event
   */
  const handleCreateGoal = useCallback(async (e) => {
    e.preventDefault();
    if (!targetValue || Number(targetValue) <= 0) return;

    setSubmitting(true);
    setError('');

    try {
      const endDate = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000).toISOString();
      await createGoal({ targetValue: Number(targetValue), endDate });
      setTargetValue('');
      await loadGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
      setError('Failed to save goal. Try again.');
    } finally {
      setSubmitting(false);
    }
  }, [targetValue, days, loadGoals]);

  /**
   * Updates the progress on an active goal.
   * @param {string} goalId - Goal ID to update
   */
  const handleUpdateProgress = useCallback(async (goalId) => {
    const progressVal = Number(updateVal[goalId]);
    if (isNaN(progressVal) || progressVal < 0) return;

    try {
      await updateGoalProgress(goalId, progressVal);
      setUpdateVal(prev => ({ ...prev, [goalId]: '' }));
      await loadGoals();
      await refreshPoints();
    } catch (err) {
      console.error('Failed to update progress:', err);
      setError('Failed to update goal progress.');
    }
  }, [updateVal, loadGoals, refreshPoints]);

  /** Active (non-completed) goals */
  const activeGoals = useMemo(() => goals.filter(g => !g.completed), [goals]);

  /** Completed goals */
  const completedGoals = useMemo(() => goals.filter(g => g.completed), [goals]);

  return {
    goals,
    loading,
    error,
    targetValue,
    setTargetValue,
    days,
    setDays,
    submitting,
    updateVal,
    setUpdateVal,
    activeGoals,
    completedGoals,
    handleCreateGoal,
    handleUpdateProgress,
  };
}
