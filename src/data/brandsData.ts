import jcbBannerImg from '../assets/images/jcb_machinery_banner_1789963695284.jpg';
import liugongBannerImg from '../assets/images/liugong_machinery_banner_1789963706661.jpg';
import jcbTechIconImg from '../assets/images/jcb_technical_icon_1789963719527.jpg';
import liugongTechIconImg from '../assets/images/liugong_technical_icon_1789963729308.jpg';
import showroomBannerImg from '../assets/images/showroom_category_banner_1789963740736.jpg';

// Newly Generated Brand Marketing Assets
import ammannBannerImg from '../assets/images/ammann_machinery_banner_1789964676579.jpg';
import ammannTechIconImg from '../assets/images/ammann_technical_icon_1789964687757.jpg';
import lsTractorBannerImg from '../assets/images/ls_tractor_machinery_banner_1789964700836.jpg';
import lsTractorTechIconImg from '../assets/images/ls_tractor_technical_icon_1789964715641.jpg';
import kubotaBannerImg from '../assets/images/kubota_machinery_banner_1789964729809.jpg';
import kubotaTechIconImg from '../assets/images/kubota_technical_icon_1789964739971.jpg';
import afexBannerImg from '../assets/images/afex_machinery_banner_1789964751359.jpg';
import afexTechIconImg from '../assets/images/afex_technical_icon_1789964761363.jpg';
import imerBannerImg from '../assets/images/imer_machinery_banner_1789964771826.jpg';
import imerTechIconImg from '../assets/images/imer_technical_icon_1789964782923.jpg';
import yanmarBannerImg from '../assets/images/yanmar_machinery_banner_1789967378321.jpg';
import yanmarTechIconImg from '../assets/images/yanmar_technical_icon_1789967394168.jpg';
import yomelBannerImg from '../assets/images/yomel_machinery_banner_1789967409164.jpg';
import yomelTechIconImg from '../assets/images/yomel_technical_icon_1789967422537.jpg';

export interface BrandInfo {
  id: string;
  name: string;
  country: string;
  tagline: string;
  category: string;
  logoFileName: string;
  primaryColor: string;
  accentBg: string;
  equipmentLines: string[];
  bannerImage?: string;
  technicalIcon?: string;
}

