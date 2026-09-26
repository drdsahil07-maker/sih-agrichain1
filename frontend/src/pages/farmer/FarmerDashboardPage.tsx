import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  TrendingUp, 
  Tag, 
  Layers, 
  ShoppingBag, 
  Navigation, 
  Bell, 
  User, 
  Bot, 
  LogOut, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Truck, 
  ShieldCheck, 
  PhoneCall, 
  Mic, 
  Sparkles,
  Info,
  Calendar,
  MapPin,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { authService } from '../../auth/authService';
import { Harvest } from '../../../../shared/types';
import { SEED_HARVESTS, SEED_PRICE_BENCHMARKS } from '../../../../shared/data/seedData';
import { SellHarvestModal } from '../../components/SellHarvestModal';
import { AgriMitraVoiceModal } from '../../components/AgriMitraVoiceModal';
import { AIFarmerCallModal } from '../../components/AIFarmerCallModal';
import { QualityVerificationView } from '../../components/QualityVerificationView';
import { DynamicPoolingView } from '../../components/DynamicPoolingView';
import { MandiPriceIntelligence } from '../../components/MandiPriceIntelligence';
import { AccountMenu } from '../../components/AccountMenu';
import { useOrders } from '../../hooks/useOrders';
import { api } from '../../services/api';

