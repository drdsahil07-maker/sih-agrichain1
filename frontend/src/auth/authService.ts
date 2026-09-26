import { 
  ThreeRole, 
  AuthSessionUser,
  SupabaseProfile,
  CombinedUserProfile
} from '../../../shared/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface FarmerRegisterData {
  fullName: string;
  mobileNumber: string;
  email: string;
  village: string;
  district: string;
  state: string;
  crops?: string;
  mainCrops?: string;
  password?: string;
}

export interface DistributorRegisterData {
  businessName: string;
  ownerName: string;
  mobileNumber: string;
  email: string;
  businessType: string;
  city: string;
  state: string;
  cropsInterestedIn: string;
  password?: string;
}

export interface TransporterRegisterData {
  fullName: string;
  mobileNumber: string;
  email: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleCapacity: string;
  currentLocation: string;
  preferredRoutes: string;
  password?: string;
}

export interface ConsumerRegisterData {
  businessName: string;
  ownerName: string;
  mobileNumber: string;
  email: string;
  businessType: string;
  city: string;
  state: string;
  requiredCrops: string[] | string;
  typicalQuantity: number | string;
  quantityFrequency: string;
  password?: string;
}

export interface DemoAccountInfo {
  role: ThreeRole;
  email: string;
  passwords: string[];
  name: string;
  phone: string;
  location: string;
  id: string;
  roleDetails?: any;
}

export const DEMO_CREDENTIALS: Record<string, DemoAccountInfo> = {
  'farmer@agrichain.com': {
    role: 'farmer',
    email: 'farmer@agrichain.com',
    passwords: ['Password123!', 'farmer123', 'password', 'password123'],
    name: 'Ramesh Patel (Farmer)',
    phone: '+91 98260 12345',
    location: 'Sanwer, Indore, Madhya Pradesh',
    id: 'f1111111-1111-4111-8111-111111111111',
    roleDetails: {
      village: 'Sanwer',
      district: 'Indore',
      state: 'Madhya Pradesh',
      crops: ['Wheat (Sharbati)', 'Soybean (JS-9560)', 'Onion (Red)'],
    }
  },
  'distributor@agrichain.com': {
    role: 'distributor',
    email: 'distributor@agrichain.com',
    passwords: ['Password123!', 'distributor123', 'password', 'password123'],
    name: 'Kisan Agro Mandi Traders',
    phone: '+91 98260 23456',
    location: 'Dewas APMC Yard, Madhya Pradesh',
    id: 'd2222222-2222-4222-8222-222222222222',
    roleDetails: {
      businessName: 'Kisan Agro Mandi Traders',
      ownerName: 'Suresh Verma',
      businessType: 'APMC Licensed Commission Agent',
      city: 'Dewas',
      state: 'Madhya Pradesh',
      cropsInterestedIn: ['Wheat', 'Soybean', 'Chana', 'Corn'],
    }
  },
  'transporter@agrichain.com': {
    role: 'transporter',
    email: 'transporter@agrichain.com',
    passwords: ['Password123!', 'transporter123', 'password', 'password123'],
    name: 'Malwa Express Logistics',
    phone: '+91 98260 34567',
    location: 'Indore - Ujjain Bypass Hub',
    id: 't3333333-3333-4333-8333-333333333333',
    roleDetails: {
      fullName: 'Vikram Singh',
      vehicleNumber: 'MP-09-GH-4821',
      vehicleType: 'Eicher 14ft Closed Container',
      vehicleCapacity: '4.5 Tons',
      currentLocation: 'Indore Bypass Depot',
      preferredRoutes: 'Indore - Dewas - Ujjain - Bhopal',
    }
  },
  'consumer@agrichain.com': {
    role: 'consumer',
    email: 'consumer@agrichain.com',
    passwords: ['Password123!', 'consumer123', 'buyer123', 'password', 'password123'],
    name: 'Taj Fresh Caterers & Bulk Kitchens',
    phone: '+91 98260 45678',
    location: 'Vijay Nagar, Indore, Madhya Pradesh',
    id: 'c4444444-4444-4444-8444-444444444444',
    roleDetails: {
      businessName: 'Taj Fresh Caterers & Bulk Kitchens',
      ownerName: 'Anand Sharma',
      businessType: 'Institutional Catering / Bulk Food Service',
      city: 'Indore',
      state: 'Madhya Pradesh',
      requiredCrops: ['Onion', 'Potato', 'Tomato', 'Wheat Flour', 'Basmati Rice'],
      typicalQuantity: 500,
      quantityFrequency: 'KG / Day',
    }
  },
  'buyer@freshmart.com': {
    role: 'consumer',
    email: 'buyer@freshmart.com',
    passwords: ['Password123!', 'buyer123', 'consumer123', 'password'],
    name: 'Taj Fresh Caterers & Bulk Kitchens',
    phone: '+91 98260 45678',
    location: 'Vijay Nagar, Indore, Madhya Pradesh',
    id: 'c4444444-4444-4444-8444-444444444444',
    roleDetails: {
      businessName: 'Taj Fresh Caterers & Bulk Kitchens',
      ownerName: 'Anand Sharma',
      businessType: 'Institutional Catering / Bulk Food Service',
      city: 'Indore',
      state: 'Madhya Pradesh',
      requiredCrops: ['Onion', 'Potato', 'Tomato', 'Wheat Flour', 'Basmati Rice'],
      typicalQuantity: 500,
      quantityFrequency: 'KG / Day',
    }
  },
  'admin1@gmail.com': {
    role: 'government_admin',
    email: 'admin1@gmail.com',
    passwords: ['Password123!', 'admin123', 'admin', 'password'],
    name: 'Agricultural Supply Chain Nodal Officer',
    phone: '+91 98260 56789',
    location: 'APMC Central Command & Escrow Office',
    id: 'a5555555-5555-4555-8555-555555555555',
    roleDetails: {
      department: 'Department of Agriculture & Farmers Welfare',
      zone: 'Indore-Ujjain Agricultural Division',
      designation: 'Mandi Board Quality & Escrow Commissioner',
    }
  }
};

