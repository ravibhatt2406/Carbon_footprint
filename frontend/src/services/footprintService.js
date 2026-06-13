/**
 * @module footprintService
 * Service layer for carbon footprint API operations.
 * Centralizes all footprint-related API calls out of page components.
 */
import { api } from '../utils/api';

/** @typedef {import('../types/index').DashboardSummary} DashboardSummary */
/** @typedef {import('../types/index').FootprintLog} FootprintLog */
/** @typedef {import('../types/index').FootprintInputs} FootprintInputs */

/**
 * Fetches the dashboard summary (current, previous, difference, percentageChange).
 * @returns {Promise<DashboardSummary>} Dashboard summary data
 */
export function fetchSummary() {
  return api.get('/footprint-logs/summary');
}

/**
 * Fetches the full carbon calculation history for the authenticated user.
 * @returns {Promise<FootprintLog[]>} Array of footprint log entries
 */
export function fetchHistory() {
  return api.get('/footprint-logs/history');
}

/**
 * Submits a new carbon footprint calculation.
 * @param {FootprintInputs} payload - User input data for calculation
 * @returns {Promise<FootprintLog>} The newly created footprint record with advice
 */
export function submitFootprint(payload) {
  return api.post('/footprint-logs', payload);
}
