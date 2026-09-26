/**
 * TECNOMAQUINARIAS DIESEL S.R.L. (TMD Dominicana)
 * Firestore Database & Firebase Initialization Script
 * Path: src/lib/firestoreInit.ts
 * 
 * Initializes Firebase App, Firestore (with custom database ID), Firebase Auth,
 * and Firebase Storage using firebase-applet-config.json.
 * 
 * Exports:
 *  - app: FirebaseApp
 *  - db: Firestore
 *  - auth: Auth
 *  - storage: FirebaseStorage
 *  - firebaseConfig: applet configuration object
 *  - Collections definitions, schemas, security rule validators and seeders
 */

import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  query,
  limit,
  getCountFromServer
} from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { app, db, auth, storage, googleProvider } from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { Machine, Part } from '../types';
import { MACHINES_DATA } from '../data/catalog';
import { PARTS_DATA } from '../data/parts';
import { INITIAL_PRESUPUESTOS_DATA, PresupuestoDoc } from '../services/firestoreCatalogService';
import { sanitizeFirestoreId } from '../utils/firestoreDataMigration';

// ==========================================
// 1. FIREBASE & FIRESTORE INSTANCE INITIALIZATION
// ==========================================

export { app, db, auth, storage, googleProvider, firebaseConfig };

// ==========================================
// 2. ERROR HANDLING & OPERATIONS
// ==========================================

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
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

// ==========================================
// 3. COLLECTION NAMES CONSTANTS
// ==========================================

export const COLLECTIONS = {
  MAQUINARIA: 'maquinaria',
  REPUESTOS: 'repuestos',
  PRESUPUESTOS: 'presupuestos',
  USERS: 'users',
  ADMINS: 'admins',
  STAFF: 'staff',
  ORDERS: 'orders',
  WORK_ORDERS: 'work_orders',
  INVENTORY_MACHINES: 'inventory_machines',
  INVENTORY_PARTS: 'inventory_parts',
  NOTIFICATIONS: 'notifications',
  FCM_TOKENS: 'fcm_tokens'
} as const;

// ==========================================
// 4. DATA SCHEMAS & INTERFACES FOR TECHNICAL CATALOGS
// ==========================================

export interface FirestoreMachineSchema {
  id: string;
  name: string;
  brand: string;
  category: string;
  modelCode: string;
  year: number;
  image: string;
  powerHp: number;
  operatingWeightKg: number;
  bucketCapacityM3?: number;
  engine: string;
  description: string;
  inStock: boolean;
  featured: boolean;
  basePriceUsd: number;
  specs: Array<{
    label: string;
    value: string;
  }>;
  applications: string[];
  createdAt?: string;
  updatedAt?: string;
  syncedToFirestore?: boolean;
}

export interface FirestorePartSchema {
  id: string;
  partNumber: string;
  name: string;
  brand: string;
  category: string;
  assemblyId?: string;
  compatibleModels: string[];
  priceUsd: number;
  stockQty: number;
  image: string;
  description: string;
  isOem: boolean;
  deliveryTimeHours: number;
  createdAt?: string;
  updatedAt?: string;
  syncedToFirestore?: boolean;
}

export interface FirestorePresupuestoSchema {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientEmail: string;
  clientName: string;
  companyName?: string;
  rncOrCedula?: string;
  ncfType?: string; // 'B01_CREDITO_FISCAL', 'B02_CONSUMIDOR_FINAL'
  phone?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_review';
  currency: 'USD' | 'DOP';
  subtotal: number;
  itbis: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    type: 'machine' | 'part';
    partNumber?: string;
    modelCode?: string;
    quantity: number;
    unitPriceUsd: number;
    subtotalUsd: number;
  }>;
  itemsCount: number;
  itemsSummary: string;
  notes?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. BASE SECURITY RULES & VALIDATION HELPERS
// ==========================================