export const SHOWROOM_MARKETING_ASSETS = {
  showroomBanner: showroomBannerImg,
  jcb: {
    banner: jcbBannerImg,
    technicalIcon: jcbTechIconImg,
    title: 'JCB Construction & Excavation Master',
    subtitle: 'Retroexcavadoras 3CX/4CX, Excavadoras JS220 y Manipuladores Loadall con telemetría LiveLink™ integrada',
    stats: [
      { label: 'Telemetría', value: 'LiveLink™ 24/7' },
      { label: 'Eficiencia', value: '-16% Combustible' },
      { label: 'Garantía TMD', value: '2 Años / 2,000h' }
    ]
  },
  liugong: {
    banner: liugongBannerImg,
    technicalIcon: liugongTechIconImg,
    title: 'LiuGong Heavy Mining & Earthmoving',
    subtitle: 'Palas cargadoras 856H Max y excavadoras pesadas serie 922E/936E con tren motriz Cummins & ZF',
    stats: [
      { label: 'Tren Motriz', value: 'Cummins + ZF' },
      { label: 'Capacidad Carga', value: 'Hasta 7.5 m³' },
      { label: 'Garantía TMD', value: '2 Años / 2,000h' }
    ]
  },
  ammann: {
    banner: ammannBannerImg,
    technicalIcon: ammannTechIconImg,
    title: 'Ammann Swiss Compaction & Paving Technology',
    subtitle: 'Rodillos monotambor ASC 110, compactadores de asfalto tándem y placas vibratorias con control inteligente ACE',
    stats: [
      { label: 'Ingeniería', value: 'Suiza 🇨🇭' },
      { label: 'Sistema Compactación', value: 'ACE Intelligent' },
      { label: 'Garantía TMD', value: '2 Años / 2,000h' }
    ]
  },
  lsTractor: {
    banner: lsTractorBannerImg,
    technicalIcon: lsTractorTechIconImg,
    title: 'LS Tractor Heavy Agricultural Powertrain',
    subtitle: 'Tractores agrícolas 4WD serie Plus 80-100 HP para siembra intensiva de caña, arroz y ganadería de alta demanda',
    stats: [
      { label: 'Tracción', value: '4WD Reforzada' },
      { label: 'Eficiencia', value: 'Bajo Consumo Diésel' },
      { label: 'Garantía TMD', value: '3 Años Oficial' }
    ]
  },
  kubota: {
    banner: kubotaBannerImg,
    technicalIcon: kubotaTechIconImg,
    title: 'Escorts Kubota Compact Agri & Utility',
    subtitle: 'Tractores compactos utilitarios Farmtrac y motores industriales diésel reconocidos por su longevidad legendaria',
    stats: [
      { label: 'Motor Diésel', value: 'Kubota Direct-Inject' },
      { label: 'Mantenimiento', value: 'Costo Mínimo' },
      { label: 'Garantía TMD', value: '2 Años Oficial' }
    ]
  },
  afex: {
    banner: afexBannerImg,
    technicalIcon: afexTechIconImg,
    title: 'AFEX Fire Suppression Systems for Mining & Heavy Fleets',
    subtitle: 'Sistemas automáticos duales de extinción y supresión de incendios diseñados para excavadoras y palas de minería',
    stats: [
      { label: 'Certificación', value: 'NFPA 122 & FM' },
      { label: 'Agente Extintor', value: 'Dual Polvo + Líquido' },
      { label: 'Sensores', value: 'Térmico Lineal 24/7' }
    ]
  },
  imer: {
    banner: imerBannerImg,
    technicalIcon: imerTechIconImg,
    title: 'IMER Concrete Batching & Transit Mixers',
    subtitle: 'Camiones hormigonera mixer, bombas de concreto y plantas dosificadoras con tambores de alta resistencia al desgaste',
    stats: [
      { label: 'Origen', value: 'Italia 🇮🇹' },
      { label: 'Tambor Mixer', value: 'Acero Antidesgaste' },
      { label: 'Soporte TMD', value: 'Servicio & Repuestos' }
    ]
  },
  yanmar: {
    banner: yanmarBannerImg,
    technicalIcon: yanmarTechIconImg,
    title: 'Yanmar Compact Construction & Diesel Power',
    subtitle: 'Miniexcavadoras con giro cero de cola (Zero Tail Swing) y motores diésel de alto rendimiento y bajo consumo',
    stats: [
      { label: 'Origen', value: 'Japón 🇯🇵' },
      { label: 'Giro de Cola', value: 'Zero Tail Swing' },
      { label: 'Garantía TMD', value: '2 Años / 2,000h' }
    ]
  },
  yomel: {
    banner: yomelBannerImg,
    technicalIcon: yomelTechIconImg,
    title: 'Yomel Precision Agricultural Implements',
    subtitle: 'Distribuidores de fertilizante, rotoenfardadoras y segadoras de forraje para rendimiento agrícola superior',
    stats: [
      { label: 'Tecnología', value: 'Siembra & Forraje' },
      { label: 'Distribución', value: 'Precisión Calibrada' },
      { label: 'Soporte TMD', value: 'Garantía Oficial' }
    ]
  }
};

