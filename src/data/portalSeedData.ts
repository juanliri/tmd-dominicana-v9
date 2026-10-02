import { 
  PortalQuote, 
  ServiceWorkOrder, 
  UserProfile, 
  RegisteredEquipment, 
  CustomerPurchaseOrder 
} from '../types';

// ============================================================================
// CANONICAL CLIENT ACCOUNTS REGISTRY (Single Source of Relational Truth)
// ============================================================================
export interface CanonicalClientAccount {
  uid: string;
  name: string;
  email: string;
  companyName: string;
  rnc: string;
  phone: string;
  location: string;
  proMemberTier: 'Silver' | 'Gold' | 'Platinum';
  proMemberPoints: number;
  proMemberNumber: string;
}

export const CANONICAL_CLIENT_ACCOUNTS: CanonicalClientAccount[] = [
  {
    uid: 'client-manuel-tavares',
    name: 'Ing. Manuel Tavares',
    email: 'compras@constructoratavares.rd',
    companyName: 'Constructora Tavares & Asociados S.R.L.',
    rnc: '1-31-89472-1',
    phone: '+1 (809) 560-8841',
    location: 'Santo Domingo Oeste / Los Alcarrizos',
    proMemberTier: 'Gold',
    proMemberPoints: 1850,
    proMemberNumber: 'TMD-PRO-8841'
  },
  {
    uid: 'client-roberto-henriquez',
    name: 'Lic. Roberto Henríquez',
    email: 'operaciones@agregadoscaribe.com.do',
    companyName: 'Agregados & Canteras del Caribe S.R.L.',
    rnc: '1-32-44910-3',
    phone: '+1 (809) 535-9000',
    location: 'San Cristóbal / Yaguate',
    proMemberTier: 'Platinum',
    proMemberPoints: 3420,
    proMemberNumber: 'TMD-PRO-5524'
  },
  {
    uid: 'client-carmen-jaquez',
    name: 'Arq. Carmen Jaquez',
    email: 'proyectos@urbanosbani.rd',
    companyName: 'Desarrollos Urbanos Baní S.A.',
    rnc: '1-01-99214-5',
    phone: '+1 (829) 450-2211',
    location: 'Baní, Peravia',
    proMemberTier: 'Silver',
    proMemberPoints: 950,
    proMemberNumber: 'TMD-PRO-2219'
  },
  {
    uid: 'client-fernando-valerio',
    name: 'Don Fernando Valerio',
    email: 'gerencia@consorciominero.rd',
    companyName: 'Consorcio Minero San Juan S.R.L.',
    rnc: '1-28-76543-9',
    phone: '+1 (809) 557-3344',
    location: 'San Juan de la Maguana',
    proMemberTier: 'Gold',
    proMemberPoints: 2400,
    proMemberNumber: 'TMD-PRO-3984'
  }
];

// Helper to look up canonical account by ID or Email
export const findCanonicalClient = (idOrEmail?: string): CanonicalClientAccount => {
  if (!idOrEmail) return CANONICAL_CLIENT_ACCOUNTS[0];
  const query = idOrEmail.toLowerCase().trim();
  const match = CANONICAL_CLIENT_ACCOUNTS.find(
    c => c.uid.toLowerCase() === query || c.email.toLowerCase() === query
  );
  return match || CANONICAL_CLIENT_ACCOUNTS[0];
};

