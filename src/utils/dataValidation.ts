/**
 * TECNOMAQUINARIAS DIESEL S.R.L. (TMD Dominicana)
 * Utility: Catalog Technical Data Validation Engine
 * Path: src/utils/dataValidation.ts
 * 
 * Verifies that technical parameters extracted from official manufacturer catalogs & PDFs
 * (Horsepower [HP/kW], Torque [Nm/lb-ft], Bucket/Operating Capacities [m3/ton], Operating Weight [kg],
 * Engine models, and DGII pricing) strictly conform to the Firestore schema definitions
 * and security rules constraints before executing atomic bulk migrations.
 */

import { FirestoreMachineSchema, FirestorePartSchema, isValidDocumentId } from '../lib/firestoreInit';

export interface ValidationErrorDetail {
  recordId: string;
  recordName: string;
  brand: string;
  field: string;
  value: any;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface TechnicalSpecMetrics {
  hpVerifiedCount: number;
  torqueVerifiedCount: number;
  capacityVerifiedCount: number;
  weightVerifiedCount: number;
  engineVerifiedCount: number;
  pricingVerifiedCount: number;
}

export interface CatalogValidationReport {
  isValid: boolean;
  canProceedWithMigration: boolean;
  totalRecordsChecked: number;
  machineryCount: number;
  partsCount: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  timestamp: string;
  specMetrics: TechnicalSpecMetrics;
  issues: ValidationErrorDetail[];
  brandSummary: Record<string, {
    total: number;
    valid: number;
    warnings: number;
    errors: number;
    detectedModels: string[];
  }>;
}

/**
 * Bounds & threshold specifications for heavy machinery in the Dominican Republic
 */
export const TECHNICAL_SPEC_BOUNDS = {
  powerHp: {
    min: 15,    // e.g. Compact Excavator (JCB 8008 / Yanmar SV08)
    max: 1200,  // e.g. Ultra Heavy Mining Excavator / Generator
    warningMin: 25,
    warningMax: 800
  },
  operatingWeightKg: {
    min: 500,     // Mini-excavators / compact rollers
    max: 150000,  // Heavy Mining excavators
    warningMin: 1000,
    warningMax: 90000
  },
  bucketCapacityM3: {
    min: 0.02,  // Micro buckets
    max: 12.0,  // Heavy mining quarry buckets
    warningMin: 0.05,
    warningMax: 8.0
  },
  basePriceUsd: {
    min: 1000,
    max: 2000000
  },
  partPriceUsd: {
    min: 1,
    max: 50000
  }
};

// =========================================================================
// 1. SPEC EXTRACTION & PARSING SANITIZERS
// =========================================================================

/**
 * Extracts numeric Horsepower (HP) from numbers, text or kW values
 * e.g. "74 HP", "92 kW (125 hp)", 74.5 -> 74.5
 */
export function extractHorsepower(rawVal: any): { hp: number; isEstimated: boolean } {
  if (typeof rawVal === 'number' && !isNaN(rawVal) && rawVal > 0) {
    return { hp: Math.round(rawVal * 10) / 10, isEstimated: false };
  }

  if (typeof rawVal === 'string') {
    const str = rawVal.trim().toLowerCase();

    // Look for explicit HP / CV / BHP pattern
    const hpMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:hp|cv|bhp|ps|fhp)/i);
    if (hpMatch && hpMatch[1]) {
      return { hp: parseFloat(hpMatch[1]), isEstimated: false };
    }

    // Look for kW and convert (1 kW ≈ 1.341 HP)
    const kwMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:kw|kilowatt)/i);
    if (kwMatch && kwMatch[1]) {
      const kw = parseFloat(kwMatch[1]);
      return { hp: Math.round(kw * 1.34102 * 10) / 10, isEstimated: true };
    }

    // Generic first number if string
    const numMatch = str.match(/^(\d+(?:\.\d+)?)/);
    if (numMatch && numMatch[1]) {
      return { hp: parseFloat(numMatch[1]), isEstimated: false };
    }
  }

  return { hp: 0, isEstimated: false };
}

