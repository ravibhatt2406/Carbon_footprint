/**
 * @module profileService
 * Service layer for user profile and badge API operations.
 * Centralizes all profile-related API calls out of page components.
 */
import { api } from '../utils/api';

/** @typedef {import('../types/index').Badge} Badge */
/** @typedef {import('../types/index').FootprintLog} FootprintLog */

/**
 * Fetches all achievement badges (unlocked and locked) for the authenticated user.
 * @returns {Promise<Badge[]>} Array of badge objects with unlock status
 */
export function fetchBadges() {
  return api.get('/badges');
}

/**
 * Fetches the carbon calculation history for the profile view.
 * @returns {Promise<FootprintLog[]>} Array of footprint log entries
 */
export function fetchProfileHistory() {
  return api.get('/footprint-logs/history');
}
