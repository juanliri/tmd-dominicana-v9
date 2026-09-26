import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  PatioTestDriveBooking, 
  PatioBookingStatus, 
  PatioTrackZone, 
  PatioMachineAvailability,
  PatioTimeSlotInfo,
  Machine 
} from '../types';
import { MACHINES_DATA } from '../data/catalog';
import { recordAdminAuditLog } from './auditService';
import { playNotificationSound } from './notificationService';

export const PATIO_COLLECTION = 'patio_test_drives';
export const PATIO_AVAILABILITY_COLLECTION = 'patio_availability';
const LOCAL_STORAGE_BOOKINGS_KEY = 'tmd_patio_bookings_cache';
const LOCAL_STORAGE_AVAILABILITY_KEY = 'tmd_patio_availability_cache';

// Master time slots at Patio Km 22
export const PATIO_TIME_SLOTS: PatioTimeSlotInfo[] = [
  {
    id: 'slot_0830',
    label: '08:30 AM - 10:00 AM',
    startTime: '08:30',
    endTime: '10:00',
    period: 'mañana'
  },
  {
    id: 'slot_1030',
    label: '10:30 AM - 12:00 PM',
    startTime: '10:30',
    endTime: '12:00',
    period: 'mañana'
  },
  {
    id: 'slot_1400',
    label: '02:00 PM - 03:30 PM',
    startTime: '14:00',
    endTime: '15:30',
    period: 'tarde'
  },
  {
    id: 'slot_1600',
    label: '04:00 PM - 05:30 PM',
    startTime: '16:00',
    endTime: '17:30',
    period: 'tarde'
  }
];

// Master Track Zones at Patio Km 22, Autopista Duarte
export const PATIO_TRACK_ZONES: {
  id: PatioTrackZone;
  name: string;
  description: string;
  suitableCategories: string[];
  maxSimultaneousMachines: number;
}[] = [
  {
    id: 'pista_1_excavacion',
    name: 'Pista 1: Banco de Tierra y Excavación Profunda',
    description: 'Fosa de 6m de profundidad, material rocoso y arcilla compacta para prueba de fuerza de desprendimiento y ciclos de balde.',
    suitableCategories: ['Excavadoras', 'Retroexcavadoras'],
    maxSimultaneousMachines: 2
  },
  {
    id: 'pista_2_rampa',
    name: 'Pista 2: Rampa de Pendiente 35° y Tracción',
    description: 'Pendiente pronunciada de grava suelta para comprobación de tracción 4x4, bloqueo de diferencial y frenado hidrostático.',
    suitableCategories: ['Retroexcavadoras', 'Tractores', 'Cargadores', 'Minicargadores'],
    maxSimultaneousMachines: 2
  },
  {
    id: 'pista_3_confinado',
    name: 'Pista 3: Circuito Urbano y Espacio Confinado',
    description: 'Pista con obstáculos perimetrales, radios de giro estrechos y simulación de zanjas en vías públicas.',
    suitableCategories: ['Minicargadores', 'Manipuladores', 'Compactación', 'Plantas de Concreto'],
    maxSimultaneousMachines: 3
  },
  {
    id: 'pista_4_velocidad',
    name: 'Pista 4: Recta de Rodamiento y Compactación Dinámica',
    description: 'Carril nivelado de 250m con inclinometría láser para rodillos vibratorios y motoniveladoras.',
    suitableCategories: ['Compactación', 'Motoniveladoras', 'Cargadores'],
    maxSimultaneousMachines: 2
  },
  {
    id: 'pista_5_agricola',
    name: 'Pista 5: Terreno Agrícola y Tiro de Arado',
    description: 'Suelo arado y fangoso para pruebas de toma de fuerza (PTO), levante hidráulico de tres puntos e implementos.',
    suitableCategories: ['Tractores', 'Implementos Agrícolas', 'Cosechadoras'],
    maxSimultaneousMachines: 3
  }
];

