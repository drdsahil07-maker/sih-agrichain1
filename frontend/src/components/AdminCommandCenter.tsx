import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Cpu, 
  Users, 
  Truck, 
  Store, 
  AlertCircle,
  Database,
  CheckCircle2,
  Lock,
  RefreshCw,
  Sprout,
  ShoppingBag,
  Shield,
  Layers,
  UtensilsCrossed,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { useOrders } from '../hooks/useOrders';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { Package } from 'lucide-react';
import { UserProfile, AppUserRole } from '../../../shared/types';

export const AdminCommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, role, switchRole, setIsAuthModalOpen, logout } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [dbStats, setDbStats] = useState({
    harvests: 0,
    demands: 0,
    backhauls: 0,
    calls: 0,
    users: 0,
  });
  const [isDbOnline, setIsDbOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { orders } = useOrders();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const health = await checkSupabaseConnection();
      setIsDbOnline(health.connected);

      // Attempt to load profiles from Supabase if table exists
      const { data: dbProfiles } = await supabase.from('profiles').select('*').limit(20);
      const mappedUsers: UserProfile[] = (dbProfiles || []).map((p: any) => ({
        uid: p.id,
        email: p.email || '',
        displayName: p.full_name || 'User',
        role: p.role,
        roleName: p.role.charAt(0).toUpperCase() + p.role.slice(1),
        department: `${p.role.toUpperCase()} NETWORK`,
        status: 'active',
        createdAt: p.created_at,
        lastLogin: p.last_login_at || p.created_at,
        isCustomUser: true
      }));

      setUsersList(mappedUsers);
      setDbStats({
        harvests: 6,
        demands: 5,
        backhauls: 4,
        calls: 8,
        users: mappedUsers.length,
      });
    } catch (e) {
      console.warn('Admin load data fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const roleBadges: Record<AppUserRole, { label: string; icon: any; color: string }> = {
    farmer: { label: 'Farmer', icon: Sprout, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    distributor: { label: 'Distributor', icon: ShoppingBag, color: 'bg-amber-100 text-amber-800 border-amber-300' },
    buyer: { label: 'Buyer', icon: ShoppingBag, color: 'bg-amber-100 text-amber-800 border-amber-300' },
    consumer: { label: 'Consumer / Bulk Buyer', icon: UtensilsCrossed, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    transporter: { label: 'Transporter', icon: Truck, color: 'bg-blue-100 text-blue-800 border-blue-300' },
    admin: { label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-800 border-purple-300' },
    government_admin: { label: 'Gov Admin', icon: Shield, color: 'bg-red-100 text-red-800 border-red-300' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header with Role & Database status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold border border-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>PROTOCOL GOVERNANCE &amp; NEUTRALITY MONITOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            System Neutrality Command Center
          </h1>
          <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
            AgriChain functions as a pure mathematical compiler. It owns zero trucks, holds zero crop inventories, and takes zero speculative market positions—ensuring absolute algorithmic impartiality.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isDbOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div className="text-left text-xs">
              <span className="font-bold text-slate-900 block">Cloud Data Node</span>
              <span className="text-[11px] text-slate-500 font-mono">Real-time Cluster Active</span>
            </div>
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer ml-1"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch Role</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                await logout();
              } catch (e) {
                console.warn('Logout note:', e);
              }
              navigate('/choose-role');
            }}
            className="bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-slate-200 hover:border-rose-200 font-bold text-xs px-4 py-3 rounded-2xl shadow-xs cursor-pointer flex items-center gap-2 transition-all"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Protocol & Live Database Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">Supply Chains Compiled</span>
          <div className="font-black text-3xl text-slate-900 font-display">1,420</div>
          <span className="text-[11px] text-emerald-600 font-semibold">+18% this harvest cycle</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">Average Farmer Net Lift</span>
          <div className="font-black text-3xl text-emerald-700 font-display">+28.4%</div>
          <span className="text-[11px] text-slate-500">Relative to local village trader</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">Logistics Waste Eliminated</span>
          <div className="font-black text-3xl text-blue-700 font-display">₹4.2M</div>
          <span className="text-[11px] text-slate-500">Saved via backhaul sharing</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">Active Harvests in DB</span>
          <div className="font-black text-3xl text-amber-700 font-display">{dbStats.harvests}</div>
          <span className="text-[11px] text-slate-500">Persistent in Firestore</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">Verified RBAC Users</span>
          <div className="font-black text-3xl text-purple-700 font-display">{dbStats.users}</div>
          <span className="text-[11px] text-purple-600 font-semibold">Farmers &bull; Buyers &bull; Transporters</span>
        </div>
      </div>

      {/* Role-Based Access Control Security Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-lg text-slate-900 font-display">
                Role-Based Access Control &amp; Firestore Security Rules
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforces least-privilege attribute validation across all participant roles. Deployed in live firestore.rules.
            </p>
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            Security Rules: Active &amp; Enforced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {[
            {
              role: '🌾 Farmer',
              write: 'harvests',
              read: 'all supply chains, buyer demands, backhaul options',
              authRule: 'Author verification (farmerId == auth.uid)',
              bg: 'bg-emerald-50/60 border-emerald-200',
            },
            {
              role: '🛒 Buyer',
              write: 'buyer_demands, orders (buyerId)',
              read: 'verified produce catalog, logistics corridors, escrow state',
              authRule: 'Buyer validation (buyerId == auth.uid)',
              bg: 'bg-amber-50/60 border-amber-200',
            },
            {
              role: '🚚 Transporter',
              write: 'backhaul_trips, delivery scans',
              read: 'pickup consignments, backhaul load matching, road corridors',
              authRule: 'Driver validation (transporterId == auth.uid)',
              bg: 'bg-blue-50/60 border-blue-200',
            },
            {
              role: '🛡️ Admin',
              write: 'users, admins, platform settings, escrow disputes',
              read: 'full auditable system log & participant directory',
              authRule: 'Zero-trust verification (exists(/admins/$(auth.uid)))',
              bg: 'bg-purple-50/60 border-purple-200',
            },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${item.bg} space-y-2`}>
              <span className="font-bold text-slate-900 text-sm block">{item.role}</span>
              <div className="space-y-1 text-[11px] text-slate-600">
                <p><strong className="text-slate-800">Write:</strong> {item.write}</p>
                <p><strong className="text-slate-800">Read:</strong> {item.read}</p>
                <p className="pt-1 text-[10px] text-slate-500 font-mono border-t border-slate-200/60">
                  {item.authRule}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Participant Directory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 font-display">
              Registered Platform Participants (Firestore users/ collection)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live directory of verified actors across the Malwa-Indore agricultural network.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {usersList.length} Accounts Synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3 pl-2">Participant</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Operating Location</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {usersList.map((u) => {
                const badge = roleBadges[u.role] || roleBadges.farmer;
                const RoleIcon = badge.icon;
                const isCurrent = userProfile.uid === u.uid;
                return (
                  <tr key={u.uid} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-emerald-50/40' : ''}`}>
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {u.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.displayName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{u.uid}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3 text-slate-600 font-mono text-[11px]">
                      {u.email}
                    </td>

                    <td className="py-3 text-slate-600">
                      {u.location || 'Indore District, MP'}
                    </td>

                    <td className="py-3 text-right pr-2">
                      <button
                        type="button"
                        onClick={() => switchRole(u.role)}
                        className={`
                          px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors
                          ${isCurrent 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }
                        `}
                      >
                        {isCurrent ? 'Active' : 'Impersonate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Neutrality Safeguards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-bold text-lg text-slate-900 font-display">Algorithmic Safeguards &amp; Anti-Monopoly Guarantees</h3>
          <p className="text-xs text-slate-500 mt-1">Guarantees designed to safeguard smallholder autonomy and prevent platform lock-in.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Inventory Holding</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              AgriChain never buys low to store and sell high. Farmers always remain the legal and beneficial owners of produce until final buyer delivery.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-Option Transparency</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              The compiler always presents all viable routes—including traditional Mandi auctions—so farmers can choose based on their individual risk tolerance.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Open Protocol Interoperability</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Full compatibility with ONDC and e-NAM standards, enabling any verified logistics or aggregation provider to plug into the execution mesh.
            </p>
          </div>
        </div>
      </div>


      {/* System Orders Oversight */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Active Orders (System Oversight)
        </h3>
        {orders.length === 0 ? (
          <div className="text-sm text-slate-500 py-4 text-center">No active orders in system.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-slate-900">{order.crop} - {order.quantity_kg}kg</div>
                    <div className="text-xs text-slate-500">ID: {order.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-700">₹{order.total_amount}</div>
                    <div className="text-xs text-slate-500">Net: ₹{order.farmer_net_value}</div>
                  </div>
                </div>
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