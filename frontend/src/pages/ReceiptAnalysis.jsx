import React, { useState } from 'react';
import { api } from '../utils/api';
import { FileUp, Sparkles, CheckCircle, HelpCircle, FileText, Image as ImageIcon } from 'lucide-react';

export default function ReceiptAnalysis() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setError('');

    // If selected file is an image, generate preview URL
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(''); // No preview for PDF
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/ocr/parse', formData);
      if (response.success) {
        setResult(response.data);
      } else {
        setError('Extraction completed with empty response.');
      }
    } catch (err) {
      console.error('OCR analysis submit error:', err);
      setError(err.message || 'Failed to scan the invoice. Make sure files are under 5MB.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Receipt & Bill OCR Analysis</h2>
        <p className="text-slate-500 font-medium mt-1">Upload electricity invoices or shop receipts. Gemini Vision will parse data and calculate emissions.</p>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold p-4 rounded-2xl flex items-center space-x-2">
          <HelpCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* UPLOADER CARD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-base font-extrabold text-slate-800">Upload Document</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!file ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-eco-400 rounded-3xl p-10 cursor-pointer bg-slate-50/50 hover:bg-eco-50/5 transition-all text-center group min-h-[220px]">
                <FileUp className="h-10 w-10 text-slate-400 group-hover:text-eco-500 transition-colors" />
                <span className="text-sm font-extrabold text-slate-700 mt-4">Select or drag file</span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1">PNG, JPG, or PDF (max 5MB)</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-4">
                {previewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-100 max-h-[220px] flex items-center justify-center bg-slate-100">
                    <img src={previewUrl} alt="Preview" className="object-contain max-h-[220px] w-full" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <FileText className="h-8 w-8 text-eco-500" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                        PDF Invoice Document
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1">
                  <span>File size: {Math.round(file.size / 1024)} KB</span>
                  <button type="button" onClick={handleClear} className="text-red-500 font-bold hover:underline">
                    Remove File
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-eco-600 hover:bg-eco-700 text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Scanning invoice with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Parse Document Impact</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESULTS CARD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-4">Extracted Carbon Insights</h3>
            
            {result ? (
              <div className="space-y-6 pt-4">
                
                {/* Impact Indicator */}
                <div className="bg-eco-50 border border-eco-100/60 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-eco-700 uppercase tracking-wider">Estimated CO₂</span>
                    <p className="text-2xl font-black text-eco-800 mt-1">{result.estimatedCarbonImpact} kg</p>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {result.type === 'electricity' ? 'Electricity Bill' : 'Shopping Receipt'}
                  </span>
                </div>

                {/* Specifics list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold border-b border-slate-50 pb-2">
                    <span className="text-slate-400">Units / Count</span>
                    <span className="text-slate-700">
                      {result.unitsConsumed !== null ? `${result.unitsConsumed} ${result.type === 'electricity' ? 'kWh' : 'items'}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold border-b border-slate-50 pb-2">
                    <span className="text-slate-400">Total Purchase</span>
                    <span className="text-slate-700">
                      {result.purchaseAmount !== null ? `$${Number(result.purchaseAmount).toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start text-xs font-semibold border-b border-slate-50 pb-2">
                    <span className="text-slate-400 shrink-0">Product Categories</span>
                    <span className="text-slate-700 text-right">
                      {result.productCategories && result.productCategories.length > 0
                        ? result.productCategories.join(', ')
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Analysis Summary</span>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{result.explanation}</p>
                </div>

              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs font-semibold">
                Upload a bill or receipt document on the left side to review real-time OCR results here.
              </div>
            )}
          </div>

          {result && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mt-6">
              🌱 Carbon calculations are logged locally
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
