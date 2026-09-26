import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, KeyRound, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronous submission locks to prevent double-clicks / repeated submissions
  const isSubmittingRef = useRef(false);
  const isUpdatingRef = useRef(false);

  // New password state (if user arrives via email reset link containing recovery session)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  // Countdown timer effect for rate-limit cooldown
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Check if recovery mode from URL hash, search params, or auth state change
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    const hash = window.location.hash;
    const search = window.location.search;
    if (
      (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) ||
      (search && (search.includes('type=recovery') || search.includes('code=')))
    ) {
      setIsRecoveryMode(true);
    }

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent double-clicks, concurrent executions, and requests during countdown
    if (isSubmittingRef.current || loading || countdown > 0) {
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    // Synchronous lock immediately
    isSubmittingRef.current = true;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Exactly ONE resetPasswordForEmail() call per user submission
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Detect Supabase rate-limit errors
        const isRateLimit =
          error.status === 429 ||
          error.code === 'over_email_send_rate_limit' ||
          error.code === '429' ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('rate_limit') ||
          error.message?.toLowerCase().includes('too many') ||
          error.message?.toLowerCase().includes('over_email_send_rate_limit');

        if (isRateLimit) {
          setErrorMsg('Too many reset requests. Please wait a while before trying again.');
          // Impose a 60-second cooldown so user does not repeatedly hit the rate limit
          setCountdown(60);
        } else {
          // Do NOT expose internal Supabase error details to normal users
          setErrorMsg('Unable to process password reset request. Please check your email and try again.');
        }
      } else {
        // Successful request
        setSuccessMsg('If an account exists for this email, a password reset link has been sent.');
        // Temporarily disable the button with a 60-second cooldown
        setCountdown(60);
      }
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('rate limit') || msg.includes('too many')) {
        setErrorMsg('Too many reset requests. Please wait a while before trying again.');
        setCountdown(60);
      } else {
        setErrorMsg('Unable to process password reset request. Please check your email and try again.');
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdatingRef.current || updatingPassword) {
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    isUpdatingRef.current = true;
    setUpdatingPassword(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        // Do not expose internal details
        setErrorMsg(error.message || 'Failed to update password. Please request a new reset link.');
      } else {
        setPasswordUpdated(true);
        setTimeout(() => {
          navigate('/choose-role');
        }, 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setUpdatingPassword(false);
      isUpdatingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link 
          to="/choose-role"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Role Selection</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-xs">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            {isRecoveryMode ? 'Set New Password' : 'Reset Password'}
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isRecoveryMode 
              ? 'Enter and confirm your new secure password'
              : 'Enter your registered email address and we will send you a link to reset your password'}
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-8 shadow-md border border-slate-200 rounded-3xl space-y-5">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="font-medium leading-relaxed">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {passwordUpdated ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">Your password has been updated successfully!</p>
              <p className="text-xs text-slate-500">Redirecting you to the login selection...</p>
              <Link
                to="/choose-role"
                className="inline-block py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Go to Login
              </Link>
            </div>
          ) : isRecoveryMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span>{updatingPassword ? 'Updating Password...' : 'Save New Password'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendResetLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={loading || countdown > 0}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {countdown > 0 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                  <Clock className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
                  <span>Please wait {countdown} second{countdown !== 1 ? 's' : ''} before requesting another reset email.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || countdown > 0}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Reset Link...
                  </span>
                ) : countdown > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Request another link in {countdown}s
                  </span>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500">Remember your password?</p>
                <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-bold">
                  <Link to="/login/farmer" className="text-emerald-700 hover:underline">Farmer</Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/login/distributor" className="text-amber-700 hover:underline">Distributor</Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/login/consumer" className="text-indigo-700 hover:underline">Consumer</Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/login/transporter" className="text-blue-700 hover:underline">Transporter</Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
