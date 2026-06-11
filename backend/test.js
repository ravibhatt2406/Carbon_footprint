const { calculateFootprint } = require('./utils/emissionFactors');

function runTests() {
  console.log('🧪 Starting carbon footprint calculator tests...');
  let passed = true;

  // Test Case 1: Simple vegetarian test
  const inputs1 = {
    carKm: 0,
    bikeKm: 10,
    busKm: 0,
    trainKm: 0,
    electricityKwh: 100,
    foodHabit: 'vegetarian',
    shoppingHabit: 'low'
  };

  const res1 = calculateFootprint(inputs1);
  // Bike: 10 * 4.33 * 0.005 = 0.2165 (~0.22)
  // Electricity: 100 * 0.5 = 50
  // Food: 150
  // Shopping: 50
  // Total expected: 0.22 + 50 + 150 + 50 = 250.22
  console.log('Test 1 Output:', res1);
  if (Math.abs(res1.total - 250.22) > 0.1) {
    console.error('❌ Test 1 Failed: Expected total around 250.22, got', res1.total);
    passed = false;
  } else {
    console.log('✅ Test 1 Passed!');
  }

  // Test Case 2: Commuter mixed diet test
  const inputs2 = {
    carKm: 150,
    bikeKm: 0,
    busKm: 50,
    trainKm: 20,
    electricityKwh: 200,
    foodHabit: 'mixed',
    shoppingHabit: 'moderate'
  };

  const res2 = calculateFootprint(inputs2);
  // Car: 150 * 4.33 * 0.18 = 116.91
  // Bus: 50 * 4.33 * 0.08 = 17.32
  // Train: 20 * 4.33 * 0.04 = 3.46
  // Electricity: 200 * 0.5 = 100
  // Food: 250
  // Shopping: 150
  // Total expected: 116.91 + 17.32 + 3.46 + 100 + 250 + 150 = 637.69
  console.log('Test 2 Output:', res2);
  if (Math.abs(res2.total - 637.69) > 0.1) {
    console.error('❌ Test 2 Failed: Expected total around 637.69, got', res2.total);
    passed = false;
  } else {
    console.log('✅ Test 2 Passed!');
  }

  if (passed) {
    console.log('🎉 All backend tests passed successfully!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
