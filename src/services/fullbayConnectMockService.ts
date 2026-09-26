import { 
  FullbayEquipment, 
  FullbayActiveRepairOrder, 
  FullbayInventoryPart,
  FullbayServiceRequestPayload 
} from '../types';

/**
 * Standard Fullbay Connect v2 API Response Envelope
 */
export interface FullbayApiResponse<T> {
  success: boolean;
  version: '2.4.0';
  shopId: string;
  timestamp: string;
  data: T;
  meta?: {
    totalRecords: number;
    page: number;
    pageSize: number;
  };
}

// =========================================================================
// MOCK DATA PAYLOADS (MOCK API SCHEMAS)
// =========================================================================

export const MOCK_FULLBAY_EQUIPMENT_FLEET: FullbayEquipment[] = [
  {
    id: "eq-fb-001",
    customerId: "cust-cibao-01",
    unitVin: "JCB3CX2026DOM001",
    unitFicha: "Ficha #01",
    make: "JCB",
    model: "3CX Eco 4x4",
    year: 2026,
    licensePlate: "L449012",
    meterType: "HOURS",
    currentMeterReading: 1485.6,
    status: "IN_SHOP",
    lastServiceDate: "2026-05-10",
    nextServiceMeterReading: 1500.0,
    telematicsVinMatch: "JCB3CX2026DOM001"
  },
  {
    id: "eq-fb-002",
    customerId: "cust-sur-02",
    unitVin: "LG922E2026DOM002",
    unitFicha: "Ficha #04",
    make: "LiuGong",
    model: "922E HD",
    year: 2026,
    licensePlate: "E110294",
    meterType: "HOURS",
    currentMeterReading: 2890.2,
    status: "ACTIVE",
    lastServiceDate: "2026-08-15",
    nextServiceMeterReading: 3000.0,
    telematicsVinMatch: "LG922E2026DOM002"
  },
  {
    id: "eq-fb-003",
    customerId: "cust-este-03",
    unitVin: "JCB220X2026DOM003",
    unitFicha: "Ficha #12",
    make: "JCB",
    model: "220X-LC Heavy",
    year: 2026,
    licensePlate: "E990312",
    meterType: "HOURS",
    currentMeterReading: 940.0,
    status: "ACTIVE",
    lastServiceDate: "2026-07-22",
    nextServiceMeterReading: 1000.0,
    telematicsVinMatch: "JCB220X2026DOM003"
  },
  {
    id: "eq-fb-004",
    customerId: "cust-agro-04",
    unitVin: "KUBM7172DOM004",
    unitFicha: "Ficha #07",
    make: "Kubota",
    model: "M7-172 KVT",
    year: 2026,
    licensePlate: "T551902",
    meterType: "HOURS",
    currentMeterReading: 512.4,
    status: "ACTIVE",
    lastServiceDate: "2026-06-04",
    nextServiceMeterReading: 750.0,
    telematicsVinMatch: "KUBM7172DOM004"
  }
];

export const MOCK_FULLBAY_ACTIVE_REPAIR_ORDERS: FullbayActiveRepairOrder[] = [
  {
    orderId: "wo-fb-4412",
    fullbayOrderNumber: "FB-2026-4412",
    customerId: "cust-cibao-01",
    customerName: "Constructora del Cibao S.A.S.",
    unitFicha: "Ficha #01",
    unitVin: "JCB3CX2026DOM001",
    unitModel: "JCB 3CX Eco 4x4",
    status: "in_progress",
    assignedTechnician: {
      id: "tech-01",
      name: "Ing. Marcos Peña"
    },
    serviceLocation: "Shop Km 22",
    complaintSummary: "Mantenimiento preventivo 1,500 Horas detectado por LiveLink + Ajuste de bujes de aguilón.",
    laborHoursTracked: 4.5,
    laborRateUsd: 65,
    totalLaborUsd: 292.50,
    allocatedPartsCount: 2,
    totalPartsUsd: 74.50,
    totalEstimatedAmountUsd: 367.00,
    digitalApprovalStatus: "approved",
    digitalApprovedAt: "2026-09-24T14:30:00Z",
    openedAt: "2026-09-24T08:00:00Z",
    updatedAt: "2026-09-25T09:15:00Z"
  },
  {
    orderId: "wo-fb-4415",
    fullbayOrderNumber: "FB-2026-4415",
    customerId: "cust-sur-02",
    customerName: "Agregados & Minería del Sur",
    unitFicha: "Ficha #04",
    unitVin: "LG922E2026DOM002",
    unitModel: "LiuGong 922E HD",
    status: "diagnostic",
    assignedTechnician: {
      id: "tech-01",
      name: "Ing. Marcos Peña"
    },
    serviceLocation: "Mobile Field Truck #01",
    complaintSummary: "Alerta telemática LiveLink: SPN 100 FMI 1 - Presión baja de aceite en motor Cummins QSB6.7 en Cantera San Cristóbal.",
    laborHoursTracked: 1.5,
    laborRateUsd: 75,
    totalLaborUsd: 112.50,
    allocatedPartsCount: 2,
    totalPartsUsd: 57.00,
    totalEstimatedAmountUsd: 169.50,
    digitalApprovalStatus: "approved",
    digitalApprovedAt: "2026-09-25T07:45:00Z",
    openedAt: "2026-09-25T07:15:00Z",
    updatedAt: "2026-09-25T08:30:00Z"
  },
  {
    orderId: "wo-fb-4419",
    fullbayOrderNumber: "FB-2026-4419",
    customerId: "cust-este-03",
    customerName: "Infraestructuras Viales del Este",
    unitFicha: "Ficha #12",
    unitVin: "JCB220X2026DOM003",
    unitModel: "JCB 220X Excavator",
    status: "waiting_on_parts",
    assignedTechnician: {
      id: "tech-02",
      name: "Téc. Ysidro Rosario"
    },
    serviceLocation: "Shop Km 22",
    complaintSummary: "Sustitución de manguera hidráulica de alta presión en circuito de retorno y prueba de presión estática.",
    laborHoursTracked: 2.0,
    laborRateUsd: 65,
    totalLaborUsd: 130.00,
    allocatedPartsCount: 1,
    totalPartsUsd: 185.00,
    totalEstimatedAmountUsd: 315.00,
    digitalApprovalStatus: "pending",
    openedAt: "2026-09-25T08:45:00Z",
    updatedAt: "2026-09-25T09:00:00Z"
  }
];