export const BASE_FIRESTORE_SECURITY_RULES_SPEC = {
  version: '2',
  database: firebaseConfig.firestoreDatabaseId,
  rulesOverview: {
    maquinaria: {
      read: 'Public (allow read: if true)',
      write: 'Admin & Staff Only (isAdmin() || isStaff()) with isValidId(id)',
      description: 'Catálogo técnico público de maquinaria pesada, specs y precios oficiales'
    },
    repuestos: {
      read: 'Public (allow read: if true)',
      write: 'Admin & Staff Only (isAdmin() || isStaff()) with isValidId(id)',
      description: 'Catálogo de repuestos OEM, número de parte, compatibilidad y almacén Km 22'
    },
    presupuestos: {
      get: 'Owner Client or Staff (resource.data.clientId == request.auth.uid || isStaff())',
      list: 'Staff or Client Own Quotes (resource.data.clientId == request.auth.uid || isStaff())',
      create: 'Authenticated Client with own UID or Staff',
      update: 'Quote Owner or Staff',
      delete: 'Admin Only',
      description: 'Presupuestos formales, proformas fiscales y cotizaciones de clientes'
    }
  },
  idRegex: '^[a-zA-Z0-9_\\-]+$',
  maxIdLength: 128
};

/**
 * Validates document ID according to security rules constraint
 */
export function isValidDocumentId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (id.length > 128) return false;
  return /^[a-zA-Z0-9_\-]+$/.test(id);
}

/**
 * Validates a machine payload against the Firestore blueprint schema
 */
export function validateMachinePayload(machine: Partial<FirestoreMachineSchema>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!machine.id || !isValidDocumentId(machine.id)) errors.push('ID inválido o ausente');
  if (!machine.name || machine.name.length > 150) errors.push('Nombre inválido (máx 150 caracteres)');
  if (!machine.brand || machine.brand.length > 80) errors.push('Marca inválida (máx 80 caracteres)');
  if (!machine.category || machine.category.length > 80) errors.push('Categoría requerida');
  if (typeof machine.basePriceUsd !== 'number' || machine.basePriceUsd < 0) errors.push('Precio base USD inválido');
  if (typeof machine.inStock !== 'boolean') errors.push('Estado de stock booleano requerido');
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a part payload against the Firestore blueprint schema
 */
export function validatePartPayload(part: Partial<FirestorePartSchema>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!part.id || !isValidDocumentId(part.id)) errors.push('ID inválido o ausente');
  if (!part.partNumber || part.partNumber.length > 80) errors.push('Número de parte inválido (máx 80 caracteres)');
  if (!part.name || part.name.length > 150) errors.push('Nombre inválido (máx 150 caracteres)');
  if (typeof part.priceUsd !== 'number' || part.priceUsd < 0) errors.push('Precio USD inválido');
  if (typeof part.stockQty !== 'number' || part.stockQty < 0) errors.push('Cantidad en stock inválida');
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a formal quote/presupuesto payload
 */
export function validatePresupuestoPayload(presupuesto: Partial<FirestorePresupuestoSchema>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!presupuesto.id || !isValidDocumentId(presupuesto.id)) errors.push('ID inválido o ausente');
  if (!presupuesto.quoteNumber) errors.push('Número de cotización requerido');
  if (!presupuesto.clientId) errors.push('ID de cliente requerido');
  if (!presupuesto.clientEmail) errors.push('Email de cliente requerido');
  if (typeof presupuesto.total !== 'number' || presupuesto.total < 0) errors.push('Monto total inválido');
  return { valid: errors.length === 0, errors };
}

// ==========================================
// 6. SEEDING & INITIALIZATION FUNCTIONS
// ==========================================

export interface FirestoreInitStatus {
  maquinariaCount: number;
  repuestosCount: number;
  presupuestosCount: number;
  initialized: boolean;
  timestamp: string;
}

/**
 * Inspects the current count of records across the core collections
 */
