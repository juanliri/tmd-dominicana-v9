import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { 
  isWebAuthnSupported, 
  getStoredBiometricCredentials, 
  registerStaffBiometrics, 
  authenticateStaffBiometrics, 
  getActiveBiometricSession, 
  clearBiometricSession,
  BiometricCredentialRecord, 
  BiometricAuthResult 
} from '../services/webAuthnService';
import { 
  PIN_ACCOUNTS, 
  PIN_ALIASES, 
  getPinAccountByRole, 
  createMockFirebaseUser, 
  createMockUserProfile, 
  savePinSession, 
  getStoredPinSession, 
  clearStoredPinSession 
} from '../data/pinAuthAccounts';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  realRole: UserRole;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  isStaffOnly: boolean;
  hasRole: (required: UserRole | UserRole[] | string) => boolean;
  checkPermission: (requiredRole: 'client' | 'staff' | 'admin' | 'staff_or_admin' | 'CLIENT' | 'STAFF' | 'ADMIN') => boolean;
  canAccessStaffTools: boolean;
  canAccessAdminDashboard: boolean;
  canAccessOfficeWorkflow: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPin: (pin: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signInAsRole: (targetRole: 'client' | 'staff' | 'admin') => Promise<void>;
  signInWithBiometrics: (targetEmail?: string) => Promise<BiometricAuthResult>;
  registerBiometrics: (deviceName?: string) => Promise<BiometricAuthResult>;
  isBiometricsSupported: boolean;
  storedBiometricKeys: BiometricCredentialRecord[];
  refreshBiometricKeys: () => void;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dedicated primary admin emails for bootstrap
const BOOTSTRAP_ADMIN_EMAILS = [
  'mrjliriano@gmail.com',
  'jliriano154@gmail.com',
  'jayhlituh@gmail.com',
  'admin@tmd.com.do',
  'perlacustodio9@gmail.com'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialPinSession = getStoredPinSession();
  const [currentUser, setCurrentUser] = useState<User | null>(initialPinSession ? initialPinSession.user : null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialPinSession ? initialPinSession.profile : null);
  const [loading, setLoading] = useState<boolean>(!initialPinSession);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
  const [storedBiometricKeys, setStoredBiometricKeys] = useState<BiometricCredentialRecord[]>([]);
  const isBiometricsSupported = isWebAuthnSupported();

  const refreshBiometricKeys = () => {
    const keys = getStoredBiometricCredentials(userProfile?.id);
    setStoredBiometricKeys(keys);
  };

  useEffect(() => {
    refreshBiometricKeys();
  }, [userProfile?.id]);

  useEffect(() => {
    // Check for existing active PIN or biometric session on boot
    const storedPin = getStoredPinSession();
    if (storedPin) {
      setCurrentUser(storedPin.user);
      setUserProfile(storedPin.profile);
      setLoading(false);
    } else {
      const bioSession = getActiveBiometricSession();
      if (bioSession && !userProfile) {
        setUserProfile(bioSession);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        setCurrentUser(firebaseUser);
        const userEmail = (firebaseUser.email || '').toLowerCase().trim();
        const isBootstrapAdmin = BOOTSTRAP_ADMIN_EMAILS.some(e => e.toLowerCase() === userEmail);
        
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            const data = userSnapshot.data() as UserProfile;
            
            // Auto-promote bootstrapped admin if email matches
            if (isBootstrapAdmin && data.role !== 'admin') {
              const updated: UserProfile = {
                ...data,
                role: 'admin',
                updatedAt: new Date().toISOString()
              };
              try {
                await updateDoc(userDocRef, { role: 'admin', updatedAt: updated.updatedAt });
                await setDoc(doc(db, 'admins', firebaseUser.uid), {
                  email: firebaseUser.email,
                  role: 'admin'
                });
              } catch (writeErr) {
                console.warn('Could not auto-promote admin in firestore:', writeErr);
              }
              setUserProfile(updated);
            } else {
              setUserProfile(data);
            }
          } else {
            // New User Registration Profile
            const initialRole: UserRole = isBootstrapAdmin ? 'admin' : 'client';

            const newProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Usuario TMD',
              role: initialRole,
              companyName: '',
              phone: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            try {
              await setDoc(userDocRef, newProfile);
              if (initialRole === 'admin') {
                await setDoc(doc(db, 'admins', firebaseUser.uid), {
                  email: firebaseUser.email,
                  role: 'admin'
                });
              }
            } catch (createErr) {
              console.warn('Could not write initial user profile:', createErr);
            }

            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
          const fallbackRole: UserRole = isBootstrapAdmin ? 'admin' : 'client';
          const fallbackProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Usuario TMD',
            role: fallbackRole,
            companyName: '',
            phone: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUserProfile(fallbackProfile);
        }
        setLoading(false);
      } else {
        // If Firebase is not logged in, check if we have a valid PIN session active
        const stored = getStoredPinSession();
        if (stored) {
          setCurrentUser(stored.user);
          setUserProfile(stored.profile);
        } else {
          const activeBio = getActiveBiometricSession();
          if (activeBio) {
            setUserProfile(activeBio);
          } else {
            setCurrentUser(null);
            setUserProfile(null);
          }
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw error;
    }
  };

  const signInWithPin = async (rawPin: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setLoading(true);
    try {
      const cleanPin = rawPin.trim();
      const resolvedPin = PIN_ALIASES[cleanPin] || cleanPin;
      const account = PIN_ACCOUNTS[resolvedPin];

      if (!account) {
        return {
          success: false,
          error: 'Código PIN no reconocido. Use 1111 (Cliente), 2222 (Staff) o 3333 (Admin).'
        };
      }

      const mockUser = createMockFirebaseUser(account);
      const mockProfile = createMockUserProfile(account);

      savePinSession(account);
      setCurrentUser(mockUser);
      setUserProfile(mockProfile);
      setSimulatedRole(null);

      return {
        success: true,
        role: account.role
      };
    } finally {
      setLoading(false);
    }
  };

  const signInAsRole = async (targetRole: 'client' | 'staff' | 'admin'): Promise<void> => {
    setLoading(true);
    try {
      const account = getPinAccountByRole(targetRole);
      const mockUser = createMockFirebaseUser(account);
      const mockProfile = createMockUserProfile(account);

      savePinSession(account);
      setCurrentUser(mockUser);
      setUserProfile(mockProfile);
      setSimulatedRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithBiometrics = async (targetEmail?: string): Promise<BiometricAuthResult> => {
    setLoading(true);
    try {
      const result = await authenticateStaffBiometrics(targetEmail);
      if (result.success && result.userProfile) {
        setUserProfile(result.userProfile);
        refreshBiometricKeys();
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const registerBiometrics = async (deviceName?: string): Promise<BiometricAuthResult> => {
    if (!userProfile) {
      return {
        success: false,
        errorCode: 'NO_CREDENTIALS',
        error: 'Debes tener una sesión activa para enrolar biometría en este dispositivo.'
      };
    }

    const result = await registerStaffBiometrics({
      id: userProfile.id || `staff_${Date.now()}`,
      email: userProfile.email,
      name: userProfile.displayName || userProfile.email.split('@')[0],
      role: userProfile.role || 'staff',
      deviceName: deviceName
    });

    if (result.success) {
      refreshBiometricKeys();
    }
    return result;
  };

  const signOut = async () => {
    try {
      clearStoredPinSession();
      clearBiometricSession();
      try {
        await fbSignOut(auth);
      } catch (fbErr) {
        console.warn('Firebase signout skipped or already signed out:', fbErr);
      }
      setCurrentUser(null);
      setUserProfile(null);
      setSimulatedRole(null);
    } catch (error) {
      console.error("Sign out error:", error);
      clearStoredPinSession();
      setCurrentUser(null);
      setUserProfile(null);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error("Solo los administradores pueden cambiar roles de usuario");
    }
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      // Maintain admin/staff collections for security rules sync
      if (newRole === 'admin') {
        await setDoc(doc(db, 'admins', userId), { role: 'admin' });
      } else if (newRole === 'staff') {
        await setDoc(doc(db, 'staff', userId), { role: 'staff' });
      }

      if (userProfile.id === userId) {
        setUserProfile(prev => prev ? { ...prev, role: newRole } : null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updated = {
        ...details,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userDocRef, updated);
      setUserProfile(prev => prev ? { ...prev, ...updated } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const isCurrentBootstrapAdmin = !!currentUser?.email && BOOTSTRAP_ADMIN_EMAILS.includes(currentUser.email);
  
  // Normalize role from Firestore or bootstrap (handles lowercase and uppercase)
  const rawRole = (userProfile?.role || '').toLowerCase();
  const normalizedProfileRole: UserRole = 
    rawRole === 'admin' || rawRole === 'administrador' ? 'admin' :
    rawRole === 'staff' || rawRole === 'operaciones' || rawRole === 'tecnico' ? 'staff' :
    'client';

  const realRole: UserRole = isCurrentBootstrapAdmin ? 'admin' : (userProfile ? normalizedProfileRole : 'client');
  const role: UserRole = simulatedRole || realRole;
  const isAdmin = role === 'admin' || role === 'ADMIN';
  const isStaff = role === 'staff' || role === 'STAFF' || isAdmin;
  const isClient = (role === 'client' || role === 'CLIENT') && !isStaff;
  const isStaffOnly = (role === 'staff' || role === 'STAFF') && !isAdmin;
  const canAccessStaffTools = isStaff || isAdmin;
  const canAccessAdminDashboard = isStaff || isAdmin;
  const canAccessOfficeWorkflow = isStaff || isAdmin;

  const hasRole = (required: UserRole | UserRole[] | string): boolean => {
    const active = (role || 'client').toLowerCase();
    if (Array.isArray(required)) {
      return required.some(r => {
        const req = r.toLowerCase();
        if (req === 'admin') return isAdmin;
        if (req === 'staff') return isStaff;
        if (req === 'client') return true;
        return active === req;
      });
    }
    const req = (required || '').toLowerCase();
    if (req === 'admin') return isAdmin;
    if (req === 'staff') return isStaff;
    if (req === 'client') return isClient || isStaff || isAdmin;
    return active === req;
  };

  const checkPermission = (requiredRole: 'client' | 'staff' | 'admin' | 'staff_or_admin' | 'CLIENT' | 'STAFF' | 'ADMIN'): boolean => {
    const req = (requiredRole || '').toLowerCase();
    if (req === 'admin') return isAdmin;
    if (req === 'staff' || req === 'staff_or_admin') return isStaff;
    if (req === 'client') return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        realRole,
        simulatedRole,
        setSimulatedRole,
        isAdmin,
        isStaff,
        isClient,
        isStaffOnly,
        hasRole,
        checkPermission,
        canAccessStaffTools,
        canAccessAdminDashboard,
        canAccessOfficeWorkflow,
        loading,
        signInWithGoogle,
        signInWithPin,
        signInAsRole,
        signInWithBiometrics,
        registerBiometrics,
        isBiometricsSupported,
        storedBiometricKeys,
        refreshBiometricKeys,
        signOut,
        updateUserRole,
        updateProfileDetails
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

export { ProtectedRoute } from '../components/auth/ProtectedRoute';