/**
 * Extracts and checks engine torque specifications
 * e.g. "400 Nm @ 1200 RPM", "550 lb-ft", "440 Nm"
 */
export function extractTorque(rawVal: any): { value: number; unit: 'Nm' | 'lb-ft' | 'kgf-m'; raw: string } | null {
  if (!rawVal) return null;
  const str = String(rawVal).trim();

  const nmMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:nm|n\.m|newton[- ]?meter)/i);
  if (nmMatch && nmMatch[1]) {
    return { value: parseFloat(nmMatch[1]), unit: 'Nm', raw: str };
  }

  const lbftMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:lb[- ]?ft|ft[- ]?lb|lbs[- ]?pie)/i);
  if (lbftMatch && lbftMatch[1]) {
    return { value: parseFloat(lbftMatch[1]), unit: 'lb-ft', raw: str };
  }

  const kgmMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:kgf[- ]?m|kg[- ]?m)/i);
  if (kgmMatch && kgmMatch[1]) {
    return { value: parseFloat(kgmMatch[1]), unit: 'kgf-m', raw: str };
  }

  return null;
}

/**
 * Extracts bucket or operational capacity in m3
 * e.g. "1.1 m3", "0.24 m³", "1.0 - 1.3 m3" -> 1.1
 */
export function extractCapacityM3(rawVal: any): number | null {
  if (typeof rawVal === 'number' && !isNaN(rawVal) && rawVal > 0) {
    return Math.round(rawVal * 100) / 100;
  }

  if (typeof rawVal === 'string') {
    const str = rawVal.trim().toLowerCase();
    const match = str.match(/(\d+(?:\.\d+)?)\s*(?:m3|m³|yd3|yd³|litros|l|gal)/i);
    if (match && match[1]) {
      let val = parseFloat(match[1]);
      if (str.includes('yd') || str.includes('yard')) {
        val = val * 0.764555; // convert yd3 to m3
      }
      return Math.round(val * 100) / 100;
    }

    const firstNum = str.match(/^(\d+(?:\.\d+)?)/);
    if (firstNum && firstNum[1]) {
      return parseFloat(firstNum[1]);
    }
  }

  return null;
}

/**
 * Extracts operating weight in Kilograms (kg)
 * e.g. "8,135 kg", "22.5 ton", "17,900 lbs" -> converted to kg
 */
export function extractOperatingWeightKg(rawVal: any): number {
  if (typeof rawVal === 'number' && !isNaN(rawVal) && rawVal > 0) {
    return Math.round(rawVal);
  }

  if (typeof rawVal === 'string') {
    const cleanStr = rawVal.replace(/,/g, '').trim().toLowerCase();

    // Ton / Toneladas check
    const tonMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*(?:ton|tons|toneladas|t)/i);
    if (tonMatch && tonMatch[1]) {
      const tons = parseFloat(tonMatch[1]);
      return Math.round(tons * 1000);
    }

    // Lbs / Libras check
    const lbsMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*(?:lbs|lb|libras)/i);
    if (lbsMatch && lbsMatch[1]) {
      const lbs = parseFloat(lbsMatch[1]);
      return Math.round(lbs * 0.453592);
    }

    // Kg check
    const kgMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|kilogramos)/i);
    if (kgMatch && kgMatch[1]) {
      return Math.round(parseFloat(kgMatch[1]));
    }

    const firstNum = cleanStr.match(/^(\d+(?:\.\d+)?)/);
    if (firstNum && firstNum[1]) {
      return Math.round(parseFloat(firstNum[1]));
    }
  }

  return 0;
}

// =========================================================================
// 2. INDIVIDUAL DOCUMENT SCHEMA VALIDATORS
// =========================================================================

/**
 * Validates a single Machinery item against the Firestore blueprint schema & physical technical bounds
 */
