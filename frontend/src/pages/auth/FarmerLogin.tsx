import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const FarmerLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleFillDemo = async (autoSubmit: boolean = false) => {
    setIdentifier('farmer@agrichain.com');
    setPassword('Password123!');
    setError(null);
    if (autoSubmit) {
      setLoading(true);
      try {
        const result = await login('farmer@agrichain.com', 'Password123!', 'farmer');
        setLoading(false);
        if (result.success) {
          navigate('/farmer/dashboard');
        } else {
          setError(result.error || 'Failed to sign in as Farmer.');
        }
      } catch (err: any) {
        setLoading(false);
        setError(err?.message || 'Failed to sign in.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(identifier, password, 'farmer');
      setLoading(false);

      if (result.success) {
        navigate('/farmer/dashboard');
      } else {
        setError(result.error || 'Failed to sign in as Farmer. Please check credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'An unexpected error occurred during sign in.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg(null);
    setResetError(null);
    setResetLoading(true);

    const res = await resetPassword(resetEmail);
    setResetLoading(false);

    if (res.success) {
      setResetMsg(`Password reset instructions sent to ${resetEmail}. Check your inbox.`);
    } else {
      setResetError(res.error || 'Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Bar / Change Account Type */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link 
          to="/choose-role"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Change account type</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-xs text-2xl">
            🌾
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            Farmer Login
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Sell and manage your produce with transparent net prices
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-md border border-slate-200 rounded-3xl space-y-5">
          {/* Demo Credentials Box */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Farmer Demo Credentials</span>
              </div>
              <div className="text-emerald-800 font-mono text-[11px] mt-0.5 select-all">
                Email: <strong>farmer@agrichain.com</strong> &bull; Pass: <strong>Password123!</strong>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleFillDemo(false)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] rounded-lg border border-emerald-300 transition-colors cursor-pointer"
              >
                Auto-Fill
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo(true)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                1-Click Login
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field: Email / Identifier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address / Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. farmer@example.com or 9826011234"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(identifier.includes('@') ? identifier : '');
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Buttons: Login & Create Account */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Signing in...' : 'Login to Farmer Portal'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/register/farmer')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Create New Farmer Account</span>
              </button>
            </div>
          </form>

          {/* Links */}
          <div className="pt-2 text-center border-t border-slate-100 flex justify-between items-center text-xs">
            <Link 
              to="/choose-role" 
              className="font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
            >
              ← Change role
            </Link>
            <Link
              to="/forgot-password"
              className="font-semibold text-emerald-700 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
              <button 
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered email address to receive a secure password reset link.
            </p>

            {resetMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{resetMsg}</span>
              </div>
            )}

            {resetError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
