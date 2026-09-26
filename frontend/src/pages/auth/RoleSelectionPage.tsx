import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThreeRole } from '../../../../shared/types';
import { checkSupabaseConnection, SupabaseHealthCheckResult } from '../../lib/supabase';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();
  const [health, setHealth] = useState<SupabaseHealthCheckResult | null>(null);
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyConnection() {
      const res = await checkSupabaseConnection();
      setHealth(res);
    }
    verifyConnection();
  }, []);

  const handleContinueAs = (role: ThreeRole) => {
    navigate(`/login/${role}`);
  };

  const handleQuickDemoLogin = async (email: string, pass: string, role: ThreeRole, redirectPath: string) => {
    setLoggingInRole(role);
    setLoginError(null);
    try {
      const res = await login(email, pass, role);
      if (res.success) {
        navigate(redirectPath);
      } else {
        setLoginError(res.error || `Failed to log in as ${role}`);
      }
    } catch (e: any) {
      setLoginError(e?.message || 'Login failed');
    } finally {
      setLoggingInRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Functional Realtime Connection Indicator */}
        <div className="flex items-center justify-between px-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${health?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span>Platform Database: {health?.connected ? 'Online' : 'Connecting...'}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login/government')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer"
          >
            <span>🏛️ Government Admin Portal →</span>
          </button>
        </div>

        {/* Brand and Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <span>AgriChain Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display">
            AgriChain
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-semibold max-w-xl mx-auto">
            Connect. Trade. Deliver.
          </p>

          {/* Active account indicator if already logged in */}
          {currentUser && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-600">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Currently signed in as <strong>{currentUser.name}</strong> (<span className="capitalize">{currentUser.role}</span>)</span>
              <button
                type="button"
                onClick={() => navigate(`/${currentUser.role}/dashboard`)}
                className="font-bold text-emerald-600 hover:text-emerald-700 underline ml-1 cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* DEMO CREDENTIALS QUICK ACCESS BANNER */}
        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="text-sm font-bold text-slate-900 font-display">Instant Demo Access Accounts</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">All 4 Roles Ready</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Use any of these 4 pre-configured accounts to sign in immediately, or click <strong>1-Click Sign In</strong> below. Password for all: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono font-bold">Password123!</code>
              </p>
            </div>
          </div>

          {loginError && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              {loginError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            {/* Farmer Demo */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">🌾 Farmer</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Producer</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-emerald-900 font-semibold select-all">
                  farmer@agrichain.com
                </div>
              </div>
              <button
                type="button"
                disabled={loggingInRole === 'farmer'}
                onClick={() => handleQuickDemoLogin('farmer@agrichain.com', 'Password123!', 'farmer', '/farmer/dashboard')}
                className="mt-2.5 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer text-center disabled:opacity-50"
              >
                {loggingInRole === 'farmer' ? 'Signing in...' : '1-Click Sign In'}
              </button>
            </div>

            {/* Distributor Demo */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">🏪 Distributor</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">Mandi Trader</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-amber-900 font-semibold select-all">
                  distributor@agrichain.com
                </div>
              </div>
              <button
                type="button"
                disabled={loggingInRole === 'distributor'}
                onClick={() => handleQuickDemoLogin('distributor@agrichain.com', 'Password123!', 'distributor', '/distributor/dashboard')}
                className="mt-2.5 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer text-center disabled:opacity-50"
              >
                {loggingInRole === 'distributor' ? 'Signing in...' : '1-Click Sign In'}
              </button>
            </div>

            {/* Transporter Demo */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950">🚚 Transporter</span>
                  <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-bold">Fleet Logistics</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-blue-900 font-semibold select-all">
                  transporter@agrichain.com
                </div>
              </div>
              <button
                type="button"
                disabled={loggingInRole === 'transporter'}
                onClick={() => handleQuickDemoLogin('transporter@agrichain.com', 'Password123!', 'transporter', '/transporter/dashboard')}
                className="mt-2.5 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer text-center disabled:opacity-50"
              >
                {loggingInRole === 'transporter' ? 'Signing in...' : '1-Click Sign In'}
              </button>
            </div>

            {/* Consumer Demo */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950">🍽️ Consumer / Buyer</span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded font-bold">Bulk Buyer</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-indigo-900 font-semibold select-all">
                  consumer@agrichain.com
                </div>
              </div>
              <button
                type="button"
                disabled={loggingInRole === 'consumer'}
                onClick={() => handleQuickDemoLogin('consumer@agrichain.com', 'Password123!', 'consumer', '/consumer/dashboard')}
                className="mt-2.5 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer text-center disabled:opacity-50"
              >
                {loggingInRole === 'consumer' ? 'Signing in...' : '1-Click Sign In'}
              </button>
            </div>
          </div>
        </div>

        {/* 4 ROLE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* CARD 1: FARMER */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                🌾
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">Farmer</h2>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  Sell and manage your produce
                </p>
              </div>

              {/* Demo Account Pill */}
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 font-mono">
                <span className="text-emerald-700 font-bold block text-[10px] uppercase tracking-wider">Demo Account:</span>
                farmer@agrichain.com
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={loggingInRole === 'farmer'}
                onClick={() => handleQuickDemoLogin('farmer@agrichain.com', 'Password123!', 'farmer', '/farmer/dashboard')}
                className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center disabled:opacity-50"
              >
                ⚡ 1-Click Demo Sign In
              </button>

              <button
                type="button"
                onClick={() => handleContinueAs('farmer')}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Go to Farmer Login</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/register/farmer')}
                className="w-full py-1.5 px-2 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors text-center cursor-pointer"
              >
                Need an account? Register
              </button>
            </div>
          </div>

          {/* CARD 2: DISTRIBUTOR */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                🏪
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">Distributor</h2>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  Source, aggregate and distribute produce
                </p>
              </div>

              {/* Demo Account Pill */}
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950 font-mono">
                <span className="text-amber-700 font-bold block text-[10px] uppercase tracking-wider">Demo Account:</span>
                distributor@agrichain.com
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={loggingInRole === 'distributor'}
                onClick={() => handleQuickDemoLogin('distributor@agrichain.com', 'Password123!', 'distributor', '/distributor/dashboard')}
                className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center disabled:opacity-50"
              >
                ⚡ 1-Click Demo Sign In
              </button>

              <button
                type="button"
                onClick={() => handleContinueAs('distributor')}
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Go to Distributor Login</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/register/distributor')}
                className="w-full py-1.5 px-2 text-[11px] font-semibold text-slate-500 hover:text-amber-700 transition-colors text-center cursor-pointer"
              >
                Need an account? Register
              </button>
            </div>
          </div>

          {/* CARD 3: CONSUMER / BULK BUYER */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                🍽️
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">Consumer / Bulk Buyer</h2>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  Buy fresh produce directly for your business
                </p>
              </div>

              {/* Demo Account Pill */}
              <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-[11px] text-indigo-950 font-mono">
                <span className="text-indigo-700 font-bold block text-[10px] uppercase tracking-wider">Demo Account:</span>
                consumer@agrichain.com
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={loggingInRole === 'consumer'}
                onClick={() => handleQuickDemoLogin('consumer@agrichain.com', 'Password123!', 'consumer', '/consumer/dashboard')}
                className="w-full py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center disabled:opacity-50"
              >
                ⚡ 1-Click Demo Sign In
              </button>

              <button
                type="button"
                onClick={() => handleContinueAs('consumer')}
                className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Go to Consumer Login</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/register/consumer')}
                className="w-full py-1.5 px-2 text-[11px] font-semibold text-slate-500 hover:text-indigo-700 transition-colors text-center cursor-pointer"
              >
                Need an account? Register
              </button>
            </div>
          </div>

          {/* CARD 4: TRANSPORTER */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                🚚
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">Transporter</h2>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  Find loads and manage deliveries
                </p>
              </div>

              {/* Demo Account Pill */}
              <div className="p-2 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-950 font-mono">
                <span className="text-blue-700 font-bold block text-[10px] uppercase tracking-wider">Demo Account:</span>
                transporter@agrichain.com
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={loggingInRole === 'transporter'}
                onClick={() => handleQuickDemoLogin('transporter@agrichain.com', 'Password123!', 'transporter', '/transporter/dashboard')}
                className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center disabled:opacity-50"
              >
                ⚡ 1-Click Demo Sign In
              </button>

              <button
                type="button"
                onClick={() => handleContinueAs('transporter')}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Go to Transporter Login</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/register/transporter')}
                className="w-full py-1.5 px-2 text-[11px] font-semibold text-slate-500 hover:text-blue-700 transition-colors text-center cursor-pointer"
              >
                Need an account? Register
              </button>
            </div>
          </div>
        </div>

        {/* HELPER TEXT */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Switch account type at any time from your dashboard account menu.
          </p>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 mt-10">
        &copy; {new Date().getFullYear()} AgriChain Commerce &bull; Production Role-Based Access
      </footer>
    </div>
  );
};
