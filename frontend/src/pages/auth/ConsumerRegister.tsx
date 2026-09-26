import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Lock, 
  UserPlus, 
  AlertCircle,
  CheckCircle,
  Briefcase,
  UtensilsCrossed,
  Scale
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ConsumerRegister: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [requiredCrops, setRequiredCrops] = useState('');
  const [typicalQuantity, setTypicalQuantity] = useState('');
  const [quantityFrequency, setQuantityFrequency] = useState('KG / Day');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  // Synchronous submission lock to prevent double-clicks or multiple submissions
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setIsExistingUser(false);

    // Prevent concurrent/duplicate submissions
    if (isSubmittingRef.current || loading) {
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter a valid email address');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      // Exactly ONE call to register -> supabase.auth.signUp()
      const result = await register('consumer', {
        businessName,
        ownerName,
        mobileNumber,
        email: cleanEmail,
        businessType,
        city,
        state,
        requiredCrops,
        typicalQuantity: parseFloat(typicalQuantity) || 0,
        quantityFrequency,
        password,
      });

      if (result.success) {
        if (result.needsEmailConfirmation) {
          setEmailConfirmationRequired(true);
        } else {
          navigate('/consumer/dashboard');
        }
      } else {
        if (result.isExistingUser) {
          setIsExistingUser(true);
        }
        setError(result.error || 'Failed to create consumer account. Please try again.');
      }
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('rate limit') || msg.includes('too many')) {
        setError('Too many requests right now. Please wait and try again.');
      } else {
        setError('An unexpected error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Navigation */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl mb-4">
        <Link 
          to="/choose-role"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Change account type</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xs text-2xl">
            🍽️
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            Consumer / Bulk Buyer Registration
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Direct farm procurement for restaurants, hotels, canteens, caterers, and food service businesses
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-md border border-slate-200 rounded-3xl space-y-6">
          {emailConfirmationRequired ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verify your email address</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                We have sent a verification link to <strong className="text-slate-900">{email}</strong>. Please check your inbox and click the link to confirm your account before logging in.
              </p>
              <div className="pt-2">
                <Link
                  to="/login/consumer"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  Proceed to Consumer Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium leading-relaxed">{error}</p>
                    {isExistingUser && (
                      <Link 
                        to="/login/consumer" 
                        className="inline-block font-bold text-indigo-700 hover:underline pt-0.5"
                      >
                        Sign in to your existing account →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Business Details Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider pb-1 border-b border-indigo-100 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-indigo-600" />
                Business Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Institution Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Royal Spice Restaurant & Hotel"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Type *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Restaurant">Restaurant / Cafe</option>
                      <option value="Hotel">Hotel / Resort</option>
                      <option value="Mess / Canteen">Mess / Hostel / Canteen</option>
                      <option value="Caterer">Caterer / Banquet Kitchen</option>
                      <option value="Institutional Kitchen">Hospital / Institutional Kitchen</option>
                      <option value="Food Processing">Food Processor / Cloud Kitchen</option>
                      <option value="Other Bulk Buyer">Other Bulk Buyer</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Person Details */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider pb-1 border-b border-indigo-100 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Contact & Account Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact / Manager Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@royalspice.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Location & Procurement Needs */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider pb-1 border-b border-indigo-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Procurement Profile & Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Crops / Commodities
                </label>
                <input
                  type="text"
                  value={requiredCrops}
                  onChange={(e) => setRequiredCrops(e.target.value)}
                  placeholder="e.g. Tomatoes, Onions, Potatoes, Basmati Rice, Ginger"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">Separate multiple crops with commas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Typical Order Quantity
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Scale className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={typicalQuantity}
                      onChange={(e) => setTypicalQuantity(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order Frequency
                  </label>
                  <select
                    value={quantityFrequency}
                    onChange={(e) => setQuantityFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="KG / Day">KG / Day</option>
                    <option value="KG / Week">KG / Week</option>
                    <option value="Quintals / Week">Quintals / Week</option>
                    <option value="Tonnes / Month">Tonnes / Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider pb-1 border-b border-indigo-100 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Security Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register as Consumer / Bulk Buyer</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 pt-2">
                Already registered?{' '}
                <Link to="/login/consumer" className="font-bold text-indigo-600 hover:underline">
                  Login to Consumer Portal
                </Link>
              </p>
            </div>
          </form>
          </>
        )}
        </div>
      </div>
    </div>
  );
};
