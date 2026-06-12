const ocrController = require('../../controllers/ocrController');
const geminiService = require('../../services/geminiService');

jest.mock('../../services/geminiService', () => ({
  analyzeReceipt: jest.fn()
}));

describe('ocrController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('returns 400 if no file is uploaded', async () => {
    await ocrController.parse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No file uploaded. Please upload a receipt or utility bill image/PDF.'
    });
  });

  it('parses the uploaded file and returns structured data', async () => {
    req.file = {
      buffer: Buffer.from('mock-file-content'),
      mimetype: 'image/png'
    };

    const mockParsed = {
      estimatedCarbonImpact: 45.2,
      type: 'shopping',
      unitsConsumed: 5,
      purchaseAmount: 120.5,
      productCategories: ['Electronics', 'Household'],
      explanation: 'Great job!'
    };
    geminiService.analyzeReceipt.mockResolvedValue(mockParsed);

    await ocrController.parse(req, res);

    expect(geminiService.analyzeReceipt).toHaveBeenCalledWith(req.file.buffer, req.file.mimetype);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockParsed
    });
  });

  it('returns 500 if Gemini service fails', async () => {
    req.file = {
      buffer: Buffer.from('mock-file-content'),
      mimetype: 'image/png'
    };
    geminiService.analyzeReceipt.mockRejectedValue(new Error('API Error'));

    await ocrController.parse(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to process document. Please ensure it is a valid image or PDF.'
    });
  });
});
