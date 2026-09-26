import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowRight, 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  Users, 
  MapPin, 
  PhoneCall, 
  Cpu, 
  Navigation, 
  CheckCircle2, 
  Truck, 
  Sparkles,
  ChevronRight,
  Store,
  Sprout,
  ShieldCheck,
  Zap,
  Landmark,
  Utensils
} from 'lucide-react';
import { AgriMap } from './AgriMap';
import { authService } from '../auth/authService';
import { useAuth } from '../context/AuthContext';

interface LandingOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenCall: () => void;
  onOpenSellModal?: () => void;
  onOpenVoice?: () => void;
}

export const LandingOverview: React.FC<LandingOverviewProps> = ({ 
  onNavigateTab,
  onOpenCall,
  onOpenSellModal,
}) => {
  const navigate = useNavigate();
  const { role } = useAuth();

  // Sample recent active listings for Ramesh Patel
  const activeOrders = [
    {
      id: 'ORD-1024',
      crop: 'Tomato',
      variety: 'Hybrid Grade A',
      quantity: '510 kg',
      status: 'In Transit',
      buyer: 'Shreemaya Kitchens',
      price: '₹18.00 / kg',
      route: 'Sanwer → Indore',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'ORD-1025',
      crop: 'Soybean',
      variety: 'JS-335 Grade A',
      quantity: '1,200 kg',
      status: 'Offer Received',
      buyer: 'Patanjali Agro Hub',
      price: '₹46.50 / kg',
      route: 'Dewas Mandi Gate',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'ORD-1026',
      crop: 'Onion',
      variety: 'Nashik Red',
      quantity: '800 kg',
      status: 'Pending Pickup',
      buyer: 'Direct Retail Co-op',
      price: '₹22.00 / kg',
      route: 'Hatod Village',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. Hero Section (Clean, Calm, Action-Oriented) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <span>Good morning 👋</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Manage your farm sales
          </h1>
          <p className="text-slate-500 text-sm">
            Find buyers, compare offers, and track deliveries.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="btn-add-produce"
            type="button"
            onClick={onOpenSellModal || (() => onNavigateTab('farmer'))}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Produce</span>
          </button>

          <button
            id="btn-view-orders"
            type="button"
            onClick={() => onNavigateTab('farmer')}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold px-4 py-3 rounded-2xl border border-slate-200 transition-colors cursor-pointer"
          >
            <span>View Orders</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2. Four Compact Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Sales */}
        <div 
          onClick={() => onNavigateTab('farmer')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">
            12
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>↑ 3 new offers today</span>
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div 
          onClick={() => onNavigateTab('farmer')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">
            4
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            2 dispatches scheduled
          </div>
        </div>

        {/* Card 3: Amount Earned */}
        <div 
          onClick={() => onNavigateTab('escrow')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Amount Earned</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-display mt-2">
            ₹24,500
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Settled directly via UPI
          </div>
        </div>

        {/* Card 4: Available Buyers */}
        <div 
          onClick={() => onNavigateTab('buyer')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Available Buyers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">
            18
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            Indore &amp; Dewas hubs
          </div>
        </div>
      </div>

      {/* 3. Primary Actions: "What do you want to do?" */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
          What do you want to do?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Action 1: Add Produce */}
          <button
            type="button"
            onClick={onOpenSellModal || (() => onNavigateTab('farmer'))}
            className="bg-white hover:bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs text-left transition-all hover:shadow-sm cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                + Add Produce
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                List today&apos;s harvest
              </p>
            </div>
          </button>

          {/* Action 2: Find Buyers */}
          <button
            type="button"
            onClick={() => onNavigateTab('buyer')}
            className="bg-white hover:bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs text-left transition-all hover:shadow-sm cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                Find Buyers
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                See nearby demand
              </p>
            </div>
          </button>

          {/* Action 3: Track Order */}
          <button
            type="button"
            onClick={() => onNavigateTab('map')}
            className="bg-white hover:bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs text-left transition-all hover:shadow-sm cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                Track Order
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Check delivery status
              </p>
            </div>
          </button>

          {/* Action 4: AI Assistant */}
          <button
            type="button"
            onClick={onOpenCall}
            className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 sm:p-5 rounded-2xl shadow-xs text-left transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                AI Assistant
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Talk instead of typing
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Best Selling Route Quick Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Best Selling Route
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            We compare available options and show you the best one.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('compiler')}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-center shrink-0"
        >
          <span>Compare Options →</span>
        </button>
      </div>

      {/* 5. Two Columns: Active Orders & Live Map Snippet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                Recent Orders &amp; Dispatches
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track payments and delivery states
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('farmer')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              View all →
            </button>
          </div>

          <div className="space-y-2.5">
            {activeOrders.map((order) => (
              <div 
                key={order.id}
                className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{order.crop}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="font-semibold text-slate-700">{order.quantity}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                    <span>Buyer: <strong className="text-slate-700">{order.buyer}</strong></span>
                    <span>&bull;</span>
                    <span>{order.route}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <div className="text-left sm:text-right">
                    <span className="font-bold text-emerald-700 text-sm block">{order.price}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{order.id}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('compiler')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="View details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Map Snapshot (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                Logistics Map
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active Corridor: Sanwer &rarr; Indore (32 km)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('map')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Full map →
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 h-56 relative z-0 isolate">
            <AgriMap height="224px" />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 text-[11px]">
              Tata Ace (MP-09-AB) on route
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('map')}
              className="font-bold text-slate-800 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Track Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
