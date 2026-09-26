import React, { useState } from 'react';
import { 
  Sprout, 
  TrendingUp, 
  Mic, 
  PhoneCall, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  Sparkles,
  Camera,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Harvest, PriceBenchmark } from '../../../shared/types';
import { SEED_PRICE_BENCHMARKS } from '../../../shared/data/seedData';
import { api } from '../services/api';
import { useOrders } from '../hooks/useOrders';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { Package } from 'lucide-react';
import { useEffect } from 'react';

interface FarmerDashboardProps {
  onOpenSellModal: () => void;
  onOpenVoice: () => void;
  onOpenCall: () => void;
  onOpenCompiler: (harvest?: Harvest) => void;
  onOpenQuality: () => void;
  activeHarvests: Harvest[];
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onOpenSellModal,
  onOpenVoice,
  onOpenCall,
  onOpenCompiler,
  onOpenQuality,
  activeHarvests
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [benchmarks, setBenchmarks] = useState<Record<string, PriceBenchmark>>({});
  const [liveMandi, setLiveMandi] = useState<{
    available: boolean;
    records?: any[];
    message?: string;
    lastUpdated?: string;
  } | null>(null);
  const [mandiLoading, setMandiLoading] = useState(false);

  useEffect(() => { 
    api.getPriceBenchmarks().then(setBenchmarks);
  }, []);

  useEffect(() => {
    setMandiLoading(true);
    api.getMandiPrices({ commodity: selectedCrop })
      .then((res) => {
        setLiveMandi(res);
      })
      .catch((err) => {
        setLiveMandi({ available: false, message: 'Government mandi feed unavailable' });
      })
      .finally(() => setMandiLoading(false));
  }, [selectedCrop]);

  const benchmark: PriceBenchmark = benchmarks[selectedCrop] || SEED_PRICE_BENCHMARKS['Tomato'];
  const matchingLiveRecord = liveMandi?.records?.find(
    (r: any) => r.commodity?.toLowerCase().includes(selectedCrop.toLowerCase())
  ) || liveMandi?.records?.[0];
  const { orders } = useOrders();

  const [receivedOffers, setReceivedOffers] = useState<any[]>([]);
  const [offerActionLoading, setOfferActionLoading] = useState<string | null>(null);

  const loadOffers = () => {
    api.getOffers().then(setReceivedOffers).catch(console.error);
  };

  useEffect(() => {
    loadOffers();
  }, [activeHarvests]);

  const handleUpdateStatus = async (offerId: string, status: string) => {
    setOfferActionLoading(offerId);
    try {
      await api.updateOfferStatus(offerId, status);
      loadOffers();
    } catch (err: any) {
      alert("Failed to update offer: " + (err.message || err));
    } finally {
      setOfferActionLoading(null);
    }
  };

