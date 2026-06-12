const geminiService = require('../../services/geminiService');

describe('geminiService (Simulation Fallbacks)', () => {
  it('returns simulated advice when API client is not initialized', async () => {
    const inputs = { carKm: 100, electricityKwh: 50 };
    const breakdown = { transportation: 77.94, electricity: 25, food: 150, shopping: 50 };
    const total = 302.94;

    const result = await geminiService.getCarbonAdvice(inputs, breakdown, total);
    expect(result).toContain('EcoLens AI Simulated Analysis');
    expect(result).toContain('Transportation');
  });

  it('returns simulated challenges when API client is not initialized', async () => {
    const result = await geminiService.generateWeeklyChallenges(100);
    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('Cold Water Wash');
  });

  it('returns simulated receipt analysis for PDF mimetype', async () => {
    const result = await geminiService.analyzeReceipt(Buffer.from(''), 'application/pdf');
    expect(result.type).toBe('electricity');
    expect(result.unitsConsumed).toBe(280);
    expect(result.estimatedCarbonImpact).toBe(140);
  });

  it('returns simulated receipt analysis for image mimetype', async () => {
    const result = await geminiService.analyzeReceipt(Buffer.from(''), 'image/png');
    expect(result.type).toBe('receipt');
    expect(result.estimatedCarbonImpact).toBe(18.5);
  });
});