export async function getCollectionsStatus(): Promise<FirestoreInitStatus> {
  try {
    const maqColl = collection(db, COLLECTIONS.MAQUINARIA);
    const repColl = collection(db, COLLECTIONS.REPUESTOS);
    const presColl = collection(db, COLLECTIONS.PRESUPUESTOS);

    const [maqSnap, repSnap, presSnap] = await Promise.all([
      getCountFromServer(maqColl),
      getCountFromServer(repColl),
      getCountFromServer(presColl)
    ]);

    const maqCount = maqSnap.data().count;
    const repCount = repSnap.data().count;
    const presCount = presSnap.data().count;

    return {
      maquinariaCount: maqCount,
      repuestosCount: repCount,
      presupuestosCount: presCount,
      initialized: maqCount > 0 || repCount > 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Could not fetch server counts, falling back to query check:', error);
    try {
      const [maqDocs, repDocs, presDocs] = await Promise.all([
        getDocs(query(collection(db, COLLECTIONS.MAQUINARIA), limit(1))),
        getDocs(query(collection(db, COLLECTIONS.REPUESTOS), limit(1))),
        getDocs(query(collection(db, COLLECTIONS.PRESUPUESTOS), limit(1)))
      ]);

      return {
        maquinariaCount: maqDocs.size,
        repuestosCount: repDocs.size,
        presupuestosCount: presDocs.size,
        initialized: maqDocs.size > 0 || repDocs.size > 0,
        timestamp: new Date().toISOString()
      };
    } catch (innerError) {
      handleFirestoreError(innerError, OperationType.GET, 'collections_status');
    }
  }
}

/**
 * Seeds the initial core machinery catalog into 'maquinaria' collection
 */
export async function initializeMaquinariaCollection(
  machines: Machine[] = MACHINES_DATA,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; count: number }> {
  try {
    const total = machines.length;
    let written = 0;
    const batchSize = 50;

    for (let i = 0; i < total; i += batchSize) {
      const chunk = machines.slice(i, i + batchSize);
      const batch = writeBatch(db);

      chunk.forEach((machine) => {
        const cleanId = sanitizeFirestoreId(machine.id, 'machine');
        const docRef = doc(db, COLLECTIONS.MAQUINARIA, cleanId);

        const docData: FirestoreMachineSchema = {
          id: cleanId,
          name: machine.name,
          brand: machine.brand,
          category: machine.category,
          modelCode: machine.modelCode || cleanId,
          year: machine.year || 2026,
          image: machine.image,
          powerHp: machine.powerHp,
          operatingWeightKg: machine.operatingWeightKg,
          bucketCapacityM3: machine.bucketCapacityM3 || 0,
          engine: machine.engine,
          description: machine.description,
          inStock: machine.inStock,
          featured: machine.featured ?? false,
          basePriceUsd: machine.basePriceUsd,
          specs: machine.specs || [],
          applications: machine.applications || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncedToFirestore: true
        };

        batch.set(docRef, docData, { merge: true });
      });

      await batch.commit();
      written += chunk.length;
      if (onProgress) onProgress(written, total);
    }

    return { success: true, count: written };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.MAQUINARIA);
  }
}

/**
 * Seeds the initial core OEM parts catalog into 'repuestos' collection
 */
export async function initializeRepuestosCollection(
  parts: Part[] = PARTS_DATA,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; count: number }> {
  try {
    const total = parts.length;
    let written = 0;
    const batchSize = 50;

    for (let i = 0; i < total; i += batchSize) {
      const chunk = parts.slice(i, i + batchSize);
      const batch = writeBatch(db);

      chunk.forEach((part) => {
        const cleanId = sanitizeFirestoreId(part.id || `part-${part.partNumber}`, 'part');
        const docRef = doc(db, COLLECTIONS.REPUESTOS, cleanId);

        const docData: FirestorePartSchema = {
          id: cleanId,
          partNumber: part.partNumber,
          name: part.name,
          brand: part.brand,
          category: part.category,
          assemblyId: part.assemblyId,
          compatibleModels: part.compatibleModels || [],
          priceUsd: part.priceUsd,
          stockQty: part.stockQty ?? 10,
          image: part.image,
          description: part.description,
          isOem: part.isOem !== false,
          deliveryTimeHours: part.deliveryTimeHours || 24,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncedToFirestore: true
        };

        batch.set(docRef, docData, { merge: true });
      });

      await batch.commit();
      written += chunk.length;
      if (onProgress) onProgress(written, total);
    }

    return { success: true, count: written };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.REPUESTOS);
  }
}

