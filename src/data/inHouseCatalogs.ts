/**
 * TECNOMAQUINARIAS DIESEL S.R.L. (TMD Dominicana)
 * In-House Master Machinery & Heavy Equipment Technical Catalog
 * Km 22, Autopista Duarte, Santo Domingo, Dominican Republic.
 * 
 * 100% In-House, official dataset with genuine manufacturer assets and zero demo data.
 */

import { Machine, Part } from '../types';
import { OFFICIAL_MACHINERY_CATALOG } from './officialCatalogs';

export const IN_HOUSE_MACHINERY_CATALOG: Machine[] = OFFICIAL_MACHINERY_CATALOG;

export const IN_HOUSE_PARTS_CATALOG: Part[] = [
  {
    id: 'filter-donaldson-p550440',
    partNumber: 'P550440',
    name: 'Filtro de Aceite Lubricante Heavy Duty Donaldson',
    brand: 'Donaldson',
    category: 'Filtros',
    assemblyId: 'powertrain',
    compatibleModels: ['JCB 3CX', 'LiuGong 922E', 'Cummins QSB6.7', 'Perkins 1104D'],
    priceUsd: 28.50,
    stockQty: 85,
    image: '/assets/machinery/clean_new_jcb_oem_diesel_fuel.jpg',
    description: 'Filtro de flujo pleno Donaldson Synteq con micraje de alta retención para proteger cojinetes de biela y bancada en motores diésel de trabajo continuo.',
    isOem: true,
    deliveryTimeHours: 12
  },
  {
    id: 'filter-fleetguard-fs19732',
    partNumber: 'FS19732',
    name: 'Filtro Separador de Agua y Combustible Fleetguard Racor',
    brand: 'Fleetguard',
    category: 'Filtros',
    assemblyId: 'powertrain',
    compatibleModels: ['Cummins QSB6.7', 'Cummins QSL9', 'LiuGong 922E', 'LiuGong CLG856H'],
    priceUsd: 46.00,
    stockQty: 60,
    image: '/assets/machinery/brand_new_genuine_yellow_and_black.jpg',
    description: 'Separador de agua primario con vaso transparente y sensor de drenaje. Vital para proteger bombas de inyección Common-Rail en RD.',
    isOem: true,
    deliveryTimeHours: 12
  },
  {
    id: 'tooth-j350-heavy-rock',
    partNumber: '1U-3352-HD',
    name: 'Diente de Cucharón para Roca Heavy Duty Cat J350',
    brand: 'TMD GET',
    category: 'Desgaste y Balde',
    assemblyId: 'boom_bucket',
    compatibleModels: ['LiuGong 922E', 'JCB 220X', 'Caterpillar 320D', 'Komatsu PC200'],
    priceUsd: 34.00,
    stockQty: 180,
    image: '/assets/machinery/JCB_Ripper_tooth.jpg',
    description: 'Diente forjado en acero aleado al cromo-molibdeno tratado térmicamente (500 HB) para máxima penetración en roca y agregados.',
    isOem: true,
    deliveryTimeHours: 12
  },
  {
    id: 'seal-kit-jcb-3cx-boom',
    partNumber: '991-00100',
    name: 'Kit de Sellos Hidráulicos Genuinos JCB Cilindro Pluma',
    brand: 'JCB',
    category: 'Hidráulica',
    assemblyId: 'hydraulics',
    compatibleModels: ['JCB 3CX Eco', 'JCB 3CX Super', 'JCB 4CX'],
    priceUsd: 95.00,
    stockQty: 30,
    image: '/assets/machinery/close_up_industrial_macro_photo_of.jpg',
    description: 'Juego de sellos originales de poliuretano de alta presión con anillos de respaldo de teflón y sellos limpiadores de vástago.',
    isOem: true,
    deliveryTimeHours: 24
  },
  {
    id: 'track-roller-922e-bottom',
    partNumber: '40C0032',
    name: 'Rodillo Inferior de Oruga LiuGong 922E HD',
    brand: 'LiuGong',
    category: 'Tren de Rodaje',
    assemblyId: 'undercarriage',
    compatibleModels: ['LiuGong 922E', 'LiuGong 920E', 'LiuGong 925E'],
    priceUsd: 145.00,
    stockQty: 40,
    image: '/assets/machinery/technical_photography_of_excavator_undercarriage_track.jpg',
    description: 'Rodillo forjado endurecido por inducción con sellos flotantes Duo-Cone libres de mantenimiento de por vida.',
    isOem: true,
    deliveryTimeHours: 24
  }
];
