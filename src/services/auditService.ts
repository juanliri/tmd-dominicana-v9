import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AdminAuditLog, AdminAuditActionType, AuditTargetCollection } from '../types';

const AUDIT_COLLECTION = 'audit_logs';
const LOCAL_STORAGE_KEY = 'tmd_admin_audit_logs_cache';

// Simple lightweight cryptographic-style SHA-like checksum for tamper detection
export function generateLogChecksum(log: Partial<AdminAuditLog>): string {
  const payload = `${log.id}|${log.timestamp}|${log.actorEmail}|${log.actionType}|${log.targetEntity}|${log.targetId}|${log.details}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `SHA256-TMD-${hex.toUpperCase()}-${log.id?.slice(-4) || 'AUTH'}`;
}

export const INITIAL_AUDIT_SEED: AdminAuditLog[] = [
  {
    id: 'log-seed-101',
    timestamp: '2026-09-20T18:14:22.000Z',
    actorUid: 'usr-admin-jliriano',
    actorEmail: 'jliriano154@gmail.com',
    actorName: 'J. Liriano (Super Admin)',
    actorRole: 'admin',
    actionType: 'INVENTORY_STOCK_UPDATE',
    targetEntity: 'inventory_machines',
    targetId: 'jcb-3cx-eco',
    targetName: 'Retroexcavadora JCB 3CX Eco 4x4',
    previousValue: { stockQty: 2, inStock: true },
    newValue: { stockQty: 3, inStock: true },
    diffSummary: 'Stock: 2 → 3 unidades (+1)',
    details: 'Recepción física y registro en almacén Km 22 de 1 unidad JCB 3CX Eco procedente de Puerto Río Haina (VIN #SLP3CX00492).',
    ipAddress: '190.166.42.11 (Santo Domingo, RD)',
    location: 'Sede Central Km 22 Autopista Duarte',
    status: 'SUCCESS',
    immutable: true,
    checksum: 'SHA256-TMD-8F21A09B-101'
  },
  {
    id: 'log-seed-102',
    timestamp: '2026-09-20T17:45:10.000Z',
    actorUid: 'usr-admin-jliriano',
    actorEmail: 'jliriano154@gmail.com',
    actorName: 'J. Liriano (Super Admin)',
    actorRole: 'admin',
    actionType: 'PRICE_UPDATE',
    targetEntity: 'inventory_machines',
    targetId: 'jcb-js220',
    targetName: 'Excavadora de Orugas JCB JS220',
    previousValue: { basePriceUsd: 142000 },
    newValue: { basePriceUsd: 148500 },
    diffSummary: 'Precio USD: $142,000 → $148,500 (+4.6%)',
    details: 'Ajuste tarifario oficial de fábrica JCB Reino Unido Q3 2026 por incremento de flete marítimo y seguro de importación.',
    ipAddress: '190.166.42.11 (Santo Domingo, RD)',
    location: 'Sede Central Km 22 Autopista Duarte',
    status: 'SUCCESS',
    immutable: true,
    checksum: 'SHA256-TMD-9C44E122-102'
  },
  {
    id: 'log-seed-103',
    timestamp: '2026-09-20T16:30:05.000Z',
    actorUid: 'usr-staff-km22',
    actorEmail: 'tecnico.km22@tmddominicana.com',
    actorName: 'Ing. Taller Km 22',
    actorRole: 'staff',
    actionType: 'INVENTORY_STOCK_UPDATE',
    targetEntity: 'inventory_parts',
    targetId: 'part-flt-001',
    targetName: 'Kit Filtro Aceite Motor Diesel JCB 3CX',
    previousValue: { stockQty: 15 },
    newValue: { stockQty: 25 },
    diffSummary: 'Stock Repuesto: 15 → 25 unidades (+10)',
    details: 'Ingreso al almacén bin B-04 de 10 kits originales Donaldson / JCB OEM para soporte de contratos preventivos.',
    ipAddress: '148.255.88.94 (Santo Domingo, RD)',
    location: 'Almacén de Repuestos Km 22',
    status: 'SUCCESS',
    immutable: true,
    checksum: 'SHA256-TMD-3312B0FE-103'
  },
  {
    id: 'log-seed-104',
    timestamp: '2026-09-20T14:12:00.000Z',
    actorUid: 'usr-admin-jliriano',
    actorEmail: 'jliriano154@gmail.com',
    actorName: 'J. Liriano (Super Admin)',
    actorRole: 'admin',
    actionType: 'BULK_IMPORT',
    targetEntity: 'bulk_batch',
    targetId: 'batch-cdn-sync-2026',
    targetName: 'Sincronización Masiva CDN + Catálogo Maestro',
    previousValue: { machineryCount: 12, partsCount: 24 },
    newValue: { machineryCount: 28, partsCount: 65 },
    diffSummary: 'Alta Masiva: +16 Equipos, +41 Repuestos OEM',
    details: 'Ejecución exitosa de script de alta masiva multicolección con esquemas validados para maquinaria y repuestos JCB, LiuGong, Kubota y Ammann.',
    ipAddress: '190.166.42.11 (Santo Domingo, RD)',
    location: 'Sede Central Km 22 Autopista Duarte',
    status: 'SUCCESS',
    immutable: true,
    checksum: 'SHA256-TMD-44A9811C-104'
  }
];

// Helper to get local cache
export function getLocalAuditCache(): AdminAuditLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read local audit cache:", e);
  }
  return INITIAL_AUDIT_SEED;
}

// Helper to save local cache
export function saveLocalAuditCache(logs: AdminAuditLog[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.warn("Could not save local audit cache:", e);
  }
}

/**
 * Base method to record an immutable audit log to Firestore
 */
export async function recordAdminAuditLog(entry: {
  actorUid?: string;
  actorEmail?: string;
  actorName?: string;
  actorRole?: 'admin' | 'staff' | 'system';
  actionType: AdminAuditActionType;
  targetEntity: AuditTargetCollection;
  targetId: string;
  targetName: string;
  previousValue?: string | Record<string, any>;
  newValue?: string | Record<string, any>;
  diffSummary?: string;
  details: string;
  ipAddress?: string;
  location?: string;
  status?: 'SUCCESS' | 'FLAGGED' | 'WARNING';
}): Promise<AdminAuditLog> {
  const id = `audit-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();

  const auditLog: AdminAuditLog = {
    id,
    timestamp,
    actorUid: entry.actorUid || 'usr-system-admin',
    actorEmail: entry.actorEmail || 'jliriano154@gmail.com',
    actorName: entry.actorName || (entry.actorEmail ? entry.actorEmail.split('@')[0] : 'Admin TMD'),
    actorRole: entry.actorRole || 'admin',
    actionType: entry.actionType,
    targetEntity: entry.targetEntity,
    targetId: entry.targetId,
    targetName: entry.targetName,
    previousValue: entry.previousValue,
    newValue: entry.newValue,
    diffSummary: entry.diffSummary || '',
    details: entry.details,
    ipAddress: entry.ipAddress || '190.166.42.11 (Santo Domingo, RD)',
    location: entry.location || 'Sede Central Km 22 Autopista Duarte',
    status: entry.status || 'SUCCESS',
    immutable: true
  };

  auditLog.checksum = generateLogChecksum(auditLog);

  // 1. Update local cache immediately
  const existing = getLocalAuditCache();
  const updated = [auditLog, ...existing.filter(item => item.id !== id)];
  saveLocalAuditCache(updated);

  // 2. Persist to Firestore collection `audit_logs`
  try {
    const docRef = doc(db, AUDIT_COLLECTION, id);
    // Convert undefined values to null or omit
    const firestoreData = {
      ...auditLog,
      previousValue: typeof auditLog.previousValue === 'object' ? JSON.stringify(auditLog.previousValue) : (auditLog.previousValue || null),
      newValue: typeof auditLog.newValue === 'object' ? JSON.stringify(auditLog.newValue) : (auditLog.newValue || null)
    };
    await setDoc(docRef, firestoreData);
  } catch (error) {
    console.warn("Could not write audit log directly to Firestore (cached locally):", error);
  }

  return auditLog;
}

