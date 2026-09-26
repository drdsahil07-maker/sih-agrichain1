import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GovernmentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFillDemo = async (autoSubmit: boolean = false) => {
    setIdentifier('admin1@gmail.com');
    setPassword('Password123!');
    setError(null);
    if (autoSubmit) {
      setLoading(true);
      try {
        const result = await login('admin1@gmail.com', 'Password123!', 'government_admin');
        setLoading(false);
        if (result.success) {
          navigate('/government');
        } else {
          setError(result.error || 'Failed to authenticate as Government Admin.');
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
      const result = await login(identifier, password, 'government_admin');
      setLoading(false);

      if (result.success) {
        navigate('/government');
      } else {
        setError(result.error || 'Failed to authenticate as Government Admin. Access is restricted.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'An unexpected error occurred during administrative authentication.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Bar / Change Account Type */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link 
          to="/choose-role"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Platform Roles</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white shadow-xs">
            <Landmark className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            Government Admin Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Authorized state agricultural officers, APMC regulators, and supply chain monitors
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-md border border-slate-200 rounded-3xl space-y-5">
          {/* Demo Credentials Box */}
          <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Government Admin Credentials</span>
              </div>
              <div className="text-slate-700 font-mono text-[11px] mt-0.5 select-all">
                Email: <strong>admin1@gmail.com</strong> &bull; Pass: <strong>Password123!</strong>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleFillDemo(false)}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-900 font-bold text-[11px] rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Auto-Fill
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo(true)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                1-Click Login
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0" />
            <span>Authorized administrative login for state agriculture board officials.</span>
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
                Official Department Email / ID
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
                  placeholder="admin.agriculture@gov.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Security Passphrase
              </label>
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>{loading ? 'Authenticating...' : 'Access Command Center'}</span>
              </button>
            </div>
          </form>

          <div className="pt-3 text-center border-t border-slate-100 text-xs">
            <Link 
              to="/choose-role"
              className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              Return to Role Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
