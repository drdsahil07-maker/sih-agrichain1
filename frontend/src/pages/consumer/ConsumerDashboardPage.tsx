import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  ShoppingBag, 
  Truck, 
  User, 
  LogOut, 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Plus, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Package,
  Scale,
  DollarSign,
  AlertCircle,
  Phone,
  Check,
  Send,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { authService } from '../../auth/authService';
import { useAuth } from '../../context/AuthContext';
import { AccountMenu } from '../../components/AccountMenu';
import { supabase } from '../../lib/supabase';
import { BulkRequirement } from '../../../../shared/types';
import { useOrders } from '../../hooks/useOrders';
import { fetchWithAuth } from '../../services/apiFetch';

interface AvailableFarmProduce {
  id: string;
  crop: string;
  variety: string;
  harvestDate: string;
  quantityAvailable: string;
  pricePerUnit: number;
  unit: string;
  farmLocation: string;
  district: string;
  farmerName: string;
  qualityGrade: string;
  minOrderQty: number;
}

interface ActiveBulkOrder {
  id: string;
  orderNumber: string;
  crop: string;
  quantity: string;
  totalAmount: number;
  farmerName: string;
  dispatchHub: string;
  status: 'Order Placed' | 'Harvesting' | 'In Transit' | 'Delivered';
  eta: string;
  transporterName: string;
  transporterPhone: string;
  vehicleNumber: string;
}