export function validateMachineryTechnicalSchema(machine: Partial<FirestoreMachineSchema>): {
  isValid: boolean;
  hasWarnings: boolean;
  issues: ValidationErrorDetail[];
  extractedMetrics: {
    hp: number;
    weightKg: number;
    capacityM3?: number;
    torqueSpec?: string;
  };
} {
  const issues: ValidationErrorDetail[] = [];
  const recId = machine.id || 'unknown-id';
  const recName = machine.name || 'Sin Nombre';
  const brand = machine.brand || 'TMD';

  // 1. Document ID Firestore rule validation
  if (!machine.id) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'id',
      value: machine.id,
      rule: 'ID requerido',
      severity: 'error',
      message: 'El registro no posee un identificador de documento único.'
    });
  } else if (!isValidDocumentId(machine.id)) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'id',
      value: machine.id,
      rule: 'isValidDocumentId regex: ^[a-zA-Z0-9_\\-]+$',
      severity: 'error',
      message: `El ID '${machine.id}' contiene caracteres inválidos para las reglas de seguridad de Firestore.`
    });
  }

  // 2. Name & Model Code
  if (!machine.name || machine.name.trim().length === 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'name',
      value: machine.name,
      rule: 'string > 0',
      severity: 'error',
      message: 'Nombre comercial del equipo requerido.'
    });
  }

  if (!machine.modelCode || machine.modelCode.trim().length === 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'modelCode',
      value: machine.modelCode,
      rule: 'string > 0',
      severity: 'warning',
      message: 'Código de modelo de catálogo no especificado (se utilizará ID sanitizado).'
    });
  }

  // 3. Horsepower (HP) Validation
  const { hp } = extractHorsepower(machine.powerHp);
  if (hp <= 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'powerHp',
      value: machine.powerHp,
      rule: `powerHp > 0 (${TECHNICAL_SPEC_BOUNDS.powerHp.min} - ${TECHNICAL_SPEC_BOUNDS.powerHp.max} HP)`,
      severity: 'error',
      message: `Potencia de motor inválida o no detectada (${machine.powerHp}). Debe ser un número mayor a 0.`
    });
  } else if (hp < TECHNICAL_SPEC_BOUNDS.powerHp.min || hp > TECHNICAL_SPEC_BOUNDS.powerHp.max) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'powerHp',
      value: hp,
      rule: `${TECHNICAL_SPEC_BOUNDS.powerHp.min} <= HP <= ${TECHNICAL_SPEC_BOUNDS.powerHp.max}`,
      severity: 'warning',
      message: `La potencia calculada (${hp} HP) está fuera del rango típico de maquinaria pesada.`
    });
  }

  // 4. Operating Weight (Peso Operativo)
  const weightKg = extractOperatingWeightKg(machine.operatingWeightKg);
  if (weightKg <= 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'operatingWeightKg',
      value: machine.operatingWeightKg,
      rule: 'operatingWeightKg > 0',
      severity: 'error',
      message: `Peso operativo no válido (${machine.operatingWeightKg} kg). Requerido para cálculo de flete en RD.`
    });
  } else if (weightKg < TECHNICAL_SPEC_BOUNDS.operatingWeightKg.min || weightKg > TECHNICAL_SPEC_BOUNDS.operatingWeightKg.max) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'operatingWeightKg',
      value: weightKg,
      rule: `${TECHNICAL_SPEC_BOUNDS.operatingWeightKg.min} <= Peso <= ${TECHNICAL_SPEC_BOUNDS.operatingWeightKg.max} kg`,
      severity: 'warning',
      message: `Peso operativo (${weightKg} kg) fuera de los rangos estándares de la gama.`
    });
  }

  // 5. Bucket / Operational Capacity (if applicable)
  let capacityM3: number | undefined = undefined;
  if (machine.bucketCapacityM3 !== undefined && machine.bucketCapacityM3 !== null) {
    const extractedCap = extractCapacityM3(machine.bucketCapacityM3);
    if (extractedCap !== null) {
      capacityM3 = extractedCap;
      if (extractedCap < TECHNICAL_SPEC_BOUNDS.bucketCapacityM3.min || extractedCap > TECHNICAL_SPEC_BOUNDS.bucketCapacityM3.max) {
        issues.push({
          recordId: recId,
          recordName: recName,
          brand,
          field: 'bucketCapacityM3',
          value: extractedCap,
          rule: `${TECHNICAL_SPEC_BOUNDS.bucketCapacityM3.min} <= Capacidad <= ${TECHNICAL_SPEC_BOUNDS.bucketCapacityM3.max} m3`,
          severity: 'warning',
          message: `Capacidad de cuchara o tolva (${extractedCap} m³) atípica para el segmento.`
        });
      }
    }
  }

  // 6. Torque spec in technical attributes array
  let torqueSpec: string | undefined = undefined;
  if (Array.isArray(machine.specs)) {
    const torqueItem = machine.specs.find(s => 
      s.label.toLowerCase().includes('torque') || 
      s.label.toLowerCase().includes('par motor')
    );
    if (torqueItem) {
      torqueSpec = torqueItem.value;
      const parsedTorque = extractTorque(torqueItem.value);
      if (!parsedTorque) {
        issues.push({
          recordId: recId,
          recordName: recName,
          brand,
          field: 'specs.torque',
          value: torqueItem.value,
          rule: 'Formato Torque (e.g. 400 Nm @ 1200 RPM)',
          severity: 'warning',
          message: `El valor de torque '${torqueItem.value}' no incluye unidades de ingeniería estándar (Nm/lb-ft).`
        });
      }
    }
  }

  // 7. Engine Description
  if (!machine.engine || machine.engine.trim().length === 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'engine',
      value: machine.engine,
      rule: 'string > 0',
      severity: 'warning',
      message: 'Especificación de modelo de motor diésel no declarada explícitamente.'
    });
  }

  // 8. Base Price USD & Stock State
  if (typeof machine.basePriceUsd !== 'number' || isNaN(machine.basePriceUsd) || machine.basePriceUsd <= 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'basePriceUsd',
      value: machine.basePriceUsd,
      rule: 'basePriceUsd > 0',
      severity: 'error',
      message: `Precio base en USD inválido (${machine.basePriceUsd}). Se requiere cotización positiva para presupuestos.`
    });
  }

  if (typeof machine.inStock !== 'boolean') {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'inStock',
      value: machine.inStock,
      rule: 'typeof inStock === boolean',
      severity: 'warning',
      message: 'Estado de stock no booleano (se forzará a true por defecto).'
    });
  }

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  return {
    isValid: errors.length === 0,
    hasWarnings: warnings.length > 0,
    issues,
    extractedMetrics: {
      hp,
      weightKg,
      capacityM3,
      torqueSpec
    }
  };
}

