/**
 * TECNOMAQUINARIAS DIESEL S.R.L. (TMD Dominicana)
 * Script: Machinery & Technical Catalog Bulk Data Migration to Firestore
 * Path: src/utils/migration.ts
 * 
 * Implements:
 * 1. Traversing and dynamically loading imported catalog files (e.g., tmd_jcb_catalog_data.js,
 *    tmd_liugong_catalog_data.js, tmd_kubota_catalog_data.js, etc.) as well as local in-house datasets.
 * 2. Strict validation of technical engineering specs (HP, torque, capacity, weight, OEM codes)
 *    using the dataValidation.ts engine and Firestore schema definitions.
 * 3. Chunked atomic bulk writes (writeBatch) to Firestore 'maquinaria' and 'repuestos' collections.
 */

import { doc, writeBatch, collection, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  COLLECTIONS, 
  FirestoreMachineSchema, 
  FirestorePartSchema, 
  isValidDocumentId,
  validateMachinePayload,
  validatePartPayload
} from '../lib/firestoreInit';
import { TMD_CDN_MODULES, CDN_CATALOG_FALLBACK_MACHINES, CdnScriptModule } from '../services/cdnCatalogLoader';
import { EXTENDED_MACHINES_DATA } from '../services/firestoreCatalogService';
import { PARTS_DATA } from '../data/parts';
import { IN_HOUSE_MACHINERY_CATALOG, IN_HOUSE_PARTS_CATALOG } from '../data/inHouseCatalogs';
import { sanitizeFirestoreId } from './firestoreDataMigration';
import { 
  validateCatalogBeforeMigration, 
  validateMachineryTechnicalSchema, 
  validatePartTechnicalSchema,
  CatalogValidationReport,
  extractHorsepower,
  extractOperatingWeightKg,
  extractCapacityM3
} from './dataValidation';

export interface CatalogFileSource {
  id: string;
  fileName: string;
  url: string;
  brand: string;
  globalKey: string;
  alternateKeys?: string[];
  productType: 'machinery' | 'parts' | 'mixed' | 'registry';
  expectedCount?: number;
  loaded: boolean;
  rawCount: number;
  validMachineryCount: number;
  validPartsCount: number;
  items: any[];
}

export interface CatalogMigrationProgress {
  totalItems: number;
  processedItems: number;
  currentFile: string;
  currentBrand: string;
  currentBatch: number;
  totalBatches: number;
  collectionName: string;
  percent: number;
  status: 'idle' | 'scanning' | 'loading_files' | 'validating' | 'in_progress' | 'completed' | 'error';
  message: string;
  logs: string[];
}

export interface CatalogMigrationResult {
  success: boolean;
  totalRecordsProcessed: number;
  machineryCount: number;
  partsCount: number;
  batchesCommitted: number;
  filesTraversed: { fileName: string; brand: string; itemsExtracted: number; status: string }[];
  brandsProcessed: string[];
  targetCollections: string[];
  durationSeconds: number;
  validationReport?: CatalogValidationReport;
  logs: string[];
  errors: string[];
}

export interface MigrationOptions {
  batchSize?: number; // Safe chunk size (default: 50, max: 400 for Firestore batch limits)
  targetCollections?: ('maquinaria' | 'repuestos' | 'inventory_machines' | 'inventory_parts')[];
  brandFilter?: string; // e.g., 'JCB', 'LiuGong', 'Kubota', 'All'
  mirrorToInventory?: boolean; // Also mirror to inventory_machines / inventory_parts
  strictValidation?: boolean; // If true, aborts immediately on critical validation failures (default: true)
  skipValidation?: boolean; // Skip technical schema validation (default: false)
  fetchRemoteScripts?: boolean; // Dynamically inject <script> tags for missing CDN assets (default: true)
  onProgress?: (progress: CatalogMigrationProgress) => void;
}

/**
 * Dynamically loads an external catalog script file (e.g. tmd_jcb_catalog_data.js) if in browser
 */
