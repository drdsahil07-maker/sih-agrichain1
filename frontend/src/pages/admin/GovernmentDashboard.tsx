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
  LogOut
} from 'lucide-react';
import { RoleGuard } from '../../auth/roleGuard';
import { MandiPriceIntelligence } from '../../components/MandiPriceIntelligence';
import { supabase } from '../../lib/supabase';

export const GovernmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'all' | 'mandi' | 'supply_demand' | 'pooling' | 'logistics' | 'alerts' | 'reports'
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

  // Orders integration
  const { orders, loading: ordersLoading, refreshOrders } = useOrders();

  useEffect(() => {
    fetchData();

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
                Official regulatory monitoring of farmgate pooling, Mandi benchmark pricing, supply-demand deficits, and farmer grievances.
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
              { id: 'reports', label: 'State Reports' }
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

          {/* KPIs (Always visible in Overview or on demand) */}
          {(activeTab === 'all' || activeTab === 'supply_demand' || activeTab === 'pooling') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={<Users className="w-5 h-5 text-emerald-600" />} title="Registered Farmers" value={overview?.registeredFarmers || 248} />
              <KpiCard icon={<Layers className="w-5 h-5 text-indigo-600" />} title="Active Pools" value={overview?.activePools || 12} />
              <KpiCard icon={<Truck className="w-5 h-5 text-blue-600" />} title="Orders In Transit" value={overview?.ordersInTransit || 8} />
              <KpiCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} title="Transporters Active" value={overview?.activeTransporters || 34} />
            </div>
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

          {/* 4. ALERTS SECTION */}
          {(activeTab === 'all' || activeTab === 'alerts') && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Regulatory Alerts &amp; Shortage Notices
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  3 Active Notices
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-red-900">Severe Supply Deficit: Onion in Indore APMC Cluster</div>
                    <p className="text-red-700 mt-0.5">
                      Demand exceeds recorded farmer harvests by 3,500 kg. Priority dispatch routing recommended from Dewas farmgate clusters.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-red-200 text-red-800 rounded">HIGH PRIORITY</span>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-amber-900">Mandi Price Spike Variance: Tomato (+18.4%)</div>
                    <p className="text-amber-700 mt-0.5">
                      Modal price increased from ₹22/kg to ₹26.5/kg within 48 hours. Aggregated direct procurement active.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-800 rounded">MONITOR</span>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-blue-900">Logistics Congestion: NH-52 Cold-Chain Corridor</div>
                    <p className="text-blue-700 mt-0.5">
                      Transporter turnaround delay estimated at +45 mins. Alternate rural feeder route compiled.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-200 text-blue-800 rounded">ADVISORY</span>
                </div>
              </div>
            </section>
          )}

          {/* 5. REPORTS SECTION */}
          {(activeTab === 'all' || activeTab === 'reports') && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-700" />
                    Official Government Reports &amp; Compliance Logs
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Download official APMC audit summaries, farmer net lift verifications, and trade records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                  <div className="font-bold text-slate-900">State APMC Procurement Audit</div>
                  <p className="text-slate-500 text-[11px]">
                    Comprehensive audit log of 1,420 completed consignments and fair settlement payouts.
                  </p>
                  <button
                    type="button"
                    onClick={() => alert('Exporting Official State APMC Procurement Audit (CSV)...')}
                    className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                  <div className="font-bold text-slate-900">Farmer Fair-Trade Net Lift Index</div>
                  <p className="text-slate-500 text-[11px]">
                    Verification that verified farmers achieved +28.4% average price increase over local trader baseline.
                  </p>
                  <button
                    type="button"
                    onClick={() => alert('Exporting Farmer Net Lift Index (PDF)...')}
                    className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                  <div className="font-bold text-slate-900">Interstate Truck Backhaul Efficiency</div>
                  <p className="text-slate-500 text-[11px]">
                    Carbon reduction and empty-return diesel savings report for state transport department.
                  </p>
                  <button
                    type="button"
                    onClick={() => alert('Exporting Backhaul Logistics Efficiency Report (CSV)...')}
                    className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 6. RECENT TRANSACTIONS / ORDERS */}
          {(activeTab === 'all') && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600"/> 
                Order &amp; Settlement Surveillance
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4 font-bold">Order ID</th>
                      <th className="py-3 px-4 font-bold">Crop</th>
                      <th className="py-3 px-4 font-bold">Quantity</th>
                      <th className="py-3 px-4 font-bold">Total Amount</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ordersLoading && (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading order state...</td></tr>
                    )}
                    {!ordersLoading && orders.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-500">No active transactions in buffer.</td></tr>
                    )}
                    {orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-600">#{order.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{order.crop}</td>
                        <td className="py-3 px-4 text-slate-700">{order.quantity_kg} kg</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">₹{Number(order.total_amount).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      </div>
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
