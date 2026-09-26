import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Truck, 
  DollarSign, 
  ShieldCheck, 
  Store, 
  Sprout 
} from 'lucide-react';

interface DemoScenarioWalkthroughProps {
  onNavigateToTab: (tab: any) => void;
}

export const DemoScenarioWalkthrough: React.FC<DemoScenarioWalkthroughProps> = ({ onNavigateToTab }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    {
      stepNumber: 1,
      title: 'Farmer Harvest Declaration',
      actor: 'Ramesh Patel (Smallholder, Sanwer)',
      tabKey: 'farmer',
      description: 'Ramesh has 100 kg ripe tomatoes. Isolated smallholders are usually forced to accept ₹10–11/kg from predatory village traders because no truck will haul 100 kg.',
      actionText: 'Inspect Farmer View',
      metric: 'Harvest: 100 kg | Min: ₹12/kg',
      icon: Sprout
    },
    {
      stepNumber: 2,
      title: 'Dynamic Smallholder Pooling',
      actor: 'Autonomous Clustering Engine',
      tabKey: 'pooling',
      description: 'AgriChain automatically detects 4 neighboring farmers in Village Cluster A harvesting tomatoes, pooling them into a 510 kg Virtual Consignment #AC-POOL-1024.',
      actionText: 'View Virtual Consignment',
      metric: 'Pooled Volume: 510 kg',
      icon: Users
    },
    {
      stepNumber: 3,
      title: 'Empty Return-Trip Backhaul Matching',
      actor: 'Jagdish Yadav (Transporter, Tata Ace)',
      tabKey: 'transporter',
      description: 'Instead of booking a dedicated truck for ₹4,000, AgriChain matches an empty returning vehicle en route from Bhopal to Indore, slashing freight to ₹2,400.',
      actionText: 'Inspect Backhaul Match',
      metric: 'Freight Saved: ₹1,600',
      icon: Truck
    },
    {
      stepNumber: 4,
      title: 'Trader Reformed into Verified Service Provider',
      actor: 'Sharma Krishi Seva (Aggregator)',
      tabKey: 'aggregator',
      description: 'Local trader Sharma is not disintermediated. Instead, he earns a transparent ₹1.00/kg fee for physical crating, sorting, and staging—earning verified recurring income.',
      actionText: 'View Service Scorecard',
      metric: 'Fee: ₹1.00/kg (Audited)',
      icon: ShieldCheck
    },
    {
      stepNumber: 5,
      title: 'Direct Institutional Buyer Demand',
      actor: 'Shreemaya Hotel & Restaurants (Indore)',
      tabKey: 'buyer',
      description: 'Commercial kitchen pre-funds escrow for 500 kg fresh Grade A tomatoes at ₹18.00/kg landed price, cutting out 3 secondary mandi wholesale tiers.',
      actionText: 'View Buyer Procurement',
      metric: 'Landed Price: ₹18.00/kg',
      icon: Store
    },
    {
      stepNumber: 6,
      title: 'Digital Escrow Instant UPI Settlement',
      actor: 'Automated Settlement Rail',
      tabKey: 'escrow',
      description: 'Upon cryptographic OTP delivery verification at Indore, digital escrow disburses funds instantly. Ramesh gets ₹14.20/kg (₹1,420 payout) with zero debt or delay.',
      actionText: 'View Escrow Vault',
      metric: 'Net Gain: +₹3.20/kg (+29.1%)',
      icon: DollarSign
    }
  ];

  const activeStepData = STEPS[currentStep];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Scenario Walkthrough Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>END-TO-END SUPPLY CHAIN COMMERCIAL SIMULATION</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Flagship Scenario: 100 kg Tomato Harvest in Sanwer
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Step through the entire end-to-end journey proving how AgriChain delivers <strong>+29.1% higher net income (₹14.20/kg vs ₹11.00/kg)</strong> to smallholders without eliminating local stakeholders.
            </p>
          </div>

          <div className="bg-indigo-950/60 border border-indigo-400/30 rounded-2xl p-4 text-center shrink-0">
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">Farmer Realization</span>
            <div className="text-3xl font-black text-emerald-400 font-display mt-0.5">₹14.20 / kg</div>
            <span className="text-xs text-slate-300">vs ₹11.00 Traditional Trader</span>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {STEPS.map((s, idx) => {
          const isCurrent = idx === currentStep;
          const isPassed = idx < currentStep;

          return (
            <button
              key={s.stepNumber}
              onClick={() => setCurrentStep(idx)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : isPassed
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span>STEP 0{s.stepNumber}</span>
                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="font-bold text-xs mt-1.5 line-clamp-1">{s.title}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
              {React.createElement(activeStepData.icon, { className: "w-6 h-6 text-emerald-700" })}
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded">
                Stage {activeStepData.stepNumber} of 6 &bull; {activeStepData.actor}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-display">
                {activeStepData.title}
              </h2>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Key Metric</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
              {activeStepData.metric}
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {activeStepData.description}
        </p>

        {/* Step Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => onNavigateToTab(activeStepData.tabKey)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <span>{activeStepData.actionText}</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Previous Step
              </button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm cursor-pointer transition-transform active:scale-95"
              >
                Next Stage &rarr;
              </button>
            ) : (
              <button
                onClick={() => onNavigateToTab('compiler')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm cursor-pointer"
              >
                Back to Compiler
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