export async function loadCatalogScriptFile(mod: CdnScriptModule): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const win = window as any;

  // Check if already available in window memory
  if (win[mod.globalKey] || (mod.alternateKeys && mod.alternateKeys.some(k => win[k]))) {
    return true;
  }

  // Check if script tag is already attached in DOM
  const existingScript = document.querySelector(`script[data-tmd-module="${mod.id}"]`);
  if (existingScript) {
    // Wait briefly for execution
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Boolean(win[mod.globalKey] || (mod.alternateKeys && mod.alternateKeys.some(k => win[k]))));
      }, 300);
    });
  }

  return new Promise((resolve) => {
    try {
      const script = document.createElement('script');
      script.src = mod.url;
      script.async = true;
      script.setAttribute('data-tmd-module', mod.id);
      script.setAttribute('data-brand', mod.brand);

      const timeout = setTimeout(() => {
        console.warn(`[TMD-Migration] Script ${mod.url} timed out; fallback catalog will be used.`);
        resolve(false);
      }, 5000);

      script.onload = () => {
        clearTimeout(timeout);
        const hasData = Boolean(win[mod.globalKey] || (mod.alternateKeys && mod.alternateKeys.some(k => win[k])));
        resolve(hasData);
      };

      script.onerror = () => {
        clearTimeout(timeout);
        console.warn(`[TMD-Migration] Failed to load remote script ${mod.url}; relying on verified fallback data.`);
        resolve(false);
      };

      document.head.appendChild(script);
    } catch (e) {
      console.warn(`[TMD-Migration] DOM injection error for ${mod.id}:`, e);
      resolve(false);
    }
  });
}

/**
 * Traverses and inspects all catalog script files and extracts their raw items
 */
export async function traverseAndExtractAllCatalogFiles(
  brandFilter?: string,
  fetchRemote: boolean = true
): Promise<CatalogFileSource[]> {
  const win = typeof window !== 'undefined' ? (window as any) : {};
  const fileSources: CatalogFileSource[] = [];

  for (const mod of TMD_CDN_MODULES) {
    if (brandFilter && brandFilter !== 'All' && mod.brand !== brandFilter && !mod.name.toLowerCase().includes(brandFilter.toLowerCase())) {
      continue;
    }

    const fileName = mod.url.split('/').pop() || `${mod.id}.js`;
    let isLoaded = Boolean(win[mod.globalKey] || (mod.alternateKeys && mod.alternateKeys.some(k => win[k])));

    // If not loaded and fetch remote is requested, attempt dynamic import
    if (!isLoaded && fetchRemote) {
      isLoaded = await loadCatalogScriptFile(mod);
    }

    let rawItems: any[] = [];
    if (win[mod.globalKey]) {
      const raw = win[mod.globalKey];
      rawItems = Array.isArray(raw) ? raw : (raw.items || raw.products || raw.catalog || raw.data || []);
    } else if (mod.alternateKeys) {
      for (const alt of mod.alternateKeys) {
        if (win[alt]) {
          const raw = win[alt];
          rawItems = Array.isArray(raw) ? raw : (raw.items || raw.products || raw.catalog || raw.data || []);
          break;
        }
      }
    }

    let validMachineryCount = 0;
    let validPartsCount = 0;

    rawItems.forEach((item: any) => {
      if (item.partNumber || item.category === 'Filtros' || item.category === 'Aceites' || mod.productType === 'parts') {
        validPartsCount++;
      } else {
        validMachineryCount++;
      }
    });

    fileSources.push({
      id: mod.id,
      fileName,
      url: mod.url,
      brand: mod.brand,
      globalKey: mod.globalKey,
      alternateKeys: mod.alternateKeys,
      productType: mod.productType,
      expectedCount: mod.expectedCount,
      loaded: isLoaded || rawItems.length > 0,
      rawCount: rawItems.length,
      validMachineryCount,
      validPartsCount,
      items: rawItems
    });
  }

  return fileSources;
}

/**
 * Normalizes any raw machinery record into standard FirestoreMachineSchema
 */
