// Predefined emission factors (in kg CO2 equivalents)
// References: EPA, DEFRA, and general carbon accounting standards for simplified tracking

const EMISSION_FACTORS = {
  // Transportation (per km)
  transportation: {
    car: 0.18,      // Average passenger car (gasoline)
    bike: 0.005,    // Lifecycle emissions of bicycle manufacturing/maintenance
    bus: 0.08,      // Average transit bus passenger
    train: 0.04     // National average rail passenger transit
  },

  // Electricity (per kWh)
  electricity: {
    kwh: 0.5        // Grid electricity average emission factor
  },

  // Food Habits (monthly footprint based on general diet classifications)
  food: {
    vegetarian: 150,     // Low meat / meat-free monthly footprint
    mixed: 250,          // Balanced diet (some poultry/fish, limited red meat)
    'non-vegetarian': 400 // High meat / regular red meat consumption
  },

  // Shopping Habits (monthly footprint based on consumer spending levels)
  shopping: {
    low: 50,             // Minimalist, second-hand buying habits
    moderate: 150,       // Average consumer spending habits
    high: 300            // Frequent purchases of new clothing, gadgets, items
  }
};

/**
 * Calculates carbon footprint based on weekly inputs and monthly habits.
 * 
 * @param {Object} inputs
 * @param {number} inputs.carKm - Car distance per week
 * @param {number} inputs.bikeKm - Bike distance per week
 * @param {number} inputs.busKm - Bus distance per week
 * @param {number} inputs.trainKm - Train distance per week
 * @param {number} inputs.electricityKwh - Electricity usage per month
 * @param {string} inputs.foodHabit - 'vegetarian', 'mixed', or 'non-vegetarian'
 * @param {string} inputs.shoppingHabit - 'low', 'moderate', or 'high'
 * 
 * @returns {Object} Total and breakdown emissions in kg CO2 per month
 */
function calculateFootprint(inputs) {
  const weeksPerMonth = 4.33; // Average weeks in a month

  // Transportation emissions (weekly km * weeks/month * factor)
  const carEmissions = (Number(inputs.carKm) || 0) * weeksPerMonth * EMISSION_FACTORS.transportation.car;
  const bikeEmissions = (Number(inputs.bikeKm) || 0) * weeksPerMonth * EMISSION_FACTORS.transportation.bike;
  const busEmissions = (Number(inputs.busKm) || 0) * weeksPerMonth * EMISSION_FACTORS.transportation.bus;
  const trainEmissions = (Number(inputs.trainKm) || 0) * weeksPerMonth * EMISSION_FACTORS.transportation.train;
  const transportationTotal = carEmissions + bikeEmissions + busEmissions + trainEmissions;

  // Electricity emissions (monthly kWh * factor)
  const electricityTotal = (Number(inputs.electricityKwh) || 0) * EMISSION_FACTORS.electricity.kwh;

  // Food habits emissions (flat rate per month)
  const foodTotal = EMISSION_FACTORS.food[inputs.foodHabit] || EMISSION_FACTORS.food.mixed;

  // Shopping habits emissions (flat rate per month)
  const shoppingTotal = EMISSION_FACTORS.shopping[inputs.shoppingHabit] || EMISSION_FACTORS.shopping.moderate;

  const total = transportationTotal + electricityTotal + foodTotal + shoppingTotal;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      transportation: Math.round(transportationTotal * 100) / 100,
      electricity: Math.round(electricityTotal * 100) / 100,
      food: Math.round(foodTotal * 100) / 100,
      shopping: Math.round(shoppingTotal * 100) / 100
    }
  };
}

module.exports = {
  EMISSION_FACTORS,
  calculateFootprint
};
