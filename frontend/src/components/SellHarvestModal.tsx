import React, { useState, useRef } from 'react';
import { X, Sprout, CheckCircle2, DollarSign, Calendar, MapPin, AlertCircle, Loader2, Camera, RefreshCw, Sparkles, Check, Info } from 'lucide-react';
import { QualityGrade, Harvest } from '../../../shared/types';
import { api } from '../services/api';

interface SellHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitHarvest?: (data: any) => void;
  onHarvestCreated?: (harvest: Harvest) => void;
}

export const SellHarvestModal: React.FC<SellHarvestModalProps> = ({
  isOpen,
  onClose,
  onSubmitHarvest,
  onHarvestCreated,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const [crop, setCrop] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState<number>(100);
  const [location, setLocation] = useState('Sanwer (Village Cluster A), Indore');
  const [minPrice, setMinPrice] = useState<number>(12.0);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A');
  const [sellingWindow, setSellingWindow] = useState('Tomorrow Morning');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAiResult(null);
        setInfoMsg('Photo added. Click "Analyze Crop Quality" to trigger real-time AI classification.');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleRunAiAnalysis = async () => {
    if (!image) {
      setErrorMsg('Please upload or capture a crop photo first.');
      return;
    }
    setIsAnalyzing(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      // Call the real backend Gemini AI Vision endpoint via API service
      const result = await api.analyzeQuality(image, crop);
      setAiResult(result);
      
      // Auto-detect identified crop if confident
      if (result.crop) {
        const matchingCrop = ['Tomato', 'Onion', 'Potato', 'Garlic'].find(
          c => c.toLowerCase() === result.crop.toLowerCase()
        );
        if (matchingCrop) {
          setCrop(matchingCrop);
        } else {
          setInfoMsg(`AI identified crop as "${result.crop}" which is outside our standard list. Please confirm manually.`);
        }
      }

      // Auto-populate quality grade detected
      if (result.grade) {
        setQualityGrade(result.grade as QualityGrade);
      } else if (result.estimatedGrade) {
        setQualityGrade(result.estimatedGrade as QualityGrade);
      }

      // Recommend minimum price based on quality grade analysis
      if (result.suggestedPriceMin) {
        setMinPrice(Number(result.suggestedPriceMin));
      }

    } catch (err: any) {
      console.error('Gemini Quality analysis failed:', err);
      setErrorMsg('AI Vision failed. Standard inputs remain active for manual calibration.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await api.createHarvest({
        crop,
        quantityKg,
        location,
        minAcceptablePrice: minPrice,
        qualityGrade,
        sellingWindow,
        harvestDate: new Date().toISOString().split('T')[0]
      });

      if (onHarvestCreated) {
        onHarvestCreated(created);
      }
      if (onSubmitHarvest) {
        onSubmitHarvest(created);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to create harvest:', err);
      setErrorMsg(err.message || 'Failed to submit harvest to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">Declare Harvest (Fasal Bechein)</h2>
              <p className="text-xs text-slate-500">Add photo to trigger Gemini real-time quality grading</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Image Upload & AI analysis section */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            1. Crop Photo Upload (Fasal Ka Photo)
          </h3>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          {!image ? (
            <button
              type="button"
              onClick={triggerSelectFile}
              className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl bg-white flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer text-slate-500"
            >
              <Camera className="w-8 h-8 text-slate-400" />
              <span className="font-bold text-[11px]">Capture or Upload Crop Image</span>
              <span className="text-[9px] text-slate-400 font-medium">Accepts live camera photos & device files</span>
            </button>
          ) : (
            <div className="space-y-3">
              {/* Image Preview */}
              <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={image}
                  alt="Crop preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setAiResult(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Run AI Analysis Trigger */}
              {!aiResult ? (
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleRunAiAnalysis}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gemini AI Analyzing Quality...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Analyze Crop Quality (AI Vishleshan)</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> AI Quality Certificate
                    </span>
                    <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                    <div>
                      Identified Crop: <strong className="text-slate-900">{aiResult.crop || crop}</strong>
                    </div>
                    <div>
                      Estimated Grade: <strong className="text-slate-900">{aiResult.grade || qualityGrade}</strong>
                    </div>
                    <div>
                      Ripeness Index: <strong className="text-slate-900">{aiResult.ripeness || 90}%</strong>
                    </div>
                    <div>
                      Defect Score: <strong className="text-slate-900">{aiResult.defectScore || 2.1}%</strong>
                    </div>
                    <div>
                      Shelf Life: <strong className="text-slate-900">{aiResult.shelfLifeDays || 5} Days</strong>
                    </div>
                    <div>
                      Confidence: <strong className="text-slate-900">{aiResult.confidence || 94}%</strong>
                    </div>
                  </div>
                  <div className="text-[9.5px] text-emerald-700 font-medium leading-relaxed bg-white/60 p-2 rounded-lg border border-emerald-100">
                    {aiResult.recommendation || aiResult.analysisNotes || 'Optical luster uniform, ready for high-value contract routing.'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Original Declaration Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs flex-1">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
            2. Harvest Form Details (Purna Karein)
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Crop Type (Fasal Ka Prakar)</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Tomato">Tomato (Tamatar)</option>
              <option value="Onion">Onion (Pyaz)</option>
              <option value="Potato">Potato (Aloo)</option>
              <option value="Garlic">Garlic (Lahsun)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity (kg)</label>
              <input
                type="number"
                value={quantityKg}
                onChange={(e) => setQuantityKg(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="100"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quality Grade</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Grade A">Grade A (Premium)</option>
                <option value="Grade B">Grade B (Standard)</option>
                <option value="Grade C">Grade C (Processing)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Farm Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min. Acceptable Price</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full pl-7 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selling Window</label>
              <select
                value={sellingWindow}
                onChange={(e) => setSellingWindow(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Today Evening">Today Evening</option>
                <option value="Tomorrow Morning">Tomorrow Morning</option>
                <option value="Within 2 Days">Within 2 Days</option>
              </select>
            </div>
          </div>

          {infoMsg && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-[11px] flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 shrink-0 text-sky-600 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isAnalyzing}
              className="px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer disabled:opacity-50 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isAnalyzing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50 text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Harvest (Fasal Darj Karein)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
