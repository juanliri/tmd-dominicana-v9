import { RentalEquipment } from '../types';

export const PROVINCIAL_FREIGHT_RATES: { [province: string]: number } = {
  'Santo Domingo / D.N. (Local)': 350,
  'San Cristóbal / Bajos de Haina': 450,
  'Santiago de los Caballeros': 850,
  'La Vega / Bonao': 650,
  'Punta Cana / Bávaro / Verón': 1200,
  'La Romana / San Pedro de Macorís': 750,
  'Puerto Plata / Sosúa': 1100,
  'Azua / Baní': 700,
  'Barahona / Pedernales': 1400,
  'Montecristi / Dajabón': 1350,
  'Samaná / Las Terrenas': 1150
};

export const RENTAL_FLEET_DATA: RentalEquipment[] = [
  {
    id: 'rent-jcb-3cx',
    name: 'Retroexcavadora JCB 3CX EcoPlus 4WD',
    brand: 'JCB',
    category: 'Retroexcavadoras',
    model: '3CX EcoPlus',
    image: '/images/video_ch2_jcb_patio.jpg',
    dayRateUsd: 280,
    weekRateUsd: 1450,
    monthRateUsd: 4800,
    operatorRateDayUsd: 75,
    minRentalDays: 2,
    availabilityStatus: 'available',
    baseLocation: 'Km 22 Autopista Duarte',
    specs: {
      powerHp: 92,
      weightTons: 8.1,
      bucketM3: 1.0,
      fuelConsumptionLph: 7.2
    },
    features: [
      'Tracción 4x4 con bloqueo diferencial',
      'Línea hidráulica auxiliar para martillo demoledor',
      'Telemática LiveLink™ integrada activa',
      'Cabina con aire acondicionado industrial FOPS/ROPS'
    ]
  },
  {
    id: 'rent-liugong-922e',
    name: 'Excavadora Hidráulica LiuGong 922E HD (Orugas)',
    brand: 'LiuGong',
    category: 'Excavadoras',
    model: '922E HD',
    image: '/images/video_ch1_patio.jpg',
    dayRateUsd: 550,
    weekRateUsd: 2900,
    monthRateUsd: 9800,
    operatorRateDayUsd: 85,
    minRentalDays: 3,
    availabilityStatus: 'available',
    baseLocation: 'Km 22 Autopista Duarte',
    specs: {
      powerHp: 160,
      weightTons: 22.0,
      bucketM3: 1.2,
      fuelConsumptionLph: 14.5
    },
    features: [
      'Motor Cummins 6BTAA5.9 Tier 2 (ideal para diésel local)',
      'Balde reforzado Hardox para roca y canteras',
      'Tren de rodaje blindado HD para servicio pesado',
      'Bomba Kawasaki de flujo variable'
    ]
  },
  {
    id: 'rent-ammann-asc110',
    name: 'Rodillo Compactador Ammann ASC 110 Monotambor',
    brand: 'Ammann',
    category: 'Compactación',
    model: 'ASC 110',
    image: '/images/tmd_coming_soon.jpg',
    dayRateUsd: 320,
    weekRateUsd: 1650,
    monthRateUsd: 5400,
    operatorRateDayUsd: 70,
    minRentalDays: 2,
    availabilityStatus: 'available',
    baseLocation: 'Santiago Base Norte',
    specs: {
      powerHp: 130,
      weightTons: 11.5,
      fuelConsumptionLph: 9.8
    },
    features: [
      'Amplitud dual de vibración para terraplenes y bases asfálticas',
      'Sistema de tracción integral hidrostática',
      'Medidor electrónico de densidad de compactación',
      'Rolo liso convertible con kit pata de cabra'
    ]
  },
  {
    id: 'rent-kubota-svl75',
    name: 'Minicargador Oruga Kubota SVL75-2 Rubber Track',
    brand: 'Kubota',
    category: 'Minicargadores',
    model: 'SVL75-2',
    image: '/images/video_ch3_minicargador.jpg',
    dayRateUsd: 290,
    weekRateUsd: 1500,
    monthRateUsd: 4900,
    operatorRateDayUsd: 65,
    minRentalDays: 1,
    availabilityStatus: 'available',
    baseLocation: 'Punta Cana Base Este',
    specs: {
      powerHp: 74,
      weightTons: 4.1,
      bucketM3: 0.55,
      fuelConsumptionLph: 6.8
    },
    features: [
      'Orugas de goma para no fracturar pavimentos terminados',
      'Levantamiento vertical para llenado de camiones volteo',
      'Caudal hidráulico de alto flujo (High-Flow Aux)',
      'Excelente estabilidad en terrenos arenosos o fango'
    ]
  },
  {
    id: 'rent-jcb-540-170',
    name: 'Manipulador Telescópico JCB 540-170 Loadall 17m',
    brand: 'JCB',
    category: 'Manipuladores',
    model: '540-170',
    image: '/images/video_ch2_jcb_patio.jpg',
    dayRateUsd: 480,
    weekRateUsd: 2500,
    monthRateUsd: 8200,
    operatorRateDayUsd: 80,
    minRentalDays: 2,
    availabilityStatus: 'available',
    baseLocation: 'Km 22 Autopista Duarte',
    specs: {
      powerHp: 109,
      weightTons: 12.1,
      fuelConsumptionLph: 8.5
    },
    features: [
      'Alcance vertical de 17 metros (4 niveles de edificación)',
      'Capacidad máxima de izaje de 4,000 kg (4 Toneladas)',
      'Estabilizadores frontales hidráulicos con sensor de inclinación',
      'Incluye horquillas portapalets y balde de materiales ligeros'
    ]
  }
];
