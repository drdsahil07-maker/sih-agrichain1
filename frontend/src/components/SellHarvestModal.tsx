import React, { useState } from 'react';
import { X, Sprout, CheckCircle2, DollarSign, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
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
  const [crop, setCrop] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState<number>(100);
  const [location, setLocation] = useState('Sanwer (Village Cluster A), Indore');
  const [minPrice, setMinPrice] = useState<number>(12.0);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A');
  const [sellingWindow, setSellingWindow] = useState('Tomorrow Morning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">Declare Harvest (Fasal Bechein)</h2>
              <p className="text-xs text-slate-500">AgriChain Compiler will find best net price</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Crop (Fasal)</label>
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

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
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