/**
 * Seeds formal initial quotes & proformas into 'presupuestos' collection
 */
export async function initializePresupuestosCollection(
  presupuestos: PresupuestoDoc[] = INITIAL_PRESUPUESTOS_DATA,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; count: number }> {
  try {
    const total = presupuestos.length;
    let written = 0;
    const batchSize = 50;

    for (let i = 0; i < total; i += batchSize) {
      const chunk = presupuestos.slice(i, i + batchSize);
      const batch = writeBatch(db);

      chunk.forEach((pres) => {
        const cleanId = sanitizeFirestoreId(pres.id, 'pres');
        const docRef = doc(db, COLLECTIONS.PRESUPUESTOS, cleanId);

        const docData: FirestorePresupuestoSchema = {
          id: cleanId,
          quoteNumber: pres.quoteNumber,
          clientId: pres.clientId,
          clientEmail: pres.clientEmail,
          clientName: pres.clientName,
          companyName: pres.companyName || '',
          rncOrCedula: pres.rncOrCedula || '',
          ncfType: pres.ncfType || 'B01_CREDITO_FISCAL',
          phone: pres.phone || '',
          status: pres.status || 'submitted',
          currency: pres.currency || 'USD',
          subtotal: pres.subtotal,
          itbis: pres.itbis,
          total: pres.total,
          items: pres.items || [],
          itemsCount: pres.itemsCount || pres.items.length,
          itemsSummary: pres.itemsSummary || '',
          notes: pres.notes || '',
          validUntil: pres.validUntil || '30 días desde emisión',
          createdAt: pres.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        batch.set(docRef, docData, { merge: true });
      });

      await batch.commit();
      written += chunk.length;
      if (onProgress) onProgress(written, total);
    }

    return { success: true, count: written };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.PRESUPUESTOS);
  }
}

/**
 * Master Database Initialization Function
 * Initializes 'maquinaria', 'repuestos', and 'presupuestos' collections in one step.
 */
export async function initializeAllFirestoreCollections(options?: {
  forceSeed?: boolean;
  onProgress?: (step: string, current: number, total: number) => void;
}): Promise<{
  success: boolean;
  status: FirestoreInitStatus;
  details: {
    machinerySeeded: number;
    partsSeeded: number;
    presupuestosSeeded: number;
  };
}> {
  try {
    const currentStatus = await getCollectionsStatus();

    let machinerySeeded = 0;
    let partsSeeded = 0;
    let presupuestosSeeded = 0;

    // 1. Maquinaria
    if (options?.forceSeed || currentStatus.maquinariaCount === 0) {
      if (options?.onProgress) options.onProgress('Inicializando colección maquinaria...', 0, MACHINES_DATA.length);
      const res = await initializeMaquinariaCollection(MACHINES_DATA, (c, t) => {
        if (options?.onProgress) options.onProgress('Escribiendo maquinaria...', c, t);
      });
      machinerySeeded = res.count;
    }

    // 2. Repuestos
    if (options?.forceSeed || currentStatus.repuestosCount === 0) {
      if (options?.onProgress) options.onProgress('Inicializando colección repuestos...', 0, PARTS_DATA.length);
      const res = await initializeRepuestosCollection(PARTS_DATA, (c, t) => {
        if (options?.onProgress) options.onProgress('Escribiendo repuestos OEM...', c, t);
      });
      partsSeeded = res.count;
    }

    // 3. Presupuestos
    if (options?.forceSeed || currentStatus.presupuestosCount === 0) {
      if (options?.onProgress) options.onProgress('Inicializando colección presupuestos...', 0, INITIAL_PRESUPUESTOS_DATA.length);
      const res = await initializePresupuestosCollection(INITIAL_PRESUPUESTOS_DATA, (c, t) => {
        if (options?.onProgress) options.onProgress('Escribiendo proformas y cotizaciones...', c, t);
      });
      presupuestosSeeded = res.count;
    }

    const updatedStatus = await getCollectionsStatus();

    return {
      success: true,
      status: updatedStatus,
      details: {
        machinerySeeded,
        partsSeeded,
        presupuestosSeeded
      }
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'initialize_all_collections');
  }
}