// Instructors stationed at Km 22
export const PATIO_INSTRUCTORS = [
  {
    id: 'inst_maximo',
    name: 'Ing. Máximo Cabrera',
    role: 'Instructor Máster de Maquinaria Pesada & Hidráulica',
    specialty: ['JCB', 'Excavadoras', 'Retroexcavadoras'],
    phone: '+1 (809) 555-2201',
    email: 'mcabrera@tmd.com.do'
  },
  {
    id: 'inst_dario',
    name: 'Téc. Darío Encarnación',
    role: 'Especialista en Ciclos de Carga & LiuGong',
    specialty: ['LiuGong', 'Cargadores', 'Minicargadores'],
    phone: '+1 (809) 555-2202',
    email: 'dencarnacion@tmd.com.do'
  },
  {
    id: 'inst_valentin',
    name: 'Ing. Agrón. Valentín Solano',
    role: 'Especialista en Equipos Agrícolas Kubota / LS Tractor',
    specialty: ['Kubota', 'LS Tractor', 'Implementos Agrícolas', 'Yomel'],
    phone: '+1 (809) 555-2203',
    email: 'vsolano@tmd.com.do'
  },
  {
    id: 'inst_yovanny',
    name: 'Téc. Yovanny Batista',
    role: 'Especialista en Compactación Ammann & Concreto IMER',
    specialty: ['Ammann', 'IMER', 'Compactación', 'Plantas de Concreto'],
    phone: '+1 (809) 555-2204',
    email: 'ybatista@tmd.com.do'
  }
];

