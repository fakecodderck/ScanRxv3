import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { RoleType } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { fbSignOut };

// Error handler conforming to FirestoreErrorInfo standard
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
    },
    operationType,
    path,
  };
  console.warn('Firestore Error Handled:', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline client mode.');
    }
  }
}

// User Profile model in Firestore
export interface AppUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'company' | 'distributor' | 'pharmacy';
  organization: string;
  facilityLocation?: {
    lat: number;
    lng: number;
    facilityName: string;
    city?: string;
    country?: string;
  };
  status: 'active' | 'pending_approval';
  createdAt?: any;
  updatedAt?: any;
}

export const ADMIN_EMAIL = 'fakemailcloud09@gmail.com';

/**
 * Fetch or initialize user profile in Firestore
 */
export async function syncUserProfile(
  user: FirebaseUser,
  selectedRole?: 'admin' | 'company' | 'distributor' | 'pharmacy',
  orgName?: string
): Promise<AppUserProfile> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as AppUserProfile;
    }

    // Determine initial role: admin if matching admin email
    const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const role: 'admin' | 'company' | 'distributor' | 'pharmacy' = isAdminUser
      ? 'admin'
      : selectedRole || 'company';

    const defaultOrg =
      orgName ||
      (role === 'admin'
        ? 'CDSCO National Drug Authority (Admin)'
        : role === 'company'
        ? 'Sun Pharma Laboratories Ltd.'
        : role === 'distributor'
        ? 'Coldex National Pharma Logistics'
        : 'Apollo Pharmacy Central');

    const newProfile: AppUserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Pharma User',
      role,
      organization: defaultOrg,
      facilityLocation: {
        lat: role === 'company' ? 30.9578 : role === 'distributor' ? 19.2967 : 28.6139,
        lng: role === 'company' ? 76.7914 : role === 'distributor' ? 73.0631 : 77.2090,
        facilityName: defaultOrg,
        city: role === 'company' ? 'Baddi (HP)' : role === 'distributor' ? 'Bhiwandi (MH)' : 'New Delhi',
        country: 'India',
      },
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    // Return optimistic fallback if offline
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Pharma User',
      role: selectedRole || 'company',
      organization: orgName || 'Registered Pharma Facility',
      status: 'active',
    };
  }
}