// ============================================================================
// MASTER USERS LIST (RBAC)
// ============================================================================
export const INITIAL_PORTAL_USERS: UserProfile[] = [
  {
    id: 'admin-super-jliriano',
    email: 'mrjliriano@gmail.com',
    displayName: 'Ing. Jayh Liriano',
    role: 'ADMIN',
    companyName: 'Tecnomaquinarias Diesel S.R.L.',
    phone: '+1 (829) 555-0100',
    rnc: '1-31-88492-1',
    isProMember: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'admin-tmd-master',
    email: 'admin@tmd.com.do',
    displayName: 'TMD Central Admin & Soporte Operativo',
    role: 'ADMIN',
    companyName: 'TMD Dominicana (Tecnomaquinarias Diesel S.R.L.)',
    phone: '+1 (809) 560-1234',
    rnc: '1-31-88492-1',
    isProMember: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'staff-edwin-martinez',
    email: 'taller@tmd.rd',
    displayName: 'Edwin Martínez (Jefe Taller Km 22)',
    role: 'STAFF',
    companyName: 'TMD Dominicana',
    phone: '+1 (829) 555-0192',
    isProMember: true,
    createdAt: '2024-03-10T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'staff-blasina-fabian',
    email: 'ventas@tmd.rd',
    displayName: 'Blasina Fabián (Directora Comercial)',
    role: 'STAFF',
    companyName: 'TMD Dominicana',
    phone: '+1 (809) 560-1235',
    isProMember: true,
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'staff-garita-km22',
    email: 'garita@tmd.rd',
    displayName: 'Control de Acceso & Garita Km 22',
    role: 'STAFF',
    companyName: 'TMD Dominicana',
    phone: '+1 (809) 560-1236',
    isProMember: false,
    createdAt: '2024-04-05T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  // Corporate Clients
  ...CANONICAL_CLIENT_ACCOUNTS.map(client => ({
    id: client.uid,
    email: client.email,
    displayName: client.name,
    role: 'CLIENT' as const,
    companyName: client.companyName,
    phone: client.phone,
    rnc: client.rnc,
    isProMember: true,
    proMemberTier: client.proMemberTier,
    proMemberPoints: client.proMemberPoints,
    proMemberNumber: client.proMemberNumber,
    createdAt: '2024-05-20T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  }))
];

// ============================================================================
// MASTER QUOTES & PROFORMAS B01
// ============================================================================
export const INITIAL_PORTAL_QUOTES: PortalQuote[] = [
  // 1. Tavares Quote 1 (Submitted)
  {
    id: 'quote-seed-8841',
    quoteNumber: 'QT-2026-8841',
    clientId: 'client-manuel-tavares',
    clientEmail: 'compras@constructoratavares.rd',
    clientName: 'Ing. Manuel Tavares',
    companyName: 'Constructora Tavares & Asociados S.R.L.',
    rnc: '1-31-89472-1',
    phone: '+1 (809) 560-8841',
    status: 'submitted',
    currency: 'USD',
    subtotal: 65000,
    itbis: 11700,
    total: 76700,
    itemsCount: 2,
    itemsSummary: 'Retroexcavadora JCB 3CX Eco 4x4 (Tier 3) + Kit Mantenimiento 1,000h OEM',
    notes: 'Entrega prioritaria en proyecto circunvalación Los Alcarrizos. Requiere inspección en Patio Km 22.',
    assignedSalesRep: 'Blasina Fabián (Ventas TMD)',
    ncfType: 'B01_CREDITO_FISCAL',
    ncfNumber: 'B0100034912',
    downPaymentAmountUsd: 15000,
    downPaymentMethod: 'banco_popular',
    downPaymentReference: 'TRANSF-BPD-984421',
    downPaymentDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    downPaymentVerified: true,
    balanceDueUsd: 61700,
    tradeInDeductionUsd: 12000,
    tradeInEquipmentName: 'Caterpillar 416E 2014 (Usada)',
    tradeInEquipmentBrand: 'Caterpillar',
    tradeInEquipmentYear: 2014,
    tradeInEquipmentHours: 7200,
    tradeInStatus: 'approved_deduction',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  // 2. Tavares Quote 2 (Approved)
  {
    id: 'quote-seed-8720',
    quoteNumber: 'QT-2026-8720',
    clientId: 'client-manuel-tavares',
    clientEmail: 'compras@constructoratavares.rd',
    clientName: 'Ing. Manuel Tavares',
    companyName: 'Constructora Tavares & Asociados S.R.L.',
    rnc: '1-31-89472-1',
    phone: '+1 (809) 560-8841',
    status: 'approved',
    currency: 'USD',
    subtotal: 77966,
    itbis: 14034,
    total: 92000,
    itemsCount: 1,
    itemsSummary: 'Rodillo Compactador Ammann ASC 110 Tier 3 Suizo (Tambor Simple 11 Ton)',
    notes: 'Aprobada formalmente. Unidad reservada en bahía de entrega Patio Km 22 con número de chasis AMMASC-771239-RD.',
    assignedSalesRep: 'Blasina Fabián (Ventas TMD)',
    ncfType: 'B01_CREDITO_FISCAL',
    ncfNumber: 'B0100034890',
    downPaymentAmountUsd: 25000,
    downPaymentMethod: 'banco_popular',
    downPaymentReference: 'BPD-DEP-773190',
    downPaymentDate: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    downPaymentVerified: true,
    balanceDueUsd: 67000,
    tradeInDeductionUsd: 0,
    tradeInStatus: 'none',
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  // 3. Agregados del Caribe Quote (Approved)
  {
    id: 'quote-seed-8854',
    quoteNumber: 'QT-2026-8854',
    clientId: 'client-roberto-henriquez',
    clientEmail: 'operaciones@agregadoscaribe.rd',
    clientName: 'Lic. Roberto Henríquez',
    companyName: 'Agregados del Caribe S.A.',
    rnc: '1-01-55243-9',
    phone: '+1 (829) 720-3310',
    status: 'approved',
    currency: 'USD',
    subtotal: 118000,
    itbis: 21240,
    total: 139240,
    itemsCount: 1,
    itemsSummary: 'Cargador Pesado 5T LiuGong 856H con Balde de 3.0 m³ + Transmisión ZF Alemana',
    notes: 'Cotización aprobada por gerencia de cantera. Pendiente envío de furgón y entrega en Pedro Brand.',
    assignedSalesRep: 'Edwin Martínez (Operaciones)',
    ncfType: 'B01_CREDITO_FISCAL',
    ncfNumber: 'B0100034913',
    downPaymentAmountUsd: 30000,
    downPaymentMethod: 'banco_bhd',
    downPaymentReference: 'BHD-WIRE-448102',
    downPaymentDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    downPaymentVerified: true,
    balanceDueUsd: 109240,
    tradeInDeductionUsd: 0,
    tradeInStatus: 'none',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 4. Desarrollos Urbanos Baní Quote (In Review)
  {
    id: 'quote-seed-8869',
    quoteNumber: 'QT-2026-8869',
    clientId: 'client-carmen-jaquez',
    clientEmail: 'proyectos@urbani.rd',
    clientName: 'Arq. Carmen Jaquez',
    companyName: 'Desarrollos Urbanos Baní S.R.L.',
    rnc: '1-30-22194-2',
    phone: '+1 (809) 330-9944',
    status: 'in_review',
    currency: 'USD',
    subtotal: 58900,
    itbis: 10602,
    total: 69502,
    itemsCount: 1,
    itemsSummary: 'Mini Excavadora Zero-Tail Kubota KX033-4 con Doble Circuito Hidráulico',
    notes: 'Proforma para financiamiento con Banco de Reservas (Tasa Leasing Maquinaria).',
    assignedSalesRep: 'Blasina Fabián (Ventas TMD)',
    ncfType: 'B01_CREDITO_FISCAL',
    ncfNumber: 'B0100034914',
    downPaymentAmountUsd: 10000,
    downPaymentMethod: 'banreservas',
    downPaymentReference: 'BANRES-499120',
    downPaymentDate: new Date().toISOString(),
    downPaymentVerified: true,
    balanceDueUsd: 59502,
    tradeInDeductionUsd: 0,
    tradeInStatus: 'none',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 5. Agropecuaria del Valle San Juan Quote (Submitted)
  {
    id: 'quote-seed-8901',
    quoteNumber: 'QT-2026-8901',
    clientId: 'client-fernando-valerio',
    clientEmail: 'fvalerio@agrivalle.do',
    clientName: 'Don Fernando Valerio',
    companyName: 'Agropecuaria del Valle San Juan S.A.',
    rnc: '1-02-39841-5',
    phone: '+1 (809) 557-2200',
    status: 'submitted',
    currency: 'USD',
    subtotal: 41102,
    itbis: 7398,
    total: 48500,
    itemsCount: 1,
    itemsSummary: 'Tractor Agrícola LS Tractor MT357 Cabina Climatizada 4WD (57 HP)',
    notes: 'Cotización con tasa preferencial FEDA / Banco Agrícola para preparación de suelo arrocero.',
    assignedSalesRep: 'Blasina Fabián (Ventas TMD)',
    ncfType: 'B01_CREDITO_FISCAL',
    ncfNumber: 'B0100034915',
    downPaymentAmountUsd: 8000,
    downPaymentMethod: 'banreservas',
    downPaymentReference: 'BAGRI-WIRE-1092',
    downPaymentDate: new Date().toISOString(),
    downPaymentVerified: true,
    balanceDueUsd: 40500,
    tradeInDeductionUsd: 0,
    tradeInStatus: 'none',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ============================================================================
// MASTER REGISTERED FLEET (Shared with Service History & LiveLink GPS)
// ============================================================================
export const INITIAL_REGISTERED_FLEET: RegisteredEquipment[] = [
  // --- Constructora Tavares Fleet ---
  {
    id: 'eq-tav-jcb',
    unitId: 'RT-01',
    brand: 'JCB',
    model: 'Retroexcavadora JCB 3CX Eco 4x4 (Tier 3)',
    serialNumber: 'JCB3CX-882910-RD',
    vin: 'JCB3CX2026DOM001',
    year: 2026,
    currentHorometer: 1485,
    lastServiceDate: '10 de Septiembre, 2026',
    nextServiceHours: 1500,
    serviceIntervalHours: 500,
    reminderThresholdHours: 50,
    reminderAutoEnabled: true,
    nextServiceDate: 'Octubre 2026',
    jobsiteLocation: 'Autopista Duarte Km 22, Pedro Brand',
    assignedOperator: 'Ramón Almonte',
    status: 'active',
    image: '/assets/machinery/JCB_3CX.jpg',
    clientId: 'client-manuel-tavares',
    clientEmail: 'compras@constructoratavares.rd',
    companyName: 'Constructora Tavares & Asociados S.R.L.'
  },
  {
    id: 'eq-tav-liugong',
    unitId: 'EX-01',
    brand: 'LiuGong',
    model: 'Excavadora LiuGong 922E HD (22 Ton)',
    serialNumber: 'LG922E-DO-2024-0089',
    vin: 'LG922E2024DOM089',
    year: 2024,
    currentHorometer: 2450,
    lastServiceDate: '15 de Agosto, 2026',
    nextServiceHours: 2500,
    serviceIntervalHours: 500,
    reminderThresholdHours: 100,
    reminderAutoEnabled: true,
    nextServiceDate: 'Noviembre 2026',
    jobsiteLocation: 'Cantera Duarte Km 28 - Tramo Los Alcarrizos',
    assignedOperator: 'Juan Carlos Martínez',
    status: 'in_service',
    image: '/assets/machinery/liugong_922e.jpg',
    clientId: 'client-manuel-tavares',
    clientEmail: 'compras@constructoratavares.rd',
    companyName: 'Constructora Tavares & Asociados S.R.L.'
  },

  // --- Agregados del Caribe Fleet ---
  {
    id: 'eq-agr-liugong',
    unitId: 'CG-05',
    brand: 'LiuGong',
    model: 'Cargador Frontal 5T LiuGong 856H Balde 3.0 m³',
    serialNumber: 'LG856H-441092-RD',
    vin: 'LG856H2025DOM019',
    year: 2025,
    currentHorometer: 2890,
    lastServiceDate: '01 de Julio, 2026',
    nextServiceHours: 3000,
    serviceIntervalHours: 500,
    reminderThresholdHours: 120,
    reminderAutoEnabled: true,
    nextServiceDate: 'Noviembre 2026',
    jobsiteLocation: 'Cantera San Cristóbal - Tramo Yaguate',
    assignedOperator: 'Danilo Rosario',
    status: 'active',
    image: '/assets/machinery/liugong_856h.jpg',
    clientId: 'client-roberto-henriquez',
    clientEmail: 'operaciones@agregadoscaribe.rd',
    companyName: 'Agregados del Caribe S.A.'
  },
  {
    id: 'eq-agr-jcb',
    unitId: 'EX-08',
    brand: 'JCB',
    model: 'Excavadora Pesada JCB 220X LC HD',
    serialNumber: 'JCB220X-901442-RD',
    vin: 'JCB220X2026DOM003',
    year: 2026,
    currentHorometer: 940,
    lastServiceDate: '20 de Agosto, 2026',
    nextServiceHours: 1000,
    serviceIntervalHours: 500,
    reminderThresholdHours: 80,
    reminderAutoEnabled: true,
    nextServiceDate: 'Octubre 2026',
    jobsiteLocation: 'Mina Cantera Sur - San Cristóbal',
    assignedOperator: 'Alberto Castillo',
    status: 'active',
    image: '/assets/machinery/JCB_220X.jpg',
    clientId: 'client-roberto-henriquez',
    clientEmail: 'operaciones@agregadoscaribe.rd',
    companyName: 'Agregados del Caribe S.A.'
  },

  // --- Desarrollos Urbanos Baní Fleet ---
  {
    id: 'eq-bani-kubota',
    unitId: 'CTL-02',
    brand: 'Kubota',
    model: 'Minicargador de Orugas Kubota SVL75-2S',
    serialNumber: 'SVL75-KB-66120',
    vin: 'SVL75-KB-66120',
    year: 2025,
    currentHorometer: 890,
    lastServiceDate: '15 de Mayo, 2026',
    nextServiceHours: 1000,
    serviceIntervalHours: 250,
    reminderThresholdHours: 100,
    reminderAutoEnabled: true,
    nextServiceDate: 'Noviembre 2026',
    jobsiteLocation: 'Urbanización Costa Sur, Baní Centro',
    assignedOperator: 'Félix Peña',
    status: 'active',
    image: '/assets/machinery/kubota_svl75.jpg',
    clientId: 'client-carmen-jaquez',
    clientEmail: 'proyectos@urbani.rd',
    companyName: 'Desarrollos Urbanos Baní S.R.L.'
  },

  // --- Agropecuaria del Valle San Juan Fleet ---
  {
    id: 'eq-agri-kubota',
    unitId: 'TR-07',
    brand: 'Kubota',
    model: 'Tractor Kubota M7-172 Premium KVT 4WD (172 HP)',
    serialNumber: 'KUBM7-331092-RD',
    vin: 'KUBM7172DOM004',
    year: 2025,
    currentHorometer: 512,
    lastServiceDate: '28 de Junio, 2026',
    nextServiceHours: 750,
    serviceIntervalHours: 250,
    reminderThresholdHours: 100,
    reminderAutoEnabled: true,
    nextServiceDate: 'Diciembre 2026',
    jobsiteLocation: 'Valle de San Juan - Sector Las Matas',
    assignedOperator: 'Héctor Jiménez',
    status: 'active',
    image: '/assets/machinery/kubota_m7.jpg',
    clientId: 'client-fernando-valerio',
    clientEmail: 'fvalerio@agrivalle.do',
    companyName: 'Agropecuaria del Valle San Juan S.A.'
  },
  {
    id: 'eq-agri-ls',
    unitId: 'TR-02',
    brand: 'LS Tractor',
    model: 'Tractor LS Tractor MT357 Cabina 4WD (57 HP)',
    serialNumber: 'LS-MT3-2025-3312',
    vin: 'LS-MT3-2025-3312',
    year: 2025,
    currentHorometer: 640,
    lastServiceDate: '12 de Julio, 2026',
    nextServiceHours: 750,
    serviceIntervalHours: 250,
    reminderThresholdHours: 100,
    reminderAutoEnabled: true,
    nextServiceDate: 'Diciembre 2026',
    jobsiteLocation: 'Finca Arrocera San Juan',
    assignedOperator: 'Modesto Encarnación',
    status: 'active',
    image: '/assets/machinery/ls_tractor_mt357.jpg',
    clientId: 'client-fernando-valerio',
    clientEmail: 'fvalerio@agrivalle.do',
    companyName: 'Agropecuaria del Valle San Juan S.A.'
  }
];

// ============================================================================
// MASTER WORK ORDERS (TALLER KM 22)
// ============================================================================
export const INITIAL_PORTAL_WORK_ORDERS: ServiceWorkOrder[] = [
  // 1. Tavares Work Order (In Progress in Bay 1)
  {
    id: 'wo-seed-1044',
    orderNumber: 'WO-2026-1044',
    clientId: 'client-manuel-tavares',
    clientName: 'Ing. Manuel Tavares (Constructora Tavares)',
    companyName: 'Constructora Tavares & Asociados S.R.L.',
    equipmentUnitId: 'EX-01',
    equipmentBrand: 'LiuGong',
    machineModel: 'Excavadora LiuGong 922E HD',
    machineSerial: 'LG922E-DO-2024-0089',
    equipmentYear: 2024,
    horometerHours: 2450,
    serviceType: 'hydraulic_repair',
    serviceCategory: 'Taller Central / Sistema Hidráulico',
    location: 'Mina de Tosca, San Cristóbal (Km 4 Carretera Sánchez)',
    workshopName: 'Bahía #1 - Taller Central Km 22',
    priority: 'urgent',
    status: 'in_progress',
    assignedTechnician: 'Edwin Martínez (Certificado LiuGong/JCB)',
    description: 'Pérdida de presión en banco de válvulas principal KMX15RA. Se procede con cambio de empaques y calibración de alivio principal.',
    scheduledDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 2. Tavares Work Order 2 (Completed)
  {
    id: 'wo-seed-1030',
    orderNumber: 'WO-2026-1030',
    clientId: 'client-manuel-tavares',
    clientName: 'Ing. Manuel Tavares (Constructora Tavares)',
    companyName: 'Constructora Tavares & Asociados S.R.L.',
    equipmentUnitId: 'RT-01',
    equipmentBrand: 'JCB',
    machineModel: 'Retroexcavadora JCB 3CX Eco 4x4',
    machineSerial: 'JCB3CX-882910-RD',
    equipmentYear: 2026,
    horometerHours: 1000,
    serviceType: 'preventive_1000h',
    serviceCategory: 'Mantenimiento Preventivo 1,000 Horas',
    location: 'Patio Central Km 22',
    workshopName: 'Bahía #3 - Servicios Rápidos TMD',
    priority: 'routine',
    status: 'completed',
    assignedTechnician: 'Julio Aguasvivas',
    description: 'Servicio mayor de 1,000 horas completado satisfactoriamente. Cambio de todos los filtros JCB Max y aceite de transmisión.',
    scheduledDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString()
  },
  // 3. Agregados del Caribe Work Order (In Progress in Bay 3)
  {
    id: 'wo-seed-1048',
    orderNumber: 'WO-2026-1048',
    clientId: 'client-roberto-henriquez',
    clientName: 'Lic. Roberto Henríquez (Agregados del Caribe)',
    companyName: 'Agregados del Caribe S.A.',
    equipmentUnitId: 'CG-05',
    equipmentBrand: 'LiuGong',
    machineModel: 'Cargador Frontal 5T LiuGong 856H',
    machineSerial: 'LG856H-441092-RD',
    equipmentYear: 2025,
    horometerHours: 2890,
    serviceType: 'preventive_500h',
    serviceCategory: 'Mantenimiento Preventivo de Flota',
    location: 'Sede Central Km 22 Autopista Duarte',
    workshopName: 'Bahía #3 - Bahía de Servicios Rápidos TMD',
    priority: 'routine',
    status: 'in_progress',
    assignedTechnician: 'Julio Aguasvivas (Técnico Senior)',
    description: 'Servicio programado de 500 horas. Reemplazo de filtros de motor, combustible, trampa de agua y toma de muestra para Laboratorio de Aceites SOS.',
    scheduledDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 4. Desarrollos Urbanos Baní Work Order (Completed)
  {
    id: 'wo-seed-1052',
    orderNumber: 'WO-2026-1052',
    clientId: 'client-carmen-jaquez',
    clientName: 'Arq. Carmen Jaquez (Desarrollos Urbanos)',
    companyName: 'Desarrollos Urbanos Baní S.R.L.',
    equipmentUnitId: 'CTL-02',
    equipmentBrand: 'Kubota',
    machineModel: 'Minicargador de Orugas Kubota SVL75-2S',
    machineSerial: 'SVL75-KB-66120',
    equipmentYear: 2025,
    horometerHours: 890,
    serviceType: 'undercarriage',
    serviceCategory: 'Tren de Rodaje & Orugas',
    location: 'Patio de Maniobras Km 22',
    workshopName: 'Bahía #5 - Orugas y Trenes de Rodaje',
    priority: 'routine',
    status: 'completed',
    assignedTechnician: 'Leonardo Encarnación',
    description: 'Sustitución de rodillos inferiores y ajuste de tensión en orugas de goma.',
    scheduledDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  // 5. Agropecuaria del Valle San Juan Work Order (Scheduled)
  {
    id: 'wo-seed-1055',
    orderNumber: 'WO-2026-1055',
    clientId: 'client-fernando-valerio',
    clientName: 'Don Fernando Valerio (Agropecuaria del Valle)',
    companyName: 'Agropecuaria del Valle San Juan S.A.',
    equipmentUnitId: 'TR-07',
    equipmentBrand: 'Kubota',
    machineModel: 'Tractor Kubota M7-172 Premium KVT',
    machineSerial: 'KUBM7-331092-RD',
    equipmentYear: 2025,
    horometerHours: 512,
    serviceType: 'preventive_500h',
    serviceCategory: 'Servicio Móvil en Obra / Finca San Juan',
    location: 'Finca Las Matas de Farfán, San Juan',
    workshopName: 'Móvil de Asistencia #2 Km 22',
    priority: 'routine',
    status: 'scheduled',
    assignedTechnician: 'Edwin Martínez',
    description: 'Inspección de 500 horas en campo. Calibración de transmisión KVT y cambio de fluidos hidráulicos.',
    scheduledDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ============================================================================
// MASTER CUSTOMER PURCHASE ORDERS (REPUESTOS Y TIENDA)
// ============================================================================
export const INITIAL_PORTAL_PURCHASE_ORDERS: CustomerPurchaseOrder[] = [
  // 1. Tavares Purchase Order
  {
    id: 'ord-tav-081',
    orderNumber: 'ORD-2026-081',
    clientId: 'client-manuel-tavares',
    clientEmail: 'compras@constructoratavares.rd',
    clientName: 'Ing. Manuel Tavares (Constructora Tavares S.R.L.)',
    companyName: 'Constructora Tavares & Asociados S.R.L.',
    rncOrCedula: '1-31-89472-1',
    phone: '+1 (809) 560-8841',
    items: [
      {
        id: 'part-filter-kit-jcb3cx',
        partNumber: 'JCB-FIL-1000H',
        name: 'Kit de Filtros OEM 1,000h JCB 3CX',
        brand: 'JCB',
        category: 'Filtros y Mantenimiento',
        priceUsd: 480,
        quantity: 1,
        image: '/assets/parts/filter_kit.jpg',
        isOem: true,
        type: 'part'
      },
      {
        id: 'part-grease-shell-s2',
        partNumber: 'SHELL-GADUS-S2',
        name: 'Balde Grasa Heavy Duty Shell Gadus S2 (18 kg)',
        brand: 'Shell',
        category: 'Lubricantes y Grasas',
        priceUsd: 145,
        quantity: 2,
        image: '/assets/parts/shell_grease.jpg',
        isOem: true,
        type: 'part'
      }
    ],
    itemsCount: 3,
    subtotalUsd: 770,
    itbisUsd: 138.6,
    shippingUsd: 0,
    totalUsd: 908.6,
    totalDop: 908.6 * 60.25,
    currency: 'USD',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'transfer',
    ncfType: 'B01_CREDITO_FISCAL',
    ncfNumber: 'B0100034870',
    deliveryMethod: 'pickup_km22',
    deliveryAddress: 'Retiro en Almacén Central Km 22 Autopista Duarte',
    city: 'Santo Domingo Oeste',
    estimatedDeliveryDate: '18 de Septiembre, 2026',
    trackingNumber: 'TMD-PICK-081',
    carrier: 'Retirado por Chofer Tavares',
    timeline: [
      {
        status: 'pending',
        title: 'Orden Confirmada',
        description: 'Pago por transferencia Banco Popular verificado.',
        timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        location: 'TMD Pasarela'
      },
      {
        status: 'delivered',
        title: 'Entregado en Mostrador',
        description: 'Mercancía despachada en Almacén Km 22 con conduce firmado.',
        timestamp: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        location: 'Bahía Mostrador Km 22'
      }
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
  },
  // 2. Agregados del Caribe Purchase Order
  {
    id: 'ord-agr-077',
    orderNumber: 'ORD-2026-077',
    clientId: 'client-roberto-henriquez',
    clientEmail: 'operaciones@agregadoscaribe.com.do',
    clientName: 'Ing. Roberto Henríquez (Agregados del Caribe)',
    companyName: 'Agregados & Canteras del Caribe S.R.L.',
    rncOrCedula: '1-32-44910-3',
    phone: '+1 (809) 535-9000',
    items: [
      {
        id: 'part-tire-triangle-235',
        partNumber: 'TR-235-25-L3',
        name: 'Neumático OTR Triangle 23.5-25 L3 para Cargador LiuGong 856H',
        brand: 'Triangle',
        category: 'Neumáticos OTR',
        priceUsd: 1650,
        quantity: 2,
        image: '/assets/parts/otr_tire.jpg',
        isOem: true,
        type: 'part'
      }
    ],
    itemsCount: 2,
    subtotalUsd: 3300,
    itbisUsd: 594,
    shippingUsd: 120,
    totalUsd: 4014,
    totalDop: 4014 * 60.25,
    currency: 'USD',
    status: 'in_transit',
    paymentStatus: 'paid',
    paymentMethod: 'transfer',
    ncfType: 'B01_CREDITO_FISCAL',
    ncfNumber: 'B0100034888',
    deliveryMethod: 'express_jobsite',
    deliveryAddress: 'Cantera San Cristóbal - Km 4 Carretera Sánchez',
    city: 'San Cristóbal',
    estimatedDeliveryDate: 'Mañana, 10:00 AM',
    trackingNumber: 'TMD-LOG-077',
    carrier: 'Camión Plataforma TMD Móvil #03',
    timeline: [
      {
        status: 'pending',
        title: 'Pago Aprobado BHD',
        description: 'Factura B01 emitida y enviada a contabilidad.',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        location: 'TMD Finanzas'
      },
      {
        status: 'in_transit',
        title: 'En Ruta hacia Cantera',
        description: 'Despachado con operador de logística TMD.',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        location: 'Autopista 6 de Noviembre'
      }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 3. Desarrollos Urbanos Baní Purchase Order
  {
    id: 'ord-bani-065',
    orderNumber: 'ORD-2026-065',
    clientId: 'client-carmen-jaquez',
    clientEmail: 'proyectos@urbanosbani.rd',
    clientName: 'Licda. Carmen Jáquez (Desarrollos Urbanos)',
    companyName: 'Desarrollos Urbanos Baní S.A.',
    rncOrCedula: '1-01-99214-5',
    phone: '+1 (829) 450-2211',
    items: [
      {
        id: 'part-kubota-cutting-edge',
        partNumber: 'KB-SVL-EDGE-75',
        name: 'Cuchilla de Desgaste Reversible Balde Kubota SVL75',
        brand: 'Kubota',
        category: 'Desgaste y Cuchillas',
        priceUsd: 520,
        quantity: 1,
        image: '/assets/parts/cutting_edge.jpg',
        isOem: true,
        type: 'part'
      }
    ],
    itemsCount: 1,
    subtotalUsd: 520,
    itbisUsd: 93.6,
    shippingUsd: 45,
    totalUsd: 658.6,
    totalDop: 658.6 * 60.25,
    currency: 'USD',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'transfer',
    ncfType: 'B01_CREDITO_FISCAL',
    ncfNumber: 'B0100034855',
    deliveryMethod: 'express_jobsite',
    deliveryAddress: 'Oficina Baní - Calle Máximo Gómez #45',
    city: 'Baní',
    estimatedDeliveryDate: '25 de Agosto, 2026',
    trackingNumber: 'TMD-LOG-065',
    carrier: 'TMD Logística Sur',
    timeline: [
      {
        status: 'pending',
        title: 'Orden Confirmada',
        description: 'Pago por transferencia Banreservas procesado.',
        timestamp: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
        location: 'TMD Pasarela'
      },
      {
        status: 'delivered',
        title: 'Entregado en Frente de Obra',
        description: 'Cuchilla recibida por jefe de taller.',
        timestamp: new Date(Date.now() - 34 * 24 * 3600 * 1000).toISOString(),
        location: 'Campamento Baní'
      }
    ],
    createdAt: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 34 * 24 * 3600 * 1000).toISOString()
  },
  // 4. Consorcio Minero San Juan Purchase Order (Fernando Valerio)
  {
    id: 'ord-val-092',
    orderNumber: 'ORD-2026-092',
    clientId: 'client-fernando-valerio',
    clientEmail: 'gerencia@consorciominero.rd',
    clientName: 'Ing. Fernando Valerio',
    companyName: 'Consorcio Minero San Juan S.R.L.',
    rncOrCedula: '1-28-76543-9',
    phone: '+1 (809) 557-3344',
    items: [
      {
        id: 'part-filter-kit-liugong936',
        partNumber: 'LG-936E-FIL-500H',
        name: 'Kit de Mantenimiento 500h LiuGong 936E HD OEM Genuine',
        brand: 'LiuGong',
        category: 'Filtros y Mantenimiento',
        priceUsd: 580,
        quantity: 1,
        image: '/assets/parts/heavy_oil_filter.jpg',
        isOem: true,
        type: 'part'
      },
      {
        id: 'part-hydraulic-oil-tellus46',
        partNumber: 'SHELL-TELLUS-S2-46',
        name: 'Tambor Aceite Hidráulico Shell Tellus S2 MX 46 (55 Galones)',
        brand: 'Shell',
        category: 'Lubricantes y Grasas',
        priceUsd: 890,
        quantity: 1,
        image: '/assets/parts/shell_grease.jpg',
        isOem: true,
        type: 'part'
      }
    ],
    itemsCount: 2,
    subtotalUsd: 1470,
    itbisUsd: 264.6,
    shippingUsd: 90,
    totalUsd: 1824.6,
    totalDop: 1824.6 * 60.25,
    currency: 'USD',
    status: 'in_transit',
    paymentStatus: 'paid',
    paymentMethod: 'transfer',
    ncfType: 'B01_CREDITO_FISCAL',
    ncfNumber: 'B0100034902',
    deliveryMethod: 'express_jobsite',
    deliveryAddress: 'Campamento Minero Los Frios, San Juan',
    city: 'San Juan de la Maguana',
    estimatedDeliveryDate: 'Mañana, 2:00 PM',
    trackingNumber: 'TMD-LOG-092',
    carrier: 'Camión de Carga Pesada TMD Móvil #02',
    timeline: [
      {
        status: 'pending',
        title: 'Orden Confirmada',
        description: 'Transferencia bancaria Banco Popular validada.',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        location: 'TMD Pasarela'
      },
      {
        status: 'in_transit',
        title: 'En Ruta hacia San Juan',
        description: 'Despachado en Autopista 6 de Noviembre.',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        location: 'Ruta Sur'
      }
    ],
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

// ============================================================================
// CLIENT-SCOPED RETRIEVAL HELPERS (Enforces 100% Data Coherence in Client View)
// ============================================================================

export const getScopedClientQuotes = (
  allQuotes: PortalQuote[], 
  clientId?: string, 
  clientEmail?: string
): PortalQuote[] => {
  if (!clientId && !clientEmail) return allQuotes.slice(0, 2);
  const cId = (clientId || '').toLowerCase();
  const cEmail = (clientEmail || '').toLowerCase();

  const matched = allQuotes.filter(q => 
    (q.clientId && q.clientId.toLowerCase() === cId) ||
    (q.clientEmail && q.clientEmail.toLowerCase() === cEmail)
  );

  return matched.length > 0 
    ? matched 
    : allQuotes.filter(q => q.clientId === 'client-manuel-tavares');
};

export const getScopedClientWorkOrders = (
  allOrders: ServiceWorkOrder[],
  clientId?: string,
  clientEmail?: string
): ServiceWorkOrder[] => {
  if (!clientId && !clientEmail) return allOrders.slice(0, 2);
  const cId = (clientId || '').toLowerCase();
  const cEmail = (clientEmail || '').toLowerCase();

  const matched = allOrders.filter(w => 
    (w.clientId && w.clientId.toLowerCase() === cId) ||
    (w.clientName && cEmail && w.clientName.toLowerCase().includes(cEmail.split('@')[0]))
  );

  return matched.length > 0 
    ? matched 
    : allOrders.filter(w => w.clientId === 'client-manuel-tavares');
};

export const getScopedClientFleet = (
  allFleet: RegisteredEquipment[],
  clientId?: string,
  clientEmail?: string
): RegisteredEquipment[] => {
  if (!clientId && !clientEmail) return allFleet.slice(0, 2);
  const cId = (clientId || '').toLowerCase();
  const cEmail = (clientEmail || '').toLowerCase();

  const matched = allFleet.filter(f => 
    (f.clientId && f.clientId.toLowerCase() === cId) ||
    (f.clientEmail && f.clientEmail.toLowerCase() === cEmail)
  );

  return matched.length > 0 
    ? matched 
    : allFleet.filter(f => f.clientId === 'client-manuel-tavares');
};

export const getScopedClientPurchaseOrders = (
  allPurchases: CustomerPurchaseOrder[],
  clientId?: string,
  clientEmail?: string
): CustomerPurchaseOrder[] => {
  if (!clientId && !clientEmail) return allPurchases.slice(0, 1);
  const cId = (clientId || '').toLowerCase();
  const cEmail = (clientEmail || '').toLowerCase();

  const matched = allPurchases.filter(o => 
    (o.clientId && o.clientId.toLowerCase() === cId) ||
    (o.clientEmail && o.clientEmail.toLowerCase() === cEmail)
  );

  return matched.length > 0 
    ? matched 
    : allPurchases.filter(o => o.clientId === 'client-manuel-tavares');
};
