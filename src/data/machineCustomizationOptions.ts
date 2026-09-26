import { Machine, MachineCustomizationOption } from '../types';
import { USD_TO_DOP_RATE } from './catalog';

export const ALL_CUSTOMIZATION_OPTIONS: MachineCustomizationOption[] = [
  // ==========================================
  // 1. ADITAMIENTOS E IMPLEMENTOS DE TRABAJO
  // ==========================================
  {
    id: 'opt-att-standard-bucket',
    name: 'Cucharón Estándar de Fábrica OEM',
    category: 'attachments',
    categoryLabel: 'Aditamentos e Implementos',
    description: 'Cucharón de uso general con dientes atornillables para excavación y carga en terrenos estándar.',
    minPriceUsd: 0,
    maxPriceUsd: 0,
    isIncludedDefault: true,
    exclusiveGroup: 'primary_bucket',
    applicableCategories: ['Excavadoras', 'Retroexcavadoras', 'Cargadores', 'Minicargadores'],
    specsBadge: 'Capacidad nominal estándar'
  },
  {
    id: 'opt-att-hd-rock-bucket',
    name: 'Cucharón Reforzado HD para Cantera y Roca',
    category: 'attachments',
    categoryLabel: 'Aditamentos e Implementos',
    description: 'Fabricado en acero Hardox 450 de alta resistencia a la abrasión con cantoneras blindadas y protectores de labios para roca volcánica y canteras dominicanas.',
    minPriceUsd: 3200,
    maxPriceUsd: 4400,
    exclusiveGroup: 'primary_bucket',
    applicableCategories: ['Excavadoras', 'Retroexcavadoras', 'Cargadores'],
    specsBadge: 'Acero Hardox 450'
  },
  {
    id: 'opt-att-hydraulic-breaker',
    name: 'Martillo Hidráulico Rompedor de Roca con Puntero Cónico',
    category: 'attachments',
    categoryLabel: 'Aditamentos e Implementos',
    description: 'Martillo de impacto de alta frecuencia con amortiguador de vibración para rotura de roca caliza, hormigón armado y zanjeo en roca firme.',
    minPriceUsd: 7800,
    maxPriceUsd: 10500,
    applicableCategories: ['Excavadoras', 'Retroexcavadoras', 'Minicargadores'],
    specsBadge: '800-1,400 BPM / 130 Bar'
  },
  {
    id: 'opt-att-quick-hitch',
    name: 'Acoplador Rápido Hidráulico Quick-Hitch',
    category: 'attachments',
    categoryLabel: 'Aditamentos e Implementos',
    description: 'Sistema de enganche y desenganche de implementos desde cabina con doble válvula de retención y bloqueo mecánico de seguridad certificado ISO 13031.',
    minPriceUsd: 2400,
    maxPriceUsd: 3200,
    applicableCategories: ['Excavadoras', 'Retroexcavadoras', 'Cargadores', 'Minicargadores'],
    specsBadge: 'Cambio en < 15 seg'
  },
  {
    id: 'opt-att-pallet-forks',
    name: 'Horquillas Porta-Pallets Industriales de Acero Forjado',
    category: 'attachments',
    categoryLabel: 'Aditamentos e Implementos',
    description: 'Juego de horquillas ajustables de alta capacidad para descarga de pallets de cemento, varillas y materiales en obra sin necesidad de montacargas.',
    minPriceUsd: 1450,
    maxPriceUsd: 1950,
    applicableCategories: ['Retroexcavadoras', 'Cargadores', 'Minicargadores', 'Manipuladores', 'Tractores'],
    specsBadge: 'Capacidad 3,500 kg'
  },
  {
    id: 'opt-att-hydraulic-auger',
    name: 'Hoyadora / Barrenador Hidráulico de Alta Torsión',
    category: 'attachments',
    categoryLabel: 'Aditamentos e Implementos',
    description: 'Unidad de barrena planetaria con broca intercambiable para perforación rápida de postes eléctricos, cimientos, cercas y pilotaje.',
    minPriceUsd: 2900,
    maxPriceUsd: 3800,
    applicableCategories: ['Minicargadores', 'Retroexcavadoras', 'Excavadoras', 'Tractores'],
    specsBadge: 'Diámetro hasta 600 mm'
  },
  {
    id: 'opt-att-demolition-grapple',
    name: 'Garra Hidráulica de Demolición y Desmonte (Grapple)',
    category: 'attachments',
    categoryLabel: 'Aditamentos e Implementos',
    description: 'Mandíbulas de acero templado con rotación hidráulica 360° para manipulación de chatarra, troncos en desmonte y escombros de demolición.',
    minPriceUsd: 4800,
    maxPriceUsd: 6200,
    applicableCategories: ['Excavadoras', 'Minicargadores', 'Manipuladores'],
    specsBadge: 'Presión 250 Bar'
  },
  {
    id: 'opt-att-single-shank-ripper',
    name: 'Desgarrador (Ripper) Unidiente Heavy-Duty',
    category: 'attachments',
    categoryLabel: 'Aditamentos e Implementos',
    description: 'Diente desgarrador reforzado para fracturar estratos duros, asfalto y capas superficiales antes de excavar en cortes viales.',
    minPriceUsd: 3400,
    maxPriceUsd: 4300,
    applicableCategories: ['Excavadoras'],
    specsBadge: 'Penetración 1.2 m'
  },

  // ==========================================
  // 2. CABINA Y ERGONOMÍA DEL OPERADOR
  // ==========================================
  {
    id: 'opt-cab-open-canopy',
    name: 'Canopia Abierta con Estructura FOPS/ROPS Nivel II',
    category: 'cabin',
    categoryLabel: 'Cabina y Ergonomía',
    description: 'Protección integral antivuelco y contra caída de objetos con parabrisas frontal y visera parasol para faenas agrícolas o climas abiertos.',
    minPriceUsd: 0,
    maxPriceUsd: 0,
    isIncludedDefault: true,
    exclusiveGroup: 'cabin_type',
    specsBadge: 'ROPS / FOPS Certificado'
  },
  {
    id: 'opt-cab-enclosed-ac',
    name: 'Cabina Cerrada Panorámica Climatizada con A/C Tropicalizado',
    category: 'cabin',
    categoryLabel: 'Cabina y Ergonomía',
    description: 'Aislamiento acústico presurizado, aire acondicionado de alto caudal para temperaturas dominicanas de más de 35°C, limpiaparabrisas intermitente y lunas tintadas.',
    minPriceUsd: 4200,
    maxPriceUsd: 5500,
    exclusiveGroup: 'cabin_type',
    specsBadge: 'A/C Tropicalizado 8.5 kW'
  },
  {
    id: 'opt-cab-deluxe-climate',
    name: 'Paquete Confort Deluxe: Clima Automático + Asiento Neumático con Calefacción & Audio Bluetooth',
    category: 'cabin',
    categoryLabel: 'Cabina y Ergonomía',
    description: 'Máxima ergonomía con suspensión neumática activa, soporte lumbar ortopédico, consola con pantalla táctil, manos libres bluetooth y cargador inalámbrico.',
    minPriceUsd: 5900,
    maxPriceUsd: 7400,
    exclusiveGroup: 'cabin_type',
    specsBadge: 'Suspensión Grammer Deluxe'
  },
  {
    id: 'opt-cab-hepa-filter',
    name: 'Sistema de Filtrado HEPA Positivo Anti-Polvo y Gases para Canteras',
    category: 'cabin',
    categoryLabel: 'Cabina y Ergonomía',
    description: 'Presurizador centrífugo continuo con filtro HEPA que impide la entrada de polvo de sílice y micropartículas dañinas para el operador en zonas áridas.',
    minPriceUsd: 1850,
    maxPriceUsd: 2450,
    specsBadge: 'Filtrado 99.97% Sílice'
  },

  // ==========================================
  // 3. TREN DE FUERZA, HIDRÁULICA Y PROTECCIÓN
  // ==========================================
  {
    id: 'opt-pwr-high-flow-hydraulics',
    name: 'Línea Hidráulica Auxiliar de Alto Flujo Proporcional (High-Flow)',
    category: 'powertrain_hydraulics',
    categoryLabel: 'Hidráulica y Blindaje',
    description: 'Bomba hidráulica de pistones axiales de caudal variable para operar martillos pesados, desbrozadoras y fresadoras de asfalto sin pérdida de fuerza.',
    minPriceUsd: 2800,
    maxPriceUsd: 3600,
    applicableCategories: ['Excavadoras', 'Retroexcavadoras', 'Minicargadores'],
    specsBadge: 'Hasta 145 L/min'
  },
  {
    id: 'opt-pwr-auto-lubrication',
    name: 'Sistema de Auto-Lubricación Centralizada Pro-Lube Automática',
    category: 'powertrain_hydraulics',
    categoryLabel: 'Hidráulica y Blindaje',
    description: 'Bomba eléctrica programable con depósito de grasa que lubrica automáticamente todos los bujes, pasadores y articulaciones durante el trabajo, reduciendo 85% el desgaste.',
    minPriceUsd: 2900,
    maxPriceUsd: 3800,
    specsBadge: 'Depósito 4 kg Grasa EP-2'
  },
  {
    id: 'opt-pwr-undercarriage-armor',
    name: 'Blindaje Inferior Heavy-Duty de Acero Reforzado para Chasis y Cárter',
    category: 'powertrain_hydraulics',
    categoryLabel: 'Hidráulica y Blindaje',
    description: 'Planchas de protección bajo el cárter, transmisión y tanque de combustible para prevenir perforaciones por tocones y rocas salientes.',
    minPriceUsd: 1750,
    maxPriceUsd: 2300,
    specsBadge: 'Placa Acero 12 mm'
  },
  {
    id: 'opt-pwr-cyclonic-prefilter',
    name: 'Pre-Filtro de Aire Ciclónico Donaldson TopSpin con Doble Separador de Agua',
    category: 'powertrain_hydraulics',
    categoryLabel: 'Hidráulica y Blindaje',
    description: 'Expulsa el 95% del polvo antes de llegar al filtro de aire principal y purga agua condensada del diésel común en la República Dominicana.',
    minPriceUsd: 850,
    maxPriceUsd: 1150,
    specsBadge: 'Protección Motor Diesel'
  },
  {
    id: 'opt-pwr-eco-idle',
    name: 'Sistema Automático Eco-Idle de Parada y Ahorro de Combustible',
    category: 'powertrain_hydraulics',
    categoryLabel: 'Hidráulica y Blindaje',
    description: 'Apaga el motor tras 4 minutos continuos de inactividad del joystick reduciendo el consumo diésel hasta 12% por turno.',
    minPriceUsd: 650,
    maxPriceUsd: 890,
    specsBadge: 'Ahorro Diésel ~12%'
  },

  // ==========================================
  // 4. TECNOLOGÍA, TELEMETRÍA Y SEGURIDAD
  // ==========================================
  {
    id: 'opt-tech-livelink-basic',
    name: 'Telemetría Satelital Básica 1 Año (Ubicación GPS & Horómetro)',
    category: 'technology_safety',
    categoryLabel: 'Tecnología y Seguridad',
    description: 'Monitoreo de horas de trabajo, geocerca de seguridad en patio y ubicación satelital GPS en tiempo real con chip celular dominicano.',
    minPriceUsd: 0,
    maxPriceUsd: 0,
    isIncludedDefault: true,
    exclusiveGroup: 'telematics_tier',
    specsBadge: 'Incluido en Flota Nueva'
  },
  {
    id: 'opt-tech-livelink-advanced',
    name: 'Telemetría Avanzada 3 Años: Diagnóstico Remoto CAN-Bus & Consumo Diésel',
    category: 'technology_safety',
    categoryLabel: 'Tecnología y Seguridad',
    description: 'Monitoreo total de códigos de falla del motor, presión hidráulica, consumo en litros/hora, alertas de exceso de temperatura y reportes automáticos semanales.',
    minPriceUsd: 1350,
    maxPriceUsd: 1800,
    exclusiveGroup: 'telematics_tier',
    specsBadge: 'Suscripción 36 Meses'
  },
  {
    id: 'opt-tech-360-camera-radar',
    name: 'Sistema de Cámaras 360° Bird-Eye con Radar y Detección de Personas',
    category: 'technology_safety',
    categoryLabel: 'Tecnología y Seguridad',
    description: 'Cuatro cámaras HD de ángulo ultra-ancho unificadas en pantalla de 10" con alertas sonoras e infrarrojas al detectar peatones u obstáculos en puntos ciegos.',
    minPriceUsd: 2400,
    maxPriceUsd: 3100,
    specsBadge: 'Visión 360° + Sensor Radar'
  },
  {
    id: 'opt-tech-2d-grade-control',
    name: 'Sistema de Control y Nivelación 2D con Sensores de Pendiente y Láser',
    category: 'technology_safety',
    categoryLabel: 'Tecnología y Seguridad',
    description: 'Guía visual en pantalla para mantener cotas exactas en explanaciones, terraplenes y taludes sin necesidad de topógrafos estacando continuamente.',
    minPriceUsd: 6900,
    maxPriceUsd: 8800,
    applicableCategories: ['Excavadoras', 'Tractores', 'Cargadores'],
    specsBadge: 'Precisión ± 10 mm'
  },
  {
    id: 'opt-tech-onboard-weighing',
    name: 'Sistema de Pesaje Dinámico en Balde con Impresora de Cabina',
    category: 'technology_safety',
    categoryLabel: 'Tecnología y Seguridad',
    description: 'Calcula el peso neto levantado en cada ciclo de carga a volquetas para evitar sobrecargas viales del MOPC y agilizar el despacho de agregados.',
    minPriceUsd: 3700,
    maxPriceUsd: 4700,
    applicableCategories: ['Cargadores', 'Excavadoras', 'Retroexcavadoras'],
    specsBadge: 'Margen de error < 1.5%'
  },

  // ==========================================
  // 5. TREN DE RODAJE Y NEUMÁTICOS
  // ==========================================
  {
    id: 'opt-und-standard-undercarriage',
    name: 'Tren de Rodaje / Neumáticos de Fábrica OEM',
    category: 'undercarriage_tires',
    categoryLabel: 'Rodaje y Neumáticos',
    description: 'Configuración estándar optimizada para terrenos mixtos de tierra, grava compactada y obras residenciales.',
    minPriceUsd: 0,
    maxPriceUsd: 0,
    isIncludedDefault: true,
    exclusiveGroup: 'undercarriage_type',
    specsBadge: 'Perfil Mixto Estándar'
  },
  {
    id: 'opt-und-hd-triple-grouser',
    name: 'Zapatas de Oruga Reforzadas Triple Garra para Cantera y Terreno Escarpado',
    category: 'undercarriage_tires',
    categoryLabel: 'Rodaje y Neumáticos',
    description: 'Eslabones y zapatas templadas por inducción con mayor tracción en pendientes pronunciadas y máxima vida útil frente al desgaste abrasivo de caliza.',
    minPriceUsd: 2900,
    maxPriceUsd: 3900,
    exclusiveGroup: 'undercarriage_type',
    applicableCategories: ['Excavadoras', 'Tractores'],
    specsBadge: 'Zapatas 600/700 mm HD'
  },
  {
    id: 'opt-und-poly-fill-tires',
    name: 'Neumáticos Industriales Reforzados con Relleno Macizo Anti-Pinchazos Poly-Fill',
    category: 'undercarriage_tires',
    categoryLabel: 'Rodaje y Neumáticos',
    description: 'Elimina al 100% las paradas por pinchazos de clavos, piedras afiladas o varillas en demolición y vertederos gracias al elastómero líquido curado.',
    minPriceUsd: 3300,
    maxPriceUsd: 4300,
    exclusiveGroup: 'undercarriage_type',
    applicableCategories: ['Retroexcavadoras', 'Cargadores', 'Minicargadores', 'Manipuladores'],
    specsBadge: 'Cero Pinchazos Garantizado'
  },

  // ==========================================
  // 6. GARANTÍA Y SERVICIO OFICIAL TMD
  // ==========================================
  {
    id: 'opt-war-standard-warranty',
    name: 'Garantía Oficial de Fábrica 1 Año / 2,000 Horas',
    category: 'warranty_service',
    categoryLabel: 'Garantía y Respaldo TMD',
    description: 'Cobertura oficial total contra defectos de manufactura con mano de obra y repuestos en los talleres de Km 22 Autopista Duarte.',
    minPriceUsd: 0,
    maxPriceUsd: 0,
    isIncludedDefault: true,
    exclusiveGroup: 'warranty_tier',
    specsBadge: 'Garantía Oficial Incluida'
  },
  {
    id: 'opt-war-extended-powertrain',
    name: 'Garantía Extendida Powertrain & Hidráulica 3 Años / 5,000 Horas',
    category: 'warranty_service',
    categoryLabel: 'Garantía y Respaldo TMD',
    description: 'Tranquilidad operativa total con cobertura ampliada para motor diésel, transmisión, bombas principales, mandos finales y cilindros maestros.',
    minPriceUsd: 3600,
    maxPriceUsd: 4600,
    exclusiveGroup: 'warranty_tier',
    specsBadge: '3 Años / 5,000 Horas'
  },
  {
    id: 'opt-war-service-pack-1000h',
    name: 'Paquete de Mantenimiento Preventivo Integral 1,000 Horas en Obra',
    category: 'warranty_service',
    categoryLabel: 'Garantía y Respaldo TMD',
    description: 'Incluye todos los kits de filtros genuinos, fluidos sintéticos certificados, análisis químico de aceites y visitas de técnicos con unidad móvil a tu proyecto en cualquier punto del país.',
    minPriceUsd: 2500,
    maxPriceUsd: 3200,
    specsBadge: 'Filtros OEM + Visitas en Obra'
  }
];

