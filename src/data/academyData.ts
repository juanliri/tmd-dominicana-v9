import { AcademyCourse, CertifiedOperatorBadge } from '../types';

export const ACADEMY_COURSES: AcademyCourse[] = [
  {
    id: 'course-op-excavator',
    code: 'TMD-ACAD-101',
    title: 'Certificación Profesional de Operadores de Excavadoras Orugas',
    category: 'Operación Segura',
    targetMachinery: 'Excavadoras LiuGong 922E / JCB JS220 (15 a 35 Toneladas)',
    durationHours: 32,
    modality: 'Presencial Km 22',
    level: 'Nivel I (Básico)',
    priceUsd: 450,
    description: 'Capacitación intensiva teórico-práctica con simulador y pruebas reales en banco de tierra. Enfoque en estabilidad en taludes, zanjas según normas OSHA e inspección diaria.',
    syllabus: [
      'Módulo 1: Seguridad y análisis de riesgos en zona de excavación',
      'Módulo 2: Inspección pre-operacional 360° y niveles de fluidos',
      'Módulo 3: Técnicas de llenado óptimo de balde y ciclo por minuto',
      'Módulo 4: Trabajo seguro en pendientes, rampas y suelos inestables',
      'Módulo 5: Examen práctico en campo y evaluación de maniobras'
    ],
    nextSchedule: 'Inicia Lunes 5 de Octubre 2026',
    seatsAvailable: 6
  },
  {
    id: 'course-op-backhoe',
    code: 'TMD-ACAD-102',
    title: 'Operación Avanzada y Técnicas de Precisión en Retroexcavadoras 4x4',
    category: 'Operación Segura',
    targetMachinery: 'Retroexcavadoras JCB 3CX / 4CX y similares',
    durationHours: 24,
    modality: 'Teórico-Práctico',
    level: 'Nivel II (Intermedio)',
    priceUsd: 380,
    description: 'Especialización para operadores en obras urbanas e infraestructura vial: izaje seguro con pluma, uso de martillo hidráulico y cambio rápido de aditamentos.',
    syllabus: [
      'Módulo 1: Cinemática y centro de gravedad con estabilizadores',
      'Módulo 2: Zanjeo milimétrico para tuberías de agua y telecomunicaciones',
      'Módulo 3: Operación de martillo demoledor sin dañar vástagos',
      'Módulo 4: Maniobras de carga de camiones volteo en espacios confinados'
    ],
    nextSchedule: 'Inicia Jueves 15 de Octubre 2026',
    seatsAvailable: 8
  },
  {
    id: 'course-maint-pm',
    code: 'TMD-ACAD-201',
    title: 'Mantenimiento Preventivo y Diagnóstico de Fluidos para Jefes de Taller',
    category: 'Mantenimiento Preventivo',
    targetMachinery: 'Flotas Mixtas Diésel Pesadas',
    durationHours: 18,
    modality: 'Presencial Km 22',
    level: 'Nivel Máster (Avanzado)',
    priceUsd: 520,
    description: 'Entrenamiento técnico para supervisores de maquinaria pesada: interpretación de análisis espectrométricos de aceite SOS, calibración de presiones y reducción de paradas no programadas.',
    syllabus: [
      'Módulo 1: Tribología aplicada y lectura de curvas de desgaste',
      'Módulo 2: Protocolos de lubricación y grasa en clima tropical húmedo',
      'Módulo 3: Diagnóstico de circuitos de inyección Common Rail vs mecánico',
      'Módulo 4: Control de contaminación con filtración Donaldson de 4 micras'
    ],
    nextSchedule: 'Inicia Sábado 24 de Octubre 2026',
    seatsAvailable: 10
  }
];

export const DEMO_VERIFIED_OPERATORS: CertifiedOperatorBadge[] = [
  {
    id: 'badge-001',
    licenseNumber: 'TMD-OP-8924',
    operatorName: 'Juan Carlos Martínez',
    cedula: '001-1827364-5',
    company: 'Constructora del Cibao S.R.L.',
    photoUrl: '/assets/machinery/professional_portrait_of_an_industrial_master.jpg',
    approvedMachines: ['JCB 3CX', 'LiuGong 922E', 'Ammann ASC 110'],
    certificationLevel: 'Operador Maestro Pesado (Categoría A)',
    issueDate: '2025-05-10',
    expiryDate: '2027-05-10',
    status: 'valid'
  },
  {
    id: 'badge-002',
    licenseNumber: 'TMD-OP-9018',
    operatorName: 'Wilmer Almonte Reyes',
    cedula: '031-0982341-2',
    company: 'Agregados & Canteras del Este S.A.',
    photoUrl: '/assets/machinery/professional_portrait_of_civil_engineer_supervisor.jpg',
    approvedMachines: ['LiuGong 922E HD', 'LiuGong 856H'],
    certificationLevel: 'Especialista en Excavadoras de Cantera',
    issueDate: '2025-08-14',
    expiryDate: '2027-08-14',
    status: 'valid'
  }
];
