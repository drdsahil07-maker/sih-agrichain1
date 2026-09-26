import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  updateDoc,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import configData from '../../../firebase-applet-config.json';
import { 
  Harvest, 
  BuyerDemand, 
  BackhaulTrip, 
  AppUserRole, 
  UserProfile, 
  ThreeRole, 
  DatabaseUserRecord,
  FarmerProfileRecord,
  DistributorProfileRecord,
  TransporterProfileRecord
} from '../../../shared/types';

export const firebaseConfig = {
  projectId: configData.projectId,
  appId: configData.appId,
  apiKey: configData.apiKey,
  authDomain: configData.authDomain,
  firestoreDatabaseId: configData.firestoreDatabaseId,
  storageBucket: configData.storageBucket,
  messagingSenderId: configData.messagingSenderId,
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Error Handling Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let isConnected = false;
let connectionTested = false;

// Test Firestore connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  if (connectionTested) return isConnected;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    isConnected = true;
    connectionTested = true;
    console.log('✅ Firebase Firestore connected successfully:', firebaseConfig.projectId);
    return true;
  } catch (error) {
    connectionTested = true;
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline. Please verify network or credentials.');
      isConnected = false;
    } else {
      isConnected = true;
      console.log('✅ Firebase Firestore endpoint responsive.');
    }
    return isConnected;
  }
}

// Immediately trigger background check
testFirestoreConnection().catch((err) => {
  console.warn('Firestore initial probe status:', err);
});

// ==========================================
// REAL FIREBASE AUTHENTICATION & FIRESTORE
// ==========================================

export interface RegisterUserInput {
  role: ThreeRole;
  email: string;
  password: string;
  name: string;
  phone: string;
  extraDetails: Record<string, any>;
}

/**
 * Creates a real Firebase Auth user, then creates the Firestore records:
 * 1. users/{uid}
 * 2. farmers/{uid} | distributors/{uid} | transporters/{uid}
 */