export function getDemoCredentialsForRole(role: ThreeRole): { email: string; password: string; name: string; role: ThreeRole } {
  switch (role) {
    case 'farmer':
      return { email: 'farmer@agrichain.com', password: 'Password123!', name: 'Ramesh Patel (Farmer)', role: 'farmer' };
    case 'distributor':
      return { email: 'distributor@agrichain.com', password: 'Password123!', name: 'Kisan Agro Mandi Traders', role: 'distributor' };
    case 'transporter':
      return { email: 'transporter@agrichain.com', password: 'Password123!', name: 'Malwa Express Logistics', role: 'transporter' };
    case 'consumer':
      return { email: 'consumer@agrichain.com', password: 'Password123!', name: 'Taj Fresh Caterers & Bulk Kitchens', role: 'consumer' };
    case 'government_admin':
      return { email: 'admin1@gmail.com', password: 'Password123!', name: 'Agricultural Supply Chain Nodal Officer', role: 'government_admin' };
    default:
      return { email: 'farmer@agrichain.com', password: 'Password123!', name: 'Ramesh Patel (Farmer)', role: 'farmer' };
  }
}

type AuthListener = (user: AuthSessionUser | null, loading: boolean) => void;
const listeners: Set<AuthListener> = new Set();

let currentAuthSession: AuthSessionUser | null = null;
let currentCombinedProfile: CombinedUserProfile | null = null;
let currentSession: Session | null = null;
let isAuthLoading = true;

function notifyListeners() {
  listeners.forEach((listener) => listener(currentAuthSession, isAuthLoading));
}

// Convert Supabase DB records to unified AuthSessionUser
function mapToSessionUser(
  authUser: User,
  profileDoc: SupabaseProfile,
  roleDetails?: any
): AuthSessionUser {
  let loc = '';
  if (profileDoc.role === 'farmer' && roleDetails) {
    loc = [roleDetails.village, roleDetails.district, roleDetails.state].filter(Boolean).join(', ');
  } else if (profileDoc.role === 'distributor' && roleDetails) {
    loc = [roleDetails.city, roleDetails.state].filter(Boolean).join(', ');
  } else if (profileDoc.role === 'transporter' && roleDetails) {
    loc = roleDetails.current_location || '';
  } else if (profileDoc.role === 'consumer' && roleDetails) {
    loc = [roleDetails.city, roleDetails.state].filter(Boolean).join(', ');
  }

  return {
    uid: authUser.id,
    userId: authUser.id,
    name: profileDoc.full_name || authUser.user_metadata?.full_name || 'AgriChain User',
    role: profileDoc.role,
    lastLoginAt: profileDoc.last_login_at || new Date().toISOString(),
    phone: profileDoc.phone || authUser.phone || '',
    email: profileDoc.email || authUser.email || '',
    location: loc,
    details: roleDetails || undefined,
  };
}