// Pre-seeded demo bookings for instant rich experience
export const INITIAL_PATIO_BOOKINGS: PatioTestDriveBooking[] = [
  {
    id: 'km22_res_001',
    machineId: 'jcb-3dx-super',
    machineName: 'JCB 3DX Super EcoMax 4WD',
    machineBrand: 'JCB',
    machineCategory: 'Retroexcavadoras',
    machineModel: '3DX SUPER',
    machineImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=800',
    date: '2026-09-22',
    timeSlot: '08:30 AM - 10:00 AM',
    timeSlotId: 'slot_0830',
    status: 'confirmed',
    operatorName: 'Ing. Rafael Castillo',
    companyName: 'Constructora Malespín S.R.L.',
    clientEmail: 'rcastillo@malespin.com.do',
    phone: '809-567-8900',
    licenseCategory: 'Categoría 3 (Equipos Pesados)',
    testFocus: 'Ciclo hidráulico y fuerza de desprendimiento en banco de tierra',
    trackZone: 'pista_1_excavacion',
    trackZoneName: 'Pista 1: Banco de Tierra y Excavación Profunda',
    instructorRequested: true,
    assignedInstructor: 'Ing. Máximo Cabrera',
    assignedInstructorPhone: '+1 (809) 555-2201',
    telemetryRequired: true,
    safetyEquipmentConfirmed: true,
    qrAccessPass: 'TMD-KM22-8491A',
    clientNotes: 'Interesados en evaluar rendimiento para proyecto de canalización en San Cristóbal.',
    staffNotes: 'Equipo preparado con balde HD de 0.28m3. Tanque de diésel 100%.',
    machineOperatingHours: 12.4,
    fuelLevelPercent: 95,
    createdAt: '2026-09-18T14:30:00.000Z',
    updatedAt: '2026-09-18T16:00:00.000Z'
  },
  {
    id: 'km22_res_002',
    machineId: 'liugong-922e',
    machineName: 'LiuGong 922E HD Excavadora de Orugas',
    machineBrand: 'LiuGong',
    machineCategory: 'Excavadoras',
    machineModel: '922E HD',
    machineImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800',
    date: '2026-09-22',
    timeSlot: '10:30 AM - 12:00 PM',
    timeSlotId: 'slot_1030',
    status: 'confirmed',
    operatorName: 'Sr. Manuel Tejada',
    companyName: 'Constructora Rizek & Asoc.',
    clientEmail: 'mtejada@rizek.com.do',
    phone: '809-541-2000',
    licenseCategory: 'Categoría 4 (Especial Maquinaria)',
    testFocus: 'Consumo de combustible por ciclo de carga y ralentí',
    trackZone: 'pista_1_excavacion',
    trackZoneName: 'Pista 1: Banco de Tierra y Excavación Profunda',
    instructorRequested: true,
    assignedInstructor: 'Téc. Darío Encarnación',
    assignedInstructorPhone: '+1 (809) 555-2202',
    telemetryRequired: true,
    safetyEquipmentConfirmed: true,
    qrAccessPass: 'TMD-KM22-9923B',
    clientNotes: 'Comparativa de telemetría vs flota existente para compra de 3 unidades.',
    staffNotes: 'Telemetría LiuGong iLink activada y calibrada con medidor de caudal.',
    machineOperatingHours: 45.0,
    fuelLevelPercent: 100,
    createdAt: '2026-09-19T09:15:00.000Z',
    updatedAt: '2026-09-19T10:00:00.000Z'
  },
  {
    id: 'km22_res_003',
    machineId: 'kubota-mu5502',
    machineName: 'Kubota MU5502 4WD Tractor Agrícola',
    machineBrand: 'Kubota',
    machineCategory: 'Tractores',
    machineModel: 'MU5502',
    machineImage: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&q=80&w=800',
    date: '2026-09-23',
    timeSlot: '08:30 AM - 10:00 AM',
    timeSlotId: 'slot_0830',
    status: 'pending',
    operatorName: 'Agrónomo José Abreu',
    companyName: 'Consorcio Azucarero Central',
    clientEmail: 'jabreu@consorcio.com.do',
    phone: '809-524-3311',
    licenseCategory: 'Categoría 3 (Equipos Pesados)',
    testFocus: 'Tracción y estabilidad en pendientes pronunciadas',
    trackZone: 'pista_5_agricola',
    trackZoneName: 'Pista 5: Terreno Agrícola y Tiro de Arado',
    instructorRequested: true,
    assignedInstructor: 'Ing. Agrón. Valentín Solano',
    assignedInstructorPhone: '+1 (809) 555-2203',
    telemetryRequired: false,
    safetyEquipmentConfirmed: true,
    qrAccessPass: 'TMD-KM22-4412C',
    clientNotes: 'Desean acoplar rastra de discos Yomel durante la prueba de campo.',
    staffNotes: 'Rastra acoplada y contrapesos frontales instalados.',
    machineOperatingHours: 8.5,
    fuelLevelPercent: 90,
    createdAt: '2026-09-20T11:00:00.000Z',
    updatedAt: '2026-09-20T11:00:00.000Z'
  },
  {
    id: 'km22_res_004',
    machineId: 'ammann-asc110',
    machineName: 'Ammann ASC 110 Rodillo Compactador Monocilíndrico',
    machineBrand: 'Ammann',
    machineCategory: 'Compactación',
    machineModel: 'ASC 110',
    machineImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=800',
    date: '2026-09-24',
    timeSlot: '14:00 PM - 03:30 PM',
    timeSlotId: 'slot_1400',
    status: 'confirmed',
    operatorName: 'Ing. Félix Peña',
    companyName: 'Constructora Estrella',
    clientEmail: 'fpena@estrella.com.do',
    phone: '809-582-7000',
    licenseCategory: 'Categoría 3 (Equipos Pesados)',
    testFocus: 'Ergonomía de cabina, visibilidad y mandos joystick',
    trackZone: 'pista_4_velocidad',
    trackZoneName: 'Pista 4: Recta de Rodamiento y Compactación Dinámica',
    instructorRequested: true,
    assignedInstructor: 'Téc. Yovanny Batista',
    assignedInstructorPhone: '+1 (809) 555-2204',
    telemetryRequired: true,
    safetyEquipmentConfirmed: true,
    qrAccessPass: 'TMD-KM22-6712D',
    clientNotes: 'Evaluación del sistema de compactación continua ACE-Force.',
    staffNotes: 'Sensor ACE calibrado.',
    machineOperatingHours: 20.0,
    fuelLevelPercent: 88,
    createdAt: '2026-09-19T17:00:00.000Z',
    updatedAt: '2026-09-20T08:30:00.000Z'
  }
];