export interface CustomizationPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  optionIds: string[];
}

export const CUSTOMIZATION_PRESETS: CustomizationPreset[] = [
  {
    id: 'standard',
    name: 'Configuración Estándar',
    badge: 'Fábrica',
    description: 'Especificación de serie recomendada para contratistas generales y operaciones urbanas.',
    optionIds: [
      'opt-att-standard-bucket',
      'opt-cab-open-canopy',
      'opt-tech-livelink-basic',
      'opt-und-standard-undercarriage',
      'opt-war-standard-warranty'
    ]
  },
  {
    id: 'quarry_heavy_duty',
    name: 'Pack Canteras & Minería HD',
    badge: 'Alta Resistencia',
    description: 'Equipamiento robusto contra roca abrasiva con martillo hidráulico, cucharon Hardox, blindaje y filtro anti-polvo.',
    optionIds: [
      'opt-att-hd-rock-bucket',
      'opt-att-hydraulic-breaker',
      'opt-att-quick-hitch',
      'opt-cab-enclosed-ac',
      'opt-cab-hepa-filter',
      'opt-pwr-undercarriage-armor',
      'opt-pwr-auto-lubrication',
      'opt-pwr-cyclonic-prefilter',
      'opt-tech-360-camera-radar',
      'opt-und-hd-triple-grouser',
      'opt-war-extended-powertrain'
    ]
  },
  {
    id: 'infrastructure_road',
    name: 'Pack Obra Civil & Vías',
    badge: 'Obras Públicas',
    description: 'Orientado a proyectos de infraestructura con acople rápido, nivelación 2D y cabina climatizada de máximo confort.',
    optionIds: [
      'opt-att-standard-bucket',
      'opt-att-quick-hitch',
      'opt-cab-deluxe-climate',
      'opt-pwr-high-flow-hydraulics',
      'opt-pwr-eco-idle',
      'opt-tech-livelink-advanced',
      'opt-tech-2d-grade-control',
      'opt-tech-360-camera-radar',
      'opt-und-standard-undercarriage',
      'opt-war-service-pack-1000h'
    ]
  },
  {
    id: 'maximum_performance',
    name: 'Pack Máximo Rendimiento TMD',
    badge: 'Full Equipado',
    description: 'La configuración más completa disponible con garantía extendida, control de pesaje y tecnología de vanguardia.',
    optionIds: [
      'opt-att-hd-rock-bucket',
      'opt-att-hydraulic-breaker',
      'opt-att-quick-hitch',
      'opt-cab-deluxe-climate',
      'opt-cab-hepa-filter',
      'opt-pwr-high-flow-hydraulics',
      'opt-pwr-auto-lubrication',
      'opt-pwr-undercarriage-armor',
      'opt-pwr-cyclonic-prefilter',
      'opt-tech-livelink-advanced',
      'opt-tech-360-camera-radar',
      'opt-tech-onboard-weighing',
      'opt-war-extended-powertrain',
      'opt-war-service-pack-1000h'
    ]
  }
];

