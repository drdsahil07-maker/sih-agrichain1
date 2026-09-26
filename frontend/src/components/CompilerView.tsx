import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  HelpCircle,
  Truck,
  Building2,
  Users,
  Store
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChainOption, QualityGrade, Harvest } from '../../../shared/types';
import { compileSupplyChains } from '../../../shared/services/chainCompiler';
import { api } from '../services/api';
import { useEffect } from 'react';
import { HistoricalPriceTrendChart } from './HistoricalPriceTrendChart';

interface CompilerViewProps {
  onChainAccepted?: (option: ChainOption) => void;
  initialHarvest?: Harvest;
}

export const CompilerView: React.FC<CompilerViewProps> = ({ onChainAccepted, initialHarvest }) => {
  // Harvest declaration inputs
  const [crop, setCrop] = useState(initialHarvest?.crop || 'Tomato');
  const [quantityKg, setQuantityKg] = useState<number>(initialHarvest?.quantityKg || 100);
  const [location, setLocation] = useState(initialHarvest?.location || 'Sanwer (Village Cluster A), Indore');
  const [minPrice, setMinPrice] = useState<number>(12.0);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A');
  const [sellingWindow, setSellingWindow] = useState('Tomorrow Morning');

  // Compiling simulation state
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState<string>('');
  const [compiledOptions, setCompiledOptions] = useState<ChainOption[]>(() => 
    compileSupplyChains({
      crop: 'Tomato',
      quantityKg: 100,
      location: 'Sanwer (Village Cluster A), Indore',
      harvestDate: '2026-09-10',
      minAcceptablePrice: 12.0,
      qualityGrade: 'Grade A',
    })
  );
  const [selectedChainId, setSelectedChainId] = useState<string>('chain-dynamic-pool');
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);
  const [showTrendChart, setShowTrendChart] = useState(true);

  const selectedOption = compiledOptions.find(o => o.id === selectedChainId) || compiledOptions[0];

  const handleRunCompiler = () => {
    setIsCompiling(true);
    setAcceptedSuccess(false);
    setCompileStep('Scanning local demand in Indore commercial hubs...');

    setTimeout(() => {
      setCompileStep('Checking returning empty vehicles (Backhaul matching)...');
    }, 450);

    setTimeout(() => {
      setCompileStep('Evaluating smallholder cluster pooling opportunities...');
    }, 900);

    setTimeout(() => {
      setCompileStep('Computing Multi-Attribute Value: Net Price + Reliability - Perishability Risk...');
    }, 1350);

    setTimeout(() => {
      const results = compileSupplyChains({
        crop,
        quantityKg,
        location,
        harvestDate: '2026-09-10',
        minAcceptablePrice: minPrice,
        qualityGrade,
      });
      setCompiledOptions(results);
      setSelectedChainId(results[0]?.id || 'chain-dynamic-pool');
      setIsCompiling(false);
      setCompileStep('');
    }, 1800);
  };

  const handleAcceptChain = (option: ChainOption) => {
    setAcceptedSuccess(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
    if (onChainAccepted) {
      onChainAccepted(option);
    }
  };

  const loadPresetFlagship = () => {
    setCrop('Tomato');
    setQuantityKg(100);
    setLocation('Sanwer (Village Cluster A), Indore');
    setMinPrice(12.0);
    setQualityGrade('Grade A');
    setSellingWindow('Tomorrow Morning');
    handleRunCompiler();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Clean Route Comparison Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">
            <Cpu className="w-3.5 h-3.5" />
            <span>Route Comparison</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-slate-900">
            Best Selling Route
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            We compare available options and show you the best one.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="btn-load-flagship-scenario"
            type="button"
            onClick={loadPresetFlagship}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Load 100kg Tomato</span>
          </button>

          <button
            type="button"
            onClick={handleRunCompiler}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Compare Options →</span>
          </button>
        </div>
      </div>

      {/* Compiler Input Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Harvest Parameters</span>
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTrendChart(!showTrendChart)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showTrendChart ? 'Hide Price Trends' : 'Show Historical Price Trends'}</span>
            </button>
            <span className="text-xs text-slate-500 hidden sm:inline">Live Simulation Parameters</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Crop</label>
            <select
              id="compiler-crop-select"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Tomato">Tomato (Tamatar)</option>
              <option value="Onion">Onion (Pyaz)</option>
              <option value="Potato">Potato (Aloo)</option>
              <option value="Garlic">Garlic (Lahsun)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (kg)</label>
            <input
              id="compiler-quantity-input"
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="e.g. 100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              id="compiler-location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Min. Acceptable Price</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">₹/kg</span>
              <input
                id="compiler-minprice-input"
                type="number"
                step="0.5"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full pl-11 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quality Grade</label>
            <select
              id="compiler-grade-select"
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Grade A">Grade A (Premium)</option>
              <option value="Grade B">Grade B (Standard)</option>
              <option value="Grade C">Grade C (Processing)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              id="btn-run-compiler"
              onClick={handleRunCompiler}
              disabled={isCompiling}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
              <span>{isCompiling ? 'Compiling...' : 'Compile Chains'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic compiling animation banner */}
        {isCompiling && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <div className="w-5 h-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
            <div>
              <p className="text-xs font-bold text-emerald-900">AgriChain Compiler Active</p>
              <p className="text-xs text-emerald-700">{compileStep}</p>
            </div>
          </div>
        )}
      </div>

      {/* Historical Price Trend & Volatility Chart (Recharts) */}
      {showTrendChart && (
        <HistoricalPriceTrendChart 
          selectedCrop={crop} 
          minAcceptablePrice={minPrice} 
        />
      )}

      {/* Comparison Grid: Compiled Supply Chain Options */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Compiled Options for {quantityKg} kg {crop} ({qualityGrade})
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by Multi-Attribute Optimization: Farmer Net Value + Reliability + Speed - Risk Factors
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Neutral Evaluation: 4 viable pathways compared</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {compiledOptions.map((option, idx) => {
            const isSelected = option.id === selectedChainId;
            const isWinner = option.isBestNetValue;

            return (
              <div
                key={option.id}
                id={`chain-card-${option.id}`}
                onClick={() => setSelectedChainId(option.id)}
                className={`
                  relative rounded-2xl p-5 transition-all cursor-pointer border flex flex-col justify-between
                  ${isSelected 
                    ? 'border-emerald-600 bg-white shadow-lg ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }
                `}
              >
                {/* Winner / Badge Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      OPTION {String.fromCharCode(65 + idx)}
                    </span>
                    {option.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isWinner ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {option.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{option.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{option.description}</p>
                  </div>

                  {/* Primary Metric: Farmer Net Value */}
                  <div className={`rounded-xl p-3 border ${
                    isWinner ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Farmer Net Value (FNV)
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`text-2xl font-black font-display ${
                        isWinner ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        ₹{option.farmerNetValue.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500">/ kg</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-1">
                      Total Payout: <strong>₹{option.totalFarmerPayout.toLocaleString('en-IN')}</strong> (for {quantityKg} kg)
                    </div>
                  </div>

                  {/* Operational Attributes */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Transit Time
                      </span>
                      <span className="font-semibold text-slate-800">{option.totalTransitHours} Hours</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Reliability
                      </span>
                      <span className="font-semibold text-emerald-700">{option.reliabilityScore}%</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> Dispute Risk
                      </span>
                      <span className={`font-semibold ${
                        option.qualityDisputeRisk === 'Low' ? 'text-emerald-600' : 
                        option.qualityDisputeRisk === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {option.qualityDisputeRisk}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card footer CTA */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-500">
                    Overall Rank: #{idx + 1}
                  </span>
                  <button 
                    id={`btn-select-chain-${option.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChainId(option.id);
                    }}
                    className={`font-bold px-2.5 py-1 rounded-md text-xs cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Inspect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Chain Deep Dive: Chain Visualizer & Margin Firewall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Chain Flow */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  Chain Architecture
                </span>
                <h3 className="font-bold text-base text-slate-900">{selectedOption.title}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">{selectedOption.recommendedReason}</p>
            </div>
            {selectedOption.isBestNetValue && (
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                Recommended
              </span>
            )}
          </div>

          {/* Node Flow Visualization */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Step-by-Step Chain Participants ({selectedOption.nodes.length} Nodes)
            </h4>

            <div className="space-y-2">
              {selectedOption.nodes.map((node, i) => (
                <div 
                  key={node.id} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">{node.name}</span>
                      {node.isServiceOnly && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                          Service Provider
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-3 mt-0.5">
                      <span>Role: <strong className="text-slate-700">{node.role}</strong></span>
                      {node.serviceType && <span>Service: <strong>{node.serviceType}</strong></span>}
                      <span>Transit: <strong>{node.timeHours}h</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-slate-900">
                      {node.feePerKg > 0 ? `₹${node.feePerKg.toFixed(2)}/kg` : 'Owner'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Reliability: {node.reliabilityScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accept Best Net Value Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">Gross Buyer Price: ₹{selectedOption.breakdown.buyerPrice.toFixed(2)}/kg</div>
              <div className="text-base font-bold text-slate-900">
                Farmer Net: <span className="text-emerald-600 font-extrabold">₹{selectedOption.farmerNetValue.toFixed(2)}/kg</span>
                <span className="text-xs text-slate-500 font-normal ml-1">
                  (Total ₹{selectedOption.totalFarmerPayout.toLocaleString('en-IN')})
                </span>
              </div>
            </div>

            <button
              id="btn-accept-best-chain"
              onClick={() => handleAcceptChain(selectedOption)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Best Net Value</span>
            </button>
          </div>

          {acceptedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Harvest Committed!</strong> Supply chain configuration locked. Dispatching notifications to Sharma Krishi Aggregator and Transporter Jagdish Yadav.
              </span>
            </div>
          )}
        </div>

        {/* Right Column: The Margin Firewall */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>The Margin Firewall</span>
            </div>
            <h3 className="font-bold text-lg font-display">Every Rupee Has An Explanation</h3>
            <p className="text-xs text-slate-400">
              No hidden broker margins or arbitrary deductions. Every deduction is a verified service fee.
            </p>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-3 font-mono text-xs">
            
            {/* Buyer Gross */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">GROSS BUYER PRICE</span>
                <p className="text-[10px] text-slate-400 font-sans">Delivered landed price paid by buyer</p>
              </div>
              <span className="text-base font-bold text-emerald-400">
                ₹{selectedOption.breakdown.buyerPrice.toFixed(2)}/kg
              </span>
            </div>

            <div className="space-y-1.5 px-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider">
                Audited Service Deductions
              </div>

              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800">
                <span className="flex items-center gap-1 font-sans">
                  <Users className="w-3 h-3 text-blue-400" /> Aggregation & Crating
                </span>
                <span className="text-rose-400">-₹{selectedOption.breakdown.aggregationFee.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800">
                <span className="flex items-center gap-1 font-sans">
                  <Truck className="w-3 h-3 text-indigo-400" /> Transport (Shared Backhaul)
                </span>
                <span className="text-rose-400">-₹{selectedOption.breakdown.transportCost.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800">
                <span className="flex items-center gap-1 font-sans">
                  <ShieldCheck className="w-3 h-3 text-purple-400" /> Quality Verification
                </span>
                <span className="text-rose-400">-₹{selectedOption.breakdown.gradingFee.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800">
                <span className="flex items-center gap-1 font-sans">
                  <Clock className="w-3 h-3 text-amber-400" /> Finance & Staging Buffer
                </span>
                <span className="text-rose-400">-₹{selectedOption.breakdown.financeCost.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800">
                <span className="flex items-center gap-1 font-sans">
                  <Cpu className="w-3 h-3 text-emerald-400" /> Transparent Platform Fee
                </span>
                <span className="text-rose-400">-₹{selectedOption.breakdown.platformFee.toFixed(2)}</span>
              </div>
            </div>

            {/* Farmer Net Value Result */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 text-sm font-sans">FARMER NET VALUE (FNV)</span>
                <span className="text-xl font-black text-emerald-400">
                  ₹{selectedOption.farmerNetValue.toFixed(2)}/kg
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-sans">
                {selectedOption.isBestNetValue
                  ? `+₹3.20/kg higher than local trader (+29.1% net gain).`
                  : `Net realization after all verified service costs.`}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed border border-slate-700/50">
            <strong>The AgriChain Philosophy:</strong> Traders don&apos;t disappear—they transition from opaque margin speculators into transparent, measurable service providers.
          </div>
        </div>

      </div>

    </div>
  );
};
