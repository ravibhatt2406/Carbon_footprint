const { calculateFootprint, EMISSION_FACTORS } = require('../../utils/emissionFactors');

describe('emissionFactors Utility', () => {
  it('correctly calculates footprint with zero inputs', () => {
    const inputs = {
      carKm: 0,
      bikeKm: 0,
      busKm: 0,
      trainKm: 0,
      electricityKwh: 0,
      foodHabit: 'mixed',
      shoppingHabit: 'moderate'
    };
    const result = calculateFootprint(inputs);
    
    // Total should equal baseline food + baseline shopping
    const expectedBaseline = EMISSION_FACTORS.food.mixed + EMISSION_FACTORS.shopping.moderate;
    expect(result.total).toBe(expectedBaseline);
    expect(result.breakdown.transportation).toBe(0);
    expect(result.breakdown.electricity).toBe(0);
    expect(result.breakdown.food).toBe(EMISSION_FACTORS.food.mixed);
    expect(result.breakdown.shopping).toBe(EMISSION_FACTORS.shopping.moderate);
  });

  it('correctly calculates transportation emissions based on distance', () => {
    const inputs = {
      carKm: 100, // 100 * 4.33 * 0.18 = 77.94
      bikeKm: 50,  // 50 * 4.33 * 0.005 = 1.0825
      busKm: 200,  // 200 * 4.33 * 0.08 = 69.28
      trainKm: 300, // 300 * 4.33 * 0.04 = 51.96
      electricityKwh: 0,
      foodHabit: 'vegetarian', // 150
      shoppingHabit: 'low' // 50
    };
    const result = calculateFootprint(inputs);

    const expectedTransportation = Math.round((77.94 + 1.0825 + 69.28 + 51.96) * 100) / 100; // 200.26
    expect(result.breakdown.transportation).toBe(expectedTransportation);
    expect(result.breakdown.food).toBe(150);
    expect(result.breakdown.shopping).toBe(50);
  });

  it('handles invalid non-numeric types gracefully by converting to 0', () => {
    const inputs = {
      carKm: 'not-a-number',
      bikeKm: 'not-a-number',
      busKm: undefined,
      trainKm: null,
      electricityKwh: 'invalid',
      foodHabit: 'invalid-diet', // should fallback to mixed
      shoppingHabit: 'invalid-shopping' // should fallback to moderate
    };
    const result = calculateFootprint(inputs);

    expect(result.breakdown.transportation).toBe(0);
    expect(result.breakdown.electricity).toBe(0);
    expect(result.breakdown.food).toBe(EMISSION_FACTORS.food.mixed);
    expect(result.breakdown.shopping).toBe(EMISSION_FACTORS.shopping.moderate);
  });
});