export function getCustomizationOptionsForMachine(machine: Machine): MachineCustomizationOption[] {
  return ALL_CUSTOMIZATION_OPTIONS.filter((opt) => {
    if (!opt.applicableCategories || opt.applicableCategories.length === 0) {
      return true;
    }
    return opt.applicableCategories.includes(machine.category);
  });
}

export interface EstimatedPriceRangeResult {
  basePriceUsd: number;
  optionsMinUsd: number;
  optionsMaxUsd: number;
  minEstimatedUsd: number;
  maxEstimatedUsd: number;
  minEstimatedDop: number;
  maxEstimatedDop: number;
  minMonthlyLeasingUsd: number;
  maxMonthlyLeasingUsd: number;
  activeOptionsCount: number;
  selectedOptionsList: MachineCustomizationOption[];
}

export function calculateRealtimePriceRange(
  machine: Machine,
  selectedOptionIds: Set<string>
): EstimatedPriceRangeResult {
  const applicableOptions = getCustomizationOptionsForMachine(machine);
  const selectedOptions = applicableOptions.filter((opt) => selectedOptionIds.has(opt.id));

  let optionsMinUsd = 0;
  let optionsMaxUsd = 0;

  selectedOptions.forEach((opt) => {
    optionsMinUsd += opt.minPriceUsd;
    optionsMaxUsd += opt.maxPriceUsd;
  });

  const basePriceUsd = machine.basePriceUsd;

  // Real-time estimated range:
  // Lower bound: Base price + lowest cost tier of chosen options
  // Upper bound: Base price + highest cost tier of chosen options + 2% contingency / site commissioning allowance
  const minEstimatedUsd = basePriceUsd + optionsMinUsd;
  const maxEstimatedUsd = Math.round(basePriceUsd + optionsMaxUsd + (basePriceUsd + optionsMaxUsd) * 0.02);

  const minEstimatedDop = minEstimatedUsd * USD_TO_DOP_RATE;
  const maxEstimatedDop = maxEstimatedUsd * USD_TO_DOP_RATE;

  // Indicative monthly leasing calculation (20% down, 36 months, 8.9% corporate APR)
  const calculateMonthly = (totalAmount: number) => {
    const financedPrincipal = totalAmount * 0.8;
    const r = 0.089 / 12;
    const n = 36;
    return (financedPrincipal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  };

  const minMonthlyLeasingUsd = Math.round(calculateMonthly(minEstimatedUsd));
  const maxMonthlyLeasingUsd = Math.round(calculateMonthly(maxEstimatedUsd));

  return {
    basePriceUsd,
    optionsMinUsd,
    optionsMaxUsd,
    minEstimatedUsd,
    maxEstimatedUsd,
    minEstimatedDop,
    maxEstimatedDop,
    minMonthlyLeasingUsd,
    maxMonthlyLeasingUsd,
    activeOptionsCount: selectedOptions.filter((o) => o.maxPriceUsd > 0).length,
    selectedOptionsList: selectedOptions
  };
}