// Generate initial availability map for all catalog machines at Km 22
export const generateInitialMachineAvailability = (): Record<string, PatioMachineAvailability> => {
  const map: Record<string, PatioMachineAvailability> = {};
  
  MACHINES_DATA.forEach((m, idx) => {
    let instructor = PATIO_INSTRUCTORS[0].name;
    if (m.brand === 'LiuGong') instructor = PATIO_INSTRUCTORS[1].name;
    else if (m.brand === 'Kubota' || m.brand === 'LS Tractor' || m.brand === 'Yomel') instructor = PATIO_INSTRUCTORS[2].name;
    else if (m.brand === 'Ammann' || m.brand === 'IMER') instructor = PATIO_INSTRUCTORS[3].name;

    let currentStatus: 'disponible' | 'en_pista' | 'mantenimiento' | 'reservado_vip' = 'disponible';
    let trackZone = 'Patio Central Km 22';
    
    if (idx === 0) {
      currentStatus = 'disponible';
      trackZone = 'Pista 1: Excavación Profunda';
    } else if (idx === 1) {
      currentStatus = 'disponible';
      trackZone = 'Pista 1: Banco de Tierra';
    } else if (idx === 4) {
      currentStatus = 'en_pista';
      trackZone = 'Pista 2: Rampa de Tracción';
    } else if (idx === 6) {
      currentStatus = 'mantenimiento';
      trackZone = 'Taller Central Km 22 (Inspección 500h)';
    }

    map[m.id] = {
      id: m.id,
      machineId: m.id,
      machineName: `${m.brand} ${m.modelCode} - ${m.name}`,
      machineBrand: m.brand,
      machineCategory: m.category,
      isAvailable: currentStatus !== 'mantenimiento',
      currentStatus,
      currentTrackZone: trackZone,
      nextAvailableSlot: currentStatus === 'mantenimiento' ? '2026-09-28' : 'Disponible Hoy',
      blockedDates: currentStatus === 'mantenimiento' ? ['2026-09-21', '2026-09-22', '2026-09-23'] : [],
      blockedSlots: [],
      totalCompletedDemos: 8 + (idx * 3),
      instructorLead: instructor,
      fuelLevel: 85 + (idx % 15),
      operatingHours: 10 + (idx * 14.5),
      lastInspectionDate: '2026-09-15',
      updatedAt: new Date().toISOString()
    };
  });

  return map;
};

// =========================================================================
// SERVICE FUNCTIONS (FIRESTORE WITH LOCAL CACHE FALLBACK)
// =========================================================================

/**
 * Get cached local bookings
 */
export const getLocalPatioBookings = (): PatioTestDriveBooking[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read local patio bookings cache:', e);
  }
  return INITIAL_PATIO_BOOKINGS;
};

/**
 * Save cached local bookings
 */
export const setLocalPatioBookings = (bookings: PatioTestDriveBooking[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn('Could not save local patio bookings cache:', e);
  }
};

/**
 * Get cached local machine availability
 */
export const getLocalPatioAvailability = (): Record<string, PatioMachineAvailability> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AVAILABILITY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read local patio availability cache:', e);
  }
  return generateInitialMachineAvailability();
};

/**
 * Save cached local machine availability
 */
export const setLocalPatioAvailability = (avail: Record<string, PatioMachineAvailability>): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_AVAILABILITY_KEY, JSON.stringify(avail));
  } catch (e) {
    console.warn('Could not save local patio availability cache:', e);
  }
};

/**
 * Fetch all test drive bookings from Firestore with cache fallback
 */
export const fetchPatioBookings = async (): Promise<PatioTestDriveBooking[]> => {
  try {
    const colRef = collection(db, PATIO_COLLECTION);
    const q = query(colRef, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const bookings: PatioTestDriveBooking[] = [];
      snapshot.forEach((docSnap) => {
        bookings.push({ ...docSnap.data() } as PatioTestDriveBooking);
      });
      setLocalPatioBookings(bookings);
      return bookings;
    }
  } catch (error) {
    console.warn('[Patio Service] Firestore read error, using local fallback:', error);
  }
  return getLocalPatioBookings();
};

/**
 * Real-time subscription to Patio Test Drive bookings
 */
export const subscribeToPatioBookings = (
  callback: (bookings: PatioTestDriveBooking[]) => void
): (() => void) => {
  try {
    const colRef = collection(db, PATIO_COLLECTION);
    const q = query(colRef, orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const bookings: PatioTestDriveBooking[] = [];
          snapshot.forEach((docSnap) => {
            bookings.push({ ...docSnap.data() } as PatioTestDriveBooking);
          });
          setLocalPatioBookings(bookings);
          callback(bookings);
        } else {
          // If Firestore is empty, return local data
          callback(getLocalPatioBookings());
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, PATIO_COLLECTION);
        callback(getLocalPatioBookings());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Patio Service] Snapshot subscription failed, fallback to local polling:', err);
    callback(getLocalPatioBookings());
    return () => {};
  }
};