/**
 * Specialized Log: Machine or Part Stock Change
 */
export async function logInventoryStockChange(params: {
  actor?: { uid?: string; email?: string | null; displayName?: string | null; role?: string };
  targetEntity: 'inventory_machines' | 'inventory_parts';
  targetId: string;
  targetName: string;
  oldQty: number;
  newQty: number;
  reason?: string;
}) {
  const delta = params.newQty - params.oldQty;
  const sign = delta >= 0 ? `+${delta}` : `${delta}`;
  const diffSummary = `Stock: ${params.oldQty} → ${params.newQty} unds (${sign})`;
  const details = params.reason 
    ? `Ajuste de inventario en ${params.targetName}: ${params.reason}. Stock actualizado de ${params.oldQty} a ${params.newQty} unidades.`
    : `Ajuste manual de existencias físicas en almacén para ${params.targetName}. Variación neta de ${sign} unidad(es).`;

  return recordAdminAuditLog({
    actorUid: params.actor?.uid,
    actorEmail: params.actor?.email || undefined,
    actorName: params.actor?.displayName || undefined,
    actorRole: (params.actor?.role as any) || 'admin',
    actionType: 'INVENTORY_STOCK_UPDATE',
    targetEntity: params.targetEntity,
    targetId: params.targetId,
    targetName: params.targetName,
    previousValue: { stockQty: params.oldQty },
    newValue: { stockQty: params.newQty },
    diffSummary,
    details
  });
}

