/**
 * @module useProfile
 * Custom hook encapsulating profile page data fetching.
 * Replaces inline state management and API calls previously in Profile.jsx.
 */
import { useState, useEffect } from 'react';
import { fetchBadges, fetchProfileHistory } from '../services/profileService';

/** @typedef {import('../types/index').Badge} Badge */
/** @typedef {import('../types/index').FootprintLog} FootprintLog */

/**
 * Fetches and manages badge and calculation history data for the profile page.
 * @returns {Object} Profile state
 * @returns {Badge[]} return.badges - Achievement badges list
 * @returns {FootprintLog[]} return.history - Calculation history logs
 * @returns {boolean} return.loading - Whether data is being fetched
 * @returns {string} return.error - Error message if fetching failed
 */
export function useProfile() {
  const [badges, setBadges] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfileData() {
      try {
        setLoading(true);
        const badgesData = await fetchBadges();
        setBadges(badgesData);

        const historyData = await fetchProfileHistory();
        setHistory(historyData);
      } catch (err) {
        console.error('Failed to load profile details:', err);
        setError('Failed to fetch profile history logs. Verify backend connection.');
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, []);

  return { badges, history, loading, error };
}
