import React, { useState, useEffect } from 'react';
import { Boxes, MapPin, CheckCircle2, TrendingUp, Truck, Users, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';
import { FarmerPool, Harvest } from '../../../shared/types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface DynamicPoolingViewProps {
  onInspectPool?: (pool: FarmerPool) => void;
}

export const DynamicPoolingView: React.FC<DynamicPoolingViewProps> = ({ onInspectPool }) => {
  const [pools, setPools] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchingPoolId, setMatchingPoolId] = useState<string | null>(null);
  const [transportOptions, setTransportOptions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const fetchedPools = await api.getPools();
    setPools(fetchedPools);
    setIsLoading(false);
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    // Suggest pools based on a standard buyer requirement for the prototype
    const newSuggestions = await api.suggestPools({
      crop: 'Tomato',
      quantityKg: 1000,
      qualityGrade: 'Grade A',
      destination: 'Indore City',
      sellingWindow: 'Tomorrow'
    });
    setSuggestions(newSuggestions);
    setIsSuggesting(false);
  };

  const handleFindTransport = async (poolId: string) => {
    setMatchingPoolId(poolId);
    try {
      const options = await api.getTransportOptions(poolId);
      setTransportOptions(options);
    } catch (e: any) {
      alert("Failed to find transport: " + e.message);
    }
  };

  const handleAssignTransport = async (poolId: string, tripId: string) => {
    try {
      await api.assignTransport(poolId, tripId);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setMatchingPoolId(null);
      setTransportOptions([]);
      fetchData();
    } catch (e: any) {
      alert("Failed to assign transport: " + e.message);
    }
  };

  const handleConfirmPool = async (suggestion: any) => {
    try {
      await api.createPool(suggestion);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setSuggestions(suggestions.filter(s => s !== suggestion));
      fetchData();
    } catch (e: any) {
      alert("Failed to confirm pool: " + e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Concept Header */}
      <div className="space-y-2 flex justify-between items-start">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold border border-purple-200">
            <Boxes className="w-3.5 h-3.5" />
            <span>DYNAMIC SMALL-LOT AGGREGATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-2">
            Virtual Smallholder Consignments
          </h1>
          <p className="text-slate-600 text-sm max-w-3xl leading-relaxed mt-2">
            Aggregate nearby small lots into high-volume commercial consignments to unlock better logistics pricing.
          </p>
        </div>
        <button 
          onClick={handleSuggest}
          disabled={isSuggesting}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSuggesting ? 'Analyzing...' : 'Generate AI Suggestions'}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200 space-y-4">
          <h2 className="font-bold text-purple-900">Suggested Pools for "1000 kg Tomato" Requirement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800">{s.clusterName}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Match: {s.matchScore}%</span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1 mb-4">
                    <div>Quantity: <strong>{s.currentQuantityKg} kg</strong> / {s.targetQuantityKg} kg</div>
                    <div>Farmers involved: <strong>{s.farmers.length}</strong></div>
                    <div className="text-emerald-600 font-semibold text-xs mt-2">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Estimated Logistics Saving: ₹{s.estimatedSavings}/kg
                    </div>
                  </div>
                </div>
                <button onClick={() => handleConfirmPool(s)} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg cursor-pointer">
                  Confirm & Lock Pool
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Pools */}
      <h2 className="text-xl font-bold text-slate-900 font-display">Active & Dispatched Pools</h2>
      {isLoading ? (
        <div className="text-slate-500 text-sm">Loading active pools...</div>
      ) : pools.length === 0 ? (
        <div className="text-slate-500 text-sm">No active pools found. Click 'Generate AI Suggestions' to form one.</div>
      ) : (
        <div className="space-y-6">
          {pools.map(pool => (
            <div key={pool.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-900 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-purple-200">
                      {pool.poolCode}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pool.status === 'ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {pool.status.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-display">
                    {pool.totalQuantityKg} kg {pool.crop} Consolidated Lot
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pickup: <strong>{pool.clusterName}</strong> &bull; Destination: <strong>{pool.destination}</strong>
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-right shrink-0">
                  <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider mb-1">
                    Estimated Pooling Saving
                  </div>
                  <div className="text-2xl font-black text-purple-900 font-display flex items-baseline justify-end gap-1">
                    +₹{pool.estimatedSavings?.toFixed(2) || '1.50'} <span className="text-xs text-purple-600 font-medium font-sans">/ kg</span>
                  </div>
                  <div className="text-[10px] text-purple-600 font-semibold mt-1">
                    via shared commercial logistics
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Participating Smallholders ({pool.farmerCount})
                  </h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-2 space-y-1">
                    {pool.farmers?.map((f: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {f.farmerName?.charAt(0) || 'F'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{f.farmerName}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {f.village}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">{f.quantityKg} kg</div>
                          <div className="text-[10px] font-bold text-emerald-600">
                            +₹{(f.quantityKg * (pool.estimatedSavings || 1.5)).toLocaleString('en-IN')} net lift
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pool Economics & Viability
                  </h3>
                  <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                      <span className="text-slate-400 text-sm">Combined Volume</span>
                      <span className="font-bold">{pool.totalQuantityKg} kg</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                      <span className="text-slate-400 text-sm">Quality Compliance</span>
                      <span className="font-bold flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" /> 100% {pool.crop} Grade A
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Target Buyer Price</span>
                      <span className="font-bold">₹18.00 / kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