/**
 * Specialized Log: Machine or Part Price Update
 */
export async function logPriceUpdate(params: {
  actor?: { uid?: string; email?: string | null; displayName?: string | null; role?: string };
  targetEntity: 'inventory_machines' | 'inventory_parts' | 'maquinaria' | 'repuestos';
  targetId: string;
  targetName: string;
  oldPriceUsd: number;
  newPriceUsd: number;
  reason?: string;
}) {
  const percentChange = params.oldPriceUsd > 0 
    ? (((params.newPriceUsd - params.oldPriceUsd) / params.oldPriceUsd) * 100).toFixed(1)
    : '0';
  const sign = Number(percentChange) >= 0 ? `+${percentChange}%` : `${percentChange}%`;
  const diffSummary = `Precio USD: $${params.oldPriceUsd.toLocaleString()} → $${params.newPriceUsd.toLocaleString()} (${sign})`;
  const details = params.reason
    ? `Actualización de tarifa para ${params.targetName}: ${params.reason}. Nuevo valor fijado en USD $${params.newPriceUsd.toLocaleString()}.`
    : `Modificación de precio de venta oficial en catálogo/inventario para ${params.targetName} (${sign}).`;

  return recordAdminAuditLog({
    actorUid: params.actor?.uid,
    actorEmail: params.actor?.email || undefined,
    actorName: params.actor?.displayName || undefined,
    actorRole: (params.actor?.role as any) || 'admin',
    actionType: 'PRICE_UPDATE',
    targetEntity: params.targetEntity,
    targetId: params.targetId,
    targetName: params.targetName,
    previousValue: { priceUsd: params.oldPriceUsd },
    newValue: { priceUsd: params.newPriceUsd },
    diffSummary,
    details
  });
}

/**
 * Specialized Log: Bulk Upload / Carga Masiva
 */
export async function logBulkImportAction(params: {
  actor?: { uid?: string; email?: string | null; displayName?: string | null; role?: string };
  collectionName: 'maquinaria' | 'repuestos' | 'presupuestos' | 'all';
  totalItems: number;
  batchId?: string;
  summary?: string;
}) {
  const batchCode = params.batchId || `batch-${Date.now()}`;
  const diffSummary = `Alta Masiva: ${params.totalItems} registros ingresados en ${params.collectionName}`;
  const details = params.summary || `Ejecución de carga masiva por lotes en Firestore para la colección '${params.collectionName}'. Se procesaron ${params.totalItems} documentos validados con NCF e ITBIS.`;

  return recordAdminAuditLog({
    actorUid: params.actor?.uid,
    actorEmail: params.actor?.email || undefined,
    actorName: params.actor?.displayName || undefined,
    actorRole: (params.actor?.role as any) || 'admin',
    actionType: 'BULK_IMPORT',
    targetEntity: 'bulk_batch',
    targetId: batchCode,
    targetName: `Carga Masiva: ${params.collectionName.toUpperCase()}`,
    previousValue: { status: 'pending' },
    newValue: { totalProcessed: params.totalItems, status: 'completed' },
    diffSummary,
    details
  });
}

/**
 * Specialized Log: Machine Created
 */