export function normalizeMachineryItem(rawItem: any, fallbackBrand: string): FirestoreMachineSchema {
  const brand = String(rawItem.brand || fallbackBrand || 'TMD').trim();
  const rawId = rawItem.id || rawItem.modelCode || rawItem.code || `${brand}-${rawItem.name || 'unit'}`;
  const cleanId = sanitizeFirestoreId(rawId, brand.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Use engineering extraction helpers for precision
  const extractedHp = extractHorsepower(rawItem.powerHp ?? rawItem.hp ?? rawItem.power);
  const extractedWeight = extractOperatingWeightKg(rawItem.operatingWeightKg ?? rawItem.weightKg ?? rawItem.weight ?? rawItem.operatingWeight);
  const extractedCapacity = extractCapacityM3(rawItem.bucketCapacityM3 ?? rawItem.bucketCapacity ?? rawItem.capacity);

  return {
    id: cleanId,
    name: String(rawItem.name || rawItem.title || rawItem.modelName || `${brand} Equipo Pesado`),
    brand,
    category: String(rawItem.category || rawItem.type || 'Excavadoras'),
    modelCode: String(rawItem.modelCode || rawItem.code || rawItem.model || cleanId.toUpperCase()),
    year: Number(rawItem.year || 2026),
    image: String(rawItem.image || rawItem.imageUrl || '/assets/machinery/fleet_of_yellow_earthmoving_excavators_lined.jpg'),
    powerHp: extractedHp.hp || (rawItem.powerHp ? Number(rawItem.powerHp) : 0),
    operatingWeightKg: extractedWeight || (rawItem.operatingWeightKg ? Number(rawItem.operatingWeightKg) : 0),
    bucketCapacityM3: extractedCapacity !== null ? extractedCapacity : (rawItem.bucketCapacityM3 ? Number(rawItem.bucketCapacityM3) : undefined),
    engine: String(rawItem.engine || rawItem.engineModel || 'Motor Diésel Industrial Certificado OEM'),
    description: String(rawItem.description || rawItem.overview || `Unidad certificada ${brand} con respaldo TMD Care y servicio técnico en Km 22 Autopista Duarte.`),
    inStock: rawItem.inStock !== false,
    featured: Boolean(rawItem.featured),
    basePriceUsd: Number(rawItem.basePriceUsd || rawItem.priceUsd || rawItem.price || 45000),
    specs: Array.isArray(rawItem.specs) && rawItem.specs.length > 0 ? rawItem.specs : [
      { label: 'Garantía TMD', value: '2,000 Horas / 1 Año de Fábrica' },
      { label: 'Centro de Servicio', value: 'Km 22, Autopista Duarte, Santo Domingo' },
      { label: 'Soporte de Repuestos', value: 'Almacén Central con Stock Inmediato' }
    ],
    applications: Array.isArray(rawItem.applications) && rawItem.applications.length > 0 ? rawItem.applications : [
      'Construcción y Movimiento de Tierra',
      'Minería, Extracción y Canteras',
      'Desarrollo Agrícola Dominicano'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncedToFirestore: true
  };
}

/**
 * Normalizes any raw spare part record into standard FirestorePartSchema
 */
export function normalizePartItem(rawItem: any, fallbackBrand: string): FirestorePartSchema {
  const brand = String(rawItem.brand || fallbackBrand || 'TMD').trim();
  const partNumber = String(rawItem.partNumber || rawItem.code || rawItem.id || 'OEM-PART').trim();
  const rawId = rawItem.id || `part-${partNumber}`;
  const cleanId = sanitizeFirestoreId(rawId, 'part');

  return {
    id: cleanId,
    partNumber,
    name: String(rawItem.name || rawItem.title || 'Repuesto Genuino Certificado'),
    brand,
    category: String(rawItem.category || rawItem.type || 'Filtros'),
    assemblyId: rawItem.assemblyId ? String(rawItem.assemblyId) : undefined,
    compatibleModels: Array.isArray(rawItem.compatibleModels) && rawItem.compatibleModels.length > 0
      ? rawItem.compatibleModels
      : [`Flota ${brand}`],
    priceUsd: Number(rawItem.priceUsd || rawItem.price || 120),
    stockQty: Number(rawItem.stockQty ?? 15),
    image: String(rawItem.image || rawItem.imageUrl || '/assets/machinery/brand_new_genuine_yellow_and_black.jpg'),
    description: String(rawItem.description || 'Componente genuino OEM con trazabilidad de fábrica.'),
    isOem: rawItem.isOem !== false,
    deliveryTimeHours: Number(rawItem.deliveryTimeHours || 24),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncedToFirestore: true
  };
}

/**
 * Consolidates all datasets: File-based script catalogs + In-house curated collections
 */
export async function consolidateAllCatalogData(
  brandFilter?: string,
  fetchRemote: boolean = true
): Promise<{
  machineryList: FirestoreMachineSchema[];
  partsList: FirestorePartSchema[];
  brands: string[];
  traversedFiles: CatalogFileSource[];
}> {
  const traversedFiles = await traverseAndExtractAllCatalogFiles(brandFilter, fetchRemote);
  const machineMap = new Map<string, FirestoreMachineSchema>();
  const partMap = new Map<string, FirestorePartSchema>();
  const brandsSet = new Set<string>();

  // 1. Process items extracted from traversed catalog files (tmd_jcb_catalog_data.js, etc.)
  traversedFiles.forEach((file) => {
    if (file.items && file.items.length > 0) {
      file.items.forEach((item: any) => {
        if (item.partNumber || item.category === 'Filtros' || item.category === 'Aceites' || file.productType === 'parts') {
          const normPart = normalizePartItem(item, file.brand);
          partMap.set(normPart.id, normPart);
          brandsSet.add(normPart.brand);
        } else {
          const normMach = normalizeMachineryItem(item, file.brand);
          machineMap.set(normMach.id, normMach);
          brandsSet.add(normMach.brand);
        }
      });
    }
  });

  // 2. Process primary In-House Machinery & Parts Catalog (guaranteeing complete offline coverage)
  IN_HOUSE_MACHINERY_CATALOG.forEach((machine: any) => {
    if (!brandFilter || brandFilter === 'All' || machine.brand === brandFilter) {
      const normMach = normalizeMachineryItem(machine, machine.brand);
      if (!machineMap.has(normMach.id)) {
        machineMap.set(normMach.id, normMach);
        brandsSet.add(normMach.brand);
      }
    }
  });

  EXTENDED_MACHINES_DATA.forEach((machine: any) => {
    if (!brandFilter || brandFilter === 'All' || machine.brand === brandFilter) {
      const normMach = normalizeMachineryItem(machine, machine.brand);
      if (!machineMap.has(normMach.id)) {
        machineMap.set(normMach.id, normMach);
        brandsSet.add(normMach.brand);
      }
    }
  });

  CDN_CATALOG_FALLBACK_MACHINES.forEach((machine: any) => {
    if (!brandFilter || brandFilter === 'All' || machine.brand === brandFilter) {
      const normMach = normalizeMachineryItem(machine, machine.brand);
      if (!machineMap.has(normMach.id)) {
        machineMap.set(normMach.id, normMach);
        brandsSet.add(normMach.brand);
      }
    }
  });

  IN_HOUSE_PARTS_CATALOG.forEach((part: any) => {
    if (!brandFilter || brandFilter === 'All' || part.brand === brandFilter) {
      const normPart = normalizePartItem(part, part.brand);
      if (!partMap.has(normPart.id)) {
        partMap.set(normPart.id, normPart);
        brandsSet.add(normPart.brand);
      }
    }
  });

  PARTS_DATA.forEach((part: any) => {
    if (!brandFilter || brandFilter === 'All' || part.brand === brandFilter) {
      const normPart = normalizePartItem(part, part.brand);
      if (!partMap.has(normPart.id)) {
        partMap.set(normPart.id, normPart);
        brandsSet.add(normPart.brand);
      }
    }
  });

  return {
    machineryList: Array.from(machineMap.values()),
    partsList: Array.from(partMap.values()),
    brands: Array.from(brandsSet),
    traversedFiles
  };
}

/**
 * PRIMARY SCRIPT FUNCTION:
 * Recorre archivos de catálogo (tmd_jcb_catalog_data.js, etc.),
 * valida con src/utils/dataValidation.ts y realiza la escritura masiva a Firestore.
 */
export async function migrateMachineryDataToFirestore(
  options: MigrationOptions = {}
): Promise<CatalogMigrationResult> {
  const startTime = Date.now();
  const batchSize = Math.min(Math.max(options.batchSize || 50, 10), 400); // Firestore max batch is 500; 400 is safe
  const targetCollections = options.targetCollections || [COLLECTIONS.MAQUINARIA, COLLECTIONS.REPUESTOS];
  const logs: string[] = [];
  const errors: string[] = [];

  const log = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const line = `[TMD-Migration ${timestamp}] ${msg}`;
    logs.push(line);
    console.log(line);
  };

  log('Iniciando script de migración masiva a Firestore (TECNOMAQUINARIAS DIESEL S.R.L.)...');

  // STEP 1: Traversal of catalog files & consolidation
  log('Recorriendo archivos de datos técnicos importados (tmd_jcb_catalog_data.js, LiuGong, Kubota, etc.)...');
  
  const { machineryList, partsList, brands, traversedFiles } = await consolidateAllCatalogData(
    options.brandFilter,
    options.fetchRemoteScripts !== false
  );

  const filesTraversedSummary = traversedFiles.map(f => ({
    fileName: f.fileName,
    brand: f.brand,
    itemsExtracted: f.rawCount,
    status: f.loaded ? 'Cargado y Extraído' : 'Fallback Local Activo'
  }));

  log(`Archivos examinados: ${traversedFiles.length}. Total consolidado: ${machineryList.length} maquinarias y ${partsList.length} repuestos OEM en ${brands.length} marcas.`);

  const totalMachinery = targetCollections.includes(COLLECTIONS.MAQUINARIA) ? machineryList.length : 0;
  const totalParts = targetCollections.includes(COLLECTIONS.REPUESTOS) ? partsList.length : 0;
  const totalRecords = totalMachinery + totalParts;

  // STEP 2: Strict Technical Schema Validation
  let validationReport: CatalogValidationReport | undefined = undefined;
  if (!options.skipValidation) {
    log('Ejecutando validación técnica estricta (HP, torque, capacidades, pesos y esquemas de Firestore)...');
    
    validationReport = validateCatalogBeforeMigration(
      targetCollections.includes(COLLECTIONS.MAQUINARIA) ? machineryList : [],
      targetCollections.includes(COLLECTIONS.REPUESTOS) ? partsList : []
    );

    log(`Resultado de validación: ${validationReport.passedCount}/${validationReport.totalRecordsChecked} registros válidos. ` +
        `HP: ${validationReport.specMetrics.hpVerifiedCount}, ` +
        `Pesos: ${validationReport.specMetrics.weightVerifiedCount}, ` +
        `Capacidades: ${validationReport.specMetrics.capacityVerifiedCount}, ` +
        `Errores Críticos: ${validationReport.errorCount}, Advertencias: ${validationReport.warningCount}.`);

    if (options.strictValidation !== false && !validationReport.canProceedWithMigration) {
      const errorDetails = validationReport.issues
        .filter(i => i.severity === 'error')
        .slice(0, 5)
        .map(i => `[${i.brand} - ${i.recordName}] Campo '${i.field}': ${i.message}`)
        .join(' | ');

      const abortMsg = `MIGRACIÓN CANCELADA: Se encontraron ${validationReport.errorCount} errores críticos en el esquema: ${errorDetails}`;
      log(abortMsg);
      errors.push(abortMsg);

      return {
        success: false,
        totalRecordsProcessed: 0,
        machineryCount: 0,
        partsCount: 0,
        batchesCommitted: 0,
        filesTraversed: filesTraversedSummary,
        brandsProcessed: brands,
        targetCollections,
        durationSeconds: Number(((Date.now() - startTime) / 1000).toFixed(2)),
        validationReport,
        logs,
        errors
      };
    }
  }

  let processedCount = 0;
  let batchesCommitted = 0;
  const totalBatchesNeeded = Math.ceil(totalMachinery / batchSize) + Math.ceil(totalParts / batchSize);

  const updateProgress = (brand: string, file: string, collName: string, status: 'in_progress' | 'completed' | 'error', msg: string) => {
    if (options.onProgress) {
      const percent = totalRecords > 0 ? Math.min(100, Math.round((processedCount / totalRecords) * 100)) : 100;
      options.onProgress({
        totalItems: totalRecords,
        processedItems: processedCount,
        currentFile: file,
        currentBrand: brand,
        currentBatch: batchesCommitted,
        totalBatches: totalBatchesNeeded,
        collectionName: collName,
        percent,
        status,
        message: msg,
        logs: [...logs]
      });
    }
  };

  try {
    // STEP 3A: Bulk Write to 'maquinaria' collection
    if (targetCollections.includes(COLLECTIONS.MAQUINARIA) && machineryList.length > 0) {
      log(`Iniciando escritura masiva por lotes en colección '${COLLECTIONS.MAQUINARIA}' (${machineryList.length} registros)...`);

      for (let i = 0; i < machineryList.length; i += batchSize) {
        const chunk = machineryList.slice(i, i + batchSize);
        const batch = writeBatch(db);
        const currentBrand = chunk[0]?.brand || 'TMD';

        for (const machine of chunk) {
          const machRef = doc(db, COLLECTIONS.MAQUINARIA, machine.id);
          batch.set(machRef, machine, { merge: true });

          // Mirror to inventory_machines if requested
          if (options.mirrorToInventory || targetCollections.includes(COLLECTIONS.INVENTORY_MACHINES)) {
            const invRef = doc(db, COLLECTIONS.INVENTORY_MACHINES, machine.id);
            batch.set(invRef, {
              ...machine,
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
          log(`Lote #${batchesCommitted} confirmado en Firestore (${chunk.length} equipos guardados en '${COLLECTIONS.MAQUINARIA}').`);
          updateProgress(currentBrand, 'maquinaria', COLLECTIONS.MAQUINARIA, 'in_progress', `Guardando maquinaria (${processedCount}/${totalRecords})...`);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, COLLECTIONS.MAQUINARIA);
        }
      }
    }

    // STEP 3B: Bulk Write to 'repuestos' collection
    if (targetCollections.includes(COLLECTIONS.REPUESTOS) && partsList.length > 0) {
      log(`Iniciando escritura masiva por lotes en colección '${COLLECTIONS.REPUESTOS}' (${partsList.length} repuestos OEM)...`);

      for (let i = 0; i < partsList.length; i += batchSize) {
        const chunk = partsList.slice(i, i + batchSize);
        const batch = writeBatch(db);
        const currentBrand = chunk[0]?.brand || 'TMD';

        for (const part of chunk) {
          const partRef = doc(db, COLLECTIONS.REPUESTOS, part.id);
          batch.set(partRef, part, { merge: true });

          // Mirror to inventory_parts if requested
          if (options.mirrorToInventory || targetCollections.includes(COLLECTIONS.INVENTORY_PARTS)) {
            const invPartRef = doc(db, COLLECTIONS.INVENTORY_PARTS, part.id);
            batch.set(invPartRef, {
              ...part,
              minStockAlert: 3,
              locationBin: 'Almacén Central Km 22 - Pasillo A'
            }, { merge: true });
          }
        }

        try {
          await batch.commit();
          batchesCommitted++;
          processedCount += chunk.length;
          log(`Lote #${batchesCommitted} confirmado en Firestore (${chunk.length} repuestos guardados en '${COLLECTIONS.REPUESTOS}').`);
          updateProgress(currentBrand, 'repuestos', COLLECTIONS.REPUESTOS, 'in_progress', `Guardando repuestos OEM (${processedCount}/${totalRecords})...`);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, COLLECTIONS.REPUESTOS);
        }
      }
    }

    const durationSeconds = Number(((Date.now() - startTime) / 1000).toFixed(2));
    log(`¡Carga masiva completada con éxito en ${durationSeconds}s! Total: ${processedCount} registros escritos en ${batchesCommitted} lotes atómicos.`);
    updateProgress('All', 'all', 'all', 'completed', `¡Migración completada! ${processedCount} registros sincronizados.`);

    return {
      success: true,
      totalRecordsProcessed: processedCount,
      machineryCount: machineryList.length,
      partsCount: partsList.length,
      batchesCommitted,
      filesTraversed: filesTraversedSummary,
      brandsProcessed: brands,
      targetCollections,
      durationSeconds,
      validationReport,
      logs,
      errors
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    log(`ERROR EN MIGRACIÓN MASIVA: ${errorMsg}`);
    errors.push(errorMsg);
    updateProgress('Error', 'error', 'all', 'error', `Error durante la migración: ${errorMsg}`);

    return {
      success: false,
      totalRecordsProcessed: processedCount,
      machineryCount: totalMachinery,
      partsCount: totalParts,
      batchesCommitted,
      filesTraversed: filesTraversedSummary,
      brandsProcessed: brands,
      targetCollections,
      durationSeconds: Number(((Date.now() - startTime) / 1000).toFixed(2)),
      validationReport,
      logs,
      errors
    };
  }
}

/**
 * Runs a strict bulk migration of all catalog files
 */
export async function runStrictCatalogMigration(options?: MigrationOptions): Promise<CatalogMigrationResult> {
  return migrateMachineryDataToFirestore({
    strictValidation: true,
    batchSize: 50,
    ...options
  });
}

/**
 * Runs migration targeting specifically the JCB catalog file (tmd_jcb_catalog_data.js)
 */
export async function migrateJcbCatalogFileStrict(options?: MigrationOptions): Promise<CatalogMigrationResult> {
  return migrateMachineryDataToFirestore({
    brandFilter: 'JCB',
    strictValidation: true,
    batchSize: 50,
    ...options
  });
}

/**
 * Runs migration targeting a specific brand's catalog files
 */
export async function migrateBrandCatalogToFirestore(
  brand: string,
  options?: Omit<MigrationOptions, 'brandFilter'>
): Promise<CatalogMigrationResult> {
  return migrateMachineryDataToFirestore({
    ...options,
    brandFilter: brand
  });
}