/**
 * Fetch all machine availability statuses from Firestore
 */
export const fetchPatioAvailability = async (): Promise<Record<string, PatioMachineAvailability>> => {
  try {
    const colRef = collection(db, PATIO_AVAILABILITY_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const result: Record<string, PatioMachineAvailability> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as PatioMachineAvailability;
        result[data.machineId || docSnap.id] = data;
      });
      setLocalPatioAvailability(result);
      return result;
    }
  } catch (error) {
    console.warn('[Patio Service] Firestore availability read error, using local fallback:', error);
  }
  return getLocalPatioAvailability();
};

/**
 * Real-time subscription to Machine Availability in Patio Km 22
 */
export const subscribeToPatioAvailability = (
  callback: (availability: Record<string, PatioMachineAvailability>) => void
): (() => void) => {
  try {
    const colRef = collection(db, PATIO_AVAILABILITY_COLLECTION);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const result: Record<string, PatioMachineAvailability> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as PatioMachineAvailability;
            result[data.machineId || docSnap.id] = data;
          });
          setLocalPatioAvailability(result);
          callback(result);
        } else {
          callback(getLocalPatioAvailability());
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, PATIO_AVAILABILITY_COLLECTION);
        callback(getLocalPatioAvailability());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Patio Service] Availability subscription failed:', err);
    callback(getLocalPatioAvailability());
    return () => {};
  }
};

/**
 * Create a new test drive booking at Patio Km 22
 */
export const createPatioBooking = async (
  bookingInput: Omit<PatioTestDriveBooking, 'id' | 'qrAccessPass' | 'createdAt' | 'updatedAt'> & {
    id?: string;
  }
): Promise<PatioTestDriveBooking> => {
  const timestamp = new Date().toISOString();
  const bookingId = bookingInput.id || `km22_res_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const qrPass = `TMD-KM22-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

  // Automatically find suitable instructor if not provided
  let instructor = bookingInput.assignedInstructor;
  let instructorPhone = bookingInput.assignedInstructorPhone;
  if (!instructor) {
    const matched = PATIO_INSTRUCTORS.find(inst => 
      inst.specialty.includes(bookingInput.machineBrand) || 
      inst.specialty.includes(bookingInput.machineCategory)
    ) || PATIO_INSTRUCTORS[0];
    instructor = matched.name;
    instructorPhone = matched.phone;
  }

  // Find track zone name
  const trackInfo = PATIO_TRACK_ZONES.find(p => p.id === bookingInput.trackZone);
  const trackZoneName = trackInfo?.name || 'Pista Principal Patio Km 22';

  const newBooking: PatioTestDriveBooking = {
    ...bookingInput,
    id: bookingId,
    qrAccessPass: qrPass,
    assignedInstructor: instructor,
    assignedInstructorPhone: instructorPhone,
    trackZoneName,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  // 1. Save to local storage first for optimistic UI
  const localList = getLocalPatioBookings();
  const updatedList = [newBooking, ...localList.filter(b => b.id !== bookingId)];
  setLocalPatioBookings(updatedList);

  // 2. Persist to Firestore `/patio_test_drives/{bookingId}`
  try {
    const docRef = doc(db, PATIO_COLLECTION, bookingId);
    await setDoc(docRef, newBooking);
    console.info(`[Patio Service] Saved booking ${bookingId} to Firestore.`);
  } catch (error) {
    console.warn('[Patio Service] Could not write to Firestore, maintained in local cache:', error);
  }

  // 3. Record Audit Log
  recordAdminAuditLog({
    actorEmail: bookingInput.clientEmail || 'contratista@tmd.com.do',
    actorName: bookingInput.operatorName,
    actorRole: 'staff',
    actionType: 'QUOTE_STATUS_OVERRIDE',
    targetEntity: 'quotes',
    targetId: bookingId,
    targetName: `Prueba en Patio Km 22: ${bookingInput.machineName}`,
    newValue: {
      fecha: bookingInput.date,
      turno: bookingInput.timeSlot,
      empresa: bookingInput.companyName,
      instructor
    },
    details: `Nueva cita agendada en Patio Km 22 para ${bookingInput.machineName} el ${bookingInput.date} (${bookingInput.timeSlot}). Pase: ${qrPass}`
  }).catch(() => {});

  // 4. Acoustic feedback
  playNotificationSound();

  return newBooking;
};

/**
 * Update an existing test drive booking status (e.g. Confirmed, In Progress, Completed, Cancelled)
 */
export const updatePatioBookingStatus = async (
  bookingId: string,
  newStatus: PatioBookingStatus,
  staffNotes?: string,
  assignedInstructor?: string
): Promise<void> => {
  const timestamp = new Date().toISOString();

  // Local update
  const list = getLocalPatioBookings();
  const idx = list.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      status: newStatus,
      ...(staffNotes !== undefined ? { staffNotes } : {}),
      ...(assignedInstructor ? { assignedInstructor } : {}),
      updatedAt: timestamp
    };
    setLocalPatioBookings([...list]);
  }

  // Firestore update
  try {
    const docRef = doc(db, PATIO_COLLECTION, bookingId);
    const updatePayload: Record<string, any> = {
      status: newStatus,
      updatedAt: timestamp
    };
    if (staffNotes !== undefined) updatePayload.staffNotes = staffNotes;
    if (assignedInstructor) updatePayload.assignedInstructor = assignedInstructor;
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    console.warn('[Patio Service] Could not update booking status in Firestore:', err);
  }

  // Audit
  recordAdminAuditLog({
    actorEmail: 'staff@tmd.com.do',
    actorName: 'Coordinador Patio Km 22',
    actorRole: 'staff',
    actionType: 'QUOTE_STATUS_OVERRIDE',
    targetEntity: 'quotes',
    targetId: bookingId,
    targetName: `Reserva ${bookingId}`,
    details: `Estado de prueba cambiado a ${newStatus.toUpperCase()}.${staffNotes ? ` Notas: ${staffNotes}` : ''}`
  }).catch(() => {});
};

