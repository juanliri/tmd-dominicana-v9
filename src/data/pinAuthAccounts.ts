import { UserProfile, UserRole } from '../types';
import { User } from 'firebase/auth';

export interface PinAccount {
  pin: string;
  role: UserRole;
  roleTitle: string;
  badgeColor: 'amber' | 'blue' | 'purple';
  name: string;
  email: string;
  companyName: string;
  rnc?: string;
  phone?: string;
  uid: string;
  description: string;
  features: string[];
}

export const PIN_ACCOUNTS: Record<string, PinAccount> = {
  '1111': {
    pin: '1111',
    role: 'client',
    roleTitle: 'CONTRATISTA / CLIENTE VIP',
    badgeColor: 'amber',
    name: 'Ing. Manuel Tavares',
    email: 'compras@constructoratavares.rd',
    companyName: 'Constructora Tavares & Asociados S.R.L.',
    rnc: '1-31-89472-1',
    phone: '+1 (809) 560-8841',
    uid: 'client-manuel-tavares',
    description: 'Acceso completo a Proformas fiscales DGII B01, Telemetría satelital LiveLink™ de flotas, historial técnico de taller y beneficios Club Pro.',
    features: ['Proformas y Cotizaciones B01', 'Telemetría LiveLink™ CAN-Bus', 'Historial Taller Km 22', 'Club Pro 1,850 PTS']
  },
  '2222': {
    pin: '2222',
    role: 'staff',
    roleTitle: 'STAFF TÉCNICO & PATIO KM 22',
    badgeColor: 'blue',
    name: 'Carlos Mendoza',
    email: 'taller@tmd.rd',
    companyName: 'TMD Dominicana S.R.L.',
    rnc: '1-31-88492-1',
    phone: '+1 (829) 555-0192',
    uid: 'staff-edwin-martinez',
    description: 'Gestión operativa de bahías Fullbay HD, escaneos QR en patio y almacén, pases de salida autorizados y diagnóstico CAN-Bus.',
    features: ['Command Center HQ', 'Taller Fullbay HD (6 bahías)', 'Pases Salida & Garita Km 22', 'Escáner QR Industrial']
  },
  '3333': {
    pin: '3333',
    role: 'admin',
    roleTitle: 'ADMINISTRADOR / DIRECCIÓN GENERAL',
    badgeColor: 'purple',
    name: 'Juan Liriano',
    email: 'mrjliriano@gmail.com',
    companyName: 'TMD Dominicana (Tecnomaquinarias Diesel S.R.L.)',
    rnc: '1-31-88492-1',
    phone: '+1 (829) 555-0100',
    uid: 'admin-juan-liriano',
    description: 'Control de mando total, aprobación de precios y proformas, operaciones financieras NCF DGII, inventario de maquinarias y administración RBAC.',
    features: ['Control Total Sistema', 'Módulo Oficina & Finanzas DGII', 'Aprobación de Proformas', 'Gestión RBAC de Usuarios']
  }
};

// Aliases for user convenience
export const PIN_ALIASES: Record<string, string> = {
  '1234': '1111',
  '5555': '2222',
  '9999': '3333',
  '0000': '3333'
};

export const getPinAccountByRole = (role: 'client' | 'staff' | 'admin'): PinAccount => {
  if (role === 'admin') return PIN_ACCOUNTS['3333'];
  if (role === 'staff') return PIN_ACCOUNTS['2222'];
  return PIN_ACCOUNTS['1111'];
};

export const createMockFirebaseUser = (account: PinAccount): User => {
  return {
    uid: account.uid,
    email: account.email,
    displayName: account.name,
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    phoneNumber: account.phone || null,
    providerId: 'pin_auth',
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: 'pin_auth',
        uid: account.uid,
        displayName: account.name,
        email: account.email,
        phoneNumber: account.phone || null,
        photoURL: null,
      }
    ],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-jwt-token',
    getIdTokenResult: async () => ({
      token: 'mock-jwt-token',
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 86400000).toISOString(),
      signInProvider: 'pin_auth',
      signInSecondFactor: null,
      claims: { role: account.role }
    } as any),
    reload: async () => {},
    toJSON: () => ({ uid: account.uid, email: account.email, displayName: account.name })
  } as unknown as User;
};

export const createMockUserProfile = (account: PinAccount): UserProfile => {
  return {
    id: account.uid,
    email: account.email,
    displayName: account.name,
    role: account.role,
    companyName: account.companyName,
    rnc: account.rnc || '',
    phone: account.phone || '',
    isProMember: true,
    proMemberTier: account.role === 'client' ? 'Gold' : 'Platinum',
    proMemberPoints: account.role === 'client' ? 1850 : 5000,
    proMemberNumber: account.role === 'client' ? 'TMD-PRO-8492' : 'TMD-STAFF-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const PIN_STORAGE_KEY = 'tmd_pin_auth_session';

export const savePinSession = (account: PinAccount): void => {
  try {
    const user = createMockFirebaseUser(account);
    const profile = createMockUserProfile(account);
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify({ account, userBrief: { uid: user.uid, email: user.email, displayName: user.displayName }, profile }));
  } catch (e) {
    console.warn('Could not save PIN session to localStorage:', e);
  }
};

export const getStoredPinSession = (): { user: User; profile: UserProfile } | null => {
  try {
    const stored = localStorage.getItem(PIN_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && parsed.account) {
      return {
        user: createMockFirebaseUser(parsed.account),
        profile: parsed.profile || createMockUserProfile(parsed.account)
      };
    }
  } catch (e) {
    console.warn('Could not read PIN session from localStorage:', e);
  }
  return null;
};

export const clearStoredPinSession = (): void => {
  try {
    localStorage.removeItem(PIN_STORAGE_KEY);
  } catch (e) {
    console.warn('Could not remove PIN session from localStorage:', e);
  }
};
