import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  LayoutDashboard, 
  Search, 
  Tag, 
  Layers, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  BarChart3, 
  User, 
  LogOut, 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  Filter,
  Sparkles,
  Award
} from 'lucide-react';
import { authService } from '../../auth/authService';
import { AccountMenu } from '../../components/AccountMenu';

interface AvailableProduceItem {
  id: string;
  crop: string;
  quantity: string;
  location: string;
  harvestDate: string;
  quality: string;
  expectedPrice: string;
  farmerPoolId: string;
  farmerName: string;
  variety: string;
}

export const DistributorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [offerModalProduce, setOfferModalProduce] = useState<AvailableProduceItem | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(19.50);
  const [offerNotes, setOfferNotes] = useState<string>('Direct truck pickup at farmgate point.');
  const [submittedOffers, setSubmittedOffers] = useState<string[]>([]);

  // Sample Available Produce according to specifications
  const [produceList] = useState<AvailableProduceItem[]>([
    {
      id: 'PROD-001',
      crop: 'Tomato',
      variety: 'Hybrid Grade A (Firm)',
      quantity: '640 KG (Consignment Pool A)',
      location: 'Sanwer Farmgate Hub (6 km away)',
      harvestDate: 'Today, 6:00 AM',
      quality: 'Grade A (94% Uniformity)',
      expectedPrice: '₹18.00 / KG',
      farmerPoolId: 'POOL-IND-091',
      farmerName: 'Ramesh Patel + 3 Cluster Farmers',
    },
    {
      id: 'PROD-002',
      crop: 'Soybean',
      variety: 'JS-335 High Protein',
      quantity: '1,200 KG',
      location: 'Dewas Kisan FPO Hub (14 km away)',
      harvestDate: 'Yesterday, 4:00 PM',
      quality: 'Grade A (Moisture < 10%)',
      expectedPrice: '₹46.50 / KG',
      farmerPoolId: 'FPO-DWS-04',
      farmerName: 'Dewas Farmers Producer Org',
    },
    {
      id: 'PROD-003',
      crop: 'Onion',
      variety: 'Nashik Red Medium',
      quantity: '850 KG',
      location: 'Hatod Village Cluster (8 km away)',
      harvestDate: 'Today, 7:30 AM',
      quality: 'Grade B+ (Cured)',
      expectedPrice: '₹22.00 / KG',
      farmerPoolId: 'FARM-HTD-112',
      farmerName: 'Mukesh Choudhary & Sons',
    },
    {
      id: 'PROD-004',
      crop: 'Potato',
      variety: 'Chipsona Grade 1',
      quantity: '2,500 KG',
      location: 'Mhow Agro Cold Cluster (20 km away)',
      harvestDate: '2 Days Ago',
      quality: 'Grade A (High Starch)',
      expectedPrice: '₹16.00 / KG',
      farmerPoolId: 'POOL-MHW-08',
      farmerName: 'Mhow Progressive Growers Pool',
    }
  ]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login/distributor');
  };

  const handleMakeOffer = (item: AvailableProduceItem) => {
    setOfferModalProduce(item);
    const numericPrice = parseFloat(item.expectedPrice.replace(/[^0-9.]/g, '')) || 19;
    setOfferPrice(numericPrice + 0.5);
  };

  const handleConfirmOffer = () => {
    if (offerModalProduce) {
      setSubmittedOffers(prev => [...prev, offerModalProduce.id]);
      setOfferModalProduce(null);
    }
  };

  const sidebarNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Find Produce', icon: Search },
    { label: 'My Offers', icon: Tag, badge: submittedOffers.length > 0 ? `${submittedOffers.length}` : undefined },
    { label: 'Orders', icon: ShoppingBag },
    { label: 'Transport', icon: Truck },
    { label: 'Payments', icon: CreditCard },
    { label: 'Analytics', icon: BarChart3 },
    { label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 tracking-tight">AgriChain</div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Distributor Portal</div>
            </div>
          </div>
          <div className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
            Active
          </div>
        </div>

        {/* Distributor User Card */}
        <div className="p-3 mx-3 mt-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              {user?.name || 'FreshMart Distribution'}
            </div>
            <div className="text-[10px] text-amber-800 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>Verified Wholesaler</span>
            </div>
          </div>
        </div>

        {/* Value Chain Positioning Banner */}
        <div className="mx-3 mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 leading-tight">
          <span className="font-bold text-slate-800 block">First-Class Partner:</span>
          &ldquo;We don&apos;t remove the middleman. We remove the mystery around the middleman.&rdquo;
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
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
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
              <span className="text-xs font-semibold text-amber-700">Distributor Command Portal</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                {user?.userId || 'distributor_active'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display mt-0.5">
              Source Produce &amp; Procurement Hub
            </h1>
            <p className="text-xs text-slate-500">
              Procure farmgate verified consignments with direct farmer escrow contracts and matched return freight.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Transparent Sourcing Partner</span>
            </span>

            {/* Account / Easy User Switching Menu */}
            <AccountMenu />
          </div>
        </div>

        {/* 4 DASHBOARD METRIC CARDS (Requested exactly) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Active Orders */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Orders</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">4</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">2 dispatching from Sanwer</div>
          </div>

          {/* Card 2: Available Produce */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Produce</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">5,190 <span className="text-xs font-normal text-slate-500">KG</span></div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">4 verified regional lots</div>
          </div>

          {/* Card 3: Pending Offers */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Offers</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 font-display mt-1">{2 + submittedOffers.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting farmer approval</div>
          </div>

          {/* Card 4: Total Procurement */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Procurement</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-display mt-1">₹4,85,000</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Settled via Smart Escrow</div>
          </div>
        </div>

        {/* MAIN SECTION: "AVAILABLE PRODUCE" (Requested with crop, quantity, location, harvest date, quality, expected price, farmer/pool ID, Make Offer) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                Available Produce
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Freshly listed harvests ready for direct purchase, forward contracts, or immediate consignment pickup.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Showing verified supply in Indore Corridor</span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {produceList.map((item) => {
                const isOfferSent = submittedOffers.includes(item.id);

                return (
                  <div 
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Header row: Crop & ID */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900 font-display">{item.crop}</span>
                          <span className="text-xs text-slate-500 font-medium">({item.variety})</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">
                          {item.farmerPoolId}
                        </span>
                      </div>

                      {/* Expected Price & Quantity */}
                      <div className="flex items-baseline justify-between bg-amber-50/70 p-3 rounded-xl border border-amber-100">
                        <div>
                          <span className="text-[10px] text-amber-800 uppercase font-bold block">Target Ask Price</span>
                          <span className="text-xl font-black text-amber-900 font-display">{item.expectedPrice}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Quantity</span>
                          <span className="text-base font-extrabold text-slate-900">{item.quantity}</span>
                        </div>
                      </div>

                      {/* Detail attributes: Location, Harvest Date, Quality, Farmer */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location:
                          </span>
                          <span className="font-semibold text-slate-800 text-right">{item.location}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Harvest Date:
                          </span>
                          <span className="font-semibold text-slate-800">{item.harvestDate}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-600" /> Quality Grade:
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                            {item.quality}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-400">Supplier / Collective:</span>
                          <span className="font-bold text-slate-700">{item.farmerName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Make Offer Button (Requested) */}
                    <button
                      type="button"
                      onClick={() => handleMakeOffer(item)}
                      disabled={isOfferSent}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isOfferSent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs active:scale-95'
                      }`}
                    >
                      {isOfferSent ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Offer Submitted (Awaiting Farmer)</span>
                        </>
                      ) : (
                        <>
                          <span>Make Offer</span>
                          <ArrowRight className="w-4 h-4 text-amber-200" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>

      {/* MAKE OFFER MODAL */}
      {offerModalProduce && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 font-display">Make Procurement Offer</h3>
              <span className="text-xs bg-amber-50 text-amber-800 font-mono px-2 py-0.5 rounded font-bold">
                {offerModalProduce.farmerPoolId}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Submit your direct purchase bid for <strong className="text-slate-800">{offerModalProduce.quantity} {offerModalProduce.crop}</strong> ({offerModalProduce.farmerName}).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Offered Price (₹ / KG)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">Ask: {offerModalProduce.expectedPrice}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Procurement Notes / Logistics Terms</label>
                <textarea
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold">Automated Escrow Safeguard:</div>
                <p>Funds will be held securely in escrow and released to the farmer upon verified QR gate scan at delivery point.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOfferModalProduce(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOffer}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs cursor-pointer active:scale-95"
              >
                Send Offer to Farmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