export const ConsumerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  // Determine initial tab from pathname if sub-route was requested
  const getTabFromPath = (path: string) => {
    if (path.includes('/consumer/produce')) return 'Find Produce';
    if (path.includes('/consumer/requirements')) return 'Bulk Requirements';
    if (path.includes('/consumer/orders')) return 'Orders';
    if (path.includes('/consumer/tracking')) return 'Live Tracking';
    if (path.includes('/consumer/profile')) return 'Profile';
    return 'Dashboard';
  };

  const [activeTab, setActiveTab] = useState<string>(getTabFromPath(location.pathname));

  // Sync tab when route changes
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    const pathMap: Record<string, string> = {
      'Dashboard': '/consumer/dashboard',
      'Find Produce': '/consumer/produce',
      'Bulk Requirements': '/consumer/requirements',
      'Orders': '/consumer/orders',
      'Live Tracking': '/consumer/tracking',
      'Profile': '/consumer/profile'
    };
    if (pathMap[tabName]) {
      navigate(pathMap[tabName], { replace: true });
    }
  };

  // State: Available Farm Produce for Bulk Purchase
  const [produceList] = useState<AvailableFarmProduce[]>([
    {
      id: 'FARM-PROD-101',
      crop: 'Tomato',
      variety: 'Hybrid Shivam (Thick skin, long shelf life)',
      harvestDate: 'Harvested Today at 5:30 AM',
      quantityAvailable: '1,400 KG',
      pricePerUnit: 17.50,
      unit: 'KG',
      farmLocation: 'Sanwer Organic Cluster, Farmgate 4',
      district: 'Indore, MP',
      farmerName: 'Ramesh Patel Farmer Cluster',
      qualityGrade: 'Grade A (Chef Selected)',
      minOrderQty: 50
    },
    {
      id: 'FARM-PROD-102',
      crop: 'Red Onion',
      variety: 'Nashik Garva (Double skin dry cured)',
      harvestDate: 'Cured 2 Days Ago',
      quantityAvailable: '3,200 KG',
      pricePerUnit: 21.00,
      unit: 'KG',
      farmLocation: 'Hatod Village Agro Cooperative',
      district: 'Indore, MP',
      farmerName: 'Hatod Progressive Farmers Group',
      qualityGrade: 'Grade A+ (Medium-Large 50mm+)',
      minOrderQty: 100
    },
    {
      id: 'FARM-PROD-103',
      crop: 'Potato',
      variety: 'Jyoti Grade 1 (Low sugar, firm texture)',
      harvestDate: 'Fresh harvest yesterday',
      quantityAvailable: '4,500 KG',
      pricePerUnit: 14.50,
      unit: 'KG',
      farmLocation: 'Mhow Cold Chain FPO Hub',
      district: 'Indore, MP',
      farmerName: 'Mhow Vegetable Growers Federation',
      qualityGrade: 'Grade A (Table / Kitchen Ready)',
      minOrderQty: 100
    },
    {
      id: 'FARM-PROD-104',
      crop: 'Basmati Rice',
      variety: 'Pusa 1121 Extra Long Grain (Raw Aged)',
      harvestDate: 'Season Harvest - Aged 12 Mo.',
      quantityAvailable: '8,000 KG',
      pricePerUnit: 78.00,
      unit: 'KG',
      farmLocation: 'Hoshangabad Paddy FPO Cluster',
      district: 'Narmadapuram, MP',
      farmerName: 'Narmada Valley Farmers Producer Org',
      qualityGrade: 'Grade A Premium Exports',
      minOrderQty: 250
    },
    {
      id: 'FARM-PROD-105',
      crop: 'Green Chilli',
      variety: 'G-4 Spicy Sharp',
      harvestDate: 'Picked Today Morning',
      quantityAvailable: '600 KG',
      pricePerUnit: 34.00,
      unit: 'KG',
      farmLocation: 'Khargone Spices Cooperative',
      district: 'Khargone, MP',
      farmerName: 'Nimar Kisan Samiti',
      qualityGrade: 'Grade A Fresh Green',
      minOrderQty: 20
    }
  ]);

  // Order Placement Modal State
  const [selectedProduce, setSelectedProduce] = useState<AvailableFarmProduce | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(100);
  const [orderDeliveryAddress, setOrderDeliveryAddress] = useState<string>(
    profile?.consumer?.city ? `${profile.consumer.business_name || 'Kitchen Hub'}, ${profile.consumer.city}, ${profile.consumer.state}` : 'Central Kitchen Dispatch Hub, Ring Road'
  );
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Bulk Requirements State
  const [requirements, setRequirements] = useState<BulkRequirement[]>([
    {
      id: 'REQ-201',
      consumer_id: user?.uid || '',
      crop: 'Tomato',
      variety: 'Grade A Cooking',
      quantity: 200,
      unit: 'kg',
      target_price: 18.00,
      delivery_location: 'Grand Kitchen, AB Road, Indore',
      city: 'Indore',
      state: 'Madhya Pradesh',
      frequency: 'daily',
      quality_grade: 'A Grade',
      status: 'open',
      notes: 'Morning delivery by 7:00 AM required. Daily fresh batch.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'REQ-202',
      consumer_id: user?.uid || '',
      crop: 'Onion',
      variety: 'Nashik Red 50mm+',
      quantity: 500,
      unit: 'kg',
      target_price: 22.50,
      delivery_location: 'Catering Central Depot, Scheme 54',
      city: 'Indore',
      state: 'Madhya Pradesh',
      frequency: 'weekly',
      quality_grade: 'A Grade',
      status: 'matched',
      notes: 'Firm dry cured onions without sprouting.',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  // New Requirement Form Modal
  const [showReqModal, setShowReqModal] = useState(false);
  const [newCrop, setNewCrop] = useState('Tomato');
  const [newVariety, setNewVariety] = useState('');
  const [newQuantity, setNewQuantity] = useState('150');
  const [newUnit, setNewUnit] = useState('kg');
  const [newTargetPrice, setNewTargetPrice] = useState('18');
  const [newLocation, setNewLocation] = useState(
    profile?.consumer?.city ? `${profile.consumer.business_name || 'Main Kitchen'}, ${profile.consumer.city}` : ''
  );
  const [newFrequency, setNewFrequency] = useState('daily');
  const [newGrade, setNewGrade] = useState('A Grade');
  const [newNotes, setNewNotes] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // Active Orders
  // Orders integration
  const { orders: activeOrders, loading: ordersLoading, refreshOrders } = useOrders();

  const handleConfirmOrder = async () => {
    if (!selectedProduce) return;

    try {
      const res = await fetchWithAuth('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: `${selectedProduce.crop} (${selectedProduce.variety})`,
          quantity_kg: orderQuantity,
          agreed_price_per_kg: selectedProduce.pricePerUnit,
          pickup_location: selectedProduce.farmLocation,
          delivery_location: orderDeliveryAddress,
        })
      });

      if (res.ok) {
        setOrderSuccessMsg(`Successfully booked ${orderQuantity} ${selectedProduce.unit} of ${selectedProduce.crop}! Order confirmed with Escrow Protection.`);
        refreshOrders();
        setTimeout(() => {
          setSelectedProduce(null);
          setOrderSuccessMsg(null);
          handleTabChange('Orders');
        }, 2000);
      } else {
        const err = await res.json();
        setOrderSuccessMsg(`Failed to place order: ${err?.error?.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      setOrderSuccessMsg(`Error: ${e.message}`);
    }
  };

  // Load requirements from Supabase if table exists
  useEffect(() => {
    const fetchSupabaseRequirements = async () => {
      try {
        const { data, error } = await supabase
          .from('bulk_requirements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setRequirements(data as BulkRequirement[]);
        }
      } catch (err) {
        console.warn('Could not fetch bulk_requirements from Supabase, using local fallback:', err);
      }
    };

    fetchSupabaseRequirements();
  }, []);

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqSubmitting(true);

    const newReqItem: BulkRequirement = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      consumer_id: user?.uid || 'user-consumer',
      crop: newCrop,
      variety: newVariety || 'Standard Grade',
      quantity: parseFloat(newQuantity) || 100,
      unit: newUnit,
      target_price: parseFloat(newTargetPrice) || undefined,
      delivery_location: newLocation || 'Kitchen Dispatch Hub',
      city: profile?.consumer?.city || 'Indore',
      state: profile?.consumer?.state || 'Madhya Pradesh',
      frequency: newFrequency as any,
      quality_grade: newGrade,
      status: 'open',
      notes: newNotes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Try to save to Supabase
      const { data, error } = await supabase
        .from('bulk_requirements')
        .insert({
          consumer_id: user?.uid,
          crop: newReqItem.crop,
          variety: newReqItem.variety,
          quantity: newReqItem.quantity,
          unit: newReqItem.unit,
          target_price: newReqItem.target_price,
          delivery_location: newReqItem.delivery_location,
          city: newReqItem.city,
          state: newReqItem.state,
          frequency: newReqItem.frequency,
          quality_grade: newReqItem.quality_grade,
          status: 'open',
          notes: newReqItem.notes
        })
        .select()
        .single();

      if (!error && data) {
        setRequirements(prev => [data as BulkRequirement, ...prev]);
      } else {
        // Fallback to local state
        setRequirements(prev => [newReqItem, ...prev]);
      }
    } catch {
      setRequirements(prev => [newReqItem, ...prev]);
    } finally {
      setReqSubmitting(false);
      setShowReqModal(false);
      // Reset form
      setNewCrop('Tomato');
      setNewVariety('');
      setNewQuantity('150');
      setNewNotes('');
    }
  };

  const handlePlaceOrder = (produce: AvailableFarmProduce) => {
    setSelectedProduce(produce);
    setOrderQuantity(produce.minOrderQty);
    setOrderSuccessMsg(null);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login/consumer');
  };

  const sidebarNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Find Produce', icon: Search, badge: `${produceList.length} items` },
    { label: 'Bulk Requirements', icon: ClipboardList, badge: `${requirements.filter(r => r.status === 'open').length} active` },
    { label: 'Orders', icon: ShoppingBag, badge: `${activeOrders.filter(o => o.status !== 'DELIVERED' && (o.status as string) !== 'Delivered').length}` },
    { label: 'Live Tracking', icon: Truck },
    { label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 tracking-tight">AgriChain</div>
              <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Consumer Portal</div>
            </div>
          </div>
          <div className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-200">
            Bulk Buyer
          </div>
        </div>

        {/* Bulk Buyer Profile Card */}
        <div className="p-3 mx-3 mt-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              {profile?.consumer?.business_name || user?.name || 'Bulk Food Business'}
            </div>
            <div className="text-[10px] text-indigo-800 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-indigo-600" />
              <span>{profile?.consumer?.business_type || 'Verified Bulk Buyer'}</span>
            </div>
          </div>
        </div>

        {/* Direct Procurement Benefit Banner */}
        <div className="mx-3 mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 leading-tight">
          <span className="font-bold text-slate-800 block">Direct Farm Procurement:</span>
          Cut mandi intermediary markups by 18-25% with farmgate-harvest freshness delivered to your kitchen door.
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
                onClick={() => handleTabChange(item.label)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-800'
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
              <span className="text-xs font-semibold text-indigo-700">Consumer &amp; Bulk Buyer Command</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                {user?.userId || 'consumer_active'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display mt-0.5">
              {activeTab === 'Dashboard' && 'Bulk Procurement Dashboard'}
              {activeTab === 'Find Produce' && 'Farmgate Produce Marketplace'}
              {activeTab === 'Bulk Requirements' && 'Manage Bulk Requirements & Tenders'}
              {activeTab === 'Orders' && 'Bulk Orders & Delivery Status'}
              {activeTab === 'Live Tracking' && 'Consignment Tracking & Route ETA'}
              {activeTab === 'Profile' && 'Institutional Buyer Profile'}
            </h1>
            <p className="text-xs text-slate-500">
              Procure farm-fresh agricultural commodities in bulk directly from farmer clusters with escrow trust.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReqModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Requirement</span>
            </button>

            {/* Account / Easy User Switching Menu */}
            <AccountMenu />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-6">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Requirements</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
                  {requirements.filter(r => r.status === 'open').length}
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                  Open to farmer clusters
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Deliveries</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
                  {activeOrders.filter(o => o.status !== 'DELIVERED' && (o.status as string) !== 'Delivered').length}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  1 arriving today
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Procurement Savings</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-display mt-1 flex items-center">
                  <TrendingDown className="w-5 h-5 inline mr-1 text-emerald-500" />
                  22%
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1">
                  vs. Mandi middleman rates
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Farmgate Freshness</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
                  &lt; 6 hrs
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                  Harvest-to-kitchen speed
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Produce Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Fresh Farmgate Harvests Available */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Fresh Farmgate Harvests Ready for Kitchens
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct bulk lots harvested this morning by verified regional farmers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('Find Produce')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All ({produceList.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {produceList.slice(0, 4).map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-white transition-all space-y-3 flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-black text-slate-900 font-display">
                            {item.crop}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            ₹{item.pricePerUnit.toFixed(2)} / {item.unit}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-1 line-clamp-1">
                          {item.variety}
                        </p>
                        <div className="text-[10px] text-slate-500 mt-2 space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{item.harvestDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{item.farmLocation}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Avail: <strong className="text-slate-900">{item.quantityAvailable}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlaceOrder(item)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                          Buy Bulk
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: Active Requirement Status & Quick Post */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-indigo-600" />
                      Your Bulk Requirements
                    </h2>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                      {requirements.length} Total
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">
                    Farmers and aggregator FPOs review your requirements and submit direct farmgate delivery quotes.
                  </p>

                  <div className="space-y-3">
                    {requirements.slice(0, 3).map((req) => (
                      <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{req.crop} ({req.quantity} {req.unit})</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {req.status === 'open' ? 'Open for Bids' : 'Matched'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>Freq: <strong className="capitalize">{req.frequency}</strong></span>
                          <span>Target: <strong>₹{req.target_price || 'Open'} / {req.unit}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowReqModal(true)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post New Bulk Requirement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('Bulk Requirements')}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-indigo-700 text-center cursor-pointer"
                  >
                    Manage all requirements →
                  </button>
                </div>
              </div>

            </div>

            {/* Active Delivery Status Spotlight */}
            {activeOrders.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 font-display">
                        Live Shipment Tracking: {activeOrders[0].crop}
                      </h3>
                      <p className="text-xs text-slate-500">Order #{activeOrders[0].orderNumber} • {activeOrders[0].quantity}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTabChange('Live Tracking')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open Live GPS Tracking
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver &amp; Vehicle</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{activeOrders[0].transporterName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{activeOrders[0].vehicleNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Arrival</span>
                    <span className="font-bold text-indigo-700 mt-0.5 block">{activeOrders[0].eta}</span>
                    <span className="text-slate-500 text-[11px]">Direct farmgate route</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Escrow Payment</span>
                    <span className="font-bold text-emerald-700 mt-0.5 block">₹{activeOrders[0].totalAmount.toLocaleString()} Locked in Escrow</span>
                    <span className="text-slate-500 text-[11px]">Auto-released on digital weighment signoff</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FIND PRODUCE / MARKETPLACE */}
        {/* ========================================================================= */}
        {activeTab === 'Find Produce' && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-display">
                    Farmgate Produce Direct Marketplace
                  </h2>
                  <p className="text-xs text-slate-500">
                    Source verified wholesale consignments direct from farmers. No middleman margins.
                  </p>
                </div>
                <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  ✓ 100% Quality &amp; Weight Guaranteed
                </div>
              </div>

              {/* Produce List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {produceList.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white hover:border-indigo-400 border border-slate-200 rounded-2xl p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-base font-black text-slate-900 font-display block">
                            {item.crop}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">
                            {item.variety}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-emerald-700 font-display block">
                            ₹{item.pricePerUnit.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">per {item.unit}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Available Lot:</span>
                          <span className="font-bold text-slate-900">{item.quantityAvailable}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Min Order:</span>
                          <span className="font-semibold text-slate-800">{item.minOrderQty} {item.unit}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Quality:</span>
                          <span className="font-semibold text-indigo-700">{item.qualityGrade}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Harvest:</span>
                          <span className="font-medium text-slate-700">{item.harvestDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Hub:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[170px]">{item.farmLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlaceOrder(item)}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order for Delivery</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BULK REQUIREMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'Bulk Requirements' && (
          <div className="space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-display">
                    Your Bulk Commodity Requirements
                  </h2>
                  <p className="text-xs text-slate-500">
                    Post continuous or spot requirements. Regional farmers and FPOs will quote direct farmgate prices.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReqModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post New Requirement</span>
                </button>
              </div>

              {/* Requirements Table / Cards */}
              <div className="space-y-3">
                {requirements.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <ClipboardList className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-slate-700">No active requirements posted</h3>
                    <p className="text-xs text-slate-500 mt-1">Post what your kitchen or business needs to start receiving farmer bids.</p>
                  </div>
                ) : (
                  requirements.map((req) => (
                    <div 
                      key={req.id} 
                      className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 font-display">{req.crop}</span>
                          <span className="text-xs text-slate-600 font-medium">({req.variety || 'Standard Grade'})</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {req.status === 'open' ? 'Bidding Open' : 'Matched / Contracted'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                          <span>Volume: <strong className="text-slate-900">{req.quantity} {req.unit}</strong></span>
                          <span>Frequency: <strong className="capitalize text-slate-900">{req.frequency}</strong></span>
                          <span>Target: <strong className="text-emerald-700">₹{req.target_price || 'Market'} / {req.unit}</strong></span>
                          <span>Quality: <strong className="text-slate-900">{req.quality_grade}</strong></span>
                        </div>

                        {req.notes && (
                          <p className="text-[11px] text-slate-500 italic">
                            &ldquo;{req.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="text-[11px] text-slate-400 block">
                          Delivery: {req.delivery_location}
                        </span>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                          <span>3 Farmer Matches</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ORDERS */}
        {/* ========================================================================= */}
        {activeTab === 'Orders' && (
          <div className="space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-display">
                    Bulk Purchase Orders &amp; Escrow Status
                  </h2>
                  <p className="text-xs text-slate-500">
                    All deliveries are covered by Escrow Protection. Funds are only settled after kitchen weight verification.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {ordersLoading && <div className="p-4 text-center text-sm text-slate-500">Loading orders...</div>}
                {activeOrders.map((order: any) => (
                  <div 
                    key={order.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 font-display">{order.crop}</span>
                          <span className="text-xs font-bold text-slate-500 font-mono">#{order.id.slice(0, 8)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Dispatched from {order.pickup_location || 'Unknown Hub'}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-700 font-display block">
                          ₹{Number(order.total_amount).toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Qty</span>
                        <span className="font-semibold text-slate-800">{order.quantity_kg} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">ETA / Schedule</span>
                        <span className="font-semibold text-slate-800">{order.expected_delivery_at ? new Date(order.expected_delivery_at).toLocaleString() : 'Pending'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Status</span>
                        <span className="font-semibold text-indigo-700">{order.status}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleTabChange('Live Tracking')}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Track Truck GPS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: LIVE TRACKING */}
        {/* ========================================================================= */}
        {activeTab === 'Live Tracking' && (
          <div className="space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-display">
                  Live Consignment GPS Tracking
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time location of active delivery trucks carrying farm produce directly to your facility.
                </p>
              </div>

              {activeOrders.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-indigo-900 block">
                        Shipment {activeOrders[0].orderNumber} • {activeOrders[0].crop}
                      </span>
                      <p className="text-xs text-indigo-700">
                        Sanwer Farmgate Hub ➔ Central Kitchen Hub, Indore
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        ● GPS Live Moving (42 km/h)
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">ETA: 45 Minutes</span>
                    </div>
                  </div>

                  {/* Visual Route Tracker */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>
                      <div className="absolute left-0 w-3/4 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 z-0"></div>

                      {/* Step 1: Farmgate Harvest */}
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          ✓
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 mt-2">Harvested</span>
                        <span className="text-[10px] text-slate-500">6:00 AM</span>
                      </div>

                      {/* Step 2: Loaded & Weighed */}
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          ✓
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 mt-2">Loaded</span>
                        <span className="text-[10px] text-slate-500">Sanwer Hub</span>
                      </div>

                      {/* Step 3: In Transit */}
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs animate-pulse shadow-md">
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-indigo-700 mt-2">In Transit</span>
                        <span className="text-[10px] text-indigo-600 font-semibold">Indore Bypass</span>
                      </div>

                      {/* Step 4: Kitchen Delivery */}
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">
                          4
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 mt-2">Kitchen Drop</span>
                        <span className="text-[10px] text-slate-400">ETA 2:30 PM</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Transporter Contact</span>
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <Phone className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{activeOrders[0].transporterPhone}</span>
                          <span className="text-slate-500 font-normal">({activeOrders[0].transporterName})</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Vehicle Registration</span>
                        <span className="font-mono font-bold text-slate-900 block">{activeOrders[0].vehicleNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-500">
                  No shipments currently in transit.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: PROFILE */}
        {/* ========================================================================= */}
        {activeTab === 'Profile' && (
          <div className="space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-display">
                    Institutional Buyer Profile &amp; Settings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Stored securely in PostgreSQL <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">consumer_profiles</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Edit Master Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Business Name</span>
                  <span className="font-bold text-slate-900 text-sm block">
                    {profile?.consumer?.business_name || user?.name || 'Bulk Food Organization'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Business Type</span>
                  <span className="font-bold text-slate-900 text-sm block">
                    {profile?.consumer?.business_type || 'Restaurant / Bulk Buyer'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Contact Manager</span>
                  <span className="font-semibold text-slate-800 block">
                    {profile?.consumer?.owner_name || profile?.full_name || user?.name || 'Manager'}
                  </span>
                  <span className="text-slate-500">{user?.email || 'N/A'}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Primary Kitchen Location</span>
                  <span className="font-semibold text-slate-800 block">
                    {profile?.consumer?.city ? `${profile.consumer.city}, ${profile.consumer.state}` : 'Indore, Madhya Pradesh'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 sm:col-span-2">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Regularly Procured Crops</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(profile?.consumer?.required_crops && profile.consumer.required_crops.length > 0 
                      ? profile.consumer.required_crops 
                      : ['Tomatoes', 'Onions', 'Potatoes', 'Basmati Rice', 'Green Chillies']
                    ).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-md font-semibold text-xs">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: POST BULK REQUIREMENT */}
      {/* ========================================================================= */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 font-display">
                  Post Bulk Produce Requirement
                </h3>
                <p className="text-xs text-slate-500">
                  Regional farmers and FPOs will receive this tender and submit direct price quotes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReqModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop *</label>
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Potato">Potato</option>
                    <option value="Basmati Rice">Basmati Rice</option>
                    <option value="Green Chilli">Green Chilli</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Garlic">Garlic</option>
                    <option value="Ginger">Ginger</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Variety / Spec</label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    placeholder="e.g. Hybrid Grade A / Long shelf"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Needed *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="kg">KG</option>
                    <option value="quintal">Quintals</option>
                    <option value="tonne">Tonnes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Price (₹ / {newUnit})</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTargetPrice}
                    onChange={(e) => setNewTargetPrice(e.target.value)}
                    placeholder="e.g. 18.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Procurement Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="one-time">One-Time Spot Order</option>
                    <option value="daily">Daily Standing Order</option>
                    <option value="weekly">Weekly Consignment</option>
                    <option value="monthly">Monthly Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kitchen / Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Hotel Grand Kitchen Hub, AB Road, Indore"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Special Specifications / Timing</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Early morning delivery before 7:30 AM required. Uniform size."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reqSubmitting}
                  className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {reqSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Publish Requirement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BUY BULK PRODUCE */}
      {/* ========================================================================= */}
      {selectedProduce && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 font-display">
                  Book Farmgate Consignment
                </h3>
                <p className="text-xs text-slate-500">
                  Direct purchase with Escrow Protection &amp; Farmgate Tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduce(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {orderSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{orderSuccessMsg}</span>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">{selectedProduce.crop}</span>
                <span className="font-bold text-emerald-700">₹{selectedProduce.pricePerUnit.toFixed(2)} / {selectedProduce.unit}</span>
              </div>
              <p className="text-slate-500 text-[11px]">{selectedProduce.variety}</p>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                Farmer: <strong>{selectedProduce.farmerName}</strong> • {selectedProduce.farmLocation}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Order Quantity ({selectedProduce.unit}) * (Min: {selectedProduce.minOrderQty})
                </label>
                <input
                  type="number"
                  min={selectedProduce.minOrderQty}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kitchen Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={orderDeliveryAddress}
                  onChange={(e) => setOrderDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between text-indigo-950 font-bold">
                  <span>Total Escrow Amount:</span>
                  <span className="text-sm font-black text-indigo-700">
                    ₹{(orderQuantity * selectedProduce.pricePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-indigo-700">
                  ✓ Amount held in AgriChain Smart Escrow until delivery is weighed and accepted at kitchen receiving dock.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProduce(null)}
                className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Booking</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