/**
 * Validates a single OEM Spare Part item against the Firestore blueprint schema
 */
export function validatePartTechnicalSchema(part: Partial<FirestorePartSchema>): {
  isValid: boolean;
  issues: ValidationErrorDetail[];
} {
  const issues: ValidationErrorDetail[] = [];
  const recId = part.id || 'unknown-part';
  const recName = part.name || 'Sin Nombre';
  const brand = part.brand || 'OEM';

  // 1. ID & Part Number
  if (!part.id || !isValidDocumentId(part.id)) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'id',
      value: part.id,
      rule: 'isValidDocumentId',
      severity: 'error',
      message: 'Identificador de repuesto inválido o ausente.'
    });
  }

  if (!part.partNumber || part.partNumber.trim().length === 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'partNumber',
      value: part.partNumber,
      rule: 'partNumber requerido',
      severity: 'error',
      message: 'Número de parte OEM de fábrica requerido para trazabilidad en almacén Km 22.'
    });
  }

  // 2. Pricing & Stock
  if (typeof part.priceUsd !== 'number' || isNaN(part.priceUsd) || part.priceUsd <= 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'priceUsd',
      value: part.priceUsd,
      rule: 'priceUsd > 0',
      severity: 'error',
      message: `Precio de repuesto inválido ($${part.priceUsd} USD).`
    });
  }

  if (typeof part.stockQty !== 'number' || isNaN(part.stockQty) || part.stockQty < 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'stockQty',
      value: part.stockQty,
      rule: 'stockQty >= 0',
      severity: 'error',
      message: 'Cantidad de existencias en almacén inválida.'
    });
  }

  // 3. Compatible Models
  if (!Array.isArray(part.compatibleModels) || part.compatibleModels.length === 0) {
    issues.push({
      recordId: recId,
      recordName: recName,
      brand,
      field: 'compatibleModels',
      value: part.compatibleModels,
      rule: 'Array.length > 0',
      severity: 'warning',
      message: 'No se han definido modelos de maquinaria compatibles con este repuesto.'
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues
  };
}

// =========================================================================
// 3. MASTER PRE-MIGRATION BATCH VALIDATION FUNCTION
// =========================================================================

/**
 * Validates the entire extracted catalog dataset (Machinery and Parts) before executing bulk Firestore migration.
 * 
 * Generates an exhaustive report detailing field errors, technical metric verifications (HP, torque, capacities),
 * and security rules compliance to prevent migration failures or corrupt database states.
 */
export function validateCatalogBeforeMigration(
  machineryList: Partial<FirestoreMachineSchema>[],
  partsList: Partial<FirestorePartSchema>[] = []
): CatalogValidationReport {
  const allIssues: ValidationErrorDetail[] = [];
  const brandSummary: CatalogValidationReport['brandSummary'] = {};

  const specMetrics: TechnicalSpecMetrics = {
    hpVerifiedCount: 0,
    torqueVerifiedCount: 0,
    capacityVerifiedCount: 0,
    weightVerifiedCount: 0,
    engineVerifiedCount: 0,
    pricingVerifiedCount: 0
  };

  let passedCount = 0;

  // 1. Validate all machinery records
  machineryList.forEach((machine) => {
    const brandKey = machine.brand || 'Otros';
    if (!brandSummary[brandKey]) {
      brandSummary[brandKey] = {
        total: 0,
        valid: 0,
        warnings: 0,
        errors: 0,
        detectedModels: []
      };
    }
    brandSummary[brandKey].total++;
    if (machine.modelCode && !brandSummary[brandKey].detectedModels.includes(machine.modelCode)) {
      brandSummary[brandKey].detectedModels.push(machine.modelCode);
    }

    const valRes = validateMachineryTechnicalSchema(machine);
    allIssues.push(...valRes.issues);

    if (valRes.isValid) {
      passedCount++;
      brandSummary[brandKey].valid++;
    } else {
      brandSummary[brandKey].errors++;
    }

    if (valRes.hasWarnings) {
      brandSummary[brandKey].warnings++;
    }

    // Count verified metrics
    if (valRes.extractedMetrics.hp > 0) specMetrics.hpVerifiedCount++;
    if (valRes.extractedMetrics.weightKg > 0) specMetrics.weightVerifiedCount++;
    if (valRes.extractedMetrics.capacityM3) specMetrics.capacityVerifiedCount++;
    if (valRes.extractedMetrics.torqueSpec) specMetrics.torqueVerifiedCount++;
    if (machine.engine && machine.engine.trim().length > 3) specMetrics.engineVerifiedCount++;
    if (machine.basePriceUsd && machine.basePriceUsd > 0) specMetrics.pricingVerifiedCount++;
  });

  // 2. Validate all parts records
  partsList.forEach((part) => {
    const brandKey = part.brand || 'OEM Parts';
    if (!brandSummary[brandKey]) {
      brandSummary[brandKey] = {
        total: 0,
        valid: 0,
        warnings: 0,
        errors: 0,
        detectedModels: []
      };
    }
    brandSummary[brandKey].total++;

    const valRes = validatePartTechnicalSchema(part);
    allIssues.push(...valRes.issues);

    if (valRes.isValid) {
      passedCount++;
      brandSummary[brandKey].valid++;
    } else {
      brandSummary[brandKey].errors++;
    }
  });

  const totalErrors = allIssues.filter(i => i.severity === 'error').length;
  const totalWarnings = allIssues.filter(i => i.severity === 'warning').length;
  const totalRecords = machineryList.length + partsList.length;

  return {
    isValid: totalErrors === 0,
    canProceedWithMigration: totalErrors === 0,
    totalRecordsChecked: totalRecords,
    machineryCount: machineryList.length,
    partsCount: partsList.length,
    passedCount,
    warningCount: totalWarnings,
    errorCount: totalErrors,
    timestamp: new Date().toISOString(),
    specMetrics,
    issues: allIssues,
    brandSummary
  };
}