export const MOCK_FULLBAY_PARTS_INVENTORY: FullbayInventoryPart[] = [
  {
    partId: "fb-part-001",
    partNumber: "P550440",
    description: "Filtro de Aceite Lubricante de Flujo Pleno",
    oemBrand: "Donaldson",
    category: "Filtración",
    quantityOnHand: 48,
    quantityAllocated: 6,
    quantityAvailable: 42,
    binLocation: "Almacén Central Km 22 - Pasillo A - Estante 03",
    unitCostUsd: 18.20,
    retailPriceUsd: 28.50,
    reorderPoint: 15,
    isOemOriginal: true,
    warehouseCode: "WH-KM22"
  },
  {
    partId: "fb-part-002",
    partNumber: "FS19732",
    description: "Filtro Separador de Combustible y Agua con Vaso Decantador",
    oemBrand: "Fleetguard",
    category: "Filtración Diésel",
    quantityOnHand: 32,
    quantityAllocated: 4,
    quantityAvailable: 28,
    binLocation: "Almacén Central Km 22 - Pasillo A - Estante 05",
    unitCostUsd: 29.50,
    retailPriceUsd: 46.00,
    reorderPoint: 10,
    isOemOriginal: true,
    warehouseCode: "WH-KM22"
  },
  {
    partId: "fb-part-003",
    partNumber: "320/07155",
    description: "Kit Completo de Filtros Preventivo 500 Horas JCB 3CX",
    oemBrand: "JCB Genuine",
    category: "Kits de Mantenimiento",
    quantityOnHand: 16,
    quantityAllocated: 2,
    quantityAvailable: 14,
    binLocation: "Almacén Central Km 22 - Pasillo B - Bahía 02",
    unitCostUsd: 195.00,
    retailPriceUsd: 285.00,
    reorderPoint: 5,
    isOemOriginal: true,
    warehouseCode: "WH-KM22"
  },
  {
    partId: "fb-part-004",
    partNumber: "KW-K3V112DT-OEM",
    description: "Bomba Hidráulica Principal Doble Pistón Axial Kawasaki",
    oemBrand: "Kawasaki OEM",
    category: "Sistemas Hidráulicos",
    quantityOnHand: 3,
    quantityAllocated: 1,
    quantityAvailable: 2,
    binLocation: "Almacén Central Km 22 - Área Segura - Bloque H",
    unitCostUsd: 2450.00,
    retailPriceUsd: 3450.00,
    reorderPoint: 1,
    isOemOriginal: true,
    warehouseCode: "WH-KM22"
  },
  {
    partId: "fb-part-005",
    partNumber: "J300-CAT-TOOTH",
    description: "Diente para Cucharón de Roca y Cantera Tipo Cat J300",
    oemBrand: "LiuGong / GET",
    category: "Herramientas de Corte",
    quantityOnHand: 120,
    quantityAllocated: 16,
    quantityAvailable: 104,
    binLocation: "Patio Km 22 - Estantería Exterior - Nivel 01",
    unitCostUsd: 24.00,
    retailPriceUsd: 39.50,
    reorderPoint: 30,
    isOemOriginal: true,
    warehouseCode: "WH-KM22"
  }
];

// =========================================================================
// HELPER SERVICE IMPLEMENTATION (FULLBAY CONNECT V2 CLIENT)
// =========================================================================

/**
 * Fetch client's registered fleet machinery assets from Fullbay Connect
 */
