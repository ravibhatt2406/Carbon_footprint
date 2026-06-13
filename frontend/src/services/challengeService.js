/**
 * @module challengeService
 * Service layer for weekly eco challenge API operations.
 * Centralizes all challenge-related API calls out of page components.
 */
import { api } from '../utils/api';

/** @typedef {import('../types/index').Challenge} Challenge */

/**
 * Fetches the current week's challenges for the authenticated user.
 * If no challenges exist, the backend generates them via Gemini AI.
 * @returns {Promise<Challenge[]>} Array of weekly challenge objects
 */
export function fetchChallenges() {
  return api.get('/challenges');
}

/**
 * Marks a challenge as completed and triggers point/badge awards.
 * @param {string} challengeId - The challenge ID to complete
 * @returns {Promise<Challenge>} The updated challenge object
 */
export function completeChallenge(challengeId) {
  return api.post(`/challenges/${challengeId}/complete`);
}
