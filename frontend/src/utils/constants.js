/**
 * @module constants
 * Shared constants used across the EcoLens AI frontend application.
 * Centralizes magic values to improve maintainability and consistency.
 */

/** Color palette for pie chart segments (Transportation, Electricity, Food, Shopping) */
export const PIE_COLORS = ['#3b82f6', '#eab308', '#10b981', '#a855f7'];

/**
 * Calculator step definitions for the multi-step footprint wizard.
 * Each step maps to a fieldset in the calculator form.
 */
export const CALCULATOR_STEPS = [
  { id: 1, title: 'Transportation' },
  { id: 2, title: 'Electricity' },
  { id: 3, title: 'Food & Diet' },
  { id: 4, title: 'Shopping' },
];

/** Dietary classification options for the calculator food step. */
export const FOOD_OPTIONS = [
  { id: 'vegetarian', title: 'Vegetarian', desc: 'No meat, plant and dairy products.' },
  { id: 'mixed', title: 'Mixed Diet', desc: 'Poultry, fish, vegetables, occasional beef.' },
  { id: 'non-vegetarian', title: 'Non-Vegetarian', desc: 'Frequent red meat, poultry, dairy.' },
];

/** Shopping habit options for the calculator shopping step. */
export const SHOPPING_OPTIONS = [
  { id: 'low', title: 'Minimal / Low', desc: 'Minimal clothing, gadgets, mostly second-hand.' },
  { id: 'moderate', title: 'Moderate / Average', desc: 'Occasional purchases of new clothing and goods.' },
  { id: 'high', title: 'Frequent / High', desc: 'Frequent purchases of new items, electronics, clothing.' },
];

/** Goal period options for the goal creation form. */
export const GOAL_PERIOD_OPTIONS = [
  { value: '7', label: '7 Days (Short Challenge)' },
  { value: '14', label: '14 Days (Biweekly Goal)' },
  { value: '30', label: '30 Days (Monthly Goal)' },
  { value: '90', label: '90 Days (Quarterly Goal)' },
];

/**
 * Badge icon color mapping based on badge type and unlock status.
 * @param {string} type - Badge type key
 * @param {boolean} unlocked - Whether the badge is unlocked
 * @returns {string} Tailwind CSS classes for badge icon styling
 */
export function getBadgeIconColor(type, unlocked) {
  if (!unlocked) return 'bg-slate-100 text-slate-400';
  switch (type) {
    case 'beginner': return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'eco_explorer': return 'bg-yellow-100 text-yellow-750 border border-yellow-200';
    case 'green_warrior': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'carbon_hero': return 'bg-indigo-100 text-indigo-750 border border-indigo-200';
    default: return 'bg-slate-100 text-slate-700';
  }
}
