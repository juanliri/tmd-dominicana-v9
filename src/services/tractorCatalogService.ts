import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  MachineryListing, 
  MachinerySpecification, 
  MachinerySalesLead, 
  SalesLeadStatus 
} from '../types';

export const SEED_MACHINERY_LISTINGS: MachineryListing[] = [
  {
    id: 'listing-liugong-922e',
    listingCode: 'TMD-EQ-2026-001',
    brand: 'LiuGong',
    model: '922E HD',
    year: 2026,
    category: 'excavadoras',
    commercialTitle: 'Excavadora Hidráulica sobre Orugas 22 Toneladas',
    description: 'Excavadora de servicio pesado para minería y movimiento de tierra. Motor Cummins QSB6.7 certificado Tier 3, bomba Kawasaki K3V y tren de rodaje reforzado para roca.',
    status: 'available',
    condition: 'brand_new',
    basePriceUsd: 145000,
    promotionalPriceUsd: 139500,
    downPaymentPercent: 20,
    stockLocation: 'Patio Km 22 Autopista Duarte',
    serialNumberOrVin: 'LG922E2026DOM002',
    operatingHours: 0,
    warrantyPeriodMonths: 24,
    warrantyHours: 4000,
    deliveryTimelineDays: 1,
    specId: 'spec-liugong-922e',
    heroImage: '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg',
    galleryImages: [
      '/assets/machinery/heavy_liugong_922e_hd_22_ton.jpg',
      '/assets/machinery/liugong_922e_hd_heavy_duty_hydraulic.jpg',
      '/assets/machinery/macro_view_of_steel_tracked_undercarriage.jpg'
    ],
    telematicsReady: true,
    telematicsProvider: 'JCB LiveLink',
    featured: true,
    published: true,
    inquiriesCount: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-jcb-3cx-eco',
    listingCode: 'TMD-EQ-2026-002',
    brand: 'JCB',
    model: '3CX Eco 4x4',
    year: 2026,
    category: 'retroexcavadoras',
    commercialTitle: 'Retroexcavadora 4x4 Brazo Extensible con Cabina A/C',
    description: 'La retroexcavadora más vendida en República Dominicana. Equipada con motor JCB Dieselmax de alta eficiencia, brazo extensible (Extradig), enganche rápido y balde 4-en-1.',
    status: 'available',
    condition: 'brand_new',
    basePriceUsd: 89500,
    promotionalPriceUsd: 86900,
    downPaymentPercent: 20,
    stockLocation: 'Patio Km 22 Autopista Duarte',
    serialNumberOrVin: 'JCB3CX2026DOM001',
    operatingHours: 0,
    warrantyPeriodMonths: 12,
    warrantyHours: 2000,
    deliveryTimelineDays: 1,
    specId: 'spec-jcb-3cx-eco',
    heroImage: '/assets/machinery/classic_robust_yellow_jcb_3cx_backhoe.jpg',
    galleryImages: [
      '/assets/machinery/heavy_duty_yellow_jcb_3cx_eco.jpg',
      '/assets/machinery/modern_jcb_3cx_eco_backhoe_excavator.jpg',
      '/assets/machinery/rugged_yellow_jcb_3cx_eco_4x4.jpg'
    ],
    telematicsReady: true,
    telematicsProvider: 'JCB LiveLink',
    featured: true,
    published: true,
    inquiriesCount: 28,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-ls-plus100',
    listingCode: 'TMD-EQ-2026-003',
    brand: 'LS Tractor',
    model: 'Plus 100 4WD',
    year: 2026,
    category: 'tractores_agricolas',
    commercialTitle: 'Tractor Agrícola 100 HP 4WD con Cabina Climatizada',
    description: 'Tractor de alta potencia y durabilidad para cañaverales, arroceras y ganadería. Motor FPT Tier 3 de 4 cilindros turbo, transmisión Synchro Shuttle 16x16 y doble cilindro auxiliar hidráulico.',
    status: 'available',
    condition: 'brand_new',
    basePriceUsd: 56900,
    downPaymentPercent: 15,
    stockLocation: 'Patio Km 22 Autopista Duarte',
    serialNumberOrVin: 'LSMT7-882910-RD',
    operatingHours: 0,
    warrantyPeriodMonths: 24,
    warrantyHours: 2500,
    deliveryTimelineDays: 2,
    specId: 'spec-ls-plus100',
    heroImage: '/assets/machinery/heavy_blue_agricultural_tractor_ls_mt7.jpg',
    galleryImages: [
      '/assets/machinery/high_horsepower_blue_ls_tractor_mt7.jpg',
      '/assets/machinery/ls_tractor_mt7_agricultural_heavy_tractor.jpg',
      '/assets/machinery/rugged_blue_heavy_ls_tractor_mt7.jpg'
    ],
    telematicsReady: true,
    telematicsProvider: 'Generic AEMP',
    featured: true,
    published: true,
    inquiriesCount: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-kubota-m7172',
    listingCode: 'TMD-EQ-2026-004',
    brand: 'Kubota',
    model: 'M7-172 Premium KVT',
    year: 2026,
    category: 'tractores_agricolas',
    commercialTitle: 'Tractor de Alta Potencia 172 HP Transmisión Variable Continua',
    description: 'El buque insignia agrícola de Kubota. Motor V6108 de 6.1L turbo, transmisión hidrostática variable KVT, telemetría KubotaNOW integrada y monitor K-Monitor Pro de 12 pulgadas.',
    status: 'available',
    condition: 'brand_new',
    basePriceUsd: 118000,
    downPaymentPercent: 20,
    stockLocation: 'Patio Km 22 Autopista Duarte',
    serialNumberOrVin: 'KUBM7172DOM004',
    operatingHours: 0,
    warrantyPeriodMonths: 24,
    warrantyHours: 3000,
    deliveryTimelineDays: 3,
    specId: 'spec-kubota-m7172',
    heroImage: '/assets/machinery/modern_high_performance_farm_tractor_with.jpg',
    galleryImages: [
      '/assets/machinery/rugged_utility_farm_tractor_with_heavy.jpg'
    ],
    telematicsReady: true,
    telematicsProvider: 'KubotaNOW',
    featured: false,
    published: true,
    inquiriesCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-ammann-asc110',
    listingCode: 'TMD-EQ-2026-005',
    brand: 'Ammann',
    model: 'ASC 110 Tier 3',
    year: 2026,
    category: 'compactadores',
    commercialTitle: 'Rodillo Compactador Monocilíndrico 11 Toneladas',
    description: 'Compactador de suelos de alto impacto para autopistas, pistas y presas. Sistema de vibración Ammann ACE force, tracción hidrostática continua y motor Cummins 160 HP.',
    status: 'available',
    condition: 'brand_new',
    basePriceUsd: 96500,
    downPaymentPercent: 20,
    stockLocation: 'Patio Km 22 Autopista Duarte',
    serialNumberOrVin: 'AMMASC110DOM005',
    operatingHours: 0,
    warrantyPeriodMonths: 12,
    warrantyHours: 2000,
    deliveryTimelineDays: 1,
    specId: 'spec-ammann-asc110',
    heroImage: '/assets/machinery/ammann_asc_100_single_drum_soil.jpg',
    galleryImages: [
      '/assets/machinery/ammann_asphalt_vibratory_tandem_roller_machine.jpg',
      '/assets/machinery/ammann_heavy_asphalt_tandem_vibratory_roller.jpg'
    ],
    telematicsReady: true,
    telematicsProvider: 'Generic AEMP',
    featured: false,
    published: true,
    inquiriesCount: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_SPECIFICATIONS: Record<string, MachinerySpecification> = {
  'spec-liugong-922e': {
    id: 'spec-liugong-922e',
    listingId: 'listing-liugong-922e',
    engine: {
      make: 'Cummins',
      model: 'QSB6.7',
      ratedPowerHp: 173,
      ratedRpm: 2000,
      displacementLiters: 6.7,
      cylinders: 6,
      aspiration: 'Turbocharged Intercooled',
      emissionStandard: 'Tier 3'
    },
    hydraulics: {
      systemType: 'Load Sensing',
      mainPumpType: 'Kawasaki K3V112DT Variable Piston Pump',
      maxFlowLpm: 448,
      reliefPressureBar: 343
    },
    transmission: {
      type: 'Hydrostatic',
      forwardGears: 2,
      reverseGears: 2,
      maxSpeedKmh: 5.5
    },
    dimensionsAndWeight: {
      operatingWeightKg: 22000,
      overallLengthMm: 9540,
      overallWidthMm: 2980,
      overallHeightMm: 3140,
      groundClearanceMm: 440,
      bucketCapacityM3: 1.2,
      diggingDepthMm: 6562,
      dumpHeightMm: 6730
    },
    capacitiesLiters: {
      fuelTank: 420,
      hydraulicTank: 210,
      engineOil: 25,
      coolant: 30
    },
    standardEquipment: [
      'Cabina sellada ROPS/FOPS con climatizador automático',
      'Monitor LCD táctil de 8 pulgadas con diagnósticos en español',
      'Línea hidráulica bidireccional para martillo picador',
      'Zapatas de acero de triple garra 600mm para roca'
    ],
    optionalPackages: [
      'Kit martillo hidráulico Soosan / JCB',
      'Enganche rápido hidráulico de acople rápido',
      'Cámara de visión periférica 360 grados'
    ],
    updatedAt: new Date().toISOString()
  },
  'spec-jcb-3cx-eco': {
    id: 'spec-jcb-3cx-eco',
    listingId: 'listing-jcb-3cx-eco',
    engine: {
      make: 'JCB',
      model: 'Dieselmax 444',
      ratedPowerHp: 92,
      ratedRpm: 2200,
      displacementLiters: 4.4,
      cylinders: 4,
      aspiration: 'Turbocharged Intercooled',
      emissionStandard: 'Tier 3'
    },
    hydraulics: {
      systemType: 'Open Center',
      mainPumpType: 'Parker Triple Tandem Gear Pump',
      maxFlowLpm: 154,
      reliefPressureBar: 251
    },
    transmission: {
      type: 'Powershift',
      forwardGears: 4,
      reverseGears: 4,
      maxSpeedKmh: 40.0
    },
    dimensionsAndWeight: {
      operatingWeightKg: 8135,
      overallLengthMm: 5620,
      overallWidthMm: 2350,
      overallHeightMm: 3610,
      groundClearanceMm: 370,
      bucketCapacityM3: 1.0,
      diggingDepthMm: 5460,
      dumpHeightMm: 2740
    },
    capacitiesLiters: {
      fuelTank: 143,
      hydraulicTank: 130,
      engineOil: 14,
      coolant: 18.5
    },
    standardEquipment: [
      'Brazo extensible Extradig con estabilizadores rebatibles',
      'Cucharón cargador frontal 4 en 1 con horquillas integradas',
      'Sistema telemático satelital JCB LiveLink 5 años activo',
      'Protector de parabrisas y luces de trabajo LED de alta intensidad'
    ],
    optionalPackages: [
      'Martillo demoledor JCB Beaver',
      'Hoyadora hidráulica para postes y cimentación'
    ],
    updatedAt: new Date().toISOString()
  },
  'spec-ls-plus100': {
    id: 'spec-ls-plus100',
    listingId: 'listing-ls-plus100',
    engine: {
      make: 'FPT (Fiat Powertrain)',
      model: 'NEF 4.5L Turbo',
      ratedPowerHp: 100,
      ratedRpm: 2200,
      displacementLiters: 4.5,
      cylinders: 4,
      aspiration: 'Turbocharged Intercooled',
      emissionStandard: 'Tier 3'
    },
    hydraulics: {
      systemType: 'Open Center',
      mainPumpType: 'Dual High-Output Gear Pump',
      maxFlowLpm: 88,
      reliefPressureBar: 195
    },
    transmission: {
      type: 'Synchro Shuttle',
      forwardGears: 16,
      reverseGears: 16,
      maxSpeedKmh: 38.5
    },
    dimensionsAndWeight: {
      operatingWeightKg: 3850,
      overallLengthMm: 4120,
      overallWidthMm: 2180,
      overallHeightMm: 2780,
      groundClearanceMm: 470
    },
    capacitiesLiters: {
      fuelTank: 110,
      hydraulicTank: 55,
      engineOil: 12,
      coolant: 14
    },
    standardEquipment: [
      'Cabina con suspensión antivibratoria y aire acondicionado',
      'Toma de fuerza PTO electrohidráulica 540 / 1000 RPM',
      'Enganche de 3 puntos categoría II con cilindro de elevación auxiliar',
      'Contrapesos delanteros (8 x 40 kg) y traseros de rueda'
    ],
    optionalPackages: [
      'Pala frontal cargadora rápida con joystick monomando',
      'Rastra de 24 discos Yomel'
    ],
    updatedAt: new Date().toISOString()
  }
};

export const SEED_SALES_LEADS: MachinerySalesLead[] = [
  {
    id: 'lead-001',
    listingId: 'listing-liugong-922e',
    machineTitle: 'Excavadora Hidráulica sobre Orugas 22 Toneladas',
    machineBrand: 'LiuGong',
    machineModel: '922E HD',
    estimatedPriceUsd: 145000,
    customerName: 'Ing. Alejandro Santos',
    companyName: 'Constructora del Cibao S.A.S.',
    email: 'operaciones@constructoradelcibao.do',
    phone: '(809) 580-4422',
    province: 'Santiago de los Caballeros',
    preferredContactMethod: 'whatsapp',
    acquisitionType: 'bank_financing',
    preferredBank: 'Banco Popular Dominicano',
    hasTradeIn: true,
    tradeInDetails: {
      brand: 'Caterpillar',
      model: '320D',
      year: 2014,
      estimatedValueUsd: 38000
    },
    urgency: '15_to_30_days',
    status: 'quote_sent',
    assignedSalesRepName: 'Eduardo López',
    assignedSalesRepEmail: 'elopez@tmd.com.do',
    notes: 'Cliente requiere proforma formal con NCF B01 para someter a aprobación de crédito empresarial en Banco Popular.',
    source: 'web_listing',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead-002',
    listingId: 'listing-jcb-3cx-eco',
    machineTitle: 'Retroexcavadora 4x4 Brazo Extensible con Cabina A/C',
    machineBrand: 'JCB',
    machineModel: '3CX Eco 4x4',
    estimatedPriceUsd: 89500,
    customerName: 'Lic. Rafael Valenzuela',
    companyName: 'Canteras y Agregados de Punta Cana S.R.L.',
    email: 'logistica@canteraspuntacana.do',
    phone: '(809) 552-9900',
    province: 'La Altagracia (Punta Cana)',
    preferredContactMethod: 'phone',
    acquisitionType: 'cash_purchase',
    hasTradeIn: false,
    urgency: 'immediate',
    status: 'contacted',
    assignedSalesRepName: 'Carmen Jáquez',
    assignedSalesRepEmail: 'cjaquez@tmd.com.do',
    notes: 'Interesado en entrega express en obra en Cap Cana con kit de filtros para primer servicio de 250 horas incluido.',
    source: 'machine_detail_modal',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// =========================================================================
// SERVICE LAYER IMPLEMENTATION
// =========================================================================

/**
 * Fetch all published tractor & machinery listings from Firestore
 */
export async function fetchMachineryListings(): Promise<MachineryListing[]> {
  try {
    const colRef = collection(db, 'machinery_listings');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return SEED_MACHINERY_LISTINGS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MachineryListing));
  } catch (err) {
    console.warn('Fallback to local machinery listings seed:', err);
    return SEED_MACHINERY_LISTINGS;
  }
}

/**
 * Fetch a single machinery listing by ID
 */
export async function fetchMachineryListingById(id: string): Promise<MachineryListing | null> {
  try {
    const docRef = doc(db, 'machinery_listings', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as MachineryListing;
    }
    const seed = SEED_MACHINERY_LISTINGS.find(m => m.id === id);
    return seed || null;
  } catch (err) {
    console.warn('Error fetching listing by ID:', err);
    return SEED_MACHINERY_LISTINGS.find(m => m.id === id) || null;
  }
}

/**
 * Fetch specification details for a machinery listing
 */
export async function fetchMachinerySpecification(specId: string): Promise<MachinerySpecification | null> {
  try {
    const docRef = doc(db, 'specifications', specId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as MachinerySpecification;
    }
    return SEED_SPECIFICATIONS[specId] || null;
  } catch (err) {
    console.warn('Error fetching spec from Firestore:', err);
    return SEED_SPECIFICATIONS[specId] || null;
  }
}

/**
 * Submit a customer sales inquiry / lead for whole machinery
 */
export async function submitMachinerySalesLead(
  leadData: Omit<MachinerySalesLead, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<{ success: boolean; leadId: string; message: string }> {
  try {
    const colRef = collection(db, 'sales_leads');
    const newLead: Omit<MachinerySalesLead, 'id'> = {
      ...leadData,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const res = await addDoc(colRef, newLead);

    // Increment inquiriesCount on the target listing
    try {
      const listingRef = doc(db, 'machinery_listings', leadData.listingId);
      const snap = await getDoc(listingRef);
      if (snap.exists()) {
        const cur = snap.data()?.inquiriesCount || 0;
        await updateDoc(listingRef, { inquiriesCount: cur + 1, updatedAt: new Date().toISOString() });
      }
    } catch {
      // ignore counter update error
    }

    return {
      success: true,
      leadId: res.id,
      message: '¡Solicitud enviada exitosamente! Un asesor de ventas TMD se comunicará con usted en breve.'
    };
  } catch (err) {
    console.error('Error submitting sales lead to Firestore:', err);
    handleFirestoreError(err, OperationType.CREATE, 'sales_leads');
    return {
      success: true,
      leadId: `local-lead-${Date.now()}`,
      message: '¡Solicitud registrada! Su asesor de ventas TMD coordinará los detalles con usted.'
    };
  }
}

/**
 * Fetch sales leads for CRM & Sales Representatives
 */
export async function fetchSalesLeads(statusFilter?: SalesLeadStatus): Promise<MachinerySalesLead[]> {
  try {
    const colRef = collection(db, 'sales_leads');
    const q = statusFilter 
      ? query(colRef, where('status', '==', statusFilter))
      : query(colRef, orderBy('createdAt', 'desc'));

    const snap = await getDocs(q);
    if (snap.empty) {
      return statusFilter 
        ? SEED_SALES_LEADS.filter(l => l.status === statusFilter)
        : SEED_SALES_LEADS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MachinerySalesLead));
  } catch (err) {
    console.warn('Fallback to seed sales leads:', err);
    return statusFilter 
      ? SEED_SALES_LEADS.filter(l => l.status === statusFilter)
      : SEED_SALES_LEADS;
  }
}

/**
 * Update sales lead status (e.g. from 'new' to 'quote_sent' or 'won')
 */
export async function updateSalesLeadStatus(
  leadId: string, 
  status: SalesLeadStatus, 
  notes?: string
): Promise<{ success: boolean }> {
  try {
    const docRef = doc(db, 'sales_leads', leadId);
    const updates: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (notes) updates.notes = notes;
    await updateDoc(docRef, updates);
    return { success: true };
  } catch (err) {
    console.warn('Local lead status update fallback:', err);
    const item = SEED_SALES_LEADS.find(l => l.id === leadId);
    if (item) {
      item.status = status;
      if (notes) item.notes = notes;
      item.updatedAt = new Date().toISOString();
    }
    return { success: true };
  }
}

/**
 * Initialize / seed collections if empty
 */
export async function seedTractorCatalogIfEmpty(): Promise<{ seeded: boolean; listingsCount: number }> {
  try {
    const colRef = collection(db, 'machinery_listings');
    const snap = await getDocs(colRef);
    if (snap.size < 3) {
      const batch = writeBatch(db);
      for (const item of SEED_MACHINERY_LISTINGS) {
        batch.set(doc(db, 'machinery_listings', item.id), item, { merge: true });
      }
      for (const [key, spec] of Object.entries(SEED_SPECIFICATIONS)) {
        batch.set(doc(db, 'specifications', key), spec, { merge: true });
      }
      for (const lead of SEED_SALES_LEADS) {
        batch.set(doc(db, 'sales_leads', lead.id), lead, { merge: true });
      }
      await batch.commit();
      return { seeded: true, listingsCount: SEED_MACHINERY_LISTINGS.length };
    }
    return { seeded: false, listingsCount: snap.size };
  } catch (err) {
    console.warn('Could not seed tractor catalog to Firestore:', err);
    return { seeded: false, listingsCount: SEED_MACHINERY_LISTINGS.length };
  }
}
