/**
 * @module ocrService
 * Service layer for receipt and bill OCR analysis API operations.
 * Centralizes all OCR-related API calls out of page components.
 */
import { api } from '../utils/api';

/** @typedef {import('../types/index').OcrResult} OcrResult */

/**
 * Uploads a document file for OCR parsing via Gemini Vision.
 * @param {FormData} formData - FormData containing the file under key 'file'
 * @returns {Promise<{success: boolean, data: OcrResult}>} OCR analysis result
 */
export function parseDocument(formData) {
  return api.post('/ocr/parse', formData);
}