export async function registerUserWithFirebase(input: RegisterUserInput): Promise<{
  user: FirebaseUser;
  userDoc: DatabaseUserRecord;
  roleProfile: any;
}> {
  const { role, email, password, name, phone, extraDetails } = input;
  const cleanEmail = email.trim().toLowerCase();

  // 1. Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  // Update Auth Profile Display Name
  try {
    await updateProfile(user, { displayName: name });
  } catch (err) {
    console.warn('Could not update Firebase user displayName:', err);
  }

  const now = new Date().toISOString();

  // 2. Create users/{uid} in Firestore
  const userDoc: DatabaseUserRecord = {
    uid: user.uid,
    userId: user.uid,
    name: name,
    email: cleanEmail,
    phone: phone,
    role: role,
    profileComplete: true,
    createdAt: now,
    lastLoginAt: now,
  };

  const userDocRef = doc(db, 'users', user.uid);
  try {
    await setDoc(userDocRef, userDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
  }

  // 3. Create the corresponding role profile in Firestore
  let roleProfile: any = null;
  const roleCollection = role === 'farmer' 
    ? 'farmers' 
    : role === 'distributor' 
      ? 'distributors' 
      : 'transporters';
  const roleDocRef = doc(db, roleCollection, user.uid);

  if (role === 'farmer') {
    const farmerProfile: FarmerProfileRecord = {
      uid: user.uid,
      userId: user.uid,
      name: name,
      phone: phone,
      village: extraDetails.village || '',
      district: extraDetails.district || '',
      state: extraDetails.state || '',
      crops: extraDetails.crops || extraDetails.mainCrops || '',
      mainCrops: extraDetails.crops || extraDetails.mainCrops || '',
      createdAt: now,
      updatedAt: now,
    };
    roleProfile = farmerProfile;
  } else if (role === 'distributor') {
    const distributorProfile: DistributorProfileRecord = {
      uid: user.uid,
      userId: user.uid,
      businessName: extraDetails.businessName || name,
      ownerName: extraDetails.ownerName || name,
      phone: phone,
      email: cleanEmail,
      businessType: extraDetails.businessType || 'Wholesale Trader',
      city: extraDetails.city || '',
      state: extraDetails.state || '',
      cropsInterestedIn: extraDetails.cropsInterestedIn || '',
      createdAt: now,
      updatedAt: now,
    };
    roleProfile = distributorProfile;
  } else if (role === 'transporter') {
    const transporterProfile: TransporterProfileRecord = {
      uid: user.uid,
      userId: user.uid,
      name: name,
      phone: phone,
      vehicleNumber: extraDetails.vehicleNumber || '',
      vehicleType: extraDetails.vehicleType || '',
      vehicleCapacity: extraDetails.vehicleCapacity || '',
      currentLocation: extraDetails.currentLocation || '',
      preferredRoutes: extraDetails.preferredRoutes || '',
      createdAt: now,
      updatedAt: now,
    };
    roleProfile = transporterProfile;
  }

  try {
    await setDoc(roleDocRef, roleProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${roleCollection}/${user.uid}`);
  }

  return { user, userDoc, roleProfile };
}

/**
 * Logs in with Firebase Authentication, fetches users/{uid}, updates lastLoginAt
 */
export async function loginUserWithFirebase(email: string, pass: string): Promise<{
  user: FirebaseUser;
  userDoc: DatabaseUserRecord;
  roleProfile?: any;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const credential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const user = credential.user;

  // Fetch users/{uid}
  let userDoc: DatabaseUserRecord | null = null;
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      userDoc = snap.data() as DatabaseUserRecord;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
  }

  const now = new Date().toISOString();

  if (!userDoc) {
    // If account was created directly in Firebase Auth console without Firestore doc, initialize one
    userDoc = {
      uid: user.uid,
      userId: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || cleanEmail,
      phone: user.phoneNumber || '',
      role: 'farmer',
      profileComplete: false,
      createdAt: now,
      lastLoginAt: now,
    };
    await setDoc(userDocRef, userDoc, { merge: true });
  } else {
    // Update lastLoginAt
    await updateDoc(userDocRef, { lastLoginAt: now }).catch((err) => {
      console.warn('Could not update lastLoginAt in Firestore:', err);
    });
    userDoc.lastLoginAt = now;
  }

  // Fetch role profile
  let roleProfile: any = null;
  const roleCollection = userDoc.role === 'farmer' 
    ? 'farmers' 
    : userDoc.role === 'distributor' 
      ? 'distributors' 
      : 'transporters';
  try {
    const roleSnap = await getDoc(doc(db, roleCollection, user.uid));
    if (roleSnap.exists()) {
      roleProfile = roleSnap.data();
    }
  } catch (err) {
    console.warn(`Could not load ${roleCollection} profile:`, err);
  }

  return { user, userDoc, roleProfile };
}

/**
 * Sends real Firebase password reset email
 */
export async function sendFirebasePasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, cleanEmail);
}

/**
 * Signs out from Firebase Authentication
 */
export async function logoutFirebaseUser(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Fetches user profile and role details for a given uid
 */
export async function fetchUserData(uid: string): Promise<{
  userDoc: DatabaseUserRecord | null;
  roleProfile: any;
}> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) {
      return { userDoc: null, roleProfile: null };
    }
    const userDoc = userSnap.data() as DatabaseUserRecord;
    const roleCollection = userDoc.role === 'farmer' 
      ? 'farmers' 
      : userDoc.role === 'distributor' 
        ? 'distributors' 
        : 'transporters';
    
    const roleSnap = await getDoc(doc(db, roleCollection, uid));
    const roleProfile = roleSnap.exists() ? roleSnap.data() : null;

    return { userDoc, roleProfile };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    return { userDoc: null, roleProfile: null };
  }
}

// User Profile Firestore Operations (Backwards compatibility)
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: data.uid || uid,
        email: data.email || '',
        displayName: data.name || data.displayName || 'User',
        role: data.role as AppUserRole,
        phone: data.phone,
        location: data.location || (data.village ? `${data.village}, ${data.district}` : ''),
        createdAt: data.createdAt,
        updatedAt: data.lastLoginAt
      };
    }
  } catch (err) {
    console.warn('Could not fetch user profile from Firestore:', err);
  }
  return null;
}

export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  try {
    const docRef = doc(db, 'users', profile.uid);
    await setDoc(docRef, {
      uid: profile.uid,
      name: profile.displayName,
      email: profile.email,
      role: profile.role,
      phone: profile.phone || '',
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    if (profile.role === 'admin') {
      const adminRef = doc(db, 'admins', profile.uid);
      await setDoc(adminRef, {
        uid: profile.uid,
        email: profile.email,
        assignedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
  }
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => {
        const data = d.data();
        return {
          uid: data.uid || d.id,
          email: data.email || '',
          displayName: data.name || data.displayName || 'User',
          role: (data.role as AppUserRole) || 'farmer',
          phone: data.phone,
          location: data.location,
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    console.warn('Could not fetch all users from Firestore:', err);
  }
  return [];
}

// --- Harvests Firestore Operations ---
export async function saveHarvestToFirestore(harvest: Harvest): Promise<void> {
  const path = `harvests/${harvest.id}`;
  try {
    const docRef = doc(db, 'harvests', harvest.id);
    await setDoc(docRef, {
      ...harvest,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function loadHarvestsFromFirestore(): Promise<Harvest[]> {
  const path = 'harvests';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as Harvest);
    }
  } catch (err) {
    console.warn('Firestore load harvests:', err);
  }
  return [];
}

// --- Buyer Demands Firestore Operations ---
export async function saveBuyerDemandToFirestore(demand: BuyerDemand): Promise<void> {
  const path = `buyer_demands/${demand.id}`;
  try {
    const docRef = doc(db, 'buyer_demands', demand.id);
    await setDoc(docRef, {
      ...demand,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function loadBuyerDemandsFromFirestore(): Promise<BuyerDemand[]> {
  const path = 'buyer_demands';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as BuyerDemand);
    }
  } catch (err) {
    console.warn('Firestore load demands:', err);
  }
  return [];
}

// --- Backhaul Trips Firestore Operations ---
export async function saveBackhaulToFirestore(trip: BackhaulTrip): Promise<void> {
  const path = `backhaul_trips/${trip.id}`;
  try {
    const docRef = doc(db, 'backhaul_trips', trip.id);
    await setDoc(docRef, {
      ...trip,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function loadBackhaulsFromFirestore(): Promise<BackhaulTrip[]> {
  const path = 'backhaul_trips';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as BackhaulTrip);
    }
  } catch (err) {
    console.warn('Firestore load backhauls:', err);
  }
  return [];
}
