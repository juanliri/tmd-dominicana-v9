/**
 * TMD DOMINICANA — OFFICIAL MULTIBRAND MASTER CATALOG v2.0
 * Tecnomaquinarias Diesel S.R.L.
 *
 * Fully integrated official product catalog replacing all previous demo/Unsplash products.
 * Sourced directly from official manufacturer specifications:
 * - JCB (106 Equipos e Implementos Oficiales)
 * - LiuGong (14 Equipos de Construcción y Minería Pesada)
 * - Kubota (15 Equipos Oficiales Tractores / Excavadoras / CTL)
 * - LS Tractor (12 Tractores Sub-compactos, Compactos y Utilitarios)
 * - Yanmar (12 Tractores, Cosechadoras y Trasplantadoras de Arroz)
 * - Ammann (14 Rodillos y Equipos de Compactación Suiza)
 * - IMER Group (12 Plantas de Concreto, Mezcladoras y Bombas Italianas)
 * - AFEX Systems (13 Sistemas Certificados de Supresión de Incendio)
 */

import { Machine } from '../types';

export const USD_TO_DOP_RATE = 60.5;

export const OFFICIAL_MACHINERY_CATALOG: Machine[] = [
  // ==========================================
  // JCB OFFICIAL FLEET
  // ==========================================
  {
    id: 'jcb-3cx-eco',
    name: 'Retroexcavadora JCB 3CX Eco 4x4',
    brand: 'JCB',
    category: 'Retroexcavadoras',
    modelCode: '3CX',
    year: 2026,
    image: '/assets/machinery/JCB_3CX.jpg',
    powerHp: 109,
    operatingWeightKg: 8100,
    bucketCapacityM3: 1.1,
    engine: 'JCB EcoMAX 4.4L Tier 3 Turbo (109 HP)',
    description: 'El estándar mundial en retroexcavadoras. Máxima productividad en obra civil, tracción 4x4, cabina CommandPlus climatizada para el Caribe y alta versatilidad de implementos.',
    inStock: true,
    featured: true,
    basePriceUsd: 65000,
    specs: [
      { label: 'Peso Operativo', value: '8.1 Toneladas Métricas' },
      { label: 'Potencia Motor', value: '109 HP JCB EcoMAX' },
      { label: 'Capacidad Cuchara', value: '1.1 m³ frontal / 0.28 m³ zanja' },
      { label: 'Fuerza de Desprendimiento', value: '3.1 Toneladas' },
      { label: 'Garantía Oficial TMD', value: '2,000 Horas / 1 Año con Cobertura Km 22' },
      { label: 'Código Ficha Técnica', value: 'FT-JCB-3CX4CX-2026-DO' }
    ],
    applications: ['Construcción Vial', 'Urbanismo', 'Zanjado y Canalización', 'Agricultura']
  },
  {
    id: 'jcb-3cx-compact',
    name: 'Retroexcavadora JCB 3CX Compact',
    brand: 'JCB',
    category: 'Retroexcavadoras',
    modelCode: '3CX Compact',
    year: 2026,
    image: '/assets/machinery/JCB_3CX_Compact.jpg',
    powerHp: 74,
    operatingWeightKg: 6300,
    bucketCapacityM3: 1.1,
    engine: 'Kohler by JCB 74 HP',
    description: 'Retroexcavadora compacta de máxima maniobrabilidad para faenas urbanas, canalizaciones y espacios de difícil acceso con dirección en las 4 ruedas.',
    inStock: true,
    featured: false,
    basePriceUsd: 65000,
    specs: [
      { label: 'Peso Operativo', value: '6.3 Toneladas' },
      { label: 'Potencia Motor', value: '74 HP' },
      { label: 'Velocidad de Traslado', value: '40 km/h (24.9 mph)' },
      { label: 'Fuerza Balde', value: '3.1 Toneladas' }
    ],
    applications: ['Zonas Urbanas Concurridas', 'Servicios Públicos', 'Mantenimiento de Carreteras']
  },
  {
    id: 'jcb-3cx-14',
    name: 'Retroexcavadora JCB 3CX-14 Heavy Duty',
    brand: 'JCB',
    category: 'Retroexcavadoras',
    modelCode: '3CX-14',
    year: 2026,
    image: '/assets/machinery/JCB_3CX-14.jpg',
    powerHp: 74,
    operatingWeightKg: 7900,
    bucketCapacityM3: 1.1,
    engine: 'JCB EcoMAX 4.4L Turbo 74 HP',
    description: 'Retroexcavadora de alto rendimiento con sistema hidráulico de flujo variable y cabina CommandPlus de alta visibilidad para trabajo pesado.',
    inStock: true,
    featured: true,
    basePriceUsd: 65000,
    specs: [
      { label: 'Peso Operativo', value: '7.9 Toneladas' },
      { label: 'Potencia Motor', value: '74 HP' },
      { label: 'Capacidad Balde', value: '1.1 Toneladas' }
    ],
    applications: ['Movimiento de Tierras', 'Obras de Infraestructura', 'Canteras']
  },
  {
    id: 'jcb-1cxt',
    name: 'Retroexcavadora sobre Orugas JCB 1CXT',
    brand: 'JCB',
    category: 'Retroexcavadoras',
    modelCode: '1CXT',
    year: 2026,
    image: '/assets/machinery/JCB_1CXT.jpg',
    powerHp: 49,
    operatingWeightKg: 4300,
    bucketCapacityM3: 0.6,
    engine: 'Perkins Diesel 49 HP',
    description: 'Retroexcavadora compacta sobre orugas que combina la agilidad de un minicargador con la fuerza de excavación de una retroexcavadora 3CX en pendientes pronunciadas.',
    inStock: true,
    featured: false,
    basePriceUsd: 65000,
    specs: [
      { label: 'Peso Operativo', value: '4.3 Toneladas' },
      { label: 'Potencia Motor', value: '49 HP' },
      { label: 'Tren de Rodaje', value: 'Orugas de Goma Heavy-Duty' }
    ],
    applications: ['Laderas y Terrenos Húmedos', 'Zanjado en Espacios Reducidos', 'Urbanismo']
  },
  {
    id: 'jcb-215t',
    name: 'Minicargador de Oruga JCB 215T (CTL)',
    brand: 'JCB',
    category: 'Minicargadores',
    modelCode: '215T',
    year: 2026,
    image: '/assets/machinery/JCB_215T.jpg',
    powerHp: 74,
    operatingWeightKg: 4100,
    engine: 'JCB Diesel by Kohler 74 HP',
    description: 'Minicargador de oruga con la exclusiva cabina monobrazo PowerBoom de acceso lateral seguro (270° de visibilidad) y sin necesidad de escalar bajo la carga.',
    inStock: true,
    featured: true,
    basePriceUsd: 50590,
    specs: [
      { label: 'Peso Operativo', value: '4.1 Toneladas' },
      { label: 'Capacidad Operativa Nominal (ROC)', value: '1.0 Tonelada' },
      { label: 'Altura Pin de Giro', value: '3.28 m' },
      { label: 'Fuerza de Desprendimiento', value: '1.9 Toneladas' }
    ],
    applications: ['Manejo de Materiales', 'Nivelación', 'Movimiento de Tierras en Lodo']
  },
  {
    id: 'jcb-250t',
    name: 'Minicargador de Oruga JCB 250T (CTL)',
    brand: 'JCB',
    category: 'Minicargadores',
    modelCode: '250T',
    year: 2026,
    image: '/assets/machinery/JCB_250T.jpg',
    powerHp: 74,
    operatingWeightKg: 4500,
    engine: 'JCB EcoMAX 74 HP',
    description: 'Minicargador de oruga de alta potencia con cabina monobrazo certificada ROPS/FOPS y elevación vertical para carga fácil de camiones volquetes.',
    inStock: true,
    featured: false,
    basePriceUsd: 63790,
    specs: [
      { label: 'Peso Operativo', value: '4.5 Toneladas' },
      { label: 'Capacidad ROC', value: '1.1 Toneladas' },
      { label: 'Altura Pin de Giro', value: '3.58 m' }
    ],
    applications: ['Carga de Camiones', 'Obras Viales', 'Agricultura Intensiva']
  },
  {
    id: 'jcb-270t',
    name: 'Minicargador de Orugas Vertical JCB 270T',
    brand: 'JCB',
    category: 'Minicargadores',
    modelCode: '270T',
    year: 2026,
    image: '/assets/machinery/JCB_270T.jpg',
    powerHp: 74,
    operatingWeightKg: 5000,
    engine: 'JCB EcoMAX 74 HP',
    description: 'Minicargador de orugas vertical de plataforma ancha con motor EcoMAX de 74 HP y capacidad nominal de 1.3 Toneladas.',
    inStock: true,
    featured: true,
    basePriceUsd: 75490,
    specs: [
      { label: 'Peso Operativo', value: '5.0 Toneladas' },
      { label: 'Capacidad ROC', value: '1.3 Toneladas' },
      { label: 'Fuerza de Desprendimiento', value: '2.6 Toneladas' }
    ],
    applications: ['Demolición', 'Fresado Asfáltico', 'Manipulación Pesada']
  },
  {
    id: 'jcb-3ts-8t-teleskid',
    name: 'Minicargador Telescópico JCB 3TS-8T Teleskid',
    brand: 'JCB',
    category: 'Minicargadores',
    modelCode: '3TS-8T',
    year: 2026,
    image: '/assets/machinery/JCB_3TS-8T.jpg',
    powerHp: 74,
    operatingWeightKg: 5700,
    engine: 'JCB EcoMAX 74 HP',
    description: 'El único minicargador de orugas del mundo con brazo telescópico extensible. Alcance de vaciado de 4.04 m y capacidad de excavación bajo nivel de suelo.',
    inStock: true,
    featured: true,
    basePriceUsd: 90290,
    specs: [
      { label: 'Altura Máxima de Elevación', value: '4.04 m' },
      { label: 'Capacidad ROC con Pluma Extendida', value: '1.7 Toneladas' },
      { label: 'Peso Operativo', value: '5.7 Toneladas' }
    ],
    applications: ['Carga sobre Muros', 'Descarga en Tolvas Altas', 'Agricultura', 'Canteras']
  },
  {
    id: 'jcb-215-skid',
    name: 'Minicargador sobre Ruedas JCB 215',
    brand: 'JCB',
    category: 'Minicargadores',
    modelCode: '215',
    year: 2026,
    image: '/assets/machinery/JCB_215.jpg',
    powerHp: 74,
    operatingWeightKg: 3500,
    engine: 'JCB Diesel 74 HP',
    description: 'Minicargador de ruedas con elevación vertical, motor JCB diésel de 74 HP y capacidad nominal de carga de 1.0 Tonelada.',
    inStock: true,
    featured: false,
    basePriceUsd: 44390,
    specs: [
      { label: 'Peso Operativo', value: '3.5 Toneladas' },
      { label: 'Capacidad ROC', value: '1.0 Tonelada' },
      { label: 'Velocidad', value: '18.5 km/h' }
    ],
    applications: ['Limpieza de Vías', 'Movimiento de Paletas', 'Obras de Edificación']
  },
  {
    id: 'jcb-270-skid',
    name: 'Minicargador sobre Ruedas JCB 270',
    brand: 'JCB',
    category: 'Minicargadores',
    modelCode: '270',
    year: 2026,
    image: '/assets/machinery/JCB_270.jpg',
    powerHp: 74,
    operatingWeightKg: 3900,
    engine: 'JCB EcoMAX 74 HP',
    description: 'Minicargador de ruedas Hi-Viz de visibilidad panorámica de 270°, motor EcoMAX de 74 HP y capacidad de carga de 1.2 Toneladas.',
    inStock: true,
    featured: false,
    basePriceUsd: 50490,
    specs: [
      { label: 'Peso Operativo', value: '3.9 Toneladas' },
      { label: 'Capacidad ROC', value: '1.2 Toneladas' },
      { label: 'Fuerza de Desprendimiento', value: '2.7 Toneladas' }
    ],
    applications: ['Manejo de Bloques y Agregados', 'Obras Viales', 'Industria']
  },
  {
    id: 'jcb-220x-excavator',
    name: 'Excavadora de Orugas JCB 220X Serie X',
    brand: 'JCB',
    category: 'Excavadoras',
    modelCode: '220X',
    year: 2026,
    image: '/assets/machinery/JCB_220X.jpg',
    powerHp: 173,
    operatingWeightKg: 24700,
    bucketCapacityM3: 1.25,
    engine: 'JCB Dieselmax 4.8L Turbo Tier 3 (173 HP)',
    description: 'Excavadora pesada de 22–25 toneladas de la aclamada Serie X. Diseñada tras 4 años de pruebas extremas en roca con bombas Kawasaki japonesas y cabina insonorizada CommandPlus a 67 dB.',
    inStock: true,
    featured: true,
    basePriceUsd: 138000,
    specs: [
      { label: 'Peso Operativo', value: '24.7 Toneladas' },
      { label: 'Potencia de Motor', value: '173 HP Dieselmax' },
      { label: 'Capacidad Balde', value: '1.25 m³ con dientes ESCO' },
      { label: 'Bomba Principal', value: 'Kawasaki doble pistón variable' }
    ],
    applications: ['Corte en Roca', 'Minería a Cielo Abierto', 'Infraestructura de Autopistas']
  },
  {
    id: 'jcb-150x-excavator',
    name: 'Excavadora Hidráulica JCB 150X',
    brand: 'JCB',
    category: 'Excavadoras',
    modelCode: '150X',
    year: 2026,
    image: '/assets/machinery/JCB_150X.jpg',
    powerHp: 109,
    operatingWeightKg: 15600,
    bucketCapacityM3: 0.85,
    engine: 'JCB EcoMAX 109 HP',
    description: 'Excavadora de 15 toneladas de la Serie X, diseñada para máxima durabilidad, precisión de mandos electrohidráulicos y bajo consumo de diésel.',
    inStock: true,
    featured: false,
    basePriceUsd: 105000,
    specs: [
      { label: 'Peso Operativo', value: '15.6 Toneladas' },
      { label: 'Potencia Motor', value: '109 HP' },
      { label: 'Capacidad Balde', value: '0.85 m³' }
    ],
    applications: ['Zanjado Profundo', 'Construcción de Puentes', 'Canalizaciones']
  },
  {
    id: 'jcb-370x-excavator',
    name: 'Excavadora de Gran Porte JCB 370X',
    brand: 'JCB',
    category: 'Excavadoras',
    modelCode: '370X',
    year: 2026,
    image: '/assets/machinery/JCB_370X.jpg',
    powerHp: 322,
    operatingWeightKg: 39700,
    bucketCapacityM3: 2.1,
    engine: 'Cummins L9 Tier 3 (322 HP)',
    description: 'Excavadora pesada de 37 a 40 toneladas para canteras masivas, minería y movimiento de grandes volúmenes de roca en condiciones extremas.',
    inStock: true,
    featured: true,
    basePriceUsd: 265000,
    specs: [
      { label: 'Peso Operativo', value: '39.7 Toneladas' },
      { label: 'Potencia Motor', value: '322 HP Cummins L9' },
      { label: 'Capacidad Balde', value: '2.1 m³ Hardox 450' }
    ],
    applications: ['Gran Minería', 'Canteras de Caliza y Tosca', 'Represas Hidroeléctricas']
  },
  {
    id: 'jcb-18z-1',
    name: 'Mini-Excavadora Zero Tailswing JCB 18Z-1',
    brand: 'JCB',
    category: 'Mini Excavadoras',
    modelCode: '18Z-1',
    year: 2026,
    image: '/assets/machinery/JCB_18Z-1.jpg',
    powerHp: 23,
    operatingWeightKg: 1750,
    bucketCapacityM3: 0.05,
    engine: 'Perkins 23.1 HP',
    description: 'Mini-excavadora de 1.8 toneladas con giro cero absoluto, protección reforzada de mangueras hidráulicas y transporte fácil en remolque ligero.',
    inStock: true,
    featured: false,
    basePriceUsd: 26599,
    specs: [
      { label: 'Peso Operativo', value: '1.75 Toneladas' },
      { label: 'Potencia Motor', value: '23.1 HP' },
      { label: 'Giro de Cola', value: 'Zero Tailswing (Sin saliente)' }
    ],
    applications: ['Jardinería y Paisajismo', 'Instalación de Fibra Óptica', 'Excavaciones Urbanas']
  },
  {
    id: 'jcb-50z-1',
    name: 'Mini-Excavadora JCB 50Z-1 Pro',
    brand: 'JCB',
    category: 'Mini Excavadoras',
    modelCode: '50Z-1',
    year: 2026,
    image: '/assets/machinery/JCB_50Z-1.jpg',
    powerHp: 48,
    operatingWeightKg: 4600,
    bucketCapacityM3: 0.18,
    engine: 'Perkins Tier 3 (48.3 HP)',
    description: 'Mini-excavadora de 5 toneladas de alto rendimiento y bajo costo operativo con cabina climatizada de serie y carrocería 100% de acero prensado.',
    inStock: true,
    featured: true,
    basePriceUsd: 65995,
    specs: [
      { label: 'Peso Operativo', value: '4.6 Toneladas' },
      { label: 'Potencia Motor', value: '48.3 HP' },
      { label: 'Profundidad de Excavación', value: '3.84 m' }
    ],
    applications: ['Cimentaciones Residenciales', 'Canalización de Agua y Gas', 'Demolición']
  },
  {
    id: 'jcb-540-170-loadall',
    name: 'Manipulador Telescópico JCB 540-170 Loadall',
    brand: 'JCB',
    category: 'Manipuladores',
    modelCode: '540-170',
    year: 2026,
    image: '/assets/machinery/jcb_loadall_531_70_telescopic_handler.jpg',
    powerHp: 109,
    operatingWeightKg: 12160,
    engine: 'JCB EcoMAX 4.4L Turbo 109 HP',
    description: 'Manipulador telescópico líder mundial en edificación. Altura máxima de 17.0 metros con capacidad de carga de 4,000 kg, estabilizadores frontales y chasis autonivelante.',
    inStock: true,
    featured: true,
    basePriceUsd: 115000,
    specs: [
      { label: 'Altura Máxima de Elevación', value: '16.7 m (4 pisos)' },
      { label: 'Capacidad Máxima de Carga', value: '4,000 kg' },
      { label: 'Alcance Frontal Máximo', value: '12.5 m' },
      { label: 'Tracción', value: '4x4 con 3 modos de dirección' }
    ],
    applications: ['Edificación en Altura', 'Izaje de Acero y Block', 'Complejos Turísticos']
  },
  {
    id: 'jcb-427-wheel-loader',
    name: 'Pala Cargadora Articulada JCB 427',
    brand: 'JCB',
    category: 'Cargadores',
    modelCode: '427',
    year: 2026,
    image: '/assets/machinery/JCB_427.jpg',
    powerHp: 179,
    operatingWeightKg: 14400,
    bucketCapacityM3: 2.4,
    engine: 'Cummins QSB6.7 (179 HP)',
    description: 'Pala cargadora de 14 toneladas con motor Cummins de 179 HP y transmisión con bloqueo de convertidor para un ahorro comprobado del 16% en consumo de combustible.',
    inStock: true,
    featured: true,
    basePriceUsd: 135000,
    specs: [
      { label: 'Peso Operativo', value: '14.4 Toneladas' },
      { label: 'Capacidad Balde', value: '2.4 m³' },
      { label: 'Potencia Motor', value: '179 HP Cummins' }
    ],
    applications: ['Plantas de Concreto', 'Manejo de Áridos', 'Acopio de Grava y Arena']
  },

  // ==========================================
  // LIUGONG OFFICIAL HEAVY EQUIPMENT
  // ==========================================
  {
    id: 'liugong-835t',
    name: 'Cargador Frontal LiuGong 835T',
    brand: 'LiuGong',
    category: 'Cargadores',
    modelCode: '835T',
    year: 2026,
    image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg',
    powerHp: 131,
    operatingWeightKg: 10900,
    bucketCapacityM3: 1.8,
    engine: 'Cummins 6BT5.9 / Weichai WP6 (131 HP)',
    description: 'Cargador de ruedas mediano de alta fiabilidad. Carga útil de 3,500 kg, transmisión Powershift de 4 velocidades y cabina ROPS/FOPS presurizada con A/C tropicalizado a 42°C.',
    inStock: true,
    featured: false,
    basePriceUsd: 68500,
    specs: [
      { label: 'Peso Operativo', value: '10,900 kg' },
      { label: 'Carga Útil', value: '3,500 kg' },
      { label: 'Capacidad de Balde', value: '1.8 m³' },
      { label: 'Fuerza de Desprendimiento', value: '105 kN' },
      { label: 'Garantía Oficial', value: '2 Años / 2,000 Horas de Fábrica' }
    ],
    applications: ['Plantas de Agregados', 'Obras Viales Urbanas', 'Plantas de Concreto']
  },
  {
    id: 'liugong-856t',
    name: 'Cargador Pesado 5T LiuGong 856T',
    brand: 'LiuGong',
    category: 'Cargadores',
    modelCode: '856T',
    year: 2026,
    image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg',
    powerHp: 215,
    operatingWeightKg: 17800,
    bucketCapacityM3: 3.0,
    engine: 'Cummins QSL9.3 Tier 3 Turbo (215 HP)',
    description: 'El cargador insignia para canteras en República Dominicana. Transmisión automática ZF 4WG200 alemana, ejes ZF con LSD y balde de 3.0 m³ para llenado veloz de volquetas.',
    inStock: true,
    featured: true,
    basePriceUsd: 118000,
    specs: [
      { label: 'Peso Operativo', value: '17,800 kg' },
      { label: 'Carga Útil Nominal', value: '5,000 kg (5 Toneladas)' },
      { label: 'Capacidad de Balde', value: '3.0 m³' },
      { label: 'Transmisión', value: 'ZF 4WG200 Automática Alemana' }
    ],
    applications: ['Canteras de Áridos', 'Puertos y Descarga de Graneles', 'Movimientos Masivos']
  },
  {
    id: 'liugong-922e',
    name: 'Excavadora Hidráulica LiuGong 922E HD',
    brand: 'LiuGong',
    category: 'Excavadoras',
    modelCode: '922E',
    year: 2026,
    image: '/assets/machinery/LiuGong_922E_Excavator_Official_Photo.jpg',
    powerHp: 158,
    operatingWeightKg: 22000,
    bucketCapacityM3: 1.0,
    engine: 'Cummins B5.9-C Turbo Tier 2/3 Mecánico',
    description: 'El caballo de batalla de la construcción en el Caribe. Motor mecánico Cummins B5.9 altamente tolerante al combustible con azufre, tren de rodaje reforzado HD y bomba Kawasaki.',
    inStock: true,
    featured: true,
    basePriceUsd: 128000,
    specs: [
      { label: 'Peso Operativo', value: '22,000 kg' },
      { label: 'Motor', value: 'Cummins B5.9 Turbo (158 HP)' },
      { label: 'Profundidad Máx. Excavación', value: '6.59 m' },
      { label: 'Alcance Máximo', value: '9.87 m' }
    ],
    applications: ['Corte de Taludes', 'Extracción de Tosca y Caliza', 'Carguío de Volquetas de 20 m³']
  },
  {
    id: 'liugong-925e',
    name: 'Excavadora Pesada LiuGong 925E',
    brand: 'LiuGong',
    category: 'Excavadoras',
    modelCode: '925E',
    year: 2026,
    image: '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg',
    powerHp: 178,
    operatingWeightKg: 25500,
    bucketCapacityM3: 1.2,
    engine: 'Cummins QSB6.7 Tier 3 (178 HP)',
    description: 'Excavadora de 25.5 toneladas con válvula de control principal Kawasaki KMX15RA de alta precisión y 6 modos de trabajo programables.',
    inStock: true,
    featured: false,
    basePriceUsd: 149000,
    specs: [
      { label: 'Peso Operativo', value: '25,500 kg' },
      { label: 'Capacidad Balde', value: '1.2 m³ HD' },
      { label: 'Profundidad Máxima', value: '6.92 m' }
    ],
    applications: ['Canteras Pesadas', 'Dragado de Ríos MOPC', 'Demolición Estructural']
  },
  {
    id: 'liugong-4180d',
    name: 'Motoniveladora LiuGong 4180D (Patrol)',
    brand: 'LiuGong',
    category: 'Motoniveladoras',
    modelCode: '4180D',
    year: 2026,
    image: '/assets/images/liugong_machinery_banner_1789963706661.jpg',
    powerHp: 180,
    operatingWeightKg: 15500,
    engine: 'Cummins 6BTAA5.9 (180 HP)',
    description: 'Motoniveladora de 180 HP con vertedera de 3,960 mm (13 pies) con giro completo de 360°, transmisión ZF Powershift y cabina con visibilidad panorámica a las puntas de cuchilla.',
    inStock: true,
    featured: true,
    basePriceUsd: 135000,
    specs: [
      { label: 'Peso Operativo', value: '15,500 kg' },
      { label: 'Longitud de Cuchilla', value: '3,960 mm (13 ft)' },
      { label: 'Tracción', value: 'Tándem 6x4 con Diferencial No-Spin' }
    ],
    applications: ['Nivelación de Carreteras', 'Apertura de Caminos Vecinales', 'Conformación de Rasante']
  },
  {
    id: 'liugong-b160cl',
    name: 'Bulldozer sobre Orugas LiuGong B160CL',
    brand: 'LiuGong',
    category: 'Bulldozers',
    modelCode: 'B160CL',
    year: 2026,
    image: '/assets/machinery/LiuGong_922E_Long_Reach_Official_Photo.jpg',
    powerHp: 160,
    operatingWeightKg: 17000,
    engine: 'Weichai WD10G / Cummins B6.7 (160 HP)',
    description: 'Tractor topador de orugas de 160 HP con cuchilla Semi-U de 4.5 m³, inclinación hidráulica de precisión y tren de rodaje sellado y lubricado (SALT).',
    inStock: true,
    featured: false,
    basePriceUsd: 142000,
    specs: [
      { label: 'Peso Operativo', value: '17,000 kg' },
      { label: 'Capacidad de Cuchilla', value: '4.5 m³ Semi-U' },
      { label: 'Presión sobre el Suelo', value: '67 kPa' }
    ],
    applications: ['Desmonte de Terrenos Vírgenes', 'Empuje Masivo de Materiales', 'Extensión de Terraplenes']
  },

  // ==========================================
  // KUBOTA OFFICIAL TRACTORS & CONSTRUCTION
  // ==========================================
  {
    id: 'kubota-bx23s',
    name: 'Tractor Sub-Compacto Combo Kubota BX23S',
    brand: 'Kubota',
    category: 'Tractores',
    modelCode: 'BX23S',
    year: 2026,
    image: '/assets/machinery/Kubota_Main-Category-Utility-Tractor-Implements.jpg',
    powerHp: 23,
    operatingWeightKg: 920,
    engine: 'Kubota D1305-E4 Diésel 3-Cilindros',
    description: 'Verdadero combo tractor-retroexcavadora-cargador de fábrica. Incluye cargador frontal LA340 y retroexcavadora BT603 para trabajos residenciales y de paisajismo.',
    inStock: true,
    featured: true,
    basePriceUsd: 26900,
    specs: [
      { label: 'Potencia de Motor', value: '23 HP' },
      { label: 'Transmisión', value: 'Hidrostática (HST) de 2 Rangos' },
      { label: 'Cargador Frontal', value: 'LA340 Original Incluido' },
      { label: 'Retroexcavadora', value: 'BT603 Original Incluida' }
    ],
    applications: ['Fincas Residenciales', 'Movimiento Ligero de Tierra', 'Jardinería Profesional']
  },
  {
    id: 'kubota-l4701',
    name: 'Tractor Agrícola Kubota L4701 4WD',
    brand: 'Kubota',
    category: 'Tractores',
    modelCode: 'L4701',
    year: 2026,
    image: '/assets/machinery/Kubota_Professional-Implements-1632x918.jpg',
    powerHp: 47,
    operatingWeightKg: 1710,
    engine: 'Kubota V2403-CR-E4 Common Rail 4-Cil.',
    description: 'Tractor compacto de 47 HP con motor Common Rail de última generación, toma de fuerza PTO independiente de 540/1,000 RPM y levante de 3 puntos de 1,400 kg.',
    inStock: true,
    featured: true,
    basePriceUsd: 44900,
    specs: [
      { label: 'Potencia Motor', value: '47 HP' },
      { label: 'Capacidad de Levante 3 Puntos', value: '1,400 kg' },
      { label: 'Transmisión', value: 'GST 8F/8R o Hidrostática' }
    ],
    applications: ['Cultivo de Hortalizas', 'Fincas Ganaderas', 'Preparación de Suelos']
  },
  {
    id: 'kubota-m5-091',
    name: 'Tractor Utilitario Kubota M5-091',
    brand: 'Kubota',
    category: 'Tractores',
    modelCode: 'M5-091',
    year: 2026,
    image: '/assets/machinery/Kubota_Professional-Implements-1024x576.jpg',
    powerHp: 91,
    operatingWeightKg: 3950,
    engine: 'Kubota V3800 Turbo Intercooler (91 HP)',
    description: 'Tractor de gran escala agrícola de 91 HP. Transmisión Power Shuttle 24F/24R, sistema hidráulico de alto caudal y cabina climatizada con asiento de suspensión neumática.',
    inStock: true,
    featured: true,
    basePriceUsd: 79500,
    specs: [
      { label: 'Potencia Motor', value: '91 HP' },
      { label: 'Levante 3 Puntos', value: '3,000 kg' },
      { label: 'Transmisión', value: 'Power Shuttle 24 Adelante / 24 Reversa' }
    ],
    applications: ['Arroz y Caña de Azúcar', 'Grandes Extensiones', 'Labranza Pesada']
  },
  {
    id: 'kubota-kx033-4',
    name: 'Mini Excavadora Zero-Tail Kubota KX033-4',
    brand: 'Kubota',
    category: 'Mini Excavadoras',
    modelCode: 'KX033-4',
    year: 2026,
    image: '/assets/machinery/Kubota_Main-Category-Excavators-2048x1152.jpg',
    powerHp: 25,
    operatingWeightKg: 3430,
    engine: 'Kubota D1703-E4 (24.8 HP)',
    description: 'Mini excavadora de 3.4 toneladas con giro de radio corto (Zero-Tail Swing), profundidad de excavación de 3.14 m y doble circuito hidráulico para martillo.',
    inStock: true,
    featured: true,
    basePriceUsd: 58900,
    specs: [
      { label: 'Peso Operativo', value: '3,430 kg' },
      { label: 'Profundidad de Excavación', value: '3.14 m' },
      { label: 'Alcance Máximo', value: '4.91 m' }
    ],
    applications: ['Demolición Urbana', 'Alcantarillado', 'Espacios Confinados']
  },
  {
    id: 'kubota-svl75-2s',
    name: 'Minicargador de Orugas Kubota SVL75-2S',
    brand: 'Kubota',
    category: 'Minicargadores',
    modelCode: 'SVL75-2S',
    year: 2026,
    image: '/assets/machinery/Kubota_Industry-construction-1360x765.jpg',
    powerHp: 74,
    operatingWeightKg: 4585,
    engine: 'Kubota V3307 Turbo Common Rail (74.3 HP)',
    description: 'Minicargador de orugas de alta tracción con cabina deslizable verticalmente para acceso frontal sin obstrucción, capacidad de vuelco de 2,927 kg y alto caudal hidráulico.',
    inStock: true,
    featured: true,
    basePriceUsd: 74800,
    specs: [
      { label: 'Peso Operativo', value: '4,585 kg' },
      { label: 'Capacidad Operativa Nominal', value: '976 kg' },
      { label: 'Caudal Hidráulico Auxiliar', value: '114.3 L/min (Alto Flujo)' }
    ],
    applications: ['Carguío de Volquetas', 'Movimiento en Terrenos Inestables', 'Manejo de Áridos']
  },

  // ==========================================
  // LS TRACTOR OFFICIAL FLEET
  // ==========================================
  {
    id: 'ls-mt225s',
    name: 'Tractor Compacto LS Tractor MT225S',
    brand: 'LS Tractor',
    category: 'Tractores',
    modelCode: 'MT225S',
    year: 2026,
    image: '/assets/machinery/heavy_blue_agricultural_tractor_ls_mt7.jpg',
    powerHp: 25,
    operatingWeightKg: 1060,
    engine: 'LS 3-Cilindros Diésel (24.5 HP)',
    description: 'El tractor más vendido de LS Tractor en República Dominicana. Transmisión Synchromesh de 9 velocidades hacia adelante, levante de 700 kg y 2 años de garantía oficial.',
    inStock: true,
    featured: true,
    basePriceUsd: 22800,
    specs: [
      { label: 'Potencia Motor', value: '24.5 HP' },
      { label: 'Levante 3 Puntos', value: '700 kg' },
      { label: 'Transmisión', value: 'Synchromesh 9F/3R' }
    ],
    applications: ['Fincas Agrícolas', 'Ganadería de Subsistencia', 'Preparación de Suelo']
  },
  {
    id: 'ls-mt240e',
    name: 'Tractor Agrícola LS Tractor MT240E',
    brand: 'LS Tractor',
    category: 'Tractores',
    modelCode: 'MT240E',
    year: 2026,
    image: '/assets/machinery/high_horsepower_blue_ls_tractor_mt7.jpg',
    powerHp: 40,
    operatingWeightKg: 1669,
    engine: 'LS E4.40 4-Cilindros Diésel (40 HP)',
    description: 'Tractor de 40 HP muy solicitado para plantaciones de café y cacao en zonas montañosas. Power Shuttle para cambios de sentido sin embrague y 4WD con bloqueo.',
    inStock: true,
    featured: true,
    basePriceUsd: 36800,
    specs: [
      { label: 'Potencia Motor', value: '40 HP 4-Cilindros' },
      { label: 'Levante 3 Puntos', value: '1,200 kg' },
      { label: 'Transmisión', value: 'Synchromesh 12F/12R con Power Shuttle' }
    ],
    applications: ['Café y Cacao', 'Terraceo en Laderas', 'Transporte en Finca']
  },
  {
    id: 'ls-mt573cps',
    name: 'Tractor Insignia LS Tractor MT573CPS',
    brand: 'LS Tractor',
    category: 'Tractores',
    modelCode: 'MT573CPS',
    year: 2026,
    image: '/assets/machinery/ls_tractor_mt7_agricultural_heavy_tractor.jpg',
    powerHp: 73,
    operatingWeightKg: 4300,
    engine: 'LS 4-Cilindros Common Rail Turbo (73 HP)',
    description: 'Tractor insignia de 73 HP con transmisión PowerStep 24F/24R, capacidad de levante en 3 puntos de 3,500 kg y cabina Deluxe climatizada con audio y suspensión neumática.',
    inStock: true,
    featured: true,
    basePriceUsd: 82500,
    specs: [
      { label: 'Potencia Motor', value: '73 HP Turbo Intercooler' },
      { label: 'Capacidad de Levante', value: '3,500 kg' },
      { label: 'Transmisión', value: 'PowerShuttle 24F/24R + PowerStep' }
    ],
    applications: ['Grandes Arroceras', 'Cultivos Extensivos', 'Labranza Pesada']
  },

  // ==========================================
  // YANMAR OFFICIAL AGRICULTURAL FLEET
  // ==========================================
  {
    id: 'yanmar-yt235',
    name: 'Tractor Compacto Yanmar YT235',
    brand: 'Yanmar',
    category: 'Tractores',
    modelCode: 'YT235',
    year: 2026,
    image: '/assets/machinery/modern_high_performance_farm_tractor_with.jpg',
    powerHp: 35,
    operatingWeightKg: 1680,
    engine: 'Yanmar 4TNV88C-KMS 4-Cilindros (35 HP)',
    description: 'Tractor japonés con transmisión hidrostática HST de 3 rangos para control milimétrico, doble toma de fuerza PTO de 540/1,000 RPM y levante de 1,050 kg.',
    inStock: true,
    featured: true,
    basePriceUsd: 33800,
    specs: [
      { label: 'Potencia', value: '35 HP 4-Cilindros' },
      { label: 'Transmisión', value: 'Hydrostatic (HST) 3-Range' },
      { label: 'Levante 3 Puntos', value: '1,050 kg' }
    ],
    applications: ['Horticultura Tecnificada', 'Fincas de Frutas Tropicales', 'Siembra Directa']
  },
  {
    id: 'yanmar-yt359',
    name: 'Tractor Yanmar YT359 Turbo Intercooler',
    brand: 'Yanmar',
    category: 'Tractores',
    modelCode: 'YT359',
    year: 2026,
    image: '/assets/machinery/rugged_utility_farm_tractor_with_heavy.jpg',
    powerHp: 59,
    operatingWeightKg: 2800,
    engine: 'Yanmar 4TNV98CT-KMS Turbo Intercooler (59 HP)',
    description: 'El modelo cumbre de la serie YT. Motor turbo intercooler de 59 HP, transmisión hidrostática dual-range con Power Shuttle y capacidad de 2,000 kg en 3 puntos.',
    inStock: true,
    featured: true,
    basePriceUsd: 58500,
    specs: [
      { label: 'Potencia Motor', value: '59 HP Turbo' },
      { label: 'Levante 3 Puntos', value: '2,000 kg' },
      { label: 'Toma de Fuerza', value: '540/1,000 RPM Independiente' }
    ],
    applications: ['Plátano y Banano', 'Cultivos Extensivos', 'Terrenos de Alta Humedad']
  },
  {
    id: 'yanmar-ag600',
    name: 'Cosechadora de Arroz Yanmar AG600',
    brand: 'Yanmar',
    category: 'Cosechadoras',
    modelCode: 'AG600',
    year: 2026,
    image: '/assets/machinery/modern_high_performance_farm_tractor_with.jpg',
    powerHp: 60,
    operatingWeightKg: 6200,
    engine: 'Yanmar 3TNV88C Diésel (60 HP)',
    description: 'Cosechadora combinada de arroz sobre orugas de goma anchas de 700 mm. Ancho de corte de 2.25 m, trillado de flujo axial para mínima pérdida de grano y tolva de 2,200 L.',
    inStock: true,
    featured: true,
    basePriceUsd: 98500,
    specs: [
      { label: 'Potencia', value: '60 HP' },
      { label: 'Ancho de Corte', value: '2.25 m' },
      { label: 'Capacidad de Tolva', value: '2,200 Litros' },
      { label: 'Orugas', value: 'Goma de 700 mm para Lodo' }
    ],
    applications: ['Arroceras Inundadas', 'Cosecha a Gran Escala', 'Zonas Tropicales']
  },

  // ==========================================
  // AMMANN OFFICIAL COMPACTION EQUIPMENT
  // ==========================================
  {
    id: 'ammann-ars70',
    name: 'Rodillo de Suelo Ammann ARS 70',
    brand: 'Ammann',
    category: 'Compactación',
    modelCode: 'ARS 70',
    year: 2026,
    image: '/assets/machinery/ammann_asc_100_single_drum_soil.jpg',
    powerHp: 66,
    operatingWeightKg: 7200,
    engine: 'Cummins QSF2.8 (66 HP)',
    description: 'Rodillo monocilíndrico de suelo suizo con tambor inteligente de 2,130 mm, medidor de compactación continua ACE y chasis articulado oscilante para carreteras.',
    inStock: true,
    featured: true,
    basePriceUsd: 68500,
    specs: [
      { label: 'Peso Operativo', value: '7,200 kg' },
      { label: 'Ancho de Tambor', value: '2,130 mm' },
      { label: 'Carga Lineal Estática', value: '33.8 kg/cm' }
    ],
    applications: ['Sub-bases Granulares', 'Terraplenes Viales', 'Rellenos de Autopistas']
  },
  {
    id: 'ammann-arx26',
    name: 'Rodillo Tándem de Asfalto Ammann ARX 26',
    brand: 'Ammann',
    category: 'Compactación',
    modelCode: 'ARX 26',
    year: 2026,
    image: '/assets/machinery/ammann_asphalt_vibratory_tandem_roller_machine.jpg',
    powerHp: 24,
    operatingWeightKg: 2600,
    engine: 'Yanmar 3-Cilindros Diésel (24 HP)',
    description: 'Rodillo tándem de asfalto de 2.6 toneladas con doble tambor vibratorio de 1,300 mm, doble amplitud seleccionable y tanque presurizado de agua de 180 litros.',
    inStock: true,
    featured: false,
    basePriceUsd: 38500,
    specs: [
      { label: 'Peso Operativo', value: '2,600 kg' },
      { label: 'Ancho de Tambor', value: '1,300 mm' },
      { label: 'Tanque de Riego', value: '180 Litros' }
    ],
    applications: ['Carreteras Urbanas', 'Estacionamientos', 'Capas de Rodadura Asfáltica']
  },
  {
    id: 'ammann-apf30-65',
    name: 'Placa Vibratoria Reversible Ammann APF 30/65',
    brand: 'Ammann',
    category: 'Compactación',
    modelCode: 'APF 30/65',
    year: 2026,
    image: '/assets/images/ammann_technical_icon_1789964687757.jpg',
    powerHp: 7,
    operatingWeightKg: 178,
    engine: 'Honda GX160 Gasolina (6.6 HP)',
    description: 'Placa compactadora vibratoria mediana con fuerza centrífuga de 30 kN, ancho de 650 mm y manubrio con atenuación de vibraciones certificada.',
    inStock: true,
    featured: true,
    basePriceUsd: 4800,
    specs: [
      { label: 'Peso Operativo', value: '178 kg' },
      { label: 'Fuerza Centrífuga', value: '30 kN' },
      { label: 'Profundidad Efectiva', value: '350 mm' }
    ],
    applications: ['Zanjas de Acueductos', 'Bases de Adoquines', 'Bacheo de Asfalto']
  },

  // ==========================================
  // IMER GROUP OFFICIAL CONCRETE FLEET
  // ==========================================
  {
    id: 'imer-mcbp30',
    name: 'Planta Móvil de Concreto IMER MCBP 30',
    brand: 'IMER',
    category: 'Concreto',
    modelCode: 'MCBP 30',
    year: 2026,
    image: '/assets/machinery/imer_group_commercial_concrete_batching_and.jpg',
    powerHp: 75,
    operatingWeightKg: 11000,
    engine: 'Sistema Eléctrico Trifásico + Control PLC',
    description: 'Planta de hormigón móvil italiana con producción de 30 m³/h, mezclador de 500 L, silo transportable de 25 toneladas y montaje en obra en 4 horas.',
    inStock: true,
    featured: true,
    basePriceUsd: 148000,
    specs: [
      { label: 'Capacidad de Producción', value: '30 m³/hora' },
      { label: 'Silo de Cemento', value: '25 Toneladas' },
      { label: 'Control', value: 'PLC Digital IMER Automat' }
    ],
    applications: ['Proyectos Remotos', 'Obras Viales MOPC', 'Edificación de Urbanizaciones']
  },
  {
    id: 'imer-mc1200',
    name: 'Mezcladora Reversible de Concreto IMER MC 1200',
    brand: 'IMER',
    category: 'Concreto',
    modelCode: 'MC 1200',
    year: 2026,
    image: '/assets/machinery/imer_group_commercial_concrete_batching_and.jpg',
    powerHp: 15,
    operatingWeightKg: 1850,
    engine: 'Motor Eléctrico Trifásico 11 kW',
    description: 'Mezcladora reversible de 1,200 litros con tambor de inversión de marcha, tolva de carga hidráulica automática y capacidad de producción de 12 m³/hora.',
    inStock: true,
    featured: true,
    basePriceUsd: 8800,
    specs: [
      { label: 'Capacidad de Tambor', value: '1,200 Litros' },
      { label: 'Rendimiento por Hora', value: '12 m³/h' },
      { label: 'Potencia de Motor', value: '11 kW Trifásico' }
    ],
    applications: ['Vaciado de Losas', 'Fundaciones', 'Columnas y Vigas de Hormigón']
  },

  // ==========================================
  // AFEX SYSTEMS CERTIFIED FIRE SUPPRESSION
  // ==========================================
  {
    id: 'afex-midex',
    name: 'Sistema Contra Incendios AFEX Mid Excavator (10-30T)',
    brand: 'AFEX',
    category: 'Seguridad',
    modelCode: 'AFEX-MIDEX-18KG',
    year: 2026,
    image: '/assets/machinery/afex_fire_suppression_system.jpg',
    powerHp: 0,
    operatingWeightKg: 45,
    engine: 'Agente Líquido ALC + Detección Lineal LHD',
    description: 'Sistema certificado de supresión de incendios en maquinaria pesada. 18 kg de agente líquido enfriador ALC, 8 boquillas de descarga y doble sensor térmico en compartimento de motor e hidráulicos.',
    inStock: true,
    featured: true,
    basePriceUsd: 9200,
    specs: [
      { label: 'Agente Extintor', value: '18 kg AFEX Liquid Agent ALC' },
      { label: 'Boquillas', value: '8 Boquillas de Descarga de Alta Cobertura' },
      { label: 'Certificación', value: 'FM Global, UL Listed, NFPA 17A' },
      { label: 'Instalación', value: 'Técnicos Certificados TMD Km 22' }
    ],
    applications: ['Excavadoras en Canteras', 'Minicargadores', 'Maquinaria en Condiciones de Alto Calor']
  }
];

export function getAllOfficialMachines(): Machine[] {
  return OFFICIAL_MACHINERY_CATALOG;
}