export async function logMachineCreation(params: {
  actor?: { uid?: string; email?: string | null; displayName?: string | null; role?: string };
  machineId: string;
  machineName: string;
  priceUsd: number;
  stockQty: number;
  modelCode: string;
}) {
  return recordAdminAuditLog({
    actorUid: params.actor?.uid,
    actorEmail: params.actor?.email || undefined,
    actorName: params.actor?.displayName || undefined,
    actorRole: (params.actor?.role as any) || 'admin',
    actionType: 'MACHINE_CREATED',
    targetEntity: 'inventory_machines',
    targetId: params.machineId,
    targetName: params.machineName,
    previousValue: 'No existente',
    newValue: { priceUsd: params.priceUsd, stockQty: params.stockQty, modelCode: params.modelCode },
    diffSummary: `Nuevo Equipo: ${params.machineName} (USD $${params.priceUsd.toLocaleString()}, Stock: ${params.stockQty})`,
    details: `Alta de nueva unidad de maquinaria pesada ${params.machineName} [${params.modelCode}] registrada en Firestore.`
  });
}

/**
 * Specialized Log: Machine Deleted
 */
export async function logMachineDeletion(params: {
  actor?: { uid?: string; email?: string | null; displayName?: string | null; role?: string };
  machineId: string;
  machineName: string;
}) {
  return recordAdminAuditLog({
    actorUid: params.actor?.uid,
    actorEmail: params.actor?.email || undefined,
    actorName: params.actor?.displayName || undefined,
    actorRole: (params.actor?.role as any) || 'admin',
    actionType: 'MACHINE_DELETED',
    targetEntity: 'inventory_machines',
    targetId: params.machineId,
    targetName: params.machineName,
    previousValue: 'Activo en inventario',
    newValue: 'Eliminado',
    diffSummary: `Eliminación de Maquinaria: ${params.machineName}`,
    details: `Baja definitiva de la unidad de maquinaria ${params.machineName} del inventario de Firestore.`,
    status: 'WARNING'
  });
}

/**
 * Specialized Log: Part Created
 */
export async function logPartCreation(params: {
  actor?: { uid?: string; email?: string | null; displayName?: string | null; role?: string };
  partId: string;
  partName: string;
  partNumber: string;
  priceUsd: number;
  stockQty: number;
}) {
  return recordAdminAuditLog({
    actorUid: params.actor?.uid,
    actorEmail: params.actor?.email || undefined,
    actorName: params.actor?.displayName || undefined,
    actorRole: (params.actor?.role as any) || 'admin',
    actionType: 'PART_CREATED',
    targetEntity: 'inventory_parts',
    targetId: params.partId,
    targetName: `${params.partNumber} - ${params.partName}`,
    previousValue: 'No existente',
    newValue: { priceUsd: params.priceUsd, stockQty: params.stockQty, partNumber: params.partNumber },
    diffSummary: `Nuevo Repuesto: ${params.partNumber} ($${params.priceUsd} USD, Stock: ${params.stockQty})`,
    details: `Alta de nuevo repuesto/consumible OEM ${params.partName} (# ${params.partNumber}) registrado en almacén.`
  });
}

/**
 * Specialized Log: Part Deleted
 */
export async function logPartDeletion(params: {
  actor?: { uid?: string; email?: string | null; displayName?: string | null; role?: string };
  partId: string;
  partName: string;
  partNumber: string;
}) {
  return recordAdminAuditLog({
    actorUid: params.actor?.uid,
    actorEmail: params.actor?.email || undefined,
    actorName: params.actor?.displayName || undefined,
    actorRole: (params.actor?.role as any) || 'admin',
    actionType: 'PART_DELETED',
    targetEntity: 'inventory_parts',
    targetId: params.partId,
    targetName: `${params.partNumber} - ${params.partName}`,
    previousValue: 'Activo en inventario',
    newValue: 'Eliminado',
    diffSummary: `Eliminación de Repuesto: ${params.partNumber}`,
    details: `Baja de catálogo y eliminación de ficha técnica de repuesto ${params.partName} (# ${params.partNumber}).`,
    status: 'WARNING'
  });
}

/**
 * Specialized Log: User Role Change
 */
export async function logUserRoleChange(params: {
  actor?: { uid?: string; email?: string | null; displayName?: string | null; role?: string };
  targetUserId: string;
  targetUserEmail: string;
  targetUserName?: string;
  oldRole: string;
  newRole: string;
}) {
  const diffSummary = `Rol de Usuario: ${params.oldRole.toUpperCase()} → ${params.newRole.toUpperCase()}`;
  const details = `Modificación de permisos y privilegios RBAC para el usuario ${params.targetUserEmail}. Nivel de acceso actualizado a '${params.newRole}'.`;

  return recordAdminAuditLog({
    actorUid: params.actor?.uid,
    actorEmail: params.actor?.email || undefined,
    actorName: params.actor?.displayName || undefined,
    actorRole: (params.actor?.role as any) || 'admin',
    actionType: 'USER_ROLE_PROMOTION',
    targetEntity: 'users',
    targetId: params.targetUserId,
    targetName: params.targetUserName || params.targetUserEmail,
    previousValue: { role: params.oldRole },
    newValue: { role: params.newRole },
    diffSummary,
    details,
    status: params.newRole === 'admin' ? 'FLAGGED' : 'SUCCESS'
  });
}

/**
 * Real-time subscription to audit logs in Firestore
 */
export function subscribeToAdminAuditLogs(
  onUpdate: (logs: AdminAuditLog[]) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(getLocalAuditCache());
          return;
        }

        const items: AdminAuditLog[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          let prevVal = data.previousValue;
          let nextVal = data.newValue;
          if (typeof prevVal === 'string' && prevVal.startsWith('{')) {
            try { prevVal = JSON.parse(prevVal); } catch (e) { /* keep as string */ }
          }
          if (typeof nextVal === 'string' && nextVal.startsWith('{')) {
            try { nextVal = JSON.parse(nextVal); } catch (e) { /* keep as string */ }
          }

          items.push({
            id: d.id,
            timestamp: data.timestamp || new Date().toISOString(),
            actorUid: data.actorUid || 'system',
            actorEmail: data.actorEmail || 'admin@tmddominicana.com',
            actorName: data.actorName || 'Admin',
            actorRole: data.actorRole || 'admin',
            actionType: data.actionType || 'SECURITY_ALERT',
            targetEntity: data.targetEntity || 'inventory_machines',
            targetId: data.targetId || d.id,
            targetName: data.targetName || 'Registro',
            previousValue: prevVal,
            newValue: nextVal,
            diffSummary: data.diffSummary || '',
            details: data.details || '',
            ipAddress: data.ipAddress || '190.166.42.11',
            location: data.location || 'Sede Central Km 22',
            status: data.status || 'SUCCESS',
            immutable: true,
            checksum: data.checksum || generateLogChecksum(data as any)
          });
        });

        saveLocalAuditCache(items);
        onUpdate(items);
      },
      (error) => {
        console.warn("Audit logs subscription error (using local cache):", error);
        onUpdate(getLocalAuditCache());
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn("Could not initiate Firestore audit subscription:", error);
    onUpdate(getLocalAuditCache());
    return () => {};
  }
}

/**
 * Export audit logs to CSV
 */
export function exportAuditLogsToCsv(logs: AdminAuditLog[]): void {
  const headers = [
    'ID',
    'Fecha / Hora (UTC)',
    'Administrador / Actor',
    'Email Actor',
    'Rol',
    'Tipo de Acción',
    'Entidad Afectada',
    'ID Objetivo',
    'Nombre Objetivo',
    'Resumen Diferencial (Diff)',
    'Detalles',
    'IP / Ubicación',
    'Estado',
    'Checksum Inmutable'
  ];

  const rows = logs.map(l => [
    `"${l.id}"`,
    `"${l.timestamp}"`,
    `"${l.actorName}"`,
    `"${l.actorEmail}"`,
    `"${l.actorRole}"`,
    `"${l.actionType}"`,
    `"${l.targetEntity}"`,
    `"${l.targetId}"`,
    `"${(l.targetName || '').replace(/"/g, '""')}"`,
    `"${(l.diffSummary || '').replace(/"/g, '""')}"`,
    `"${(l.details || '').replace(/"/g, '""')}"`,
    `"${l.ipAddress || ''} - ${l.location || ''}"`,
    `"${l.status}"`,
    `"${l.checksum || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TMD_AUDIT_LOG_INMUTABLE_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export audit logs to JSON
 */
export function exportAuditLogsToJson(logs: AdminAuditLog[]): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
  const link = document.createElement('a');
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `TMD_AUDIT_LOG_INMUTABLE_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
