import React, { useState } from 'react';
import { Briefcase, ShieldCheck, CheckCircle2, TrendingUp, Award, Clock, DollarSign, Users, AlertCircle } from 'lucide-react';
import { ServiceProvider } from '../../../shared/types';
import { SEED_SERVICE_PROVIDERS } from '../../../shared/data/seedData';

export const AggregatorDashboard: React.FC = () => {
  const [provider] = useState<ServiceProvider>(SEED_SERVICE_PROVIDERS[0]); // Sharma Krishi Seva

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Core Philosophy */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold border border-amber-200">
          <Briefcase className="w-3.5 h-3.5" />
          <span>TRANSPARENT SERVICE PROVIDER MODEL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Traders as Verified Service Partners
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          In AgriChain, intermediaries do not vanish. Instead, their local expertise (sorting, crating, staging, weighing) is unbundled into transparent, auditable services billed at clear rates—eliminating forced dependency and opaque speculative markups.
        </p>
      </div>

      {/* Manifesto Callout Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
            Platform Tenet
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            &ldquo;Intermediary is a choice, not a gatekeeper.&rdquo;
          </h2>
          <p className="text-xs text-slate-400">
            &ldquo;Every intermediary must earn their place through a measurable service.&rdquo;
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-right shrink-0">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified Services Active</div>
          <div className="text-2xl font-bold text-emerald-400 font-display mt-0.5">
            {provider.verifiedServicesCount} Services
          </div>
          <div className="text-xs text-slate-400">Sharma Krishi Seva</div>
        </div>
      </div>

      {/* Service Provider Profile & Scorecard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Registered Services & Current Batch */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900">{provider.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{provider.location} &bull; Traditional Trader Turned Transparent Service Partner</p>
            <p className="text-xs text-slate-600 italic mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              &ldquo;{provider.quote}&rdquo;
            </p>
          </div>

          {/* Registered Services Catalog */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Audited Service Catalog & Transparent Rates
            </h4>

            <div className="space-y-2.5">
              {provider.services.map((svc, i) => (
                <div 
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{svc.serviceName}</span>
                      {svc.verified && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Audited
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[11px]">Daily Throughput Capacity: {svc.capacityPerDay}</span>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-bold text-emerald-700 text-sm">₹{svc.feePerKg.toFixed(2)}/kg</div>
                    <div className="text-[10px] text-slate-400">Fixed Service Fee</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Consignment Batch */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" /> Current Aggregation Consignment: #AC-POOL-1024
              </span>
              <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="text-xs text-slate-700">
              Aggregating <strong>510 kg Tomatoes</strong> from 5 Sanwer smallholders for Shreemaya Hospitality.
            </div>
            <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600">Earned Service Fee:</span>
              <span className="font-bold text-emerald-800 text-sm">₹510.00 (3.5 hours work)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Scorecard */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Service Provider Scorecard</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mt-1 font-display">Performance & Trust Rating</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-700">
                <span>Aggregation Reliability</span>
                <span className="font-mono text-emerald-700">{provider.scorecard.aggregationReliability}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${provider.scorecard.aggregationReliability}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-700">
                <span>Payment Settlement Reliability</span>
                <span className="font-mono text-emerald-700">{provider.scorecard.paymentReliability}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${provider.scorecard.paymentReliability}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-700">
                <span>Quality Dispute Rate</span>
                <span className="font-mono text-emerald-700">{provider.scorecard.qualityDisputeRate}% (Industry Avg: 8.5%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-700">
                <span>Average Handling & Staging Time</span>
                <span className="font-mono text-slate-900">{provider.scorecard.avgCompletionHours} Hours</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Overall Composite Trust Score</span>
              <div className="text-3xl font-black text-slate-900 font-display">
                {provider.scorecard.overallTrustScore} / 100
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">Tier-1 Certified AgriChain Service Partner</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
