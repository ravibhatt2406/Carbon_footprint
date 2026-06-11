const geminiService = require('../services/geminiService');

const ocrController = {
  /**
   * Processes a receipt or bill upload using Gemini Vision API
   */
  async parse(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded. Please upload a receipt or utility bill image/PDF.' });
      }

      const fileBuffer = req.file.buffer;
      const fileMimeType = req.file.mimetype;

      console.log(`Processing file upload: size=${fileBuffer.length} bytes, mimetype=${fileMimeType}`);

      // Parse receipt using Gemini Vision API (or simulated parser if credentials are missing)
      const parsedData = await geminiService.analyzeReceipt(fileBuffer, fileMimeType);

      // Return the structured extraction data to the frontend
      res.json({
        success: true,
        data: parsedData
      });
    } catch (error) {
      console.error('OCR Controller parse error:', error);
      res.status(500).json({ error: 'Failed to process document. Please ensure it is a valid image or PDF.' });
    }
  }
};

module.exports = ocrController;
