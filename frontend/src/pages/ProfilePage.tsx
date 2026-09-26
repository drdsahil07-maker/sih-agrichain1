import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Clock, 
  Edit3, 
  Save, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Truck,
  Building,
  Sprout,
  UtensilsCrossed
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AccountMenu } from '../components/AccountMenu';
import { getDashboardPath } from '../auth/roleGuard';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Role specific state
  const [farmerVillage, setFarmerVillage] = useState('');
  const [farmerDistrict, setFarmerDistrict] = useState('');
  const [farmerState, setFarmerState] = useState('');
  const [farmerCrops, setFarmerCrops] = useState('');

  const [distBusinessName, setDistBusinessName] = useState('');
  const [distOwnerName, setDistOwnerName] = useState('');
  const [distBusinessType, setDistBusinessType] = useState('');
  const [distCity, setDistCity] = useState('');
  const [distState, setDistState] = useState('');
  const [distCrops, setDistCrops] = useState('');

  const [transVehicleNumber, setTransVehicleNumber] = useState('');
  const [transVehicleType, setTransVehicleType] = useState('');
  const [transCapacity, setTransCapacity] = useState('');
  const [transLocation, setTransLocation] = useState('');
  const [transRoutes, setTransRoutes] = useState('');

  const [consumerBusinessName, setConsumerBusinessName] = useState('');
  const [consumerOwnerName, setConsumerOwnerName] = useState('');
  const [consumerBusinessType, setConsumerBusinessType] = useState('');
  const [consumerCity, setConsumerCity] = useState('');
  const [consumerState, setConsumerState] = useState('');
  const [consumerCrops, setConsumerCrops] = useState('');
  const [consumerQuantity, setConsumerQuantity] = useState('');
  const [consumerFrequency, setConsumerFrequency] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      setFullName(profile.full_name || user.name || '');
      setPhoneNumber(profile.phone || user.phone || '');

      if (profile.role === 'farmer' && profile.farmer) {
        setFarmerVillage(profile.farmer.village || '');
        setFarmerDistrict(profile.farmer.district || '');
        setFarmerState(profile.farmer.state || '');
        setFarmerCrops(Array.isArray(profile.farmer.crops) ? profile.farmer.crops.join(', ') : '');
      } else if (profile.role === 'distributor' && profile.distributor) {
        setDistBusinessName(profile.distributor.business_name || '');
        setDistOwnerName(profile.distributor.owner_name || '');
        setDistBusinessType(profile.distributor.business_type || '');
        setDistCity(profile.distributor.city || '');
        setDistState(profile.distributor.state || '');
        setDistCrops(Array.isArray(profile.distributor.crops_interested_in) ? profile.distributor.crops_interested_in.join(', ') : '');
      } else if (profile.role === 'transporter' && profile.transporter) {
        setTransVehicleNumber(profile.transporter.vehicle_number || '');
        setTransVehicleType(profile.transporter.vehicle_type || '');
        setTransCapacity(String(profile.transporter.vehicle_capacity || ''));
        setTransLocation(profile.transporter.current_location || '');
        setTransRoutes(Array.isArray(profile.transporter.preferred_routes) ? profile.transporter.preferred_routes.join(', ') : '');
      } else if (profile.role === 'consumer' && profile.consumer) {
        setConsumerBusinessName(profile.consumer.business_name || '');
        setConsumerOwnerName(profile.consumer.owner_name || '');
        setConsumerBusinessType(profile.consumer.business_type || '');
        setConsumerCity(profile.consumer.city || '');
        setConsumerState(profile.consumer.state || '');
        setConsumerCrops(Array.isArray(profile.consumer.required_crops) ? profile.consumer.required_crops.join(', ') : '');
        setConsumerQuantity(String(profile.consumer.typical_quantity || ''));
        setConsumerFrequency(profile.consumer.quantity_frequency || '');
      }
    }
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-700">Loading user profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/choose-role');
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    let roleDetails: Record<string, any> = {};
    if (user.role === 'farmer') {
      const cropsArray = farmerCrops.split(',').map(s => s.trim()).filter(Boolean);
      roleDetails = {
        village: farmerVillage,
        district: farmerDistrict,
        state: farmerState,
        crops: cropsArray,
      };
    } else if (user.role === 'distributor') {
      const cropsArray = distCrops.split(',').map(s => s.trim()).filter(Boolean);
      roleDetails = {
        business_name: distBusinessName,
        owner_name: distOwnerName,
        business_type: distBusinessType,
        city: distCity,
        state: distState,
        crops_interested_in: cropsArray,
      };
    } else if (user.role === 'transporter') {
      const routesArray = transRoutes.split(',').map(s => s.trim()).filter(Boolean);
      roleDetails = {
        vehicle_number: transVehicleNumber,
        vehicle_type: transVehicleType,
        vehicle_capacity: parseFloat(transCapacity) || 0,
        current_location: transLocation,
        preferred_routes: routesArray,
      };
    } else if (user.role === 'consumer') {
      const cropsArray = consumerCrops.split(',').map(s => s.trim()).filter(Boolean);
      roleDetails = {
        business_name: consumerBusinessName,
        owner_name: consumerOwnerName,
        business_type: consumerBusinessType,
        city: consumerCity,
        state: consumerState,
        required_crops: cropsArray,
        typical_quantity: parseFloat(consumerQuantity) || 0,
        quantity_frequency: consumerFrequency,
      };
    }

    const res = await updateProfile({
      fullName,
      phone: phoneNumber,
      roleDetails,
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
  };

  const backLink = getDashboardPath(user.role);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={backLink}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <h1 className="text-base font-black text-slate-900 font-display">
              AgriChain Account
            </h1>
          </div>
          <AccountMenu />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900 font-display">
                    {profile?.full_name || user.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email || profile?.email || 'No email provided'}</span>
                </p>
              </div>
            </div>

            <div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form or Display View */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section: Supabase Core Profile */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 font-display">
                Account Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Primary identity stored in PostgreSQL <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">public.profiles</code>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                    {profile?.full_name || user.name}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 flex items-center justify-between">
                  <span>{user.email || profile?.email || 'N/A'}</span>
                  <span className="text-[10px] text-slate-400 font-bold">Managed by Auth</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                    {profile?.phone || user.phone || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Account Type
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold capitalize text-slate-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>{user.role}</span>
                </div>
              </div>

              {/* Created Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Created Date
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleString() 
                      : 'Recently created'}
                  </span>
                </div>
              </div>

              {/* Last Login */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Last Login
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    {profile?.last_login_at 
                      ? new Date(profile.last_login_at).toLocaleString() 
                      : 'Active Session'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Role Specific Database Record */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                {user.role === 'farmer' && <Sprout className="w-5 h-5 text-emerald-600" />}
                {user.role === 'distributor' && <Building className="w-5 h-5 text-amber-600" />}
                {user.role === 'transporter' && <Truck className="w-5 h-5 text-blue-600" />}
                {user.role === 'consumer' && <UtensilsCrossed className="w-5 h-5 text-indigo-600" />}
                <span className="capitalize">{user.role === 'consumer' ? 'Consumer / Bulk Buyer' : user.role} Specifications</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stored in PostgreSQL <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">{`public.${user.role}_profiles`}</code>
              </p>
            </div>

            {/* Farmer Specific Fields */}
            {user.role === 'farmer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Village</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={farmerVillage}
                      onChange={(e) => setFarmerVillage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.farmer?.village || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">District</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={farmerDistrict}
                      onChange={(e) => setFarmerDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.farmer?.district || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={farmerState}
                      onChange={(e) => setFarmerState(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.farmer?.state || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Crops Cultivated (comma separated)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={farmerCrops}
                      onChange={(e) => setFarmerCrops(e.target.value)}
                      placeholder="e.g. Tomato, Onion, Wheat"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {Array.isArray(profile?.farmer?.crops) && profile?.farmer?.crops.length > 0 
                        ? profile?.farmer?.crops.join(', ') 
                        : 'No crops listed'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Distributor Specific Fields */}
            {user.role === 'distributor' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={distBusinessName}
                      onChange={(e) => setDistBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.distributor?.business_name || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Owner / Contact Person</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={distOwnerName}
                      onChange={(e) => setDistOwnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.distributor?.owner_name || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Type</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={distBusinessType}
                      onChange={(e) => setDistBusinessType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.distributor?.business_type || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City & State</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={distCity}
                        onChange={(e) => setDistCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={distState}
                        onChange={(e) => setDistState(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {[profile?.distributor?.city, profile?.distributor?.state].filter(Boolean).join(', ') || 'N/A'}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Crops Interested In</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={distCrops}
                      onChange={(e) => setDistCrops(e.target.value)}
                      placeholder="e.g. Potato, Onion, Tomato"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {Array.isArray(profile?.distributor?.crops_interested_in) && profile?.distributor?.crops_interested_in.length > 0
                        ? profile?.distributor?.crops_interested_in.join(', ')
                        : 'None listed'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transporter Specific Fields */}
            {user.role === 'transporter' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={transVehicleNumber}
                      onChange={(e) => setTransVehicleNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.transporter?.vehicle_number || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Type</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={transVehicleType}
                      onChange={(e) => setTransVehicleType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.transporter?.vehicle_type || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Capacity (Tonnes)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.5"
                      value={transCapacity}
                      onChange={(e) => setTransCapacity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.transporter?.vehicle_capacity ? `${profile.transporter.vehicle_capacity} MT` : 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Operating Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={transLocation}
                      onChange={(e) => setTransLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.transporter?.current_location || 'N/A'}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Transit Routes</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={transRoutes}
                      onChange={(e) => setTransRoutes(e.target.value)}
                      placeholder="e.g. Pune - Mumbai, Nashik - Surat"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {Array.isArray(profile?.transporter?.preferred_routes) && profile?.transporter?.preferred_routes.length > 0
                        ? profile?.transporter?.preferred_routes.join(', ')
                        : 'None listed'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Consumer / Bulk Buyer Specific Fields */}
            {user.role === 'consumer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={consumerBusinessName}
                      onChange={(e) => setConsumerBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.consumer?.business_name || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact / Manager Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={consumerOwnerName}
                      onChange={(e) => setConsumerOwnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.consumer?.owner_name || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Type</label>
                  {isEditing ? (
                    <select
                      value={consumerBusinessType}
                      onChange={(e) => setConsumerBusinessType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Restaurant">Restaurant / Cafe</option>
                      <option value="Hotel">Hotel / Resort</option>
                      <option value="Mess / Canteen">Mess / Hostel / Canteen</option>
                      <option value="Caterer">Caterer / Banquet Kitchen</option>
                      <option value="Institutional Kitchen">Hospital / Institutional Kitchen</option>
                      <option value="Food Processing">Food Processor / Cloud Kitchen</option>
                      <option value="Other Bulk Buyer">Other Bulk Buyer</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.consumer?.business_type || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={consumerCity}
                      onChange={(e) => setConsumerCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.consumer?.city || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={consumerState}
                      onChange={(e) => setConsumerState(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.consumer?.state || 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Typical Order Quantity & Frequency</label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={consumerQuantity}
                        onChange={(e) => setConsumerQuantity(e.target.value)}
                        placeholder="Quantity"
                        className="w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <select
                        value={consumerFrequency}
                        onChange={(e) => setConsumerFrequency(e.target.value)}
                        className="w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="KG / Day">KG / Day</option>
                        <option value="KG / Week">KG / Week</option>
                        <option value="Quintals / Week">Quintals / Week</option>
                        <option value="Tonnes / Month">Tonnes / Month</option>
                      </select>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {profile?.consumer?.typical_quantity ? `${profile.consumer.typical_quantity} (${profile.consumer.quantity_frequency || 'KG / Day'})` : 'N/A'}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Required Crops (comma separated)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={consumerCrops}
                      onChange={(e) => setConsumerCrops(e.target.value)}
                      placeholder="e.g. Tomatoes, Onions, Potatoes, Basmati Rice"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      {Array.isArray(profile?.consumer?.required_crops) && profile?.consumer?.required_crops.length > 0
                        ? profile?.consumer?.required_crops.join(', ')
                        : 'None listed'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons while editing */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving changes...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};