/**
 * Reschedule a booking date and time slot
 */
export const reschedulePatioBooking = async (
  bookingId: string,
  newDate: string,
  newTimeSlot: string,
  newTimeSlotId: string,
  reason?: string
): Promise<void> => {
  const timestamp = new Date().toISOString();

  // Local update
  const list = getLocalPatioBookings();
  const idx = list.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      date: newDate,
      timeSlot: newTimeSlot,
      timeSlotId: newTimeSlotId,
      status: 'rescheduled',
      staffNotes: reason ? `Reagendada: ${reason}` : list[idx].staffNotes,
      updatedAt: timestamp
    };
    setLocalPatioBookings([...list]);
  }

  // Firestore update
  try {
    const docRef = doc(db, PATIO_COLLECTION, bookingId);
    await updateDoc(docRef, {
      date: newDate,
      timeSlot: newTimeSlot,
      timeSlotId: newTimeSlotId,
      status: 'rescheduled',
      ...(reason ? { staffNotes: `Reagendada: ${reason}` } : {}),
      updatedAt: timestamp
    });
  } catch (err) {
    console.warn('[Patio Service] Firestore reschedule error:', err);
  }
};

/**
 * Update machine availability and maintenance status in Patio Km 22
 */
export const updateMachinePatioAvailability = async (
  machineId: string,
  updates: Partial<PatioMachineAvailability>
): Promise<void> => {
  const timestamp = new Date().toISOString();
  const currentMap = getLocalPatioAvailability();
  const existing = currentMap[machineId] || {
    id: machineId,
    machineId,
    machineName: machineId,
    machineBrand: 'TMD',
    machineCategory: 'Maquinaria',
    isAvailable: true,
    currentStatus: 'disponible',
    totalCompletedDemos: 0,
    instructorLead: 'Ing. Máximo Cabrera',
    fuelLevel: 100,
    operatingHours: 0,
    lastInspectionDate: new Date().toISOString().split('T')[0],
    updatedAt: timestamp
  };

  const updated: PatioMachineAvailability = {
    ...existing,
    ...updates,
    updatedAt: timestamp
  };

  currentMap[machineId] = updated;
  setLocalPatioAvailability(currentMap);

  try {
    const docRef = doc(db, PATIO_AVAILABILITY_COLLECTION, machineId);
    await setDoc(docRef, updated, { merge: true });
  } catch (err) {
    console.warn('[Patio Service] Firestore update availability error:', err);
  }

  recordAdminAuditLog({
    actorEmail: 'staff@tmd.com.do',
    actorName: 'Jefe de Patio Km 22',
    actorRole: 'staff',
    actionType: 'INVENTORY_STOCK_UPDATE',
    targetEntity: 'inventory_machines',
    targetId: machineId,
    targetName: updated.machineName,
    details: `Estado de disponibilidad modificado a: ${updated.currentStatus.toUpperCase()}. Combustible: ${updated.fuelLevel}%`
  }).catch(() => {});
};

