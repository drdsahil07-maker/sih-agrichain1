import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  authService, 
  FarmerRegisterData, 
  DistributorRegisterData, 
  TransporterRegisterData 
} from '../auth/authService';
import { 
  ThreeRole, 
  AuthSessionUser, 
  AppUserRole, 
  UserProfile,
  CombinedUserProfile
} from '../../../shared/types';
import { Session, User } from '@supabase/supabase-js';

export interface AuthContextType {
  // Required Supabase AuthProvider properties
  session: Session | null;
  user: AuthSessionUser | null;
  profile: CombinedUserProfile | null;
  role: ThreeRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string, expectedRole?: ThreeRole) => Promise<{ success: boolean; error?: string; user?: AuthSessionUser }>;
  register: (role: ThreeRole, data: any) => Promise<{ success: boolean; error?: string; user?: AuthSessionUser | null; needsEmailConfirmation?: boolean; isRateLimit?: boolean; isExistingUser?: boolean }>;
  logout: () => Promise<void>;
  switchAccount: () => void;

  // Additional helper methods
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { fullName?: string; phone?: string; roleDetails?: Record<string, any> }) => Promise<{ success: boolean; error?: string }>;

  // Backwards compatibility properties for existing components
  currentUser: AuthSessionUser | null;
  userRole: ThreeRole | null;
  isLoading: boolean;
  userProfile: UserProfile;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, role: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchRole: (role: any) => void;
  setRole: (role: any) => void;
  getCurrentUser: () => AuthSessionUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSessionUser | null>(authService.getCurrentUser());
  const [profile, setProfile] = useState<CombinedUserProfile | null>(authService.getCombinedProfile());
  const [session, setSession] = useState<Session | null>(authService.getCurrentSession());
  const [loading, setLoading] = useState<boolean>(authService.isLoading());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Listen to real Supabase Auth session & profile updates
    const unsubscribe = authService.subscribe((currentAuthUser, isAuthLoading) => {
      setUser(currentAuthUser);
      setProfile(authService.getCombinedProfile());
      setSession(authService.getCurrentSession());
      setLoading(isAuthLoading);
    });
    return () => unsubscribe();
  }, []);

  const login = async (identifier: string, pass: string, expectedRole?: ThreeRole) => {
    return await authService.login(identifier, pass, expectedRole);
  };

  const logout = async () => {
    await authService.logout();
  };

  const register = async (role: ThreeRole, data: any) => {
    return await authService.register(role, data);
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const updateProfile = async (updates: { fullName?: string; phone?: string; roleDetails?: Record<string, any> }) => {
    return await authService.updateProfile(updates);
  };

  const getCurrentUser = () => {
    return authService.getCurrentUser();
  };

  const switchRole = (_newRole: any) => {
    window.location.href = '/choose-role';
  };

  const setRole = (_newRole: any) => {
    // no-op; role is determined strictly by Supabase authenticated record
  };

  // Compatibility derivation for legacy views
  const legacyRole: AppUserRole = user?.role === 'distributor' ? 'buyer' : (user?.role || 'farmer');
  
  const userProfile: UserProfile = {
    uid: user?.uid || user?.userId || '',
    email: user?.email || '',
    displayName: user?.name || 'AgriChain User',
    role: legacyRole,
    phone: user?.phone || '',
    location: user?.location || '',
    trustScore: 98,
    createdAt: user?.lastLoginAt || new Date().toISOString()
  };

  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await authService.login(email, pass);
    return { success: res.success, error: res.error };
  };

  const signUpWithEmail = async (email: string, pass: string, roleToCreate: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const targetRole: ThreeRole = roleToCreate === 'distributor' || roleToCreate === 'buyer' 
      ? 'distributor' 
      : (roleToCreate === 'transporter' ? 'transporter' : 'farmer');
    const res = await register(targetRole, {
      fullName: name,
      businessName: name,
      email,
      password: pass,
      mobileNumber: '',
    });
    return { success: res.success, error: res.error };
  };

  const signOut = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        // Section 9 requirements
        session,
        user,
        profile,
        role: user?.role || null,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchAccount: () => { window.location.href = '/choose-role'; },

        // Extras
        resetPassword,
        updateProfile,

        // Backward compatibility
        currentUser: user,
        userRole: user?.role || null,
        isLoading: loading,
        userProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        switchRole,
        setRole,
        getCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
