import { UsedMachineListing } from '../types';

export const CERTIFIED_USED_MACHINES: UsedMachineListing[] = [
  {
    id: 'used-jcb-3cx-2021',
    slug: 'jcb-3cx-eco-2021-tmd-certified',
    title: 'JCB 3CX Eco 4WD Cabina Climatizada',
    brand: 'JCB',
    model: '3CX Eco',
    year: 2021,
    hours: 2450,
    serialNumberMasked: 'JCB3CX***8492',
    priceUsd: 58500,
    certifiedInspectionScore: 94,
    inspectionReportDocRef: 'CERT-150P-JCB3CX-2026',
    warrantyMonths: 6,
    location: 'Sede Central Km 22 Autopista Duarte',
    status: 'available',
    features: [
      'Motor JCB Dieselmax 92 HP',
      'Línea hidráulica auxiliar para martillo',
      'Cazo 4 en 1 con horquillas integradas',
      'Neumáticos Michelin Power CL al 85%'
    ],
    imageUrl: '/images/video_ch2_jcb_patio.jpg',
    cabinType: 'Cabina ROPS/FOPS con Aire Acondicionado',
    undercarriageConditionPercent: 88
  },
  {
    id: 'used-liugong-922e-2020',
    slug: 'liugong-922e-hd-2020-certified',
    title: 'Excavadora LiuGong 922E HD 22 Toneladas',
    brand: 'LiuGong',
    model: '922E HD',
    year: 2020,
    hours: 3820,
    serialNumberMasked: 'LG922E***3190',
    priceUsd: 84000,
    certifiedInspectionScore: 91,
    inspectionReportDocRef: 'CERT-150P-LG922-2026',
    warrantyMonths: 6,
    location: 'Patio Industrial Santiago (Zona Norte)',
    status: 'available',
    features: [
      'Motor Cummins 6BTA 150 HP',
      'Bomba principal Kawasaki K3V112',
      'Cucharón para roca HD 1.1 m³ reforzado',
      'Tren de rodaje Berco al 80% de vida útil'
    ],
    imageUrl: '/images/video_ch1_patio.jpg',
    cabinType: 'Cabina Presurizada con Pantalla Digital',
    undercarriageConditionPercent: 80
  },
  {
    id: 'used-jcb-531-70-2022',
    slug: 'jcb-531-70-loadall-2022-certified',
    title: 'Manipulador Telescópico JCB 531-70 Loadall',
    brand: 'JCB',
    model: '531-70',
    year: 2022,
    hours: 1680,
    serialNumberMasked: 'JCB531***1102',
    priceUsd: 72000,
    certifiedInspectionScore: 97,
    inspectionReportDocRef: 'CERT-150P-JCB531-2026',
    warrantyMonths: 12,
    location: 'Sucursal Punta Cana / Verón',
    status: 'available',
    features: [
      'Alcance de 7.0 metros / Capacidad 3.1 Ton',
      'Tracción 4x4 con 3 modos de dirección',
      'Estabilizadores frontales hidráulicos',
      'Horquillas para paletas y balde de material'
    ],
    imageUrl: '/images/video_ch2_jcb_patio.jpg',
    cabinType: 'Cabina Vista Panorámica Hi-Vision',
    undercarriageConditionPercent: 92
  }
];
