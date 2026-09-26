import React, { useState } from 'react';
import { RefreshCw, ArrowRight, TrendingUp, CheckCircle2, AlertCircle, Zap, Shield, Truck, Users } from 'lucide-react';
import { evaluateCounterfactual } from '../../../shared/services/chainCompiler';

export const CounterfactualSimulator: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'full_optimal' | 'replace_trader' | 'enable_backhaul' | 'replace_distributor'>('full_optimal');

  const scenario = evaluateCounterfactual(activeScenario);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-200">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>COUNTERFACTUAL ANALYSIS ENGINE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          &ldquo;What If We Change One Link?&rdquo;
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          Traditional solutions advocate cutting everyone out. AgriChain mathematically isolates each supply-chain link to measure its exact value contribution vs its cost, allowing farmers to substitute or reform single links dynamically.
        </p>
      </div>

      {/* Scenario Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          id="btn-scenario-optimal"
          onClick={() => setActiveScenario('full_optimal')}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeScenario === 'full_optimal'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider opacity-80">Scenario 1</div>
          <div className="font-bold text-sm mt-1">Full Compiler Optimization</div>
          <div className={`text-xs mt-2 font-semibold ${activeScenario === 'full_optimal' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            +₹3.20/kg Improvement (+29.1%)
          </div>
        </button>

        <button
          id="btn-scenario-trader"
          onClick={() => setActiveScenario('replace_trader')}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeScenario === 'replace_trader'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider opacity-80">Scenario 2</div>
          <div className="font-bold text-sm mt-1">Trader to Verified Service</div>
          <div className={`text-xs mt-2 font-semibold ${activeScenario === 'replace_trader' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            +₹2.20/kg Improvement (+20.0%)
          </div>
        </button>

        <button
          id="btn-scenario-backhaul"
          onClick={() => setActiveScenario('enable_backhaul')}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeScenario === 'enable_backhaul'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider opacity-80">Scenario 3</div>
          <div className="font-bold text-sm mt-1">Substitute Empty Backhaul</div>
          <div className={`text-xs mt-2 font-semibold ${activeScenario === 'enable_backhaul' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            +₹1.60/kg Improvement (+12.7%)
          </div>
        </button>

        <button
          id="btn-scenario-distributor"
          onClick={() => setActiveScenario('replace_distributor')}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeScenario === 'replace_distributor'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider opacity-80">Scenario 4</div>
          <div className="font-bold text-sm mt-1">Pool & Direct Buyer</div>
          <div className={`text-xs mt-2 font-semibold ${activeScenario === 'replace_distributor' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            +₹2.80/kg Improvement (+25.4%)
          </div>
        </button>
      </div>

      {/* Counterfactual Visual Comparison Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Scenario Header */}
        <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded">
              Selected Counterfactual Model
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-display">{scenario.name}</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{scenario.description}</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Farmer Net Delta</div>
              <div className="text-3xl font-black text-emerald-700 font-display">
                +₹{scenario.improvement.toFixed(2)}/kg
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-0.5">
                +{scenario.percentageGain}% net income boost
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Side by Side Node Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Baseline Chain */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Baseline (Default Traditional Chain)
              </span>
              <span className="font-mono font-bold text-slate-700 text-sm">Net: ₹{scenario.originalNet.toFixed(2)}/kg</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">1</span>
                <div>
                  <div className="font-bold text-slate-800">Smallholder Farmer</div>
                  <div className="text-[11px] text-slate-400 font-sans">Forced price taker, isolated 100 kg lot</div>
                </div>
              </div>

              <div className="text-center text-slate-400">↓</div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs">2</span>
                  <div>
                    <div className="font-bold text-rose-900">{scenario.changedLink}</div>
                    <div className="text-[11px] text-rose-700 font-sans">Captures opaque margin / high freight</div>
                  </div>
                </div>
                <span className="font-bold text-rose-700">-₹3.20/kg</span>
              </div>

              <div className="text-center text-slate-400">↓</div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">3</span>
                <div>
                  <div className="font-bold text-slate-800">Secondary Mandi / Arthiya Auction</div>
                  <div className="text-[11px] text-slate-400 font-sans">Commission deductions + delayed settlement</div>
                </div>
              </div>

              <div className="text-center text-slate-400">↓</div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">4</span>
                <div>
                  <div className="font-bold text-slate-800">End Consumer / Retail</div>
                  <div className="text-[11px] text-slate-400 font-sans">Buys at inflated price (₹20+/kg)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reformed Counterfactual Chain */}
          <div className="bg-emerald-50/40 rounded-2xl p-6 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                AgriChain Counterfactual Alternative
              </span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                New Net: ₹{scenario.newNet.toFixed(2)}/kg
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">1</span>
                <div>
                  <div className="font-bold text-slate-800">Smallholder Farmer (Pooled)</div>
                  <div className="text-[11px] text-slate-500 font-sans">Joined 510 kg Virtual Consignment</div>
                </div>
              </div>

              <div className="text-center text-emerald-500">↓</div>

              <div className="p-3 bg-emerald-100/80 rounded-xl border border-emerald-300 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">2</span>
                  <div>
                    <div className="font-bold text-emerald-950">{scenario.replacementLink}</div>
                    <div className="text-[11px] text-emerald-800 font-sans">Transparent service, audited fee</div>
                  </div>
                </div>
                <span className="font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded text-[11px]">
                  REFORMED
                </span>
              </div>

              <div className="text-center text-emerald-500">↓</div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">3</span>
                <div>
                  <div className="font-bold text-slate-800">Digital Escrow & Direct Fulfillment</div>
                  <div className="text-[11px] text-slate-500 font-sans">Instant settlement, zero commission leakage</div>
                </div>
              </div>

              <div className="text-center text-emerald-500">↓</div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">4</span>
                <div>
                  <div className="font-bold text-slate-800">Direct Commercial Buyer</div>
                  <div className="text-[11px] text-slate-500 font-sans">Fresh delivery directly into kitchen/shelves</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Why this matters explanation */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Economic Rationale &amp; Bottom-Line Impact</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {scenario.explanation}
          </p>
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-800 flex items-center gap-2">
            <span>Core business outcome:</span>
            <strong className="text-white">&ldquo;Intermediary is a choice, not a gatekeeper.&rdquo;</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