export const OFFICIAL_BRANDS: BrandInfo[] = [
  {
    id: 'jcb',
    name: 'JCB',
    country: 'Reino Unido (UK)',
    tagline: 'Líder Mundial en Retroexcavadoras & Manipuladores Telescópicos',
    category: 'Construcción & Carga',
    logoFileName: 'jcb-logo.png',
    primaryColor: '#F59E0B',
    accentBg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    equipmentLines: ['Retroexcavadoras 3CX / 4CX', 'Manipuladores Loadall 540-170', 'Excavadoras de Orugas JS220', 'Miniexcavadoras & Rodillos'],
    bannerImage: jcbBannerImg,
    technicalIcon: jcbTechIconImg
  },
  {
    id: 'liugong',
    name: 'LiuGong',
    country: 'Global / China & USA',
    tagline: 'Maquinaria Pesada para Minería, Canteras & Movimiento Masivo',
    category: 'Minería & Tierra',
    logoFileName: 'liugong-logo.png',
    primaryColor: '#002B66',
    accentBg: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    equipmentLines: ['Excavadoras Pesadas 922E / 936E', 'Palas Cargadoras 856H Max', 'Motoniveladoras 4180D', 'Bulldozers'],
    bannerImage: liugongBannerImg,
    technicalIcon: liugongTechIconImg
  },
  {
    id: 'ammann',
    name: 'Ammann',
    country: 'Suiza',
    tagline: 'Tecnología Suiza en Compactación de Suelos & Asfalto',
    category: 'Vial & Pavimentación',
    logoFileName: 'ammann-logo.png',
    primaryColor: '#E11D48',
    accentBg: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    equipmentLines: ['Rodillos Monotambor ASC 110', 'Compactadores Tándem Asfalto', 'Compactadores Neumáticos', 'Placas Vibratorias'],
    bannerImage: ammannBannerImg,
    technicalIcon: ammannTechIconImg
  },
  {
    id: 'ls-tractor',
    name: 'LS Tractor',
    country: 'Corea del Sur',
    tagline: 'Tractores Agrícolas de Alta Potencia & Eficiencia de Combustible',
    category: 'Agroindustria & Campo',
    logoFileName: 'ls-tractor-logo.png',
    primaryColor: '#0284C7',
    accentBg: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
    equipmentLines: ['Tractores Serie Plus 80-100 HP', 'Tractores Utilitarios 4WD', 'Aperos & Rastras Agrícolas', 'Empacadoras'],
    bannerImage: lsTractorBannerImg,
    technicalIcon: lsTractorTechIconImg
  },
  {
    id: 'kubota',
    name: 'Escorts Kubota',
    country: 'Japón / India',
    tagline: 'Potencia Compacta & Motores Diésel de Máxima Durabilidad',
    category: 'Agrícola & Construcción Ligera',
    logoFileName: 'kubota-logo.png',
    primaryColor: '#009688',
    accentBg: 'bg-teal-500/10 text-teal-500 border-teal-500/30',
    equipmentLines: ['Tractores Especializados Farmtrac / Powertrac', 'Motores Industriales Diésel', 'Cargadores Frontales Agrícolas'],
    bannerImage: kubotaBannerImg,
    technicalIcon: kubotaTechIconImg
  },
  {
    id: 'yanmar',
    name: 'Yanmar',
    country: 'Japón',
    tagline: 'Miniexcavadoras de Precisión & Motores Diésel Compactos',
    category: 'Excavación Compacta',
    logoFileName: 'yanmar-logo.png',
    primaryColor: '#DC2626',
    accentBg: 'bg-red-500/10 text-red-500 border-red-500/30',
    equipmentLines: ['Miniexcavadoras VIO Series', 'Motores Diésel Industriales', 'Dumpers Compactos de Orugas'],
    bannerImage: yanmarBannerImg,
    technicalIcon: yanmarTechIconImg
  },
  {
    id: 'yomel',
    name: 'Yomel',
    country: 'Argentina / Latam',
    tagline: 'Implementos de Forraje, Rotoenfardadoras & Sembradoras',
    category: 'Implementos Agrícolas',
    logoFileName: 'yomel-logo.png',
    primaryColor: '#EAB308',
    accentBg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    equipmentLines: ['Fertilizadoras y Abonadoras', 'Rotoenfardadoras Magna', 'Segadoras de Tambor & Rastrillos'],
    bannerImage: yomelBannerImg,
    technicalIcon: yomelTechIconImg
  },
  {
    id: 'afex',
    name: 'AFEX',
    country: 'Estados Unidos',
    tagline: 'Sistemas Automáticos de Supresión de Incendios para Minería',
    category: 'Seguridad & Protección',
    logoFileName: 'afex-logo.png',
    primaryColor: '#DC2626',
    accentBg: 'bg-red-500/10 text-red-500 border-red-500/30',
    equipmentLines: ['Sistemas de Polvo Químico Seco', 'Sistemas Duales Líquido/Polvo', 'Monitoreo de Sensores Térmicos para Palas y Camiones'],
    bannerImage: afexBannerImg,
    technicalIcon: afexTechIconImg
  },
  {
    id: 'imer',
    name: 'IMER Concrete',
    country: 'Italia / Global',
    tagline: 'Plantas Dosificadoras de Hormigón & Equipos de Concreto',
    category: 'Hormigón & Plantas',
    logoFileName: 'imer-logo.png',
    primaryColor: '#0D9488',
    accentBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    equipmentLines: ['Camiones Hormigoneros Mixer', 'Plantas Dosificadoras de Concreto', 'Bombas Estacionarias & Proyectores de Mortero'],
    bannerImage: imerBannerImg,
    technicalIcon: imerTechIconImg
  }
];