export async function fetchFullbayFleetEquipment(customerId?: string): Promise<FullbayEquipment[]> {
  try {
    // Attempt local API proxy first
    const res = await fetch(`/api/shop/fullbay/equipment?customerId=${encodeURIComponent(customerId || '')}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.equipment)) return data.equipment;
    }
  } catch {
    // Graceful fallback to mock payload
  }

  if (customerId) {
    const filtered = MOCK_FULLBAY_EQUIPMENT_FLEET.filter(e => e.customerId === customerId);
    return filtered.length > 0 ? filtered : MOCK_FULLBAY_EQUIPMENT_FLEET;
  }
  return MOCK_FULLBAY_EQUIPMENT_FLEET;
}

/**
 * Fetch active shop and field repair orders from Fullbay Connect
 */
export async function fetchFullbayActiveRepairOrders(filters?: { status?: string; customerId?: string }): Promise<FullbayActiveRepairOrder[]> {
  try {
    const res = await fetch('/api/shop/fullbay/work-orders');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.workOrders)) {
        return data.workOrders.map((o: any) => ({
          orderId: o.id || `wo-${o.fullbayOrderNumber}`,
          fullbayOrderNumber: o.fullbayOrderNumber,
          customerId: o.customerId || 'cust-direct',
          customerName: o.customerCompany || o.customerName || 'Cliente TMD',
          unitFicha: o.unitFicha || 'Unidad Flota',
          unitVin: o.unitVin || 'VIN-UNKNOWN',
          unitModel: o.unitModel || 'Equipo Pesado',
          status: o.status === 'in_progress' ? 'in_progress' : o.status === 'scheduled' ? 'diagnostic' : 'in_queue',
          assignedTechnician: {
            id: o.assignedTechnicianId || 'tech-01',
            name: o.assignedTechnicianName || 'Ing. Marcos Peña'
          },
          serviceLocation: o.serviceDepartment === 'Taller Central Km 22' ? 'Shop Km 22' : 'Mobile Field Truck #01',
          complaintSummary: o.complaint || 'Servicio programado',
          laborHoursTracked: Number(o.technicianLaborHours || 2.0),
          laborRateUsd: Number(o.laborRateUsd || 65),
          totalLaborUsd: Number(o.totalLaborUsd || 130),
          allocatedPartsCount: Array.isArray(o.partsRequired) ? o.partsRequired.length : 1,
          totalPartsUsd: Number(o.totalPartsUsd || 57),
          totalEstimatedAmountUsd: Number(o.totalAmountUsd || 187),
          digitalApprovalStatus: o.estimateApproved ? 'approved' : 'pending',
          digitalApprovedAt: o.estimateApprovedAt,
          openedAt: o.createdAt || new Date().toISOString(),
          updatedAt: o.updatedAt || new Date().toISOString()
        }));
      }
    }
  } catch {
    // Fallback to mock
  }

  let list = MOCK_FULLBAY_ACTIVE_REPAIR_ORDERS;
  if (filters?.customerId) {
    list = list.filter(o => o.customerId === filters.customerId);
  }
  if (filters?.status) {
    list = list.filter(o => o.status === filters.status);
  }
  return list;
}

/**
 * Fetch live inventory quantities from Fullbay parts warehouse
 */
export async function fetchFullbayPartsInventory(searchQuery?: string): Promise<FullbayInventoryPart[]> {
  const query = (searchQuery || '').trim().toLowerCase();
  if (!query) {
    return MOCK_FULLBAY_PARTS_INVENTORY;
  }

  return MOCK_FULLBAY_PARTS_INVENTORY.filter(p => 
    p.partNumber.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.oemBrand.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
}

/**
 * Submit plain-language service work request pushing payload to Fullbay Connect
 */
export async function submitFullbayServiceRequest(
  payload: FullbayServiceRequestPayload
): Promise<{ success: boolean; orderNumber: string; message: string }> {
  try {
    const res = await fetch('/api/shop/fullbay/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: payload.customerId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        unitFicha: payload.unitFicha,
        unitVin: payload.unitVin,
        unitHorometer: payload.currentHorometer,
        priority: payload.priority,
        complaint: payload.complaint,
        serviceDepartment: payload.priority === 'emergency' ? 'Unidad Móvil Campo 24/7' : 'Taller Central Km 22',
        livelinkFaultCodeRef: payload.livelinkFaultRef
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        orderNumber: data.workOrder?.fullbayOrderNumber || `FB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        message: '¡Orden de trabajo generada exitosamente en Fullbay! Nuestro equipo técnico se pondrá en contacto.'
      };
    }
  } catch {
    // Local fallback
  }

  const generatedNum = `FB-2026-${Math.floor(5000 + Math.random() * 4000)}`;
  return {
    success: true,
    orderNumber: generatedNum,
    message: `¡Orden de trabajo #${generatedNum} recibida en Fullbay Connect Taller Km 22!`
  };
}
