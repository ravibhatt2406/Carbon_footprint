/**
 * @module types
 * Shared JSDoc type definitions for the EcoLens AI frontend application.
 * Import this module in any file to reference these types in JSDoc comments.
 */

/**
 * Breakdown of carbon emissions by category.
 * @typedef {Object} FootprintBreakdown
 * @property {number} transportation - CO₂ from car, bike, bus, train (kg)
 * @property {number} electricity - CO₂ from monthly electricity usage (kg)
 * @property {number} food - CO₂ from dietary habits (kg)
 * @property {number} shopping - CO₂ from consumer shopping habits (kg)
 */

/**
 * User inputs for the carbon footprint calculator.
 * @typedef {Object} FootprintInputs
 * @property {number} carKm - Weekly car distance in km
 * @property {number} bikeKm - Weekly bicycle distance in km
 * @property {number} busKm - Weekly bus distance in km
 * @property {number} trainKm - Weekly train distance in km
 * @property {number} electricityKwh - Monthly electricity consumption in kWh
 * @property {'vegetarian'|'mixed'|'non-vegetarian'} foodHabit - Dietary classification
 * @property {'low'|'moderate'|'high'} shoppingHabit - Consumer spending level
 */

/**
 * A single carbon footprint calculation log entry.
 * @typedef {Object} FootprintLog
 * @property {string} id - Unique log identifier
 * @property {string} userId - Owner user ID
 * @property {FootprintInputs} inputs - Original user inputs
 * @property {FootprintBreakdown} breakdown - Emission breakdown by category
 * @property {number} total - Total monthly CO₂ in kg
 * @property {string} advice - Gemini AI generated advice text (markdown)
 * @property {string} date - ISO 8601 date string
 */

/**
 * Dashboard summary data aggregating current and previous footprints.
 * @typedef {Object} DashboardSummary
 * @property {FootprintLog|null} current - Most recent footprint log
 * @property {FootprintLog|null} previous - Second most recent footprint log
 * @property {number} difference - Absolute change in total (current - previous)
 * @property {number} percentageChange - Percentage change from previous
 */

/**
 * A carbon reduction goal set by the user.
 * @typedef {Object} Goal
 * @property {string} id - Unique goal identifier
 * @property {string} userId - Owner user ID
 * @property {number} targetValue - Target CO₂ reduction in kg
 * @property {number} currentProgress - Current progress toward target in kg
 * @property {string} startDate - ISO 8601 start date
 * @property {string} endDate - ISO 8601 end date
 * @property {boolean} completed - Whether the goal has been met
 */

/**
 * A weekly eco challenge for gamification.
 * @typedef {Object} Challenge
 * @property {string} id - Unique challenge identifier
 * @property {string} userId - Owner user ID
 * @property {string} title - Challenge title
 * @property {string} description - Challenge description/instructions
 * @property {number} points - Points awarded on completion
 * @property {boolean} completed - Whether the challenge is completed
 * @property {string} weekStartDate - ISO date of week start
 * @property {string} [dateCompleted] - ISO date of completion
 */

/**
 * An achievement badge earned by the user.
 * @typedef {Object} Badge
 * @property {string} badgeType - Badge type key (beginner, eco_explorer, green_warrior, carbon_hero)
 * @property {string} title - Human-readable badge title
 * @property {string} description - Badge description
 * @property {boolean} unlocked - Whether the user has earned this badge
 * @property {string|null} unlockedAt - ISO date of unlock, or null
 */

/**
 * Authenticated user profile.
 * @typedef {Object} UserProfile
 * @property {string} uid - User ID
 * @property {string} email - User email
 * @property {string} displayName - Display name
 * @property {number} points - Eco experience points
 */

/**
 * Result from OCR receipt/bill analysis.
 * @typedef {Object} OcrResult
 * @property {'electricity'|'receipt'} type - Document type detected
 * @property {number|null} unitsConsumed - kWh for electricity or item count for receipts
 * @property {number|null} purchaseAmount - Total purchase amount in currency
 * @property {string[]} productCategories - Detected product categories
 * @property {number} estimatedCarbonImpact - Estimated CO₂ in kg
 * @property {string} explanation - Human-readable explanation of calculation
 */
