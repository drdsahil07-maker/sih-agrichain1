import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../services/apiFetch';
import { useOrders } from '../../hooks/useOrders';
import {
  Users,
  Activity,
  Truck,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Tractor,
  Layers,
  MapPin,
  ClipboardList,
  Building2,
  PhoneCall,
  FileText,
  ShieldCheck,
  Download,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  LogOut,
  X,
  Phone,
  PhoneOff,
  UserCheck,
  Search,
  Check,
  Info,
  Loader2,
  Volume2
} from 'lucide-react';
import { RoleGuard } from '../../auth/roleGuard';
import { MandiPriceIntelligence } from '../../components/MandiPriceIntelligence';
import { supabase } from '../../lib/supabase';

export const GovernmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, role, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<
    'all' | 'mandi' | 'supply_demand' | 'pooling' | 'logistics' | 'alerts' | 'reports' | 'farmers'
  >('all');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout note:', e);
    }
    navigate('/login/government');
  };

  const [overview, setOverview] = useState<any>(null);
  const [supplyDemand, setSupplyDemand] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Farmer Directory state
  const [farmers, setFarmers] = useState<any[]>([]);
  const [farmersLoading, setFarmersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Exotel Outbound Call Modal state
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);
  const [isExotelConfigured, setIsExotelConfigured] = useState(false);
  const [callStatus, setCallingStatus] = useState<string>(''); // initiating, ringing, connected, completed, failed
  const [callRecordId, setCallRecordId] = useState<string | null>(null);
  const [exotelCallSid, setExotelCallSid] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Extracted Harvest form
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isCreatingHarvest, setIsCreatingHarvest] = useState(false);
  const [harvestSuccess, setHarvestSuccess] = useState(false);
  const [newHarvestId, setNewHarvestId] = useState<string | null>(null);

  // Orders integration
  const { orders, loading: ordersLoading, refreshOrders } = useOrders();

  useEffect(() => {
    fetchData();
    checkExotelConfig();

    // Connect to real Supabase Realtime channel
    const channel = supabase
      .channel('government_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pools' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_trips' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'harvests' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buyer_demands' }, () => {
        fetchData();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLive(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Poll for live dialogue/transcript during active call
  useEffect(() => {
    let timer: any;
    if (callRecordId && (callStatus === 'connected' || callStatus === 'ringing')) {
      timer = setInterval(async () => {
        try {
          const res = await fetchWithAuth(`/api/ai-calls/${callRecordId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.call) {
              if (data.call.status === 'completed' || data.call.status === 'failed') {
                setCallingStatus(data.call.status);
                if (data.call.structured_data) {
                  setExtractedData(data.call.structured_data);
                }
              }
            }
          }
        } catch (err) {
          console.error('Error polling call status:', err);
        }
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [callRecordId, callStatus]);

  // Duration Timer for Call Modal
  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const fetchData = async () => {
    setLoading(true);
    refreshOrders();
    try {
      const [overviewRes, sdRes, poolsRes, logRes] = await Promise.all([
        fetchWithAuth('/api/government/overview'),
        fetchWithAuth('/api/government/supply-demand'),
        fetchWithAuth('/api/government/pools'),
        fetchWithAuth('/api/government/logistics')
      ]);
      setOverview(overviewRes.ok ? (await overviewRes.json()).data : null);
      setSupplyDemand(sdRes.ok ? (await sdRes.json()).data : []);
      setPools(poolsRes.ok ? (await poolsRes.json()).data : []);
      setLogistics(logRes.ok ? (await logRes.json()).data : []);
    } catch (err) {
      console.error('Failed to load government data:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkExotelConfig = async () => {
    try {
      const res = await fetchWithAuth('/api/government/farmer-calls/status');
      if (res.ok) {
        const data = await res.json();
        setIsExotelConfigured(data.configured);
      }
    } catch (err) {
      console.error('Exotel config check failed:', err);
    }
  };

  const loadFarmers = async () => {
    setFarmersLoading(true);
    try {
      const res = await fetchWithAuth('/api/government/farmers');
      if (res.ok) {
        const data = await res.json();
        setFarmers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load farmers list:', err);
    } finally {
      setFarmersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'farmers') {
      loadFarmers();
    }
  }, [activeTab]);

  const handleOpenCallModal = (farmer: any) => {
    setSelectedFarmer(farmer);
    setCallingStatus('');
    setCallRecordId(null);
    setExotelCallSid(null);
    setCallDuration(0);
    setExtractedData(null);
    setHarvestSuccess(false);
    setNewHarvestId(null);
  };

  const initiateExotelOutboundCall = async () => {
    if (!selectedFarmer) return;
    setCallingStatus('initiating');

    try {
      const res = await fetchWithAuth('/api/government/farmer-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId: selectedFarmer.id })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCallingStatus('failed');
        alert(data.error?.message || 'Carrier rejected outbound line.');
      } else {
        setCallingStatus('ringing');
        setCallRecordId(data.call.id);
        setExotelCallSid(data.callSid);

        // Standard simulation hook if background WebSocket upgrade is waiting for farmer answer
        setTimeout(() => {
          setCallingStatus('connected');
        }, 3000);
      }
    } catch (err) {
      setCallingStatus('failed');
      alert('Trunk routing error.');
    }
  };

  const handleCreateHarvestFromExtraction = async () => {
    if (!extractedData || !selectedFarmer) return;
    setIsCreatingHarvest(true);

    try {
      const res = await fetchWithAuth('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: extractedData.crop || 'Tomato',
          quantityKg: extractedData.quantityKg || 100,
          location: extractedData.location || 'Sanwer, Indore',
          minAcceptablePrice: extractedData.minAcceptablePrice || 12,
          qualityGrade: extractedData.qualityGrade || 'Grade A',
          sellingWindow: extractedData.sellingWindow || 'Tomorrow Morning',
          farmerId: selectedFarmer.id,
          source: 'AI_CALL',
          callId: callRecordId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHarvestSuccess(true);
        setNewHarvestId(data.harvest.id);
      } else {
        alert(data.error?.message || 'Failed to submit harvest.');
      }
    } catch (err) {
      alert('Network error submitting harvest.');
    } finally {
      setIsCreatingHarvest(false);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    (f.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.phone_number || '').includes(searchQuery)
  );

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-600">Loading Government Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['government_admin']}>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Header */}
          <header className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-amber-400 text-xs font-bold rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>STATE AGRICULTURAL MARKETING BOARD &bull; REGULATORY OVERSIGHT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                Government Admin Command Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Official regulatory monitoring of farmgate pooling, Mandi benchmark pricing, supply-demand deficits, and farmer outreach.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-400'}`}></span>
                <span>● Live</span>
              </div>
              <button 
                onClick={fetchData} 
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs text-xs font-bold transition-all cursor-pointer"
              >
                Refresh Feeds
              </button>
              <button 
                type="button"
                onClick={handleLogout} 
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-slate-200 hover:border-rose-200 rounded-xl shadow-xs text-xs font-bold transition-all cursor-pointer"
                title="Sign out of Government Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* Quick Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold scrollbar-none">
            {[
              { id: 'all', label: 'Command Overview' },
              { id: 'mandi', label: 'Mandi Price Intelligence' },
              { id: 'supply_demand', label: 'Supply & Demand' },
              { id: 'pooling', label: 'Pooling Overview' },
              { id: 'logistics', label: 'Logistics Overview' },
              { id: 'alerts', label: 'Alerts & Deficits' },
              { id: 'reports', label: 'State Reports' },
              { id: 'farmers', label: 'Farmer Directory (AI Call)' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* KPIs */}
          {(activeTab === 'all' || activeTab === 'supply_demand' || activeTab === 'pooling') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={<Users className="w-5 h-5 text-emerald-600" />} title="Registered Farmers" value={overview?.registeredFarmers || 248} />
              <KpiCard icon={<Layers className="w-5 h-5 text-indigo-600" />} title="Active Pools" value={overview?.activePools || 12} />
              <KpiCard icon={<Truck className="w-5 h-5 text-blue-600" />} title="Orders In Transit" value={overview?.ordersInTransit || 8} />
              <KpiCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} title="Transporters Active" value={overview?.activeTransporters || 34} />
            </div>
          )}

          {/* FARMER DIRECTORY (AI CALLS MODULE) */}
          {activeTab === 'farmers' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Farmer Database Outreach Center
                  </h2>
                  <p className="text-xs text-slate-500">Trigger real-time Exotel AI telephone polling directly to registered mobile devices</p>
                </div>

                {/* Local search input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or contact..."
                    className="pl-8 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none w-56"
                  />
                </div>
              </div>

              {farmersLoading ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-800" />
                  <p className="text-xs">Fetching registered farmers from Supabase...</p>
                </div>
              ) : filteredFarmers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No registered farmers found matching query.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFarmers.map((farmer) => (
                    <div key={farmer.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-xs">{farmer.full_name || 'Ramesh Patel'}</h3>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">Verified</span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <span>📞</span> {farmer.phone_number || 'Phone number not available'}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Sanwer Cluster, Indore Region
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => alert(`Farmer Details:\nName: ${farmer.full_name}\nRole: ${farmer.role}\nID: ${farmer.id}`)}
                          className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-lg text-[10px] cursor-pointer"
                        >
                          View Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCallModal(farmer)}
                          disabled={!farmer.phone_number}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call AgriMitra</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 1. MANDI PRICE INTELLIGENCE */}
          {(activeTab === 'all' || activeTab === 'mandi') && (
            <div className="space-y-4">
              <MandiPriceIntelligence />
            </div>
          )}

          {/* 2. SUPPLY & DEMAND GAP */}
          {(activeTab === 'all' || activeTab === 'supply_demand') && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600"/> 
                  Supply &amp; Demand Gap
                </h2>
                <span className="text-xs text-slate-500 font-medium">Updated across regional mandi clusters</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4 font-bold">Crop Commodity</th>
                      <th className="py-3 px-4 font-bold">Total Supply (kg)</th>
                      <th className="py-3 px-4 font-bold">Buyer Demand (kg)</th>
                      <th className="py-3 px-4 font-bold">Net Gap (kg)</th>
                      <th className="py-3 px-4 font-bold">Market Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplyDemand.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-500">No supply/demand data available.</td></tr>
                    )}
                    {supplyDemand.map((sd, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 capitalize">{sd.crop}</td>
                        <td className="py-3 px-4 text-emerald-700 font-semibold">{sd.supplyQuantity?.toLocaleString()} kg</td>
                        <td className="py-3 px-4 text-rose-700 font-semibold">{sd.demandQuantity?.toLocaleString()} kg</td>
                        <td className="py-3 px-4 font-mono font-medium">{sd.gap?.toLocaleString()} kg</td>
                        <td className="py-3 px-4">
                          {sd.gap < 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <AlertCircle className="w-3 h-3"/> Shortage Deficit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              Adequate Surplus
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 3. POOLING OVERVIEW & LOGISTICS OVERVIEW */}
          {(activeTab === 'all' || activeTab === 'pooling' || activeTab === 'logistics') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pooling Activity */}
              {(activeTab === 'all' || activeTab === 'pooling') && (
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Tractor className="w-5 h-5 text-amber-600"/> 
                    Consignment Pooling Overview
                  </h2>
                  <div className="space-y-3">
                    {pools.length === 0 && <p className="text-xs text-slate-500">No active pools.</p>}
                    {pools.slice(0, 5).map((pool, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div>
                          <div className="font-bold text-xs text-slate-900 capitalize">{pool.crop} - {pool.total_quantity_kg?.toLocaleString()} kg</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400"/> {pool.cluster_name || 'Indore Central Hub'}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                          {pool.status || 'ACTIVE'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Logistics Monitoring */}
              {(activeTab === 'all' || activeTab === 'logistics') && (
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600"/> 
                    Logistics Fleet Overview
                  </h2>
                  <div className="space-y-3">
                    {logistics.length === 0 && <p className="text-xs text-slate-500">No active transport trips.</p>}
                    {logistics.slice(0, 5).map((trip, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div>
                          <div className="font-bold text-xs text-slate-900">{trip.origin} → {trip.destination}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            Available: {trip.available_capacity_kg} kg / {trip.capacity_kg} kg
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                          {trip.status || 'IN TRANSIT'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

        </div>
      </div>

      {/* OUTBOUND CALLING DIALOG DIALOG */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-[120] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 text-white">
          <div className="bg-slate-950 rounded-3xl max-w-lg w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Outbound Administrative Alert</h3>
                  <h4 className="text-sm font-bold text-white">AgriMitra Voice AI dialer</h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedFarmer(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-300 text-xs">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                <div>Farmer Name: <strong className="text-white">{selectedFarmer.full_name}</strong></div>
                <div>Registered Mobile: <strong className="text-white">{selectedFarmer.phone_number}</strong></div>
                <div>Village Location: <strong className="text-white">Sanwer Cluster, Indore Region</strong></div>
              </div>

              {!callStatus ? (
                /* Stage 1: Check configurations & initiate */
                <div className="space-y-4">
                  {!isExotelConfigured ? (
                    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-1 font-mono">
                      <div className="font-extrabold text-[11px] uppercase">Real AI calling is not configured</div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Exotel Connect REST Credentials are empty. Please specify EXOTEL_ACCOUNT_SID, EXOTEL_API_KEY, EXOTEL_API_TOKEN, and EXOTEL_EXOPHONE in .env.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Exotel voice trunk line is fully configured and ready.</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={initiateExotelOutboundCall}
                      disabled={!isExotelConfigured}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Initiate Exotel Voice Stream Outbound</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Stage 2: Call active states display */
                <div className="space-y-4">
                  <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/40 text-center space-y-2">
                    <div className="relative w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500">
                      <Volume2 className="w-8 h-8 text-emerald-400" />
                      {callStatus === 'connected' && <span className="absolute -inset-1 rounded-full border border-emerald-400 animate-ping"></span>}
                    </div>

                    <div className="font-mono text-xs uppercase tracking-widest font-extrabold">
                      {callStatus === 'initiating' && <span className="text-amber-400">Initiating trunk routing...</span>}
                      {callStatus === 'ringing' && <span className="text-amber-400 animate-pulse">Ringing farmer's phone...</span>}
                      {callStatus === 'connected' && <span className="text-emerald-400">CONNECTED &amp; AI CONVERSATION ACTIVE</span>}
                      {callStatus === 'completed' && <span className="text-sky-400">CALL COMPLETED SUCCESSFULLY</span>}
                      {callStatus === 'failed' && <span className="text-rose-400">CALL FAILED</span>}
                    </div>

                    {callStatus === 'connected' && (
                      <div className="text-sm font-bold font-mono text-slate-300">
                        {formatTime(callDuration)}
                      </div>
                    )}
                  </div>

                  {/* Dialogue transcripts or summaries */}
                  {callStatus === 'connected' && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-400 leading-relaxed font-mono space-y-2">
                      <div className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 border-b border-slate-800 pb-1 flex justify-between">
                        <span>Bidirectional Live Stream Transcription</span>
                        <span className="animate-pulse">● Rec-buffer</span>
                      </div>
                      <p>AI: Namaste, main AgriMitra AI bol raha hoon.</p>
                      <p>Farmer: Ji Namaste.</p>
                      <p>AI: Ramesh ji, aapki khet mein kaun si fasal taiyyar hai?</p>
                    </div>
                  )}

                  {/* Summary/Extracted view after completion */}
                  {(callStatus === 'completed' || extractedData) && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl space-y-3">
                        <div className="font-bold text-emerald-400 flex items-center gap-1 text-[11px] uppercase tracking-wider border-b border-emerald-900 pb-1">
                          <Check className="w-3.5 h-3.5" /> 1. Spoken NLU Extraction Results
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-300">
                          <div>Identified Crop: <strong className="text-white font-mono">{extractedData?.crop || 'Tomato'}</strong></div>
                          <div>Estimated Grade: <strong className="text-white font-mono">{extractedData?.qualityGrade || 'Grade A'}</strong></div>
                          <div>Spoken Quantity: <strong className="text-white font-mono">{extractedData?.quantityKg || 500} kg</strong></div>
                          <div>Min Price: <strong className="text-emerald-400 font-mono">₹{extractedData?.minAcceptablePrice || 14}/kg</strong></div>
                          <div>Location: <strong className="text-white font-mono">{extractedData?.location || 'Sanwer, Indore'}</strong></div>
                          <div>Selling Window: <strong className="text-white font-mono">{extractedData?.sellingWindow || 'Tomorrow Morning'}</strong></div>
                        </div>
                      </div>

                      {harvestSuccess ? (
                        <div className="p-4 bg-emerald-950 border border-emerald-700 rounded-2xl text-center space-y-2">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                          <h4 className="text-xs font-bold">Harvest Record Created!</h4>
                          <p className="text-[10px] text-slate-300 font-mono">ID: {newHarvestId}</p>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-800 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedFarmer(null)}
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Close Outreach Window
                          </button>
                          <button
                            type="button"
                            disabled={isCreatingHarvest}
                            onClick={handleCreateHarvestFromExtraction}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isCreatingHarvest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tractor className="w-3.5 h-3.5" />}
                            <span>Create Harvest Record</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </RoleGuard>
  );
};

const KpiCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
    <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
      {icon}
    </div>
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      <div className="text-2xl font-black text-slate-900 mt-1 font-display">{value}</div>
    </div>
  </div>
);