  const flagshipHarvest = activeHarvests.find(h => h.id === 'AC-HRV-2026-00124') || activeHarvests[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Farmer Identity & Low Connectivity Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg border-2 border-emerald-500">
            RP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">Ramesh Patel</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Farmer
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" /> Sanwer (Village Cluster A), Indore &bull; 3.5 Acres
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium self-start sm:self-center">
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Trust Score</span>
            <span className="font-bold text-emerald-600 text-sm">94 / 100</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Offline Cache</span>
            <span className="font-bold text-slate-700 text-sm">Synced (4G)</span>
          </div>
        </div>
      </div>

      {/* Primary Hero Actions (Mobile-Optimized Touch Targets > 48px) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Big CTA: Sell My Harvest */}
        <button
          id="btn-farmer-sell-harvest"
          onClick={onOpenSellModal}
          className="sm:col-span-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-4 rounded-2xl shadow-md shadow-emerald-600/20 flex sm:flex-col items-center justify-between sm:justify-center gap-3 text-left sm:text-center transition-transform active:scale-95 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-extrabold font-display">SELL MY HARVEST</div>
            <p className="text-xs text-emerald-100 mt-0.5">Fasal Bechein (Enter Details)</p>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-200 sm:hidden" />
        </button>

        {/* Voice Assistant Button */}
        <button
          id="btn-farmer-voice"
          onClick={onOpenVoice}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-900 border border-indigo-200 font-bold p-4 rounded-2xl flex sm:flex-col items-center justify-between sm:justify-center gap-3 text-left sm:text-center transition-transform active:scale-95 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-extrabold font-display text-indigo-950">AgriMitra Voice</div>
            <p className="text-xs text-indigo-700 mt-0.5">Bolkar Fasal Darj Karein (Hindi)</p>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-400 sm:hidden" />
        </button>

        {/* Simulated Outbound Phone Call */}
        <button
          id="btn-farmer-call"
          onClick={onOpenCall}
          className="bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 border border-amber-200 font-bold p-4 rounded-2xl flex sm:flex-col items-center justify-between sm:justify-center gap-3 text-left sm:text-center transition-transform active:scale-95 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold font-display text-amber-950">AI Phone Call</div>
            <p className="text-xs text-amber-800 mt-0.5">Auto-Call Ramesh Ji (Simulation)</p>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-400 sm:hidden" />
        </button>
      </div>

      {/* Active Harvest Card & Current Best Offer */}
      {flagshipHarvest && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-emerald-400 font-bold">ACTIVE HARVEST:</span>
              <span>{flagshipHarvest.id}</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              COMPILED & OPTIMIZED
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    {flagshipHarvest.quantityKg} kg {flagshipHarvest.crop}
                  </h2>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded border border-emerald-200">
                    {flagshipHarvest.qualityGrade}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Harvested Today &bull; Selling Window: {flagshipHarvest.sellingWindow} &bull; Min: ₹{flagshipHarvest.minAcceptablePrice}/kg
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-right shrink-0">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Current Best Farmer Net Value
                </div>
                <div className="text-2xl font-black text-emerald-700 font-display mt-0.5">
                  ₹14.20 <span className="text-xs font-medium text-slate-600">/ kg</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Total ₹1,420 (Local Trader: ₹1,100)
                </div>
              </div>
            </div>

            {/* Compiled Supply Chain Route Preview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  Selected Optimal Chain: Dynamic Pool + Return Tata Ace
                </span>
                <span className="text-emerald-700 font-bold">+₹3.20/kg (+29.1%) Gain</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  👨‍🌾 Ramesh Patel (100 kg)
                </span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  📦 Sharma Aggregation (₹1/kg fee)
                </span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  🚚 Return Tata Ace (Jagdish Yadav)
                </span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold shadow-2xs">
                  🍽️ Shreemaya Restaurant (₹18/kg)
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                id="btn-inspect-compiler-from-farmer"
                onClick={() => onOpenCompiler(flagshipHarvest)}
                className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 text-xs font-bold py-2 px-3 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <span>Compare Other 4 Chains in Compiler</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="btn-farmer-ai-quality"
                  onClick={onOpenQuality}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Verify AI Grade</span>
                </button>

                <button
                  id="btn-farmer-accept-payout"
                  onClick={() => onOpenCompiler(flagshipHarvest)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  Commit Harvest (₹14.20/kg)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Distributor Offers Received Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Distributor Offers Received for Your Produce</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Bids placed directly by licensed distributors & APMC buyers</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            {receivedOffers.length} {receivedOffers.length === 1 ? 'Offer' : 'Offers'}
          </span>
        </div>

        {receivedOffers.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No incoming buyer offers yet. Active distributor bids from the marketplace will appear here automatically.
          </div>
        ) : (
          <div className="space-y-3">
            {receivedOffers.map((offer) => {
              const netValue = (offer.offeredPrice - 1.20).toFixed(2);
              const mandiGain = (Number(netValue) - 11.0).toFixed(2);
              return (
                <div key={offer.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{offer.buyerName}</span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="font-semibold text-slate-700 text-xs">{offer.crop} ({offer.quantityKg} kg)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Destination: {offer.destination} &bull; Pickup: {offer.pickupTerms}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Offered Rate</div>
                        <div className="text-lg font-black text-slate-900 font-display">₹{offer.offeredPrice}/kg</div>
                      </div>
                      <div className="text-right bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <div className="text-[10px] text-emerald-800 font-bold uppercase">Net Farmer Value</div>
                        <div className="text-base font-extrabold text-emerald-700 font-display">₹{netValue}/kg</div>
                        <div className="text-[9px] text-emerald-700 font-semibold">+₹{mandiGain}/kg vs Mandi</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        offer.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        offer.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        offer.status === 'COUNTERED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                  </div>

                  {offer.status === 'ACTIVE' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(offer.id, 'REJECTED')}
                        disabled={offerActionLoading === offer.id}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const counter = prompt("Enter your counter-offer price per kg (₹):", (offer.offeredPrice + 1).toString());
                          if (counter) {
                            handleUpdateStatus(offer.id, 'COUNTERED');
                          }
                        }}
                        disabled={offerActionLoading === offer.id}
                        className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        Counter Offer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(offer.id, 'ACCEPTED')}
                        disabled={offerActionLoading === offer.id}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {offerActionLoading === offer.id ? 'Processing...' : 'Accept Offer (Lock ₹' + netValue + '/kg)'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandi Price Benchmark Engine Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Nearby Mandi Benchmark Prices</span>
              </h3>
              {liveMandi?.available && matchingLiveRecord ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE APMC Feed
                </span>
              ) : liveMandi && !liveMandi.available ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Offline Estimate
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {liveMandi?.available && matchingLiveRecord
                ? `Official APMC rates for ${matchingLiveRecord.market || 'Indore'} (${matchingLiveRecord.district || 'Indore'})`
                : 'e-NAM & Mandi Feeds vs Local Trader Offers'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {['Tomato', 'Onion', 'Potato'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedCrop === c ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Fallback Message if Mandi Feed is Unavailable */}
        {liveMandi && !liveMandi.available && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Government mandi feed unavailable: displaying regional model estimate.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Box 1: Mandi Price / Range */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">
              {liveMandi?.available && matchingLiveRecord
                ? `${matchingLiveRecord.market} APMC Rate`
                : 'Regional APMC Mandi Benchmark'}
            </span>
            <div className="mt-1">
              {liveMandi?.available && matchingLiveRecord ? (
                <div>
                  <div className="text-lg font-black text-slate-900 font-display">
                    ₹{matchingLiveRecord.modal_price_per_kg || (Number(matchingLiveRecord.modal_price) / 100).toFixed(2)} <span className="text-xs font-semibold text-emerald-700">/ kg Modal</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Min: ₹{matchingLiveRecord.min_price_per_kg || (Number(matchingLiveRecord.min_price) / 100).toFixed(2)} &bull; Max: ₹{matchingLiveRecord.max_price_per_kg || (Number(matchingLiveRecord.max_price) / 100).toFixed(2)}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-black text-slate-900 font-display">
                    ₹{benchmark.mandiBenchmarkMin.toFixed(2)} – ₹{benchmark.mandiBenchmarkMax.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Choithram Yard auction band</div>
                </div>
              )}
            </div>
          </div>

          {/* Box 2: Local Trader Offering */}
          <div className="p-3.5 bg-rose-50/80 rounded-xl border border-rose-200">
            <span className="text-[11px] text-rose-700 block font-medium">Local Trader Offering</span>
            <div className="text-lg font-black text-rose-800 mt-1 font-display">
              ₹{benchmark.currentTraderOffer.toFixed(2)} <span className="text-xs font-semibold">/ kg</span>
            </div>
            <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">Below official APMC modal benchmark</span>
          </div>

          {/* Box 3: Bargaining Gap Discovered */}
          <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200">
            <span className="text-[11px] text-emerald-800 block font-medium">Bargaining Gap Discovered</span>
            <div className="text-lg font-black text-emerald-700 mt-1 font-display">
              +₹{benchmark.potentialBargainingGap.toFixed(2)} <span className="text-xs font-semibold">/ kg</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">AgriChain compiles higher net</span>
          </div>
        </div>
      </div>


      {/* Active Orders Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 font-display">Active Orders for Your Pools</h2>
        </div>
        {orders.length === 0 ? (
          <div className="text-sm text-slate-500 py-4 text-center">No active orders found for your pools.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">{order.crop}</span>
                  <span className="font-semibold text-emerald-700">{order.quantity_kg} kg</span>
                </div>
                <div className="text-xs text-slate-600 mb-4">₹{order.agreed_price_per_kg}/kg - Est. Net: ₹{order.farmer_net_value}</div>
                <div className="bg-slate-50 p-3 rounded-lg overflow-x-auto">
                   <OrderStatusTimeline currentStatus={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};