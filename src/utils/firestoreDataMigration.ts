import { writeBatch, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Machine, Part } from '../types';
import { TMD_CDN_MODULES, CdnScriptModule, CDN_CATALOG_FALLBACK_MACHINES, getUnifiedStoreMachinery, getUnifiedStoreParts } from '../services/cdnCatalogLoader';
import { EXTENDED_MACHINES_DATA } from '../services/firestoreCatalogService';
import { PARTS_DATA } from '../data/parts';
import { IN_HOUSE_MACHINERY_CATALOG, IN_HOUSE_PARTS_CATALOG } from '../data/inHouseCatalogs';

export interface GlobalCatalogSource {
  module: CdnScriptModule;
  detectedKey: string | null;
  itemCount: number;
  rawItems: any[];
  status: 'ready' | 'missing_script' | 'empty';
}

export interface MigrationProgress {
  totalItems: number;
  processedItems: number;
  currentBrand: string;
  currentBatch: number;
  totalBatches: number;
  collectionName: string;
  status: 'idle' | 'scanning' | 'migrating' | 'completed' | 'error';
  message: string;
  logs: string[];
  errors: string[];
}

export interface MigrationSummary {
  success: boolean;
  totalProcessed: number;
  machineryCount: number;
  partsCount: number;
  batchesCommitted: number;
  brandBreakdown: Record<string, number>;
  targetCollections: string[];
  durationMs: number;
  logs: string[];
  errors: string[];
}

export interface MigrationOptions {
  targetCollections?: ('maquinaria' | 'repuestos' | 'inventory_machines' | 'inventory_parts')[];
  selectedBrand?: string; // 'All' or specific brand like 'JCB', 'Kubota', etc.
  batchSize?: number; // default 50 (max 450)
  mirrorToInventory?: boolean; // also populate inventory_machines / inventory_parts
  onProgress?: (progress: MigrationProgress) => void;
}

/**
 * Sanitizes an ID to guarantee it conforms to Firestore isValidId rules:
 * - String up to 128 chars
 * - Matches ^[a-zA-Z0-9_\-]+$
 */
export function sanitizeFirestoreId(rawId: string, prefix = 'tmd'): string {
  if (!rawId) {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  }
  const clean = String(rawId)
    .trim()
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const result = clean || `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  return result.slice(0, 120);
}

/**
 * Normalizes raw global data object item into a validated Maquinaria document
 */
export function normalizeRawItemToMachine(item: any, fallbackBrand: string): Machine {
  const brand = String(item.brand || fallbackBrand || 'TMD').trim();
  const rawId = item.id || item.modelCode || item.code || `${brand}-${item.name || 'unit'}`;
  const id = sanitizeFirestoreId(rawId, brand.toLowerCase().replace(/[^a-z0-9]/g, ''));

  return {
    id,
    name: String(item.name || item.title || item.modelName || `${brand} Equipo Pesado`),
    brand: brand as any,
    category: (item.category || item.type || 'Excavadoras') as any,
    modelCode: String(item.modelCode || item.code || item.model || 'TMD-STD'),
    year: Number(item.year || 2026),
    image: String(item.image || item.imageUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1000&q=80'),
    powerHp: Number(item.powerHp || item.hp || item.power || 0),
    operatingWeightKg: Number(item.operatingWeightKg || item.weightKg || item.operatingWeight || 0),
    bucketCapacityM3: item.bucketCapacityM3 ? Number(item.bucketCapacityM3) : undefined,
    engine: String(item.engine || item.engineModel || 'Diésel Industrial Certificado OEM'),
    description: String(item.description || item.overview || `Unidad oficial ${brand} con garantía TMD Care y servicio técnico en Km 22 Autopista Duarte.`),
    inStock: item.inStock !== false,
    featured: Boolean(item.featured),
    basePriceUsd: Number(item.basePriceUsd || item.priceUsd || item.price || 45000),
    specs: Array.isArray(item.specs) ? item.specs : [
      { label: 'Garantía Oficial', value: 'TMD Care 2,000 Horas / 1 Año' },
      { label: 'Centro de Soporte', value: 'Km 22, Autopista Duarte, Santo Domingo' },
      { label: 'Disponibilidad', value: 'Entrega Inmediata / En Stock' }
    ],
    applications: Array.isArray(item.applications) && item.applications.length > 0 
      ? item.applications 
      : ['Construcción de Infraestructura', 'Minería & Canteras', 'Sector Agrícola Dominicano']
  };
}

/**
 * Normalizes raw global data object item into a validated Repuesto document
 */
export function normalizeRawItemToPart(item: any, fallbackBrand: string): Part {
  const brand = String(item.brand || fallbackBrand || 'TMD').trim();
  const partNumber = String(item.partNumber || item.code || item.id || 'OEM-PART').trim();
  const rawId = item.id || `part-${partNumber}`;
  const id = sanitizeFirestoreId(rawId, 'part');

  return {
    id,
    partNumber,
    name: String(item.name || item.title || 'Componente Genuino Certificado'),
    brand,
    category: (item.category || item.type || 'Filtros') as any,
    compatibleModels: Array.isArray(item.compatibleModels) && item.compatibleModels.length > 0
      ? item.compatibleModels
      : [`Equipos ${brand} Series`],
    priceUsd: Number(item.priceUsd || item.price || 120),
    stockQty: Number(item.stockQty ?? 15),
    image: String(item.image || item.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'),
    description: String(item.description || 'Repuesto genuino de alta durabilidad con trazabilidad de fábrica.'),
    isOem: item.isOem !== false,
    deliveryTimeHours: Number(item.deliveryTimeHours || 24),
    assemblyId: item.assemblyId ? (String(item.assemblyId) as any) : undefined
  };
}

function extractRawItemsFromCatalogVal(val: any): any[] {
  if (!val) return [];
  if (typeof val.getAllProducts === 'function') {
    return val.getAllProducts();
  }
  if (val.machines && val.attachments) {
    return [...val.machines, ...val.attachments];
  }
  if (Array.isArray(val)) {
    return val;
  }
  if (Array.isArray(val.items)) return val.items;
  if (Array.isArray(val.products)) return val.products;
  if (Array.isArray(val.catalog)) return val.catalog;
  if (Array.isArray(val.data)) return val.data;
  return [];
}

/**
 * Inspects all global data objects in `window` (e.g. window.TMD_JCB_CATALOG, window.TMD_LIUGONG_CATALOG, etc.)
 */
export function scanGlobalCatalogObjects(): GlobalCatalogSource[] {
  const win = typeof window !== 'undefined' ? (window as any) : {};
  const sources: GlobalCatalogSource[] = [];

  TMD_CDN_MODULES.forEach((mod) => {
    let foundKey: string | null = null;
    let rawItems: any[] = [];

    // 1. Try primary global key
    if (win[mod.globalKey]) {
      foundKey = mod.globalKey;
      rawItems = extractRawItemsFromCatalogVal(win[mod.globalKey]);
    } else if (mod.alternateKeys) {
      // 2. Try alternate keys
      for (const alt of mod.alternateKeys) {
        if (win[alt]) {
          foundKey = alt;
          rawItems = extractRawItemsFromCatalogVal(win[alt]);
          break;
        }
      }
    }

    let status: 'ready' | 'missing_script' | 'empty' = 'ready';
    if (!foundKey) {
      status = 'missing_script';
    } else if (rawItems.length === 0) {
      status = 'empty';
    }

    sources.push({
      module: mod,
      detectedKey: foundKey,
      itemCount: rawItems.length,
      rawItems,
      status
    });
  });

  return sources;
}

/**
 * Extracts all items from global data objects and fallback repositories,
 * returning distinct lists of normalized Machines and Parts.
 */
export function extractAndNormalizeAllCatalogData(brandFilter?: string): {
  machines: Machine[];
  parts: Part[];
  brandCount: Record<string, number>;
  sourceDetails: { name: string; key: string; count: number; origin: 'global_window' | 'local_fallback' }[];
} {
  const sources = scanGlobalCatalogObjects();
  const machineMap = new Map<string, Machine>();
  const partMap = new Map<string, Part>();
  const brandCount: Record<string, number> = {};
  const sourceDetails: { name: string; key: string; count: number; origin: 'global_window' | 'local_fallback' }[] = [];

  sources.forEach((src) => {
    if (brandFilter && brandFilter !== 'All' && src.module.brand !== brandFilter && !src.module.name.includes(brandFilter)) {
      return;
    }

    let items = src.rawItems;
    let origin: 'global_window' | 'local_fallback' = 'global_window';

    // If script not in window, use built-in rich fallback data for that brand
    if (!items || items.length === 0) {
      origin = 'local_fallback';
      if (src.module.brand === 'JCB') {
        items = EXTENDED_MACHINES_DATA.filter(m => m.brand === 'JCB');
      } else if (src.module.brand === 'LiuGong') {
        items = EXTENDED_MACHINES_DATA.filter(m => m.brand === 'LiuGong');
      } else if (src.module.brand === 'Kubota') {
        items = CDN_CATALOG_FALLBACK_MACHINES.filter(m => m.brand === 'Kubota');
      } else if (src.module.brand === 'LS Tractor') {
        items = EXTENDED_MACHINES_DATA.filter(m => m.brand === 'LS Tractor');
      } else if (src.module.brand === 'Yanmar') {
        items = CDN_CATALOG_FALLBACK_MACHINES.filter(m => m.brand === 'Yanmar');
      } else if (src.module.brand === 'Ammann') {
        items = EXTENDED_MACHINES_DATA.filter(m => m.brand === 'Ammann');
      } else if (src.module.brand === 'IMER') {
        items = CDN_CATALOG_FALLBACK_MACHINES.filter(m => m.brand === 'IMER');
      } else if (src.module.brand === 'AFEX') {
        items = CDN_CATALOG_FALLBACK_MACHINES.filter(m => m.brand === 'AFEX');
      } else if (src.module.brand.includes('Yomel')) {
        items = CDN_CATALOG_FALLBACK_MACHINES.filter(m => m.brand === 'Yomel' || m.brand === 'Celli');
      } else {
        items = [];
      }
    }

    sourceDetails.push({
      name: src.module.name,
      key: src.detectedKey || src.module.globalKey,
      count: items.length,
      origin
    });

    items.forEach((raw: any) => {
      // Determine if part or machine
      if (raw.partNumber || src.module.productType === 'parts' || raw.category === 'Filtros' || raw.category === 'Aceites') {
        const part = normalizeRawItemToPart(raw, src.module.brand);
        partMap.set(part.id, part);
        brandCount[part.brand] = (brandCount[part.brand] || 0) + 1;
      } else {
        const machine = normalizeRawItemToMachine(raw, src.module.brand);
        machineMap.set(machine.id, machine);
        brandCount[machine.brand] = (brandCount[machine.brand] || 0) + 1;
      }
    });
  });

  // Always include in-house and fallback catalogs if no specific filter
  if (!brandFilter || brandFilter === 'All') {
    IN_HOUSE_MACHINERY_CATALOG.forEach((m) => {
      const machine = normalizeRawItemToMachine(m, m.brand);
      machineMap.set(machine.id, machine);
      brandCount[machine.brand] = (brandCount[machine.brand] || 0) + 1;
    });

    IN_HOUSE_PARTS_CATALOG.forEach((p) => {
      const part = normalizeRawItemToPart(p, p.brand);
      partMap.set(part.id, part);
      brandCount[part.brand] = (brandCount[part.brand] || 0) + 1;
    });

    PARTS_DATA.forEach((p) => {
      const part = normalizeRawItemToPart(p, p.brand);
      partMap.set(part.id, part);
      brandCount[part.brand] = (brandCount[part.brand] || 0) + 1;
    });
  }

  return {
    machines: Array.from(machineMap.values()),
    parts: Array.from(partMap.values()),
    brandCount,
    sourceDetails
  };
}

/**
 * MASTER MIGRATION FUNCTION:
 * Iterates over global data objects (e.g. tmd_jcb_catalog_data.js) and executes
 * chunked atomic `writeBatch` bulk writes to the provisioned Firestore database.
 */
export async function migrateGlobalCatalogObjectsToFirestore(
  options: MigrationOptions = {}
): Promise<MigrationSummary> {
  const startTime = Date.now();
  const targetCollections = options.targetCollections || ['maquinaria', 'repuestos'];
  const batchSize = Math.min(Math.max(options.batchSize || 50, 10), 450); // Keep safely under 500
  const logs: string[] = [];
  const errors: string[] = [];

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${msg}`;
    logs.push(logEntry);
    console.log(logEntry);
  };

  addLog(`Iniciando escaneo de objetos globales de catálogo (CDN Vercel & Scripts TMD)...`);

  // 1. Scan and normalize data
  const { machines, parts, brandCount, sourceDetails } = extractAndNormalizeAllCatalogData(options.selectedBrand);

  sourceDetails.forEach((src) => {
    addLog(`Fuente detectada: ${src.name} (${src.key}) -> ${src.count} ítems [${src.origin}]`);
  });

  const totalMachines = machines.length;
  const totalParts = parts.length;
  const totalItems = totalMachines + totalParts;

  addLog(`Total consolidado para migración: ${totalMachines} maquinarias y ${totalParts} repuestos OEM.`);

  if (totalItems === 0) {
    const emptySummary: MigrationSummary = {
      success: true,
      totalProcessed: 0,
      machineryCount: 0,
      partsCount: 0,
      batchesCommitted: 0,
      brandBreakdown: brandCount,
      targetCollections,
      durationMs: Date.now() - startTime,
      logs,
      errors: ['No se encontraron productos para migrar con el filtro especificado.']
    };
    return emptySummary;
  }

  let processedCount = 0;
  let batchesCommitted = 0;
  const nowIso = new Date().toISOString();

  // Helper to trigger progress callback
  const notifyProgress = (
    currentBrand: string,
    collectionName: string,
    status: 'scanning' | 'migrating' | 'completed' | 'error',
    message: string
  ) => {
    if (options.onProgress) {
      options.onProgress({
        totalItems,
        processedItems: processedCount,
        currentBrand,
        currentBatch: batchesCommitted,
        totalBatches: Math.ceil(totalMachines / batchSize) + Math.ceil(totalParts / batchSize),
        collectionName,
        status,
        message,
        logs: [...logs],
        errors: [...errors]
      });
    }
  };

  try {
    // ----------------------------------------------------
    // 2. MIGRATE MACHINERY (colección 'maquinaria' y espejo 'inventory_machines')
    // ----------------------------------------------------
    if (targetCollections.includes('maquinaria') && totalMachines > 0) {
      addLog(`Procesando colección 'maquinaria' (${totalMachines} documentos en lotes de ${batchSize})...`);
      
      for (let i = 0; i < totalMachines; i += batchSize) {
        const chunk = machines.slice(i, i + batchSize);
        const batch = writeBatch(db);
        const currentBrand = chunk[0]?.brand || 'TMD';

        for (const machine of chunk) {
          const docPayload = {
            ...machine,
            updatedAt: nowIso,
            syncedToFirestore: true,
            migratedFromGlobalCdn: true
          };

          // Primary collection: 'maquinaria'
          const machDocRef = doc(db, 'maquinaria', machine.id);
          batch.set(machDocRef, docPayload, { merge: true });

          // Optional mirror collection: 'inventory_machines'
          if (options.mirrorToInventory || targetCollections.includes('inventory_machines')) {
            const invDocRef = doc(db, 'inventory_machines', machine.id);
            batch.set(invDocRef, {
              ...docPayload,
              stockQty: 1,
              minStockAlert: 1,
              status: 'available',
              location: 'Patio Principal Km 22 Autopista Duarte'
            }, { merge: true });
          }
        }

        try {
          await batch.commit();
          batchesCommitted++;
          processedCount += chunk.length;
          addLog(`Lote #${batchesCommitted} confirmado: ${chunk.length} equipos pesados sincronizados.`);
          notifyProgress(currentBrand, 'maquinaria', 'migrating', `Sincronizados ${processedCount}/${totalItems} registros...`);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'maquinaria');
        }
      }
    }

    // ----------------------------------------------------
    // 3. MIGRATE PARTS (colección 'repuestos' y espejo 'inventory_parts')
    // ----------------------------------------------------
    if (targetCollections.includes('repuestos') && totalParts > 0) {
      addLog(`Procesando colección 'repuestos' (${totalParts} documentos en lotes de ${batchSize})...`);
      
      for (let i = 0; i < totalParts; i += batchSize) {
        const chunk = parts.slice(i, i + batchSize);
        const batch = writeBatch(db);
        const currentBrand = chunk[0]?.brand || 'TMD';

        for (const part of chunk) {
          const docPayload = {
            ...part,
            updatedAt: nowIso,
            syncedToFirestore: true,
            migratedFromGlobalCdn: true
          };

          // Primary collection: 'repuestos'
          const partDocRef = doc(db, 'repuestos', part.id);
          batch.set(partDocRef, docPayload, { merge: true });

          // Optional mirror collection: 'inventory_parts'
          if (options.mirrorToInventory || targetCollections.includes('inventory_parts')) {
            const invDocRef = doc(db, 'inventory_parts', part.id);
            batch.set(invDocRef, {
              ...docPayload,
              minStockAlert: 3,
              locationBin: 'Pasillo A - Almacén Central Km 22'
            }, { merge: true });
          }
        }

        try {
          await batch.commit();
          batchesCommitted++;
          processedCount += chunk.length;
          addLog(`Lote #${batchesCommitted} confirmado: ${chunk.length} repuestos OEM sincronizados.`);
          notifyProgress(currentBrand, 'repuestos', 'migrating', `Sincronizados ${processedCount}/${totalItems} registros...`);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'repuestos');
        }
      }
    }

    const durationMs = Date.now() - startTime;
    addLog(`¡Migración masiva completada con éxito en ${(durationMs / 1000).toFixed(2)}s! Total: ${processedCount} registros en ${batchesCommitted} lotes atómicos.`);

    notifyProgress('All', 'all', 'completed', `¡Carga masiva completada exitosamente! ${processedCount} documentos procesados.`);

    return {
      success: true,
      totalProcessed: processedCount,
      machineryCount: totalMachines,
      partsCount: totalParts,
      batchesCommitted,
      brandBreakdown: brandCount,
      targetCollections,
      durationMs,
      logs,
      errors
    };
  } catch (globalError: any) {
    const errorMsg = globalError?.message || String(globalError);
    addLog(`ERROR CRÍTICO DURANTE LA MIGRACIÓN: ${errorMsg}`);
    errors.push(errorMsg);

    notifyProgress('Error', 'all', 'error', `Fallo de migración: ${errorMsg}`);

    return {
      success: false,
      totalProcessed: processedCount,
      machineryCount: totalMachines,
      partsCount: totalParts,
      batchesCommitted,
      brandBreakdown: brandCount,
      targetCollections,
      durationMs: Date.now() - startTime,
      logs,
      errors
    };
  }
}
