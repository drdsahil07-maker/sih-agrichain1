import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sprout, 
  ShoppingBag, 
  Truck, 
  Shield, 
  LogIn, 
  UserPlus, 
  Check, 
  AlertCircle,
  Database,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppUserRole } from '../../../shared/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    userProfile, 
    role, 
    currentUser, 
    switchRole, 
    signInWithEmail, 
    signUpWithEmail, 
    signOut 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'switch_role' | 'signin' | 'signup'>('switch_role');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppUserRole>('farmer');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const rolesConfig: {
    id: AppUserRole;
    title: string;
    label: string;
    icon: any;
    desc: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    features: string[];
  }[] = [
    {
      id: 'farmer',
      title: 'Farmer Persona',
      label: 'Ramesh Patel',
      icon: Sprout,
      desc: 'Sell crops directly, trigger AI Calling Assistant, pool harvests.',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      features: ['List Harvest & Set Min Price', 'AI Phone Telephony Call', 'Village Aggregation Hubs'],
    },
    {
      id: 'buyer',
      title: 'Buyer Persona',
      label: 'Shreemaya Food Hub',
      icon: ShoppingBag,
      desc: 'Browse verified produce, post institutional demands, fund escrow.',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      features: ['Available Produce Catalog', 'Post Commercial Demands', 'Direct Landed Cost Guarantee'],
    },
    {
      id: 'transporter',
      title: 'Transporter Persona',
      label: 'Jagdish Yadav',
      icon: Truck,
      desc: 'Fill return trips with farm loads, claim backhaul earnings.',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      features: ['Corridor Route Load Matching', 'List Empty Return Trips', 'Instant Delivery OTP Payout'],
    },
    {
      id: 'admin',
      title: 'Platform Admin',
      label: 'AgriChain Central Control',
      icon: Shield,
      desc: 'Monitor Firestore database, manage escrow settlement, verify participants.',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      features: ['Firestore User Directory', 'Escrow Contract Oversight', 'Platform Clearing Operations'],
    },
  ];

  const handleSelectRole = async (targetRole: AppUserRole) => {
    setLoading(true);
    await switchRole(targetRole);
    setLoading(false);
    setSuccessMsg(`Switched to ${targetRole.toUpperCase()} role successfully.`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 800);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const res = await signInWithEmail(email, password);
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 800);
    } else {
      setErrorMsg(res.error || 'Failed to sign in.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const res = await signUpWithEmail(email, password, displayName, selectedRole);
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Account created and role registered in Firestore!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 800);
    } else {
      setErrorMsg(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-1.5">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>AgriChain Auth &amp; Cloud Database Connected</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Role-Based Authentication
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch accounts or authenticate with credentials. Protected by PostgreSQL Row-Level Security.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Active Persona &amp; Security Context
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-white text-sm font-display">
                {userProfile.displayName}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase border border-emerald-500/30">
                {userProfile.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {userProfile.email} {userProfile.location ? `• ${userProfile.location}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                setSuccessMsg('Logged out successfully');
                setTimeout(() => setSuccessMsg(null), 1500);
              }}
              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('switch_role')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'switch_role' 
                ? 'text-emerald-700 border-b-2 border-emerald-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Quick Role Switcher (4 Personas)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'signin' 
                ? 'text-emerald-700 border-b-2 border-emerald-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'signup' 
                ? 'text-emerald-700 border-b-2 border-emerald-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Quick Role Switcher */}
        {activeTab === 'switch_role' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Select any persona to test end-to-end role permissions with live Firestore synchronization:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rolesConfig.map((r) => {
                const Icon = r.icon;
                const isCurrent = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRole(r.id)}
                    className={`
                      p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between
                      ${isCurrent 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/40' 
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
                      }
                    `}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl ${r.bgColor} ${r.textColor} flex items-center justify-center font-bold`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{r.title}</span>
                            <span className="text-[11px] text-slate-500">{r.label}</span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="bg-emerald-600 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 pt-1">
                        {r.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700 uppercase">Role: {r.id}</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                        {isCurrent ? 'Active Now' : 'Switch →'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agrichain.in"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        )}

        {/* Tab 3: Sign Up Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name or Entity</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Anand Sharma / Green Valley Kitchen"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@agrichain.in"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'farmer', label: '🌾 Farmer', desc: 'Crop Seller' },
                  { id: 'buyer', label: '🛒 Buyer', desc: 'Commercial Kitchen' },
                  { id: 'transporter', label: '🚚 Transporter', desc: 'Fleet / Driver' },
                  { id: 'admin', label: '🛡️ Admin', desc: 'Operations Control' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id as AppUserRole)}
                    className={`
                      p-2.5 rounded-xl border text-left cursor-pointer transition-all
                      ${selectedRole === r.id 
                        ? 'border-emerald-600 bg-emerald-50/60 font-bold' 
                        : 'border-slate-200 hover:bg-slate-50'
                      }
                    `}
                  >
                    <span className="block text-slate-900 text-xs">{r.label}</span>
                    <span className="text-[10px] text-slate-500 block">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Register & Sync to Firestore'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
