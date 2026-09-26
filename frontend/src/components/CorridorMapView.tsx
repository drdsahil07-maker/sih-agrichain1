import React, { useState } from 'react';
import { Map, Navigation, Truck, Store, MapPin, Cpu, ArrowRight, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';
import { AgriMap } from './AgriMap';

interface CorridorMapViewProps {
  onSelectChain?: () => void;
}

export const CorridorMapView: React.FC<CorridorMapViewProps> = ({ onSelectChain }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'farms' | 'trucks' | 'buyers'>('all');

  return (
    <div className="space-y-4">
      {/* Map Control Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold text-slate-900">Active Corridor: Sanwer &rarr; Indore (32 km)</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">ETA: 48 mins &bull; 5 Farm pickups</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Nodes (8)
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('farms')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'farms' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌱 Pickups
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('trucks')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'trucks' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🚚 Backhaul
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('buyers')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'buyers' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏪 Buyers
            </button>
          </div>

          {onSelectChain && (
            <button
              type="button"
              onClick={onSelectChain}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Compile Routes</span>
            </button>
          )}
        </div>
      </div>

      {/* The Leaflet Map Component */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 relative z-0 isolate">
        <AgriMap height="460px" />
      </div>

      {/* Visual Corridor Node Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              1. Farmgate Cluster
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">Sanwer</span>
          </div>
          <div className="text-slate-800 font-semibold">5 Smallholders (510 kg)</div>
          <div className="text-slate-500 text-[11px]">Aggregated locally without distress selling</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              2. Consignment Hub
            </span>
            <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">Manglia</span>
          </div>
          <div className="text-slate-800 font-semibold">Crating &amp; Quality Check</div>
          <div className="text-slate-500 text-[11px]">Fixed ₹1.00/kg service fee (No spread)</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              3. Empty Backhaul
            </span>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Tata Ace</span>
          </div>
          <div className="text-slate-800 font-semibold">Jagdish Yadav (MP-09-AB)</div>
          <div className="text-slate-500 text-[11px]">Bhopal &rarr; Indore return trip (40% discount)</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-teal-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              4. Commercial Buyer
            </span>
            <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">Indore City</span>
          </div>
          <div className="text-slate-800 font-semibold">Shreemaya Kitchens</div>
          <div className="text-slate-500 text-[11px]">Procuring 500 kg @ ₹18.00/kg (Instant UPI)</div>
        </div>
      </div>
    </div>
  );
};
