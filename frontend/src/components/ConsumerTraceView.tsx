import React, { useState } from 'react';
import { QrCode, CheckCircle2, ShieldCheck, MapPin, Clock, Truck, DollarSign, Sprout, Store, Sparkles } from 'lucide-react';

export const ConsumerTraceView: React.FC = () => {
  const [activeBatch, setActiveBatch] = useState('AC-TRACE-2026-9041');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
          <QrCode className="w-3.5 h-3.5" />
          <span>FARM-TO-FORK DIGITAL PASSPORT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Consumer Freshness & Price Transparency
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Scan the QR code on your produce basket or restaurant receipt to see the exact verified journey and transparent margin breakdown.
        </p>
      </div>

      {/* Traceability Passport Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Passport Top Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl">
              🍅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display">Hydro-Certified Vine Tomatoes</h2>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Grade A
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Passport ID: {activeBatch} &bull; Shreemaya Dining Hall</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Field to Kitchen Duration</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">11 Hours Total</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Timeline Nodes */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cryptographically Verified Provenance Log
            </h3>

            <div className="relative pl-6 border-l-2 border-emerald-500 space-y-6">
              {/* Node 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-emerald-100"></div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">Harvested & Bull; 06:30 AM</span>
                  <h4 className="font-bold text-sm text-slate-900">Ramesh Patel Farm (Sanwer, Indore)</h4>
                  <p className="text-xs text-slate-500">Grown on 3.5 acres under micro-drip irrigation. Handpicked at peak ripeness.</p>
                </div>
              </div>

              {/* Node 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">Aggregated & Crated & Bull; 09:45 AM</span>
                  <h4 className="font-bold text-sm text-slate-900">Sharma Krishi Seva Center</h4>
                  <p className="text-xs text-slate-500">Optical grade inspection: 94% Ripeness, 2.1% defect score. Packed in sanitized aerated crates.</p>
                </div>
              </div>

              {/* Node 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase">Backhaul Transport & Bull; 02:15 PM</span>
                  <h4 className="font-bold text-sm text-slate-900">Jagdish Yadav (Tata Ace MP-09-AB-4210)</h4>
                  <p className="text-xs text-slate-500">Shared return-leg trip. Saved 14.8 kg CO2 emissions by eliminating empty deadhead run.</p>
                </div>
              </div>

              {/* Node 4 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-emerald-100"></div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">Kitchen Delivered & Bull; 05:30 PM</span>
                  <h4 className="font-bold text-sm text-slate-900">Shreemaya Commercial Kitchen</h4>
                  <p className="text-xs text-slate-500">Delivery verified via OTP 9103. Escrow settled instantly via UPI.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Margin Pie / Split */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Where Did Your Rupee Go?</h4>
                <p className="text-xs text-slate-500">Exact landed breakdown of ₹18.00/kg retail/commercial value</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                78.9% To Producer
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white rounded-xl border border-emerald-300">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Farmer Net</span>
                <span className="text-lg font-black text-emerald-700 font-display">₹14.20</span>
                <span className="text-[10px] text-emerald-600 font-medium block">78.9% share</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Transport</span>
                <span className="text-lg font-bold text-slate-800 font-display">₹1.60</span>
                <span className="text-[10px] text-slate-400 block">8.9% share</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Aggregation</span>
                <span className="text-lg font-bold text-slate-800 font-display">₹1.00</span>
                <span className="text-[10px] text-slate-400 block">5.5% share</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Quality & Plat.</span>
                <span className="text-lg font-bold text-slate-800 font-display">₹1.20</span>
                <span className="text-[10px] text-slate-400 block">6.7% share</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic text-center">
              In traditional supply chains, the farmer receives only ₹9–11/kg (less than 45% of consumer price).
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