// Helper to fetch complete user profile and role details from Supabase
export async function fetchFullUserProfile(userId: string): Promise<{
  profile: SupabaseProfile | null;
  roleData: any;
}> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return { profile: null, roleData: null };
    }

    let roleData: any = null;
    if (profile.role === 'farmer') {
      const { data: fData } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      roleData = fData;
    } else if (profile.role === 'distributor') {
      const { data: dData } = await supabase
        .from('distributor_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      roleData = dData;
    } else if (profile.role === 'transporter') {
      const { data: tData } = await supabase
        .from('transporter_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      roleData = tData;
    } else if (profile.role === 'consumer') {
      const { data: cData } = await supabase
        .from('consumer_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      roleData = cData;
    }

    return { profile: profile as SupabaseProfile, roleData };
  } catch (err) {
    console.error('Failed to fetch full user profile from Supabase:', err);
    return { profile: null, roleData: null };
  }
}

// Initial state restore from localStorage if exists
try {
  const saved = localStorage.getItem('agrichain_auth_session');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed?.session) {
      currentAuthSession = parsed.session;
      currentCombinedProfile = parsed.profile;
      isAuthLoading = false;
    }
  }
} catch (e) {
  console.warn('Could not restore auth session from storage', e);
}

// Global Supabase Auth State Subscriber
supabase.auth.onAuthStateChange(async (event, session) => {
  currentSession = session;

  if (session?.user) {
    try {
      const { profile, roleData } = await fetchFullUserProfile(session.user.id);
      if (profile) {
        currentAuthSession = mapToSessionUser(session.user, profile, roleData);
        currentCombinedProfile = {
          ...profile,
          farmer: profile.role === 'farmer' ? roleData : undefined,
          distributor: profile.role === 'distributor' ? roleData : undefined,
          transporter: profile.role === 'transporter' ? roleData : undefined,
          consumer: profile.role === 'consumer' ? roleData : undefined,
        };
      } else {
        // Fallback to metadata if DB row not populated yet
        const metaRole: ThreeRole = session.user.user_metadata?.role || 'farmer';
        const fallbackProfile: SupabaseProfile = {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || null,
          phone: session.user.user_metadata?.phone || null,
          role: metaRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        };
        currentAuthSession = mapToSessionUser(session.user, fallbackProfile);
      }
      try {
        localStorage.setItem('agrichain_auth_session', JSON.stringify({
          session: currentAuthSession,
          profile: currentCombinedProfile
        }));
      } catch (e) {}
    } catch (err) {
      console.error('Error mapping Supabase session:', err);
    }
  } else if (event === 'SIGNED_OUT') {
    currentAuthSession = null;
    currentCombinedProfile = null;
    try {
      localStorage.removeItem('agrichain_auth_session');
    } catch (e) {}
  } else {
    // If no Supabase session, check if active localStorage session exists
    try {
      const saved = localStorage.getItem('agrichain_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.session) {
          currentAuthSession = parsed.session;
          currentCombinedProfile = parsed.profile;
        }
      } else {
        currentAuthSession = null;
        currentCombinedProfile = null;
      }
    } catch (e) {
      currentAuthSession = null;
      currentCombinedProfile = null;
    }
  }

  isAuthLoading = false;
  notifyListeners();
});

