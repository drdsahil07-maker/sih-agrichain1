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

export const ConsumerLogin: React.FC = () => {
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
    setIdentifier('consumer@agrichain.com');
    setPassword('Password123!');
    setError(null);
    if (autoSubmit) {
      setLoading(true);
      try {
        const result = await login('consumer@agrichain.com', 'Password123!', 'consumer');
        setLoading(false);
        if (result.success) {
          navigate('/consumer/dashboard');
        } else {
          setError(result.error || 'Failed to sign in as Consumer.');
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
      const result = await login(identifier, password, 'consumer');
      setLoading(false);

      if (result.success) {
        navigate('/consumer/dashboard');
      } else {
        setError(result.error || 'Failed to sign in as Consumer / Bulk Buyer. Please check credentials.');
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Change account type</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xs text-2xl">
            🍽️
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            Consumer / Bulk Buyer Login
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Procure fresh farm produce directly for restaurants, hotels, canteens, and food businesses
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-md border border-slate-200 rounded-3xl space-y-5">
          {/* Demo Credentials Box */}
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span>Consumer Demo Credentials</span>
              </div>
              <div className="text-indigo-800 font-mono text-[11px] mt-0.5 select-all">
                Email: <strong>consumer@agrichain.com</strong> &bull; Pass: <strong>Password123!</strong>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleFillDemo(false)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-900 font-bold text-[11px] rounded-lg border border-indigo-300 transition-colors cursor-pointer"
              >
                Auto-Fill
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo(true)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors cursor-pointer"
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
                Business Email / User ID
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
                  placeholder="e.g. procurement@hotelgrand.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
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
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 transition-colors cursor-pointer"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Buttons: Login & Create Account */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Signing in...' : 'Login to Consumer Portal'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/register/consumer')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Create New Bulk Buyer Account</span>
              </button>
            </div>
          </form>

          {/* Links */}
          <div className="pt-2 text-center border-t border-slate-100 flex justify-between items-center text-xs">
            <Link 
              to="/choose-role"
              className="text-slate-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Back to Role Selection
            </Link>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => {
                setResetEmail(identifier.includes('@') ? identifier : '');
                setShowForgotModal(true);
              }}
              className="text-slate-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Reset Consumer Password</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetMsg(null);
                  setResetError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter your registered business email address and we'll send you instructions to reset your account password.
            </p>

            {resetMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{resetMsg}</span>
              </div>
            )}

            {resetError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Business Email
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="procurement@hotelgrand.com"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