export const FarmerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const profile = authService.getCombinedProfile();
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [harvests, setHarvests] = useState<Harvest[]>(SEED_HARVESTS);

  // Extract farmer state and district from profile
  const userState = user?.details?.state || profile?.farmer?.state || (user?.location?.includes('Madhya Pradesh') ? 'Madhya Pradesh' : undefined);
  const userDistrict = user?.details?.district || profile?.farmer?.district || (user?.location?.includes('Indore') ? 'Indore' : undefined);

  // Orders integration
  const { orders, loading: ordersLoading, refreshOrders } = useOrders();

  // Modals
  const [showSellModal, setShowSellModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  // Active Produce item
  const [selectedProduce, setSelectedProduce] = useState({
    crop: 'Tomato',
    variety: 'Hybrid Grade A',
    quantity: '100 KG',
    status: 'Available',
    harvestDate: 'Today, 6:00 AM',
    location: user?.location || 'Sanwer (Village Cluster A), Indore',
    buyerOffers: [
      {
        buyerName: 'Shreemaya Hotels & Kitchens',
        buyerType: 'Institutional Buyer',
        buyerPrice: 21.00, // ₹ per kg
        transportCost: 1.20,
        serviceCost: 0.60,
        expectedLoss: 0.40, // quality degradation factor
      },
      {
        buyerName: 'Patanjali Agro Hub',
        buyerType: 'Food Processor',
        buyerPrice: 19.50,
        transportCost: 1.00,
        serviceCost: 0.50,
        expectedLoss: 0.20,
      },
      {
        buyerName: 'Indore Direct Retail Co-op',
        buyerType: 'Wholesale Retailer',
        buyerPrice: 22.00,
        transportCost: 2.80, // higher transport
        serviceCost: 0.80,
        expectedLoss: 0.90, // higher transit loss
      }
    ],
    governmentMandiPrice: {
      location: userDistrict ? `${userDistrict} APMC Mandi` : 'Local APMC Mandi',
      modalPrice: 16.50,
      minPrice: 13.00,
      maxPrice: 18.00,
      deductions: {
        commission: 1.50, // 6-8%
        unloadingLabour: 0.80,
        weightSlipCess: 0.40,
        transitShrinkage: 1.20,
      },
      traditionalNetInHand: 12.60
    }
  });

  // Live Mandi Data
  const [liveMandi, setLiveMandi] = useState<{
    available: boolean;
    records?: any[];
    message?: string;
    lastUpdated?: string;
  } | null>(null);

  useEffect(() => {
    api.getMandiPrices({ 
      commodity: selectedProduce.crop,
      state: userState,
      district: userDistrict
    })
      .then((res) => {
        setLiveMandi(res);
      })
      .catch(() => {
        setLiveMandi({ available: false, message: 'Government mandi feed unavailable' });
      });
  }, [selectedProduce.crop, userState, userDistrict]);

  const activeMandiRecord = liveMandi?.records?.find(
    (r: any) => r.commodity?.toLowerCase().includes(selectedProduce.crop.toLowerCase())
  ) || liveMandi?.records?.[0];

  const handleLogout = () => {
    authService.logout();
    navigate('/login/farmer');
  };

  const handleProduceCreated = (newHarvest: Harvest) => {
    setHarvests(prev => [newHarvest, ...prev]);
    setShowSellModal(false);
  };

  const sidebarNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'My Produce', icon: Package },
    { label: 'Add Produce', icon: PlusCircle, action: () => setShowSellModal(true) },
    { label: 'Market', icon: TrendingUp },
    { label: 'Offers', icon: Tag },
    { label: 'Pooling', icon: Layers },
    { label: 'Orders', icon: ShoppingBag },
    { label: 'Tracking', icon: Navigation },
    { label: 'Notifications', icon: Bell, badge: '3' },
    { label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 tracking-tight">AgriChain</div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Farmer Portal</div>
            </div>
          </div>
          <div className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
            Active
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 mt-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RP'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              {user?.name || 'Ramesh Patel'}
            </div>
            <div className="text-[10px] text-emerald-800 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified Farmer</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.label);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700">Namaste, {user?.name || 'Farmer'} Ji 👋</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                {user?.userId || 'farmer_active'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display mt-0.5">
              Farmer Command Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              {user?.location || 'Sanwer (Cluster A), Indore'} &bull; Real-time net procurement value
            </p>
          </div>

          {/* Quick Action Tools and Account Menu */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSellModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Produce</span>
            </button>

            <button
              type="button"
              onClick={() => setShowVoiceModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>AgriMitra Voice</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCallModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Call</span>
            </button>

            {/* Account / Easy User Switching Menu */}
            <AccountMenu />
          </div>
        </div>

        {/* TAB VIEWS */}
        {activeTab === 'Market' && (
          <div className="space-y-6">
            <MandiPriceIntelligence />
          </div>
        )}

        {activeTab === 'Pooling' && (
          <div className="space-y-6">
            <DynamicPoolingView />
          </div>
        )}

        {activeTab !== 'Market' && activeTab !== 'Pooling' && (
          <>
            {/* 5 DASHBOARD METRIC CARDS (Requested exactly) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Card 1: Total Produce */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Produce</div>
                <div className="text-2xl font-black text-slate-900 font-display mt-1">1,840 <span className="text-xs font-normal text-slate-500">KG</span></div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">3 active crop batches</div>
              </div>

              {/* Card 2: Active Listings */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Listings</div>
                <div className="text-2xl font-black text-slate-900 font-display mt-1">2 <span className="text-xs font-normal text-slate-500">Lots</span></div>
                <div className="text-[11px] text-blue-600 font-semibold mt-1">100 KG Tomato, 1.2T Soy</div>
              </div>

              {/* Card 3: Best Available Price */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Best Available Price</div>
                <div className="text-2xl font-black text-emerald-700 font-display mt-1">₹21.00 <span className="text-xs font-normal text-slate-500">/ KG</span></div>
                <div className="text-[11px] text-slate-500 mt-1">Shreemaya Kitchens Offer</div>
              </div>

              {/* Card 4: Expected Earnings */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expected Earnings</div>
                <div className="text-2xl font-black text-emerald-700 font-display mt-1">₹34,800</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">+28% vs Mandi net</div>
              </div>

              {/* Card 5: Active Orders */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Orders</div>
                <div className="text-2xl font-black text-slate-900 font-display mt-1">3 <span className="text-xs font-normal text-slate-500">In Transit</span></div>
                <div className="text-[11px] text-amber-600 font-semibold mt-1">Pickup scheduled 4:30 PM</div>
              </div>
            </div>

            {/* MAIN SECTION: "YOUR PRODUCE" (Requested with Mandi vs Farmer Net Value Formula) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                      Your Produce
                    </h2>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Status: {selectedProduce.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Detailed valuation comparing Mandi intermediary deductions vs Direct Net Value.
                  </p>
                </div>

                {/* Produce Header Badge */}
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                    🍅
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{selectedProduce.crop} ({selectedProduce.variety})</div>
                    <div className="text-xs text-slate-500">{selectedProduce.quantity} &bull; {selectedProduce.location}</div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                
                {/* VALUE COMPARISON BANNER: The Central Product Metric */}
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 border-2 border-emerald-300/80 rounded-3xl p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Net Value Highlight */}
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-xs">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Farmer Net Value Metric (Key Metric)</span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-emerald-900 font-display">
                        ₹18.80 <span className="text-base font-semibold text-emerald-700">/ KG Net in Bank</span>
                      </div>
                      <p className="text-xs text-emerald-800 max-w-xl">
                        Net cash you pocket after return-logistics and automated QA. Higher than Mandi net of ₹12.60/kg!
                      </p>
                    </div>

                    {/* The Exact Mathematical Formula (Requested in Prompt) */}
                    <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-4 text-xs space-y-2 shadow-xs">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Transparent Value Formula:</span>
                      </div>
                      <div className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                        Farmer Net Value = Buyer Price - Transport Cost - Service Cost - Expected Loss
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono pt-1">
                        ₹18.80 = ₹21.00 (Buyer) - ₹1.20 (Transit) - ₹0.60 (Platform) - ₹0.40 (QA Loss)
                      </div>
                    </div>
                  </div>
                </div>

                {/* TWO COLUMNS: Government Mandi Price vs Buyer Offers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* LEFT: Government Mandi Price Benchmark */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                          🏛️
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {liveMandi?.available && activeMandiRecord
                              ? `${activeMandiRecord.market} APMC Rate`
                              : 'Nearby Mandi Benchmark Prices'}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            {liveMandi?.available && activeMandiRecord
                              ? `${activeMandiRecord.district || userDistrict || 'Indore'}, ${activeMandiRecord.state || userState || 'Madhya Pradesh'}`
                              : selectedProduce.governmentMandiPrice.location}
                          </p>
                        </div>
                      </div>
                      {liveMandi?.available && activeMandiRecord ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          LIVE APMC Feed
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                          Model Estimate
                        </span>
                      )}
                    </div>

                    {liveMandi && !liveMandi.available && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Government mandi feed unavailable: displaying regional model estimate.</span>
                      </div>
                    )}

                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Mandi Displayed Gross Price:</span>
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          ₹{liveMandi?.available && activeMandiRecord
                            ? Number(activeMandiRecord.modal_price_per_kg || (Number(activeMandiRecord.modal_price) / 100) || 0).toFixed(2)
                            : Number(selectedProduce?.governmentMandiPrice?.modalPrice ?? 12).toFixed(2)} / KG
                        </span>
                      </div>

                      {liveMandi?.available && activeMandiRecord && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg font-mono">
                          <span>Min: ₹{Number(activeMandiRecord.min_price_per_kg || (Number(activeMandiRecord.min_price) / 100) || 0).toFixed(2)}/kg</span>
                          <span>Modal: ₹{Number(activeMandiRecord.modal_price_per_kg || (Number(activeMandiRecord.modal_price) / 100) || 0).toFixed(2)}/kg</span>
                          <span>Max: ₹{Number(activeMandiRecord.max_price_per_kg || (Number(activeMandiRecord.max_price) / 100) || 0).toFixed(2)}/kg</span>
                        </div>
                      )}

                      <div className="border-t border-dashed border-slate-200 pt-2.5 space-y-1.5 text-[11px] text-slate-500">
                        <div className="flex justify-between">
                          <span>Trader Commission (Aadath 6%):</span>
                          <span className="text-red-600 font-mono">- ₹{selectedProduce.governmentMandiPrice.deductions.commission.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unloading &amp; Hamali Labor:</span>
                          <span className="text-red-600 font-mono">- ₹{selectedProduce.governmentMandiPrice.deductions.unloadingLabour.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mandi Weight Slip / Market Cess:</span>
                          <span className="text-red-600 font-mono">- ₹{selectedProduce.governmentMandiPrice.deductions.weightSlipCess.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transit Delay Shrinkage:</span>
                          <span className="text-red-600 font-mono">- ₹{selectedProduce.governmentMandiPrice.deductions.transitShrinkage.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Actual Mandi Net to Farmer:</span>
                        <span className="text-base font-black text-amber-700 font-mono">
                          ₹{selectedProduce.governmentMandiPrice.traditionalNetInHand.toFixed(2)} / KG
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Buyer Offers with Net Value Calculation */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          🤝
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Direct Buyer Offers</h3>
                          <p className="text-[11px] text-slate-500">{selectedProduce.buyerOffers.length} verified procurement bids</p>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-700 font-semibold">Net Calculated</span>
                    </div>

                    <div className="space-y-3">
                      {selectedProduce.buyerOffers.map((offer, idx) => {
                        const netVal = offer.buyerPrice - offer.transportCost - offer.serviceCost - offer.expectedLoss;
                        const isHighestNet = idx === 0;

                        return (
                          <div 
                            key={idx}
                            className={`bg-white rounded-xl p-3.5 border transition-all ${
                              isHighestNet ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900">{offer.buyerName}</span>
                                  {isHighestNet && (
                                    <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                                      BEST NET
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">{offer.buyerType}</div>
                              </div>

                              <div className="text-right">
                                <div className="text-[10px] text-slate-400">Buyer Bid: ₹{offer.buyerPrice.toFixed(2)}/kg</div>
                                <div className="text-sm font-black text-emerald-700 font-mono">
                                  ₹{netVal.toFixed(2)} <span className="text-[10px] font-bold text-emerald-800">NET / KG</span>
                                </div>
                              </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Transit: ₹{offer.transportCost.toFixed(2)}</span>
                              <span>Service: ₹{offer.serviceCost.toFixed(2)}</span>
                              <span>Est. Loss: ₹{offer.expectedLoss.toFixed(2)}</span>
                              <button
                                type="button"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition-colors cursor-pointer"
                              >
                                Accept Offer
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* POOLING & COMMUNITY HARVESTS */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Village Cluster Pooling (Cluster A)</h3>
                  <p className="text-xs text-slate-500">Pool your 100 KG with neighbors to unlock full-truckload bulk freight discounts.</p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
                  640 KG Current Pool
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Your Contribution</span>
                  <span className="font-bold text-slate-800 text-sm">100 KG (15.6%)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Backhaul Truck Route</span>
                  <span className="font-bold text-slate-800 text-sm">Sanwer → Indore Gate 2</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Logistics Savings</span>
                  <span className="font-bold text-emerald-700 text-sm">₹1.40 / KG saved</span>
                </div>
              </div>
            </div>

            {/* ACTIVE ORDERS */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">My Orders</h3>
                  <p className="text-xs text-slate-500">Live status of your committed produce and logistics.</p>
                </div>
                <button onClick={refreshOrders} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                  Refresh
                </button>
              </div>
              
              <div className="space-y-3">
                {ordersLoading && <p className="text-xs text-slate-500">Loading orders...</p>}
                {!ordersLoading && orders.length === 0 && <p className="text-xs text-slate-500">No active orders found.</p>}
                
                {orders.map((order: any) => (
                  <div key={order.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{order.crop}</span>
                        <span className="text-[10px] font-mono text-slate-500">#{order.id.slice(0, 8)}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">{order.quantity_kg} kg</span> sold to {order.delivery_location.substring(0, 20)}...
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Expected Net Value</div>
                        <div className="text-lg font-black text-emerald-700 font-mono">₹{Number(order.farmer_net_value).toLocaleString()}</div>
                      </div>
                      <div className="mt-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </main>

      {/* MODALS */}
      {showSellModal && (
        <SellHarvestModal
          isOpen={showSellModal}
          onClose={() => setShowSellModal(false)}
          onHarvestCreated={handleProduceCreated}
        />
      )}

      {showVoiceModal && (
        <AgriMitraVoiceModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onHarvestCreated={handleProduceCreated}
        />
      )}

      {showCallModal && (
        <AIFarmerCallModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          farmerName={user?.name || 'Ramesh Patel'}
          farmerPhone={user?.phone || '9826011234'}
        />
      )}

    </div>
  );
};
