import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ServiceWorkOrder, RegisteredEquipment, InstalledServicePart } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { INITIAL_REGISTERED_FLEET } from '../data/portalSeedData';

const WORK_ORDERS_COLLECTION = 'work_orders';
const LOCAL_SERVICE_HISTORY_KEY = 'tmd-service-history-records';
const LOCAL_FLEET_KEY = 'tmd-registered-fleet-units';

export const getLocalServiceHistory = (): ServiceWorkOrder[] => {
  try {
    const data = localStorage.getItem(LOCAL_SERVICE_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveServiceOrderToLocalStorage = (order: ServiceWorkOrder) => {
  try {
    const existing = getLocalServiceHistory();
    const updated = [order, ...existing.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber)];
    localStorage.setItem(LOCAL_SERVICE_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save service order to local storage', e);
  }
};

export const getLocalFleet = (): RegisteredEquipment[] => {
  try {
    const data = localStorage.getItem(LOCAL_FLEET_KEY);
    return data ? JSON.parse(data) : INITIAL_REGISTERED_FLEET;
  } catch {
    return INITIAL_REGISTERED_FLEET;
  }
};

export const saveFleetToLocalStorage = (fleet: RegisteredEquipment[]) => {
  try {
    localStorage.setItem(LOCAL_FLEET_KEY, JSON.stringify(fleet));
  } catch (e) {
    console.warn('Could not save fleet to local storage', e);
  }
};

// Default registered machines for client demo
export const generateDemoFleet = (): RegisteredEquipment[] => INITIAL_REGISTERED_FLEET;

// Helper to update machine horometer and auto-save
export const updateEquipmentHorometer = (
  equipmentId: string,
  newHours: number,
  fleet: RegisteredEquipment[] = getLocalFleet()
): RegisteredEquipment[] => {
  const updated = fleet.map((eq) => {
    if (eq.id === equipmentId) {
      return {
        ...eq,
        currentHorometer: newHours,
        updatedAt: new Date().toISOString()
      };
    }
    return eq;
  });
  saveFleetToLocalStorage(updated);
  return updated;
};

// Helper to mark service completed and schedule next cycle
export const completeEquipmentServiceCycle = (
  equipmentId: string,
  nextIntervalHours: number = 500,
  fleet: RegisteredEquipment[] = getLocalFleet()
): RegisteredEquipment[] => {
  const todayFormatted = new Date().toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const updated = fleet.map((eq) => {
    if (eq.id === equipmentId) {
      const nextTarget = eq.currentHorometer + nextIntervalHours;
      return {
        ...eq,
        lastServiceDate: todayFormatted,
        nextServiceHours: nextTarget,
        serviceIntervalHours: nextIntervalHours,
        status: 'active' as const
      };
    }
    return eq;
  });
  saveFleetToLocalStorage(updated);
  return updated;
};

// Rich Demo Service History with Installed OEM Parts
export const generateDemoServiceHistory = (
  userId: string,
  userName: string,
  companyName: string
): ServiceWorkOrder[] => {
  return [
    {
      id: 'wo-tmd-2026-0891',
      orderNumber: 'OT-2026-0891',
      clientId: userId,
      clientName: userName || 'Ing. Manuel Tavares',
      companyName: companyName || 'Constructora del Caribe S.R.L.',
      equipmentUnitId: 'EX-01',
      equipmentBrand: 'LiuGong',
      machineModel: 'LiuGong 922E Excavadora de Orugas (22 Ton)',
      machineSerial: 'LG922E-2023-88412',
      equipmentYear: 2023,
      horometerHours: 2450,
      serviceType: 'preventive_1000h',
      serviceCategory: 'Mantenimiento Preventivo 1,000 Horas & Servicio Mayor Hidráulico',
      location: 'Autopista Duarte Km 28, Santo Domingo Oeste (En Obra)',
      workshopName: 'Taller Central TMD Km 22 / Unidad Móvil #01',
      priority: 'routine',
      status: 'completed',
      assignedTechnician: 'Ing. Carlos Santana',
      technicianTitle: 'Especialista Máster en Hidráulica y Motores LiuGong / Cummins',
      scheduledDate: '14 de Agosto, 2026',
      completedDate: '15 de Agosto, 2026 - 16:45',
      description: 'Servicio programado de 1,000 horas de operación para excavadora en frente de cantera.',
      workPerformed: '• Cambio integral de aceite de motor diésel y filtros primarios/secundarios.\n• Reemplazo de elementos de retorno y succión del circuito hidráulico principal.\n• Calibración y prueba de presiones de bomba variable Kawasaki (34.3 MPa).\n• Reemplazo de 5 puntas de balde de penetración para roca con pines de retención nuevos.\n• Inspección de tensión de cadenas y lubricación completa de 32 puntos con grasa EP-2.',
      technicianNotes: 'Equipo en excelentes condiciones operativas. El análisis de desgaste SOS no muestra presencia de ferrita o bronce en el fluido hidráulico. Se recomienda mantener soplado diario de filtros de aire en cantera.',
      diagnosticReport: 'Presión Standby: 3.4 MPa | Presión Alivio Principal: 34.3 MPa | Temperatura Operativa: 78°C | Ciclo de Pluma: 3.1 seg. Calibración aprobada bajo norma ISO 9001.',
      installedParts: [
        {
          partNumber: '40C0448',
          name: 'Filtro de Retorno Hidráulico Original LiuGong',
          brand: 'LiuGong OEM',
          category: 'Filtros',
          quantity: 2,
          unitPriceUsd: 125.00,
          totalPriceUsd: 250.00,
          isOem: true,
          warrantyPeriod: '1,000 Horas / 6 Meses',
          serialBatch: 'LT-8841-2026'
        },
        {
          partNumber: '53C0053',
          name: 'Filtro de Succión de Bomba Hidráulica Principal',
          brand: 'LiuGong OEM',
          category: 'Filtros',
          quantity: 1,
          unitPriceUsd: 95.00,
          totalPriceUsd: 95.00,
          isOem: true,
          warrantyPeriod: '1,000 Horas',
          serialBatch: 'LT-9102-2026'
        },
        {
          partNumber: '40039211',
          name: 'Kit de Sellos de Pistón del Brazo Principal (Boom)',
          brand: 'Parker / LiuGong',
          category: 'Cilindros Hidráulicos',
          quantity: 1,
          unitPriceUsd: 280.00,
          totalPriceUsd: 280.00,
          isOem: true,
          warrantyPeriod: '12 Meses',
          serialBatch: 'SEAL-49210'
        },
        {
          partNumber: '531-03205',
          name: 'Puntas de Diente de Balde Tipo Escarificador Pesado',
          brand: 'LiuGong Heavy GET',
          category: 'Herramientas de Corte (GET)',
          quantity: 5,
          unitPriceUsd: 38.00,
          totalPriceUsd: 190.00,
          isOem: true,
          warrantyPeriod: 'Desgaste Normal',
          serialBatch: 'GET-2026-55'
        },
        {
          partNumber: 'OIL-ISO-46',
          name: 'Aceite Hidráulico Anti-Desgaste Premium ISO VG 46 (Tambor 55 Gal)',
          brand: 'TotalEnergies / TMD Lub',
          category: 'Fluidos y Lubricantes',
          quantity: 1,
          unitPriceUsd: 680.00,
          totalPriceUsd: 680.00,
          isOem: true,
          warrantyPeriod: 'Certificado de Fábrica'
        }
      ],
      installedPartsCount: 10,
      nextServiceDueHours: 2500,
      nextServiceDueDate: 'Noviembre 2026 (+250 Horas)',
      totalLaborCostUsd: 450.00,
      totalPartsCostUsd: 1495.00,
      totalCostUsd: 1945.00,
      totalCostDop: 1945.00 * USD_TO_DOP_RATE,
      warrantyMonths: 6,
      warrantyHours: 1000,
      estimatedHours: 8,
      createdAt: '2026-08-14T08:30:00.000Z',
      updatedAt: '2026-08-15T16:45:00.000Z'
    },
    {
      id: 'wo-tmd-2026-0744',
      orderNumber: 'OT-2026-0744',
      clientId: userId,
      clientName: userName || 'Ing. Manuel Tavares',
      companyName: companyName || 'Constructora del Caribe S.R.L.',
      equipmentUnitId: 'RT-04',
      equipmentBrand: 'JCB',
      machineModel: 'JCB 3CX Eco Retroexcavadora 4x4 Turbo',
      machineSerial: 'JCB-3CX-2024-9104',
      equipmentYear: 2024,
      horometerHours: 1120,
      serviceType: 'preventive_1000h',
      serviceCategory: 'Mantenimiento Preventivo 1,000 Horas (Motor EcoMAX & Ejes Powershift)',
      location: 'Sector Cap Cana, Punta Cana, La Altagracia',
      workshopName: 'Estación de Soporte Técnico Este (Bávaro - Punta Cana)',
      priority: 'routine',
      status: 'completed',
      assignedTechnician: 'Téc. Roberto Méndez',
      technicianTitle: 'Técnico Especialista de Campo - Flota Móvil #03',
      scheduledDate: '01 de Julio, 2026',
      completedDate: '02 de Julio, 2026 - 15:30',
      description: 'Mantenimiento preventivo completo de 1,000 hrs para retroexcavadora en obra hotelera.',
      workPerformed: '• Reemplazo de filtros de combustible diésel y separador primario.\n• Cambio de aceite de transmisión Powershift y filtro de transmisión.\n• Calibración del sistema hidráulico auxiliar para martillo demoledor.\n• Ajuste de holgura en bujes del aguilón trasero y pasadores de giro.\n• Escaneo electrónico con JCB LiveLink Diagnostic Tool (0 fallas activas).',
      technicianNotes: 'Motor EcoMAX operando con compresión óptima en todos los cilindros. Se reemplazó correa serpentina que mostraba microfisuras preventivamente.',
      diagnosticReport: 'Presión de riel común diésel: 1,600 Bar | Presión de carga de transmisión: 18 Bar | Voltaje de alternador: 14.2V estable.',
      installedParts: [
        {
          partNumber: '320/04133',
          name: 'Filtro de Aceite de Motor Original JCB',
          brand: 'JCB Genuine Parts',
          category: 'Filtros de Motor',
          quantity: 1,
          unitPriceUsd: 48.50,
          totalPriceUsd: 48.50,
          isOem: true,
          warrantyPeriod: '500 Horas'
        },
        {
          partNumber: '32/925346',
          name: 'Filtro Separador de Agua y Sedimentos Diésel',
          brand: 'JCB Genuine Parts',
          category: 'Inyección Diésel',
          quantity: 1,
          unitPriceUsd: 115.00,
          totalPriceUsd: 115.00,
          isOem: true,
          warrantyPeriod: '1,000 Horas'
        },
        {
          partNumber: '332/F8114',
          name: 'Correa Serpentina del Alternador y Bomba de Agua',
          brand: 'JCB Genuine Parts',
          category: 'Sistema de Enfriamiento',
          quantity: 1,
          unitPriceUsd: 65.00,
          totalPriceUsd: 65.00,
          isOem: true,
          warrantyPeriod: '12 Meses'
        },
        {
          partNumber: '32/917804',
          name: 'Filtro de Aire Primario y Secundario Alta Eficiencia',
          brand: 'JCB Genuine Parts',
          category: 'Admisión de Aire',
          quantity: 1,
          unitPriceUsd: 92.00,
          totalPriceUsd: 92.00,
          isOem: true,
          warrantyPeriod: '1,000 Horas'
        }
      ],
      installedPartsCount: 4,
      nextServiceDueHours: 1500,
      nextServiceDueDate: 'Diciembre 2026',
      totalLaborCostUsd: 320.00,
      totalPartsCostUsd: 320.50,
      totalCostUsd: 640.50,
      totalCostDop: 640.50 * USD_TO_DOP_RATE,
      warrantyMonths: 6,
      warrantyHours: 500,
      estimatedHours: 6,
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T15:30:00.000Z'
    },
    {
      id: 'wo-tmd-2026-0618',
      orderNumber: 'OT-2026-0618',
      clientId: userId,
      clientName: userName || 'Ing. Manuel Tavares',
      companyName: companyName || 'Constructora del Caribe S.R.L.',
      equipmentUnitId: 'TR-02',
      equipmentBrand: 'LS Tractor',
      machineModel: 'LS MT357 Cabina 4WD (57 HP)',
      machineSerial: 'LS-MT3-2025-3312',
      equipmentYear: 2025,
      horometerHours: 680,
      serviceType: 'preventive_500h',
      serviceCategory: 'Mantenimiento Preventivo 500 Horas & Calibración de TDF',
      location: 'Finca Arrocera San Francisco de Macorís, Duarte',
      workshopName: 'Centro Técnico Regional Cibao (Santiago) / Unidad Agro',
      priority: 'routine',
      status: 'completed',
      assignedTechnician: 'Ing. David Polanco',
      technicianTitle: 'Especialista en Maquinaria Agroindustrial LS / TMD',
      scheduledDate: '17 de Junio, 2026',
      completedDate: '18 de Junio, 2026 - 14:00',
      description: 'Mantenimiento de 500 horas y verificación de acople de toma de fuerza para rotavator.',
      workPerformed: '• Cambio de aceite de transmisión hidrostática y filtro hidráulico doble.\n• Limpieza de radiador y enfriador de aceite para prevención de sobrecalentamiento por polvillo.\n• Ajuste del varillaje de enganche de tres puntos Categoría II.\n• Reemplazo de filtro de combustible primario con purga de aire.',
      technicianNotes: 'Tractor trabajando en terreno húmedo de arrozal. Se aplicó sellado adicional en conectores eléctricos de sensores de tracción.',
      diagnosticReport: 'Potencia medida en TDF (540 RPM): 52.4 HP efectivos. Embrague electrohidráulico en tolerancias de fábrica.',
      installedParts: [
        {
          partNumber: 'LS-40039211',
          name: 'Filtro Hidráulico de Transmisión Hidrostática HST',
          brand: 'LS Tractor Genuine',
          category: 'Transmisión Hidráulica',
          quantity: 1,
          unitPriceUsd: 78.00,
          totalPriceUsd: 78.00,
          isOem: true,
          warrantyPeriod: '500 Horas'
        },
        {
          partNumber: 'LS-10293844',
          name: 'Filtro de Combustible Diésel de Doble Etapa',
          brand: 'LS Tractor Genuine',
          category: 'Combustible',
          quantity: 2,
          unitPriceUsd: 36.00,
          totalPriceUsd: 72.00,
          isOem: true,
          warrantyPeriod: '500 Horas'
        },
        {
          partNumber: 'OIL-80W90-LS',
          name: 'Lubricante para Eje Delantero 4WD SAE 80W-90 GL-5 (Galón)',
          brand: 'LS Genuine Oil',
          category: 'Transmisión',
          quantity: 2,
          unitPriceUsd: 42.00,
          totalPriceUsd: 84.00,
          isOem: true,
          warrantyPeriod: '500 Horas'
        }
      ],
      installedPartsCount: 5,
      nextServiceDueHours: 750,
      nextServiceDueDate: 'Octubre 2026',
      totalLaborCostUsd: 210.00,
      totalPartsCostUsd: 234.00,
      totalCostUsd: 444.00,
      totalCostDop: 444.00 * USD_TO_DOP_RATE,
      warrantyMonths: 6,
      warrantyHours: 500,
      estimatedHours: 4,
      createdAt: '2026-06-17T10:00:00.000Z',
      updatedAt: '2026-06-18T14:00:00.000Z'
    },
    {
      id: 'wo-tmd-2026-0520',
      orderNumber: 'OT-2026-0520',
      clientId: userId,
      clientName: userName || 'Ing. Manuel Tavares',
      companyName: companyName || 'Constructora del Caribe S.R.L.',
      equipmentUnitId: 'EX-01',
      equipmentBrand: 'LiuGong',
      machineModel: 'LiuGong 922E Excavadora de Orugas (22 Ton)',
      machineSerial: 'LG922E-2023-88412',
      equipmentYear: 2023,
      horometerHours: 2050,
      serviceType: 'undercarriage',
      serviceCategory: 'Reacondicionamiento de Tren de Rodaje & Zapatas de Oruga',
      location: 'Taller Central TMD Km 22, Autopista Duarte',
      workshopName: 'Taller Máster de Tren de Rodaje & Soldadura Especializada TMD',
      priority: 'routine',
      status: 'completed',
      assignedTechnician: 'Ing. Carlos Santana',
      technicianTitle: 'Especialista Máster en Tren de Rodaje',
      scheduledDate: '19 de Mayo, 2026',
      completedDate: '20 de Mayo, 2026 - 18:00',
      description: 'Reemplazo de eslabones desgastados y zapatas de 600mm por trabajo severo en roca caliza.',
      workPerformed: '• Desmontaje de cadenas con prensa hidráulica de 100 toneladas.\n• Instalación de kit de cadenas selladas y lubricadas con zapatas de 600mm triple garra.\n• Reemplazo de 2 rodillos inferiores con sellos Duo-Cone nuevos.\n• Ajuste de torque de pernos de zapata a 750 N·m con torquímetro calibrado.',
      technicianNotes: 'Ruedas guías (idlers) y sprocket motriz en 85% de vida útil remanente. Se entregó garantía de 2,000 horas para el tren de rodaje.',
      diagnosticReport: 'Paso de cadena verificado: 190.2 mm (Tolerancia 0-1 mm). Desgaste cero en bujes internos.',
      installedParts: [
        {
          partNumber: 'UC-922E-600',
          name: 'Cadena Sellada y Lubricada con Zapatas 600mm',
          brand: 'LiuGong Heavy Undercarriage',
          category: 'Tren de Rodaje',
          quantity: 2,
          unitPriceUsd: 1450.00,
          totalPriceUsd: 2900.00,
          isOem: true,
          warrantyPeriod: '2,000 Horas / 12 Meses',
          serialBatch: 'UC-TR-2026-99'
        },
        {
          partNumber: 'UC-ROLL-INF',
          name: 'Rodillo Inferior de Carga con Sello Duo-Cone',
          brand: 'LiuGong Heavy Undercarriage',
          category: 'Tren de Rodaje',
          quantity: 2,
          unitPriceUsd: 185.00,
          totalPriceUsd: 370.00,
          isOem: true,
          warrantyPeriod: '12 Meses'
        }
      ],
      installedPartsCount: 4,
      nextServiceDueHours: 2450,
      nextServiceDueDate: 'Agosto 2026',
      totalLaborCostUsd: 680.00,
      totalPartsCostUsd: 3270.00,
      totalCostUsd: 3950.00,
      totalCostDop: 3950.00 * USD_TO_DOP_RATE,
      warrantyMonths: 12,
      warrantyHours: 2000,
      estimatedHours: 12,
      createdAt: '2026-05-19T08:00:00.000Z',
      updatedAt: '2026-05-20T18:00:00.000Z'
    }
  ];
};

/**
 * Calculates Horometer status and remaining hours until next interval
 */
export const getHorometerHealthStatus = (equipment: RegisteredEquipment): {
  hoursRemaining: number;
  progressPercent: number;
  status: 'normal' | 'due_soon' | 'overdue';
  statusLabel: string;
  badgeColor: string;
  recommendedInterval: 250 | 500 | 1000;
} => {
  const current = equipment.currentHorometer || 0;
  const next = equipment.nextServiceHours || current + 250;
  const interval = equipment.serviceIntervalHours || 500;
  const hoursRemaining = Math.max(0, next - current);
  
  // Progress inside current service cycle
  const cycleStart = Math.max(0, next - interval);
  const cycleCompleted = Math.max(0, current - cycleStart);
  const progressPercent = Math.min(100, Math.round((cycleCompleted / interval) * 100));

  let status: 'normal' | 'due_soon' | 'overdue' = 'normal';
  let statusLabel = 'Operativo Óptimo';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (current >= next) {
    status = 'overdue';
    statusLabel = '¡Mantenimiento Vencido!';
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
  } else if (hoursRemaining <= (equipment.reminderThresholdHours || 100)) {
    status = 'due_soon';
    statusLabel = 'Próximo a Servicio';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  const recInterval: 250 | 500 | 1000 = (next % 1000 === 0) ? 1000 : (next % 500 === 0) ? 500 : 250;

  return {
    hoursRemaining,
    progressPercent,
    status,
    statusLabel,
    badgeColor,
    recommendedInterval: recInterval
  };
};