/**
 * Check if a given machine is available on a specific date and time slot
 */
export const checkSlotAvailability = (
  machineId: string,
  date: string,
  timeSlotId: string,
  allBookings: PatioTestDriveBooking[],
  availabilityMap: Record<string, PatioMachineAvailability>
): {
  isAvailable: boolean;
  reason?: string;
  booking?: PatioTestDriveBooking;
} => {
  const machineAvail = availabilityMap[machineId];
  
  // 1. Check if machine is in maintenance or blocked
  if (machineAvail) {
    if (machineAvail.currentStatus === 'mantenimiento') {
      return { isAvailable: false, reason: 'Equipo en mantenimiento preventivo / inspección técnica' };
    }
    if (machineAvail.blockedDates?.includes(date)) {
      return { isAvailable: false, reason: 'Fecha bloqueada por revisión técnica de taller' };
    }
    const isSlotBlocked = machineAvail.blockedSlots?.some(s => s.date === date && s.slotId === timeSlotId);
    if (isSlotBlocked) {
      return { isAvailable: false, reason: 'Turno bloqueado para mantenimiento de orugas/hidráulico' };
    }
  }

  // 2. Check if another active booking exists for this machine on this date + slot
  const conflictingBooking = allBookings.find(
    b => b.machineId === machineId && 
         b.date === date && 
         (b.timeSlotId === timeSlotId || b.timeSlot.includes(timeSlotId)) &&
         b.status !== 'cancelled'
  );

  if (conflictingBooking) {
    return { 
      isAvailable: false, 
      reason: `Turno ya reservado por ${conflictingBooking.companyName || conflictingBooking.operatorName}`,
      booking: conflictingBooking 
    };
  }

  return { isAvailable: true };
};

/**
 * Generate formatted WhatsApp share URL for direct operator / customer confirmation
 */
export const getPatioBookingWhatsAppUrl = (booking: PatioTestDriveBooking): string => {
  const text = encodeURIComponent(
    `🚜 *DEMOSTRACIÓN TÉCNICA AGENDADA - PATIO KM 22 TMD*\n\n` +
    `Hola ${booking.operatorName},\n` +
    `Tu cita para probar el equipo *${booking.machineName}* ha sido confirmada.\n\n` +
    `📅 *Fecha:* ${booking.date}\n` +
    `⏰ *Horario:* ${booking.timeSlot}\n` +
    `📍 *Ubicación:* Patio Central Km 22, Autopista Duarte, Santo Domingo Oeste\n` +
    `🏁 *Pista:* ${booking.trackZoneName}\n` +
    `👷 *Instructor Asignado:* ${booking.assignedInstructor} (${booking.assignedInstructorPhone || '809-555-2201'})\n` +
    `🎫 *Pase de Entrada Industrial:* ${booking.qrAccessPass}\n\n` +
    `⚠️ *Requisitos Obligatorios:* Casco, botas con casquillo de seguridad y licencia de conducir vigente.\n\n` +
    `🗺️ *Ubicación en Google Maps:* https://maps.google.com/?q=18.5721,-70.0234\n\n` +
    `¡Te esperamos en TMD Dominicana!`
  );

  const cleanPhone = booking.phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${text}`;
};
