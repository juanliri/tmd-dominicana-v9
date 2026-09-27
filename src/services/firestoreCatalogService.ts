import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Machine, Part, PortalQuote } from '../types';
import { MACHINES_DATA } from '../data/catalog';
import { PARTS_DATA } from '../data/parts';
import { getUnifiedStoreMachinery, getUnifiedStoreParts } from './cdnCatalogLoader';
import { logBulkImportAction } from './auditService';
import firebaseConfig from '../../firebase-applet-config.json';

export interface MaquinariaDoc extends Machine {
  createdAt?: string | any;
  updatedAt?: string | any;
  syncedToFirestore?: boolean;
}

export interface RepuestoDoc extends Part {
  createdAt?: string | any;
  updatedAt?: string | any;
  syncedToFirestore?: boolean;
}

export interface PresupuestoDoc {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientEmail: string;
  clientName: string;
  companyName?: string;
  rncOrCedula?: string;
  ncfType?: string;
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

export interface BulkUploadProgress {
  total: number;
  current: number;
  status: 'idle' | 'in_progress' | 'completed' | 'error';
  collectionName: 'maquinaria' | 'repuestos' | 'presupuestos' | 'all';
  message: string;
  errors: string[];
}

// Technical dataset for initial/sample Presupuestos
export const INITIAL_PRESUPUESTOS_DATA: PresupuestoDoc[] = [
  {
    id: 'pres-2026-001',
    quoteNumber: 'PRF-2026-001-CIB',
    clientId: 'client-tmd-cibao-01',
    clientEmail: 'operaciones@constructoradelcibao.rd',
    clientName: 'Ing. Alejandro Santos',
    companyName: 'Constructora del Cibao S.A.S.',
    rncOrCedula: '1-30-88992-1',
    ncfType: 'B01_CREDITO_FISCAL',
    phone: '(809) 580-4422',
    status: 'approved',
    currency: 'USD',
    subtotal: 89500,
    itbis: 16110,
    total: 105610,
    items: [
      {
        id: 'jcb-3cx-eco',
        name: 'Retroexcavadora JCB 3CX Eco 4x4',
        type: 'machine',
        modelCode: '3CX-ECO-2026',
        quantity: 1,
        unitPriceUsd: 89500,
        subtotalUsd: 89500
      }
    ],
    itemsCount: 1,
    itemsSummary: '1x Retroexcavadora JCB 3CX Eco 4x4 (Tier 3)',
    notes: 'Incluye primer servicio de 250h gratuito y transporte en cama baja hasta Santiago de los Caballeros.',
    validUntil: '2026-10-30',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pres-2026-002',
    quoteNumber: 'PRF-2026-002-ESTE',
    clientId: 'client-tmd-este-02',
    clientEmail: 'logistica@canteraspuntacana.rd',
    clientName: 'Lic. Rafael Valenzuela',
    companyName: 'Canteras y Agregados de Punta Cana S.R.L.',
    rncOrCedula: '1-01-44781-9',
    ncfType: 'B01_CREDITO_FISCAL',
    phone: '(809) 552-9900',
    status: 'in_review',
    currency: 'USD',
    subtotal: 148450,
    itbis: 26721,
    total: 175171,
    items: [
      {
        id: 'liugong-922e',
        name: 'Excavadora Hidráulica LiuGong 922E HD',
        type: 'machine',
        modelCode: 'CLG922E-HD',
        quantity: 1,
        unitPriceUsd: 145000,
        subtotalUsd: 145000
      },
      {
        id: 'part-03-hydraulic-pump',
        name: 'Bomba Hidráulica Principal Doble Pistón Kawasaki',
        type: 'part',
        partNumber: 'KW-K3V112DT-OEM',
        quantity: 1,
        unitPriceUsd: 3450,
        subtotalUsd: 3450
      }
    ],
    itemsCount: 2,
    itemsSummary: '1x Excavadora LiuGong 922E HD + 1x Bomba Kawasaki OEM',
    notes: 'Cotización sujeta a aprobación de línea crediticia bancaria con BHD / Popular.',
    validUntil: '2026-11-15',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pres-2026-003',
    quoteNumber: 'PRF-2026-003-AGRO',
    clientId: 'client-tmd-agro-03',
    clientEmail: 'compras@agroindustriabani.com',
    clientName: 'Ing. Carlos De Los Santos',
    companyName: 'Agropecuaria del Sur Baní',
    rncOrCedula: '1-22-33445-5',
    ncfType: 'B02_CONSUMIDOR_FINAL',
    phone: '(809) 522-1133',
    status: 'submitted',
    currency: 'USD',
    subtotal: 57605,
    itbis: 10368.9,
    total: 67973.9,
    items: [
      {
        id: 'ls-tractor-plus100',
        name: 'Tractor Agrícola LS Tractor Plus 100 4WD',
        type: 'machine',
        modelCode: 'PLUS-100-CAB',
        quantity: 1,
        unitPriceUsd: 56900,
        subtotalUsd: 56900
      },
      {
        id: 'part-01-jcb-filter-kit',
        name: 'Kit de Filtros de Mantenimiento 500H JCB 3CX',
        type: 'part',
        partNumber: 'JCB-320/07155',
        quantity: 2,
        unitPriceUsd: 285,
        subtotalUsd: 570
      },
      {
        id: 'part-05-mann-separator',
        name: 'Filtro Separador de Agua y Diésel Mann-Filter ProVent',
        type: 'part',
        partNumber: 'MF-WK950/21-TMD',
        quantity: 1,
        unitPriceUsd: 135,
        subtotalUsd: 135
      }
    ],
    itemsCount: 3,
    itemsSummary: '1x LS Tractor Plus 100 + Kits de filtros para mantenimiento',
    notes: 'Solicitud con financiamiento agropecuario BAGRICOLA.',
    validUntil: '2026-10-25',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

import { OFFICIAL_MACHINERY_CATALOG } from '../data/officialCatalogs';

// Extended list of machines for bulk seeding to ensure a comprehensive fleet in Firestore
export const EXTENDED_MACHINES_DATA: Machine[] = OFFICIAL_MACHINERY_CATALOG;

// ==========================================
// 1. CARGA MASIVA (BULK UPLOAD) FUNCTIONS
// ==========================================

/**
 * Carga masiva de la flota de maquinaria a Firestore (colección 'maquinaria')
 */
export async function bulkUploadMachinery(
  machines: Machine[] = getUnifiedStoreMachinery(),
  onProgress?: (progress: BulkUploadProgress) => void
): Promise<{ successCount: number; errors: string[] }> {
  const collectionPath = 'maquinaria';
  const errors: string[] = [];
  let successCount = 0;

  try {
    const batchSize = 20;
    const total = machines.length;

    for (let i = 0; i < total; i += batchSize) {
      const chunk = machines.slice(i, i + batchSize);
      const batch = writeBatch(db);

      for (const machine of chunk) {
        const docRef = doc(db, collectionPath, machine.id);
        const payload: MaquinariaDoc = {
          ...machine,
          updatedAt: new Date().toISOString(),
          syncedToFirestore: true,
        };
        batch.set(docRef, payload, { merge: true });
      }

      await batch.commit();
      successCount += chunk.length;

      if (onProgress) {
        onProgress({
          total,
          current: successCount,
          status: 'in_progress',
          collectionName: 'maquinaria',
          message: `Sincronizados ${successCount} de ${total} equipos pesados multimarca en Firestore...`,
          errors,
        });
      }
    }

    return { successCount, errors };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

/**
 * Carga masiva del catálogo de repuestos OEM a Firestore (colección 'repuestos')
 */
export async function bulkUploadParts(
  parts: Part[] = getUnifiedStoreParts(),
  onProgress?: (progress: BulkUploadProgress) => void
): Promise<{ successCount: number; errors: string[] }> {
  const collectionPath = 'repuestos';
  const errors: string[] = [];
  let successCount = 0;

  try {
    const batchSize = 25;
    const total = parts.length;

    for (let i = 0; i < total; i += batchSize) {
      const chunk = parts.slice(i, i + batchSize);
      const batch = writeBatch(db);

      for (const part of chunk) {
        const docRef = doc(db, collectionPath, part.id);
        const payload: RepuestoDoc = {
          ...part,
          updatedAt: new Date().toISOString(),
          syncedToFirestore: true,
        };
        batch.set(docRef, payload, { merge: true });
      }

      await batch.commit();
      successCount += chunk.length;

      if (onProgress) {
        onProgress({
          total,
          current: successCount,
          status: 'in_progress',
          collectionName: 'repuestos',
          message: `Sincronizados ${successCount} de ${total} repuestos OEM e implementos en Firestore...`,
          errors,
        });
      }
    }

    return { successCount, errors };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

/**
 * Carga masiva de presupuestos / cotizaciones a Firestore (colección 'presupuestos')
 */
export async function bulkUploadPresupuestos(
  presupuestos: PresupuestoDoc[] = INITIAL_PRESUPUESTOS_DATA,
  onProgress?: (progress: BulkUploadProgress) => void
): Promise<{ successCount: number; errors: string[] }> {
  const collectionPath = 'presupuestos';
  const errors: string[] = [];
  let successCount = 0;

  try {
    const batch = writeBatch(db);
    const total = presupuestos.length;

    for (const quote of presupuestos) {
      const docRef = doc(db, collectionPath, quote.id);
      batch.set(docRef, quote, { merge: true });
    }

    await batch.commit();
    successCount = total;

    if (onProgress) {
      onProgress({
        total,
        current: total,
        status: 'completed',
        collectionName: 'presupuestos',
        message: `Sincronizados ${total} presupuestos oficiales con RNC/NCF en Firestore.`,
        errors,
      });
    }

    return { successCount, errors };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

/**
 * Ejecución maestra de Carga Masiva para toda la base de datos (Maquinaria + Repuestos + Presupuestos)
 */
export async function executeMasterBulkDataLoad(
  onProgress?: (progress: BulkUploadProgress) => void
): Promise<{
  machineryCount: number;
  partsCount: number;
  presupuestosCount: number;
  totalSynced: number;
}> {
  try {
    if (onProgress) {
      onProgress({
        total: 100,
        current: 5,
        status: 'in_progress',
        collectionName: 'all',
        message: 'Iniciando conexión con Firebase Firestore y preparando lotes...',
        errors: []
      });
    }

    // 1. Cargar Maquinaria Completa Unificada (CDN + Local Fleet)
    const allUnifiedMachines = getUnifiedStoreMachinery();
    const machResult = await bulkUploadMachinery(allUnifiedMachines, (p) => {
      if (onProgress) {
        onProgress({
          total: 100,
          current: Math.round(10 + (p.current / p.total) * 40),
          status: 'in_progress',
          collectionName: 'maquinaria',
          message: `[1/3 Maquinaria] ${p.message}`,
          errors: p.errors
        });
      }
    });

    // 2. Cargar Repuestos y Aditamentos OEM Unificados
    const allUnifiedParts = getUnifiedStoreParts();
    const partsResult = await bulkUploadParts(allUnifiedParts, (p) => {
      if (onProgress) {
        onProgress({
          total: 100,
          current: Math.round(55 + (p.current / p.total) * 35),
          status: 'in_progress',
          collectionName: 'repuestos',
          message: `[2/3 Repuestos] ${p.message}`,
          errors: p.errors
        });
      }
    });

    // 3. Cargar Presupuestos
    const presResult = await bulkUploadPresupuestos(INITIAL_PRESUPUESTOS_DATA, (p) => {
      if (onProgress) {
        onProgress({
          total: 100,
          current: 95,
          status: 'in_progress',
          collectionName: 'presupuestos',
          message: `[3/3 Presupuestos] ${p.message}`,
          errors: p.errors
        });
      }
    });

    if (onProgress) {
      onProgress({
        total: 100,
        current: 100,
        status: 'completed',
        collectionName: 'all',
        message: `¡Carga Masiva Exitosa! ${machResult.successCount} maquinarias, ${partsResult.successCount} repuestos y ${presResult.successCount} presupuestos sincronizados.`,
        errors: []
      });
    }

    const totalSynced = machResult.successCount + partsResult.successCount + presResult.successCount;

    // Record immutable audit log
    await logBulkImportAction({
      collectionName: 'all',
      totalItems: totalSynced,
      summary: `Carga masiva maestra ejecutada: ${machResult.successCount} maquinarias, ${partsResult.successCount} repuestos y ${presResult.successCount} presupuestos registrados en Firestore.`
    });

    return {
      machineryCount: machResult.successCount,
      partsCount: partsResult.successCount,
      presupuestosCount: presResult.successCount,
      totalSynced
    };
  } catch (err) {
    console.error('Master bulk load failure:', err);
    throw err;
  }
}

// ==========================================
// 2. QUERY & SUBSCRIPTION FUNCTIONS
// ==========================================

/**
 * Obtener listado de maquinaria desde Firestore (con fallback a local)
 */
export async function getFirestoreMachinery(): Promise<Machine[]> {
  const collectionPath = 'maquinaria';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    if (snap.empty) {
      return EXTENDED_MACHINES_DATA;
    }
    return snap.docs.map(d => d.data() as Machine);
  } catch (error) {
    console.warn('Fallback to local machinery catalog due to Firestore read error:', error);
    return EXTENDED_MACHINES_DATA;
  }
}

/**
 * Obtener listado de repuestos desde Firestore (con fallback a local)
 */
export async function getFirestoreParts(): Promise<Part[]> {
  const collectionPath = 'repuestos';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    if (snap.empty) {
      return PARTS_DATA;
    }
    return snap.docs.map(d => d.data() as Part);
  } catch (error) {
    console.warn('Fallback to local parts catalog due to Firestore read error:', error);
    return PARTS_DATA;
  }
}

/**
 * Obtener listado de presupuestos desde Firestore
 */
export async function getFirestorePresupuestos(): Promise<PresupuestoDoc[]> {
  const collectionPath = 'presupuestos';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    if (snap.empty) {
      return INITIAL_PRESUPUESTOS_DATA;
    }
    return snap.docs.map(d => d.data() as PresupuestoDoc);
  } catch (error) {
    console.warn('Fallback to initial presupuestos:', error);
    return INITIAL_PRESUPUESTOS_DATA;
  }
}

/**
 * Suscripción en tiempo real a la colección 'maquinaria'
 */
export function subscribeToMachinery(
  callback: (machines: Machine[]) => void,
  onError?: (err: any) => void
): () => void {
  const collectionPath = 'maquinaria';
  return onSnapshot(
    collection(db, collectionPath),
    (snap) => {
      if (snap.empty) {
        callback(EXTENDED_MACHINES_DATA);
      } else {
        const list = snap.docs.map(d => d.data() as Machine);
        callback(list);
      }
    },
    (error) => {
      console.warn('Machinery snapshot subscription warning:', error);
      if (onError) onError(error);
      callback(EXTENDED_MACHINES_DATA);
    }
  );
}

/**
 * Suscripción en tiempo real a la colección 'repuestos'
 */
export function subscribeToParts(
  callback: (parts: Part[]) => void,
  onError?: (err: any) => void
): () => void {
  const collectionPath = 'repuestos';
  return onSnapshot(
    collection(db, collectionPath),
    (snap) => {
      if (snap.empty) {
        callback(PARTS_DATA);
      } else {
        const list = snap.docs.map(d => d.data() as Part);
        callback(list);
      }
    },
    (error) => {
      console.warn('Parts snapshot subscription warning:', error);
      if (onError) onError(error);
      callback(PARTS_DATA);
    }
  );
}

/**
 * Suscripción en tiempo real a la colección 'presupuestos'
 */
export function subscribeToPresupuestos(
  callback: (presupuestos: PresupuestoDoc[]) => void,
  onError?: (err: any) => void
): () => void {
  const collectionPath = 'presupuestos';
  return onSnapshot(
    collection(db, collectionPath),
    (snap) => {
      if (snap.empty) {
        callback(INITIAL_PRESUPUESTOS_DATA);
      } else {
        const list = snap.docs.map(d => d.data() as PresupuestoDoc);
        callback(list);
      }
    },
    (error) => {
      console.warn('Presupuestos snapshot subscription warning:', error);
      if (onError) onError(error);
      callback(INITIAL_PRESUPUESTOS_DATA);
    }
  );
}

/**
 * Crear un nuevo presupuesto directamente en Firestore
 */
export async function saveNewPresupuesto(
  presupuesto: Omit<PresupuestoDoc, 'createdAt' | 'updatedAt'>
): Promise<PresupuestoDoc> {
  const collectionPath = 'presupuestos';
  const fullDoc: PresupuestoDoc = {
    ...presupuesto,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, collectionPath, fullDoc.id);
    await setDoc(docRef, fullDoc);
    return fullDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${fullDoc.id}`);
  }
}

/**
 * Conteo y estadísticas de las colecciones de Firestore
 */
export async function getFirestoreCollectionsStats(): Promise<{
  machineryCount: number;
  partsCount: number;
  presupuestosCount: number;
  databaseId: string;
}> {
  try {
    const [machSnap, partsSnap, presSnap] = await Promise.all([
      getDocs(collection(db, 'maquinaria')).catch(() => ({ size: 0 })),
      getDocs(collection(db, 'repuestos')).catch(() => ({ size: 0 })),
      getDocs(collection(db, 'presupuestos')).catch(() => ({ size: 0 }))
    ]);

    return {
      machineryCount: machSnap.size,
      partsCount: partsSnap.size,
      presupuestosCount: presSnap.size,
      databaseId: firebaseConfig.firestoreDatabaseId || 'default'
    };
  } catch (e) {
    return {
      machineryCount: 0,
      partsCount: 0,
      presupuestosCount: 0,
      databaseId: firebaseConfig.firestoreDatabaseId || 'default'
    };
  }
}