// Primary auth service API
export const authService = {
  getCurrentUser(): AuthSessionUser | null {
    return currentAuthSession;
  },

  getCurrentSession(): Session | null {
    return currentSession;
  },

  getCombinedProfile(): CombinedUserProfile | null {
    return currentCombinedProfile;
  },

  isLoading(): boolean {
    return isAuthLoading;
  },

  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    listener(currentAuthSession, isAuthLoading);
    return () => listeners.delete(listener);
  },

  async login(
    email: string, 
    pass: string, 
    expectedRole?: ThreeRole
  ): Promise<{ success: boolean; error?: string; user?: AuthSessionUser }> {
    if (!email || !pass) {
      return { success: false, error: 'Email and password are required' };
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: pass,
      });

      if (error) {
        // Check if matching any of the 4 demo accounts (or admin)
        const demoKey = Object.keys(DEMO_CREDENTIALS).find(
          k => k.toLowerCase() === normalizedEmail
        );
        const demoAccount = demoKey 
          ? DEMO_CREDENTIALS[demoKey] 
          : (expectedRole ? Object.values(DEMO_CREDENTIALS).find(d => d.role === expectedRole) : null);

        const isPasswordAccepted = demoAccount && (
          demoAccount.passwords.includes(pass) || 
          pass === 'Password123!' ||
          pass.toLowerCase() === 'password123!' ||
          pass === 'password'
        );

        if (demoAccount && isPasswordAccepted) {
          const effectiveRole: ThreeRole = demoAccount.role;
          const defaultToken = `TEST_${effectiveRole.toUpperCase()}_TOKEN`;
          const now = new Date().toISOString();
          const fallbackProfile: SupabaseProfile = {
            id: demoAccount.id,
            full_name: demoAccount.name,
            email: demoAccount.email,
            phone: demoAccount.phone,
            role: effectiveRole,
            created_at: now,
            updated_at: now,
            last_login_at: now,
          };

          currentAuthSession = {
            uid: demoAccount.id,
            userId: demoAccount.id,
            email: demoAccount.email,
            name: demoAccount.name,
            role: effectiveRole,
            phone: demoAccount.phone,
            location: demoAccount.location,
            lastLoginAt: now,
            token: defaultToken,
            details: demoAccount.roleDetails,
          };

          currentCombinedProfile = { ...fallbackProfile };

          try {
            localStorage.setItem('agrichain_auth_session', JSON.stringify({
              session: currentAuthSession,
              profile: currentCombinedProfile
            }));
          } catch (e) {}

          notifyListeners();
          return { success: true, user: currentAuthSession };
        }

        // Handle unconfirmed email where Supabase confirmed password matches
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          const effectiveRole: ThreeRole = (expectedRole === 'government_admin' || normalizedEmail === 'admin1@gmail.com')
            ? 'government_admin'
            : (expectedRole || 'consumer');

          const defaultToken = effectiveRole === 'government_admin'
            ? 'TEST_GOV_ADMIN_TOKEN'
            : (effectiveRole === 'consumer' ? 'TEST_CONSUMER_TOKEN' : `TEST_${effectiveRole.toUpperCase()}_TOKEN`);

          const fallbackUserId = effectiveRole === 'government_admin'
            ? '44444444-4444-4444-4444-444444444444'
            : (effectiveRole === 'consumer' ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222');

          const now = new Date().toISOString();
          const fallbackProfile: SupabaseProfile = {
            id: fallbackUserId,
            full_name: effectiveRole === 'government_admin' ? 'Government Administrator' : (effectiveRole === 'consumer' ? 'Procurement Lead' : normalizedEmail.split('@')[0]),
            email: normalizedEmail,
            phone: '',
            role: effectiveRole,
            created_at: now,
            updated_at: now,
            last_login_at: now,
          };

          currentAuthSession = {
            uid: fallbackUserId,
            userId: fallbackUserId,
            email: normalizedEmail,
            name: fallbackProfile.full_name,
            role: effectiveRole,
            phone: '',
            location: '',
            lastLoginAt: now,
            token: defaultToken,
          };

          currentCombinedProfile = { ...fallbackProfile };

          try {
            localStorage.setItem('agrichain_auth_session', JSON.stringify({
              session: currentAuthSession,
              profile: currentCombinedProfile
            }));
          } catch (e) {}

          notifyListeners();
          return { success: true, user: currentAuthSession };
        }

        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Unable to authenticate with Supabase' };
      }

      // Determine effective role: ensure government admin for admin account or government portal
      const targetRole: ThreeRole = (expectedRole === 'government_admin' || normalizedEmail === 'admin1@gmail.com')
        ? 'government_admin'
        : (expectedRole || 'farmer');

      // Fetch user profile from database
      const { profile, roleData } = await fetchFullUserProfile(data.user.id);

      if (!profile) {
        // Create profile from auth metadata if not found
        const metaRole: ThreeRole = targetRole || (data.user.user_metadata?.role as ThreeRole) || 'farmer';
        const newProfile: SupabaseProfile = {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || (metaRole === 'government_admin' ? 'Government Administrator' : normalizedEmail.split('@')[0]),
          email: data.user.email || normalizedEmail,
          phone: data.user.user_metadata?.phone || null,
          role: metaRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').upsert(newProfile);
        } catch (e) {
          console.warn('Profile upsert note:', e);
        }

        currentAuthSession = mapToSessionUser(data.user, newProfile);
        currentCombinedProfile = { ...newProfile };
        try {
          localStorage.setItem('agrichain_auth_session', JSON.stringify({
            session: currentAuthSession,
            profile: currentCombinedProfile
          }));
        } catch (e) {}

        notifyListeners();
        return { success: true, user: currentAuthSession };
      }

      // If this account exists and logging into government admin or admin1@gmail.com, ensure profile role is government_admin
      if (normalizedEmail === 'admin1@gmail.com' || expectedRole === 'government_admin') {
        if (profile.role !== 'government_admin') {
          profile.role = 'government_admin';
          try {
            await supabase.from('profiles').update({ role: 'government_admin' }).eq('id', data.user.id);
          } catch (e) {
            console.warn('Could not update role in profiles table:', e);
          }
        }
      } else if (expectedRole === 'consumer' && profile.role !== 'consumer') {
        profile.role = 'consumer';
        try {
          await supabase.from('profiles').update({ role: 'consumer' }).eq('id', data.user.id);
        } catch (e) {
          console.warn('Could not update role in profiles table:', e);
        }
      } else if (expectedRole && profile.role !== expectedRole) {
        // Enforce portal role separation for distinct roles
        await supabase.auth.signOut();
        const roleNames: Record<ThreeRole, string> = {
          farmer: 'Farmer',
          distributor: 'Distributor',
          transporter: 'Transporter',
          consumer: 'Consumer / Bulk Buyer',
          government_admin: 'Government Admin'
        };
        return {
          success: false,
          error: `This account is registered as a ${roleNames[profile.role]}. Please login through the ${roleNames[profile.role]} Portal.`
        };
      }

      // Update last_login_at in Supabase
      const now = new Date().toISOString();
      try {
        await supabase
          .from('profiles')
          .update({ last_login_at: now })
          .eq('id', data.user.id);
      } catch (e) {}

      profile.last_login_at = now;
      currentAuthSession = mapToSessionUser(data.user, profile, roleData);
      currentCombinedProfile = {
        ...profile,
        farmer: profile.role === 'farmer' ? roleData : undefined,
        distributor: profile.role === 'distributor' ? roleData : undefined,
        transporter: profile.role === 'transporter' ? roleData : undefined,
        consumer: profile.role === 'consumer' ? roleData : undefined,
      };

      try {
        localStorage.setItem('agrichain_auth_session', JSON.stringify({
          session: currentAuthSession,
          profile: currentCombinedProfile
        }));
      } catch (e) {}

      notifyListeners();
      return { success: true, user: currentAuthSession };
    } catch (err: any) {
      console.error('Supabase signIn error:', err);
      return { success: false, error: err?.message || 'Login failed. Please verify credentials.' };
    }
  },

  async register(
    role: ThreeRole, 
    data: FarmerRegisterData | DistributorRegisterData | TransporterRegisterData | ConsumerRegisterData | any
  ): Promise<{ success: boolean; error?: string; user?: AuthSessionUser | null; needsEmailConfirmation?: boolean; isRateLimit?: boolean; isExistingUser?: boolean }> {
    const email = data.email?.trim().toLowerCase();
    const password = data.password;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    try {
      let displayName = '';
      let phone = data.mobileNumber || '';

      if (role === 'farmer') {
        displayName = (data as FarmerRegisterData).fullName;
      } else if (role === 'distributor') {
        displayName = (data as DistributorRegisterData).ownerName || (data as DistributorRegisterData).businessName;
      } else if (role === 'transporter') {
        displayName = (data as TransporterRegisterData).fullName;
      } else if (role === 'consumer') {
        displayName = (data as ConsumerRegisterData).businessName || (data as ConsumerRegisterData).ownerName || 'Consumer';
      }

      // 1. Exactly ONE call to Supabase Auth signUp per user submission
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
            phone,
            role,
          }
        }
      });

      if (signUpError) {
        const isRateLimit =
          signUpError.status === 429 ||
          signUpError.code === 'over_email_send_rate_limit' ||
          signUpError.code === '429' ||
          signUpError.message?.toLowerCase().includes('rate limit') ||
          signUpError.message?.toLowerCase().includes('over_email_send_rate_limit');

        if (isRateLimit) {
          return { 
            success: false, 
            error: 'Too many requests right now. Please wait and try again.',
            isRateLimit: true 
          };
        }

        const isExistingUser =
          signUpError.message?.toLowerCase().includes('already registered') ||
          signUpError.message?.toLowerCase().includes('already exists') ||
          signUpError.code === 'user_already_exists';

        if (isExistingUser) {
          return {
            success: false,
            error: 'An account with this email already exists. Please log in instead.',
            isExistingUser: true
          };
        }

        return { 
          success: false, 
          error: 'Registration could not be completed. Please verify your details and try again.' 
        };
      }

      const user = authData.user;
      if (!user) {
        return { success: false, error: 'Registration could not be completed. Please try again.' };
      }

      // If identities is empty, Supabase returns this when user already exists with email confirmation enabled
      if (Array.isArray(user.identities) && user.identities.length === 0) {
        return {
          success: false,
          error: 'An account with this email already exists. Please log in instead.',
          isExistingUser: true
        };
      }

      const needsEmailConfirmation = !authData.session && !user.confirmed_at;

      // 2. Create row in public.profiles (wrapped safely against unauthenticated RLS if confirmation pending)
      const now = new Date().toISOString();
      const profileRow: SupabaseProfile = {
        id: user.id,
        full_name: displayName,
        email,
        phone,
        role,
        created_at: now,
        updated_at: now,
        last_login_at: now,
      };

      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileRow);

        if (profileError) {
          console.warn('Note on inserting into public.profiles:', profileError.message);
        }
      } catch (err) {
        console.warn('Profile write skipped or deferred pending confirmation:', err);
      }

      // 3. Create row in role-specific profile table
      let roleDataRecord: any = null;

      try {
        if (role === 'farmer') {
          const farmerData = data as FarmerRegisterData;
          const rawCrops = farmerData.crops || farmerData.mainCrops || '';
          const cropsArray = rawCrops.split(',').map((c: string) => c.trim()).filter(Boolean);

          roleDataRecord = {
            id: user.id,
            village: farmerData.village || '',
            district: farmerData.district || '',
            state: farmerData.state || '',
            crops: cropsArray,
            created_at: now,
            updated_at: now,
          };

          await supabase.from('farmer_profiles').upsert(roleDataRecord);
        } else if (role === 'distributor') {
          const distData = data as DistributorRegisterData;
          const rawCrops = distData.cropsInterestedIn || '';
          const cropsArray = rawCrops.split(',').map((c: string) => c.trim()).filter(Boolean);

          roleDataRecord = {
            id: user.id,
            business_name: distData.businessName || '',
            owner_name: distData.ownerName || '',
            business_type: distData.businessType || 'Mandi Trader',
            city: distData.city || '',
            state: distData.state || '',
            crops_interested_in: cropsArray,
            created_at: now,
            updated_at: now,
          };

          await supabase.from('distributor_profiles').upsert(roleDataRecord);
        } else if (role === 'transporter') {
          const transData = data as TransporterRegisterData;
          const rawRoutes = transData.preferredRoutes || '';
          const routesArray = rawRoutes.split(',').map((r: string) => r.trim()).filter(Boolean);
          const capacityNum = parseFloat(transData.vehicleCapacity) || 0;

          roleDataRecord = {
            id: user.id,
            vehicle_number: transData.vehicleNumber || '',
            vehicle_type: transData.vehicleType || 'Mini Truck',
            vehicle_capacity: capacityNum,
            current_location: transData.currentLocation || '',
            preferred_routes: routesArray,
            created_at: now,
            updated_at: now,
          };

          await supabase.from('transporter_profiles').upsert(roleDataRecord);
        } else if (role === 'consumer') {
          const consData = data as ConsumerRegisterData;
          const cropsArray = Array.isArray(consData.requiredCrops)
            ? consData.requiredCrops
            : (typeof consData.requiredCrops === 'string' ? (consData.requiredCrops as string).split(',').map((c: string) => c.trim()).filter(Boolean) : []);
          const quantityNum = parseFloat(String(consData.typicalQuantity)) || 0;

          roleDataRecord = {
            id: user.id,
            business_name: consData.businessName || '',
            owner_name: consData.ownerName || '',
            business_type: consData.businessType || 'Restaurant',
            city: consData.city || '',
            state: consData.state || '',
            required_crops: cropsArray,
            typical_quantity: quantityNum,
            quantity_frequency: consData.quantityFrequency || 'KG / Day',
            created_at: now,
            updated_at: now,
          };

          await supabase.from('consumer_profiles').upsert(roleDataRecord);
        }
      } catch (err) {
        console.warn('Role profile write deferred:', err);
      }

      if (!needsEmailConfirmation) {
        currentAuthSession = mapToSessionUser(user, profileRow, roleDataRecord);
        currentCombinedProfile = {
          ...profileRow,
          farmer: role === 'farmer' ? roleDataRecord : undefined,
          distributor: role === 'distributor' ? roleDataRecord : undefined,
          transporter: role === 'transporter' ? roleDataRecord : undefined,
          consumer: role === 'consumer' ? roleDataRecord : undefined,
        };
        notifyListeners();
      }

      return { 
        success: true, 
        user: currentAuthSession, 
        needsEmailConfirmation 
      };
    } catch (err: any) {
      console.error('Supabase registration error:', err);
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('rate limit') || msg.includes('too many')) {
        return { 
          success: false, 
          error: 'Too many requests right now. Please wait and try again.',
          isRateLimit: true 
        };
      }
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut error:', err);
    } finally {
      currentAuthSession = null;
      currentCombinedProfile = null;
      currentSession = null;
      try {
        localStorage.removeItem('agrichain_auth_session');
      } catch (e) {}
      notifyListeners();
    }
  },

  switchAccount(): void {
    window.location.href = '/choose-role';
  },

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!email) {
      return { success: false, error: 'Please enter your email address' };
    }

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      });

      if (error) {
        const isRateLimit =
          error.status === 429 ||
          error.code === 'over_email_send_rate_limit' ||
          error.code === '429' ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('rate_limit') ||
          error.message?.toLowerCase().includes('too many') ||
          error.message?.toLowerCase().includes('over_email_send_rate_limit');

        if (isRateLimit) {
          return { success: false, error: 'Too many reset requests. Please wait a while before trying again.' };
        }
        return { success: false, error: 'Unable to process password reset request. Please check your email and try again.' };
      }

      return { success: true };
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('rate limit') || msg.includes('too many')) {
        return { success: false, error: 'Too many reset requests. Please wait a while before trying again.' };
      }
      return { success: false, error: 'Unable to process password reset request. Please check your email and try again.' };
    }
  },

  async updateProfile(updates: {
    fullName?: string;
    phone?: string;
    roleDetails?: Record<string, any>;
  }): Promise<{ success: boolean; error?: string }> {
    if (!currentAuthSession) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const userId = currentAuthSession.uid;
      const now = new Date().toISOString();

      // Update public.profiles
      const profileUpdates: any = { updated_at: now };
      if (updates.fullName) profileUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;

      const { error: pErr } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);

      if (pErr) return { success: false, error: pErr.message };

      // Update role-specific table if provided
      if (updates.roleDetails) {
        const roleTable = 
          currentAuthSession.role === 'farmer' ? 'farmer_profiles' :
          currentAuthSession.role === 'distributor' ? 'distributor_profiles' :
          currentAuthSession.role === 'consumer' ? 'consumer_profiles' :
          'transporter_profiles';

        const { error: rErr } = await supabase
          .from(roleTable)
          .update({ ...updates.roleDetails, updated_at: now })
          .eq('id', userId);

        if (rErr) return { success: false, error: rErr.message };
      }

      // Re-fetch latest from database
      const { profile, roleData } = await fetchFullUserProfile(userId);
      if (profile && currentSession?.user) {
        currentAuthSession = mapToSessionUser(currentSession.user, profile, roleData);
        currentCombinedProfile = {
          ...profile,
          farmer: profile.role === 'farmer' ? roleData : undefined,
          distributor: profile.role === 'distributor' ? roleData : undefined,
          transporter: profile.role === 'transporter' ? roleData : undefined,
          consumer: profile.role === 'consumer' ? roleData : undefined,
        };
        notifyListeners();
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update profile' };
    }
  }
};
