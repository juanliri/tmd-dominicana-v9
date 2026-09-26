import { EmergencyServiceTruck, EmergencyTicket } from '../types';

export const EMERGENCY_SERVICE_TRUCKS: EmergencyServiceTruck[] = [
  {
    id: 'truck-01',
    unitCode: 'TMD-MÓVIL-01',
    baseLocation: 'Km 22 Duarte (Central)',
    driverTechnician: 'Ing. Carlos Alcántara & Tec. David Morillo',
    specialty: 'Diagnóstico Hidráulico & Eléctrico',
    currentStatus: 'available',
    currentLat: 18.5721,
    currentLng: -70.0210,
    equippedWithCrane: true,
    onboardOilRecoverySystem: true
  },
  {
    id: 'truck-02',
    unitCode: 'TMD-MÓVIL-02',
    baseLocation: 'Santiago / Cibao',
    driverTechnician: 'Tec. Rafael Peña',
    specialty: 'Mecánica Pesada & Motores',
    currentStatus: 'en_route',
    currentLat: 19.4517,
    currentLng: -70.6970,
    equippedWithCrane: true,
    onboardOilRecoverySystem: true
  },
  {
    id: 'truck-03',
    unitCode: 'TMD-MÓVIL-03',
    baseLocation: 'Punta Cana / Este',
    driverTechnician: 'Tec. Jonathan Valdez',
    specialty: 'Soldadura & Orugas en Campo',
    currentStatus: 'available',
    currentLat: 18.5601,
    currentLng: -68.3725,
    equippedWithCrane: false,
    onboardOilRecoverySystem: true
  },
  {
    id: 'truck-04',
    unitCode: 'TMD-MÓVIL-04',
    baseLocation: 'Barahona / Sur',
    driverTechnician: 'Tec. Manuel Féliz',
    specialty: 'Diagnóstico Hidráulico & Eléctrico',
    currentStatus: 'standby',
    currentLat: 18.2085,
    currentLng: -71.1008,
    equippedWithCrane: false,
    onboardOilRecoverySystem: false
  }
];

export const INITIAL_EMERGENCY_TICKETS: EmergencyTicket[] = [
  {
    id: 'tkt-901',
    ticketNumber: 'SOS-2026-081',
    clientName: 'Constructora del Cibao S.R.L.',
    phone: '809-555-8912',
    locationAddress: 'Tramo Carretera Duarte Km 45, Villa Altagracia',
    zone: 'Cibao',
    machineModel: 'Excavadora LiuGong 922E',
    faultDescription: 'Manguera principal de la bomba hidráulica reventada en zanja, derrame contenido pero equipo inoperativo.',
    severity: 'URGENTE_PARADA',
    status: 'en_camino',
    assignedUnitCode: 'TMD-MÓVIL-02',
    createdAt: 'Hace 22 minutos',
    estimatedArrivalMin: 18
  },
  {
    id: 'tkt-902',
    ticketNumber: 'SOS-2026-082',
    clientName: 'Consorcio Vial Este (Autovía)',
    phone: '829-441-0293',
    locationAddress: 'Bulevar Turístico del Este, Cruce Cabeza de Toro',
    zone: 'Este',
    machineModel: 'Rodillo Compactador Ammann ASC 110',
    faultDescription: 'Código de fallo en sistema de vibración hidráulica, tambor no genera impacto.',
    severity: 'ALERTA_OPERATIVA',
    status: 'asignado',
    assignedUnitCode: 'TMD-MÓVIL-03',
    createdAt: 'Hace 45 minutos',
    estimatedArrivalMin: 35
  }
];
