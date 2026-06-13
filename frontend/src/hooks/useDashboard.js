/**
 * @module useDashboard
 * Custom hook encapsulating all Dashboard page data fetching and chart data transformations.
 * Replaces inline state management and API calls previously in Dashboard.jsx.
 */
import { useState, useEffect, useMemo } from 'react';
import { fetchSummary, fetchHistory } from '../services/footprintService';
import { fetchGoals } from '../services/goalService';

/** @typedef {import('../types/index').DashboardSummary} DashboardSummary */
/** @typedef {import('../types/index').FootprintLog} FootprintLog */
/** @typedef {import('../types/index').Goal} Goal */

/**
 * Fetches and manages all dashboard data: summary metrics, history for charts, and active goal.
 * @returns {Object} Dashboard state and derived chart data
 * @returns {DashboardSummary|null} return.summary - Footprint summary data
 * @returns {FootprintLog[]} return.history - Historical footprint logs
 * @returns {Goal|null} return.activeGoal - The latest active (non-completed) goal
 * @returns {boolean} return.loading - Whether data is being fetched
 * @returns {string} return.error - Error message if fetching failed
 * @returns {Object|null} return.latestFootprint - Current footprint from summary
 * @returns {Array} return.pieData - Transformed data for pie chart
 * @returns {Array} return.lineData - Transformed data for line chart
 */
export function useDashboard() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const summaryData = await fetchSummary();
        setSummary(summaryData);

        const historyLogs = await fetchHistory();
        setHistory(historyLogs);

        const goals = await fetchGoals();
        const active = goals.find(g => !g.completed) || null;
        setActiveGoal(active);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
        setError('Could not retrieve dashboard statistics. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const latestFootprint = summary?.current || null;

  /** Pie chart data derived from the latest footprint breakdown */
  const pieData = useMemo(() => {
    if (!latestFootprint) return [];
    return [
      { name: 'Transportation', value: latestFootprint.breakdown.transportation },
      { name: 'Electricity', value: latestFootprint.breakdown.electricity },
      { name: 'Diet & Food', value: latestFootprint.breakdown.food },
      { name: 'Shopping Habits', value: latestFootprint.breakdown.shopping }
    ].filter(item => item.value > 0);
  }, [latestFootprint]);

  /** Line chart data derived from historical logs */
  const lineData = useMemo(() => {
    return history
      .map(log => ({
        name: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        CO2: log.total
      }))
      .reverse();
  }, [history]);

  return {
    summary,
    history,
    activeGoal,
    loading,
    error,
    latestFootprint,
    pieData,
    lineData,
  };
}
