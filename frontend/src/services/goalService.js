/**
 * @module goalService
 * Service layer for carbon reduction goal API operations.
 * Centralizes all goal-related API calls out of page components.
 */
import { api } from '../utils/api';

/** @typedef {import('../types/index').Goal} Goal */

/**
 * Fetches all goals for the authenticated user.
 * @returns {Promise<Goal[]>} Array of goal objects
 */
export function fetchGoals() {
  return api.get('/goals');
}

/**
 * Creates a new carbon reduction goal.
 * @param {Object} data - Goal creation payload
 * @param {number} data.targetValue - Target CO₂ reduction in kg
 * @param {string} data.endDate - ISO 8601 end date
 * @returns {Promise<Goal>} The newly created goal
 */
export function createGoal(data) {
  return api.post('/goals', data);
}

/**
 * Updates the progress on an existing goal.
 * @param {string} goalId - The goal ID to update
 * @param {number} currentProgress - New progress value in kg
 * @returns {Promise<Goal>} The updated goal object
 */
export function updateGoalProgress(goalId, currentProgress) {
  return api.put(`/goals/${goalId}`, { currentProgress });
}
