import React from 'react';
import { 
  HardHat, 
  Mountain, 
  Cog, 
  Wrench, 
  Truck, 
  Sparkles, 
  Building2, 
  Landmark, 
  Layers, 
  FileText, 
  FileCheck
} from 'lucide-react';
import { SHOWROOM_MARKETING_ASSETS } from '../../data/brandsData';

export type MegaMenuTabId = 'heavy_machinery' | 'contractor_deploy' | 'gov_bids' | 'parts_service' | 'brands';
export type IndustrialSegmentKey = 'heavy_machinery' | 'contractor_deploy' | 'gov_bids' | 'parts_service' | 'brands' | 'construction' | 'contractors' | 'government' | 'rental' | 'parts' | 'services' | string;

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  spec: string;
  priceUsd?: number;
  route: string;
}

export interface QuickLinkItem {
  label: string;
  route: string;
  icon?: React.ElementType;
}

export interface SubCategoryItem {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: string;
  linkRoute: string;
  featuredProduct: ProductItem;
  quickLinks: QuickLinkItem[];
}

export interface MainTabConfig {
  id: MegaMenuTabId;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  headline: string;
  subcategories: SubCategoryItem[];
  highlight: {
    title: string;
    desc: string;
    bannerImg: string;
    ctaLabel: string;
    ctaRoute: string;
    badge: string;
    secondaryCta?: {
      label: string;
      route: string;
    };
  };
}

export const TAB_CONFIGS: MainTabConfig[] = [
  /* ------------------------------------------------------------- */
  /* 1. MAQUINARIA PESADA (Catálogo Principal de Equipos)          */
  /* ------------------------------------------------------------- */
  {
    id: 'heavy_machinery',
    label: 'Maquinaria Pesada',
    shortLabel: 'MAQUINARIA',
    icon: HardHat,
    headline: 'Excavación, Movimiento de Tierras y Minería en Patio Km 22',
    subcategories: [
      {
        id: 'excavation',
        title: 'Excavación & Retroexcavadoras',
        icon: HardHat,
        badge: 'JCB & LiuGong',
        linkRoute: '#/machinery?category=Retroexcavadoras',
        featuredProduct: {
          id: 'jcb-3cx-eco',
          name: 'JCB 3CX Eco 4x4 (2026)',
          brand: 'JCB',
          category: 'Retroexcavadora',
          image: 'https://www.jcb.com/globalassets/digizuite/66001-a_bhl_3cx_pro_1/Img_800x800',
          spec: 'Motor 109 HP EcoMAX • Balde 1.1 m³',
          priceUsd: 65000,
          route: '#/machinery/jcb-3cx-eco'
        },
        quickLinks: [
          { label: 'Retroexcavadoras 4x4 en Patio', route: '#/machinery?category=Retroexcavadoras' },
          { label: 'Excavadoras de Orugas 22T a 50T', route: '#/machinery?category=Excavadoras' },
          { label: 'Miniexcavadoras Compactas Yanmar & JCB', route: '#/machinery?category=Mini%20Excavadoras' }
        ]
      },
      {
        id: 'loaders_mining',
        title: 'Carga & Minería Pesada',
        icon: Mountain,
        badge: 'LiuGong Max',
        linkRoute: '#/machinery?category=Cargadores',
        featuredProduct: {
          id: 'liugong-856t',
          name: 'LiuGong 856T Heavy 5T',
          brand: 'LiuGong',
          category: 'Pala Cargadora 215 HP',
          image: SHOWROOM_MARKETING_ASSETS.liugong.banner,
          spec: 'Cummins 215 HP • Transmisión ZF • Balde 3.0 m³',
          priceUsd: 118000,
          route: '#/machinery/liugong-856t'
        },
        quickLinks: [
          { label: 'Palas Cargadoras de Roca y Áridos', route: '#/machinery?category=Cargadores' },
          { label: 'Motoniveladoras LiuGong 4180D (180 HP)', route: '#/machinery?category=Motoniveladoras' },
          { label: 'Sistemas Antincendio AFEX para Minería', route: '#/machinery?category=Seguridad' }
        ]
      },
      {
        id: 'road_compaction',
        title: 'Compactación & Izaje',
        icon: Layers,
        badge: 'Ammann & JCB',
        linkRoute: '#/machinery?category=Compactación',
        featuredProduct: {
          id: 'jcb-540-170-loadall',
          name: 'JCB 540-170 Loadall 17m',
          brand: 'JCB',
          category: 'Manipulador Telescópico',
          image: 'https://www.jcb.com/globalassets/digizuite/64829-a_thl_510_56_t4f_5/Img_800x800',
          spec: 'Alcance 16.7 m • Carga 4,000 kg • 4x4',
          priceUsd: 115000,
          route: '#/machinery/jcb-540-170-loadall'
        },
        quickLinks: [
          { label: 'Rodillos Monotambor de Suelo 11T-20T', route: '#/machinery?category=Compactación' },
          { label: 'Compactadores de Asfalto Tándem', route: '#/machinery?category=Compactación' },
          { label: 'Manipuladores Telescópicos 17m Loadall', route: '#/machinery?category=Manipuladores' }
        ]
      }
    ],
    highlight: {
      title: 'Flota Pesada Certificada 2026',
      desc: 'Disponibilidad inmediata en Patio Km 22 con 2 años de garantía de fábrica, telemetría satelital LiveLink™ y soporte técnico local.',
      bannerImg: SHOWROOM_MARKETING_ASSETS.jcb.banner,
      ctaLabel: 'Ver Catálogo Completo',
      ctaRoute: '#/machinery',
      badge: 'Stock en República Dominicana',
      secondaryCta: {
        label: 'Cotizar con NCF Fiscal',
        route: '#/checkout'
      }
    }
  },

  /* ------------------------------------------------------------- */
  /* 2. DESPLIEGUE EN OBRA & RENTA (Para el Contratista en Frente)  */
  /* ------------------------------------------------------------- */
  {
    id: 'contractor_deploy',
    label: 'Despliegue & Renta Obra',
    shortLabel: 'RENTA',
    icon: Truck,
    headline: 'Renta Rápida, Auxilio Mecánico SOS 24/7 y Lowboy para Contratistas',
    subcategories: [
      {
        id: 'express_rental',
        title: 'Renta Express & Operadores',
        icon: Truck,
        badge: 'Entrega < 4h',
        linkRoute: '#/rental',
        featuredProduct: {
          id: 'rent_jcb',
          name: 'Renta Retroexcavadoras & Rodillos',
          brand: 'TMD Rental Fleet',
          category: 'Por Día / Semana / Mes',
          image: 'https://www.jcb.com/globalassets/digizuite/66001-a_bhl_3cx_pro_1/Img_800x800',
          spec: 'Flota revisada con operador calificado o sin chofer',
          route: '#/rental'
        },
        quickLinks: [
          { label: 'Renta por Día, Semana o Mes en Obra', route: '#/rental' },
          { label: 'Cotizador Rápido de Renta con Operador', route: '#/rental' },
          { label: 'Políticas de Cobertura y Seguro de Flota', route: '#/rental' }
        ]
      },
      {
        id: 'field_emergency',
        title: 'Auxilio Mecánico SOS 24/7',
        icon: Wrench,
        badge: 'Respuesta Inmediata',
        linkRoute: '#/emergency-dispatch',
        featuredProduct: {
          id: 'sos_truck',
          name: 'Unidad Móvil 4x4 Taller Rodante',
          brand: 'TMD Rescate Obra',
          category: 'Asistencia en Sitio',
          image: SHOWROOM_MARKETING_ASSETS.liugong.banner,
          spec: 'Soldadora, compresor, prensa hidráulica y escáner ECU',
          route: '#/emergency-dispatch'
        },
        quickLinks: [
          { label: 'Despachar Auxilio Mecánico a Frente de Obra', route: '#/emergency-dispatch' },
          { label: 'Diagnóstico Electrónico LiveLink™ en Sitio', route: '#/emergency-dispatch' },
          { label: 'Repuestos Críticos para Paradas de Emergencia', route: '#/parts' }
        ]
      },
      {
        id: 'heavy_logistics',
        title: 'Logística Pesada & Lowboy',
        icon: Layers,
        badge: 'Hasta 60T',
        linkRoute: '#/rental',
        featuredProduct: {
          id: 'lowboy_service',
          name: 'Transporte Lowboy Interprovincial',
          brand: 'TMD Logística',
          category: 'Traslado de Maquinaria',
          image: SHOWROOM_MARKETING_ASSETS.showroomBanner,
          spec: 'Movilización rápida y segura a nivel nacional',
          route: '#/rental'
        },
        quickLinks: [
          { label: 'Cotizar Traslado Lowboy a Nivel Nacional', route: '#/rental' },
          { label: 'Suministro de Grasa y Lubricantes en Obra', route: '#/parts' },
          { label: 'Inspección Preventiva de Seguridad en Campo', route: '#/service' }
        ]
      }
    ],
    highlight: {
      title: 'Respuesta Rápida en Obra',
      desc: 'Cero paradas en tu cronograma: despacho express de flota en renta, rescate mecánico 24/7 y movilización en Lowboy en toda la geografía nacional.',
      bannerImg: SHOWROOM_MARKETING_ASSETS.ammann.banner,
      ctaLabel: 'Despacho Urgente: (809) 560-1234',
      ctaRoute: 'tel:18095601234',
      badge: 'Quick Deploy Contratistas',
      secondaryCta: {
        label: 'Solicitar Renta con Operador',
        route: '#/rental'
      }
    }
  },

  /* ------------------------------------------------------------- */
  /* 3. LICITACIONES & GOBIERNO (Para Licitadores y Entidades)     */
  /* ------------------------------------------------------------- */
  {
    id: 'gov_bids',
    label: 'Licitaciones & Gobierno',
    shortLabel: 'LICITACIONES',
    icon: Landmark,
    headline: 'Fichas Técnicas Homologadas, RPE Activo y Cotizador Fiscal NCF B15',
    subcategories: [
      {
        id: 'gov_fleet',
        title: 'Flota Homologada MOPC & Vial',
        icon: Building2,
        badge: 'MOPC & Ayuntamientos',
        linkRoute: '#/machinery?category=Compactación',
        featuredProduct: {
          id: 'liugong-4180d',
          name: 'Motoniveladora LiuGong 4180D',
          brand: 'LiuGong',
          category: 'Caminos Vecinales',
          image: SHOWROOM_MARKETING_ASSETS.showroomBanner,
          spec: 'Cummins 180 HP • Vertedera 13ft • Giro 360°',
          priceUsd: 135000,
          route: '#/machinery/liugong-4180d'
        },
        quickLinks: [
          { label: 'Motoniveladoras y Rodillos Viales MOPC', route: '#/machinery?category=Compactación' },
          { label: 'Excavadoras para Dragado y Cuencas Hidráulicas', route: '#/machinery?category=Excavadoras' },
          { label: 'Tractores Agrícolas para Alcaldías y Cabildos', route: '#/machinery?category=Tractores' }
        ]
      },
      {
        id: 'tech_specs',
        title: 'Fichas Técnicas & Pliegos',
        icon: FileText,
        badge: 'Descarga PDF',
        linkRoute: '#/tech-docs',
        featuredProduct: {
          id: 'spec_pdf',
          name: 'Fichas Homologadas para Licitación',
          brand: 'Bóveda Técnica TMD',
          category: 'Especificaciones Oficiales',
          image: SHOWROOM_MARKETING_ASSETS.kubota.banner,
          spec: 'PDFs listos para anexar a pliegos y propuestas del Estado',
          route: '#/tech-docs'
        },
        quickLinks: [
          { label: 'Bóveda Técnica Offline PWA', route: '#/tech-docs' },
          { label: 'Descargar Manuales y Hojas de Datos', route: '#/tech-docs' },
          { label: 'Asesoría Técnica para Pliegos de Licitación', route: '#/checkout' }
        ]
      },
      {
        id: 'state_procurement',
        title: 'Compras Públicas & RPE',
        icon: FileCheck,
        badge: 'DGII B15',
        linkRoute: '#/checkout',
        featuredProduct: {
          id: 'ncf_b15',
          name: 'Proforma Formal con NCF B15',
          brand: 'DGII Compras Públicas',
          category: 'Presupuestos Oficiales',
          image: SHOWROOM_MARKETING_ASSETS.showroomBanner,
          spec: 'RPE activo, RNC corporativo y validez fiscal inmediata',
          route: '#/checkout'
        },
        quickLinks: [
          { label: 'Generar Cotización NCF B15 Gubernamental', route: '#/checkout' },
          { label: 'Registro RPE Proveedor del Estado Activo', route: '#/checkout' },
          { label: 'Contratos Marco y Garantía de 10 Años', route: '#/about' }
        ]
      }
    ],
    highlight: {
      title: 'Soporte Integral para Licitaciones',
      desc: 'Documentación técnica homologada, RPE al día y asesoría especializada para licitaciones públicas y compras estatales en RD.',
      bannerImg: SHOWROOM_MARKETING_ASSETS.showroomBanner,
      ctaLabel: 'Generar Proforma con NCF',
      ctaRoute: '#/checkout',
      badge: 'Homologación Estatal RPE',
      secondaryCta: {
        label: 'Descargar Fichas Técnicas',
        route: '#/tech-docs'
      }
    }
  },

  /* ------------------------------------------------------------- */
  /* 4. REPUESTOS & TALLER (Partes Genuinas y Servicio Técnico)     */
  /* ------------------------------------------------------------- */
  {
    id: 'parts_service',
    label: 'Repuestos & Taller',
    shortLabel: 'REPUESTOS',
    icon: Cog,
    headline: 'Repuestos Genuinos OEM, Filtros Donaldson y Taller Km 22',
    subcategories: [
      {
        id: 'genuine_parts',
        title: 'Repuestos Genuinos OEM',
        icon: Cog,
        badge: '+35,000 Partes',
        linkRoute: '#/parts',
        featuredProduct: {
          id: 'parts_filter',
          name: 'Kits Filtros Donaldson & OEM',
          brand: 'Donaldson & OEM',
          category: 'Mantenimiento Preventivo',
          image: SHOWROOM_MARKETING_ASSETS.yomel.banner,
          spec: 'Filtros de aceite, combustible, aire e hidráulico',
          priceUsd: 280,
          route: '#/parts'
        },
        quickLinks: [
          { label: 'Buscador de Repuestos por Código OEM', route: '#/parts' },
          { label: 'Trenes de Rodaje & Orugas de Acero', route: '#/parts' },
          { label: 'Dientes de Balde & Cuchillas Antidesgaste', route: '#/parts' }
        ]
      },
      {
        id: 'central_workshop',
        title: 'Taller Central Km 22',
        icon: Wrench,
        badge: '12 Bahías HD',
        linkRoute: '#/service',
        featuredProduct: {
          id: 'overhaul_engine',
          name: 'Overhaul y Banco de Motores Diésel',
          brand: 'Cummins / Perkins / JCB',
          category: 'Reconstrucción Certificada',
          image: SHOWROOM_MARKETING_ASSETS.liugong.banner,
          spec: '12 bahías de servicio pesado y banco de dinamómetro',
          route: '#/service'
        },
        quickLinks: [
          { label: 'Agendar Turno en Taller Central Km 22', route: '#/service' },
          { label: 'Contratos Preventivos de Mantenimiento CMP', route: '#/service' },
          { label: 'Laboratorio de Inyección Diésel Common Rail', route: '#/service' }
        ]
      },
      {
        id: 'sos_support',
        title: 'Auxilio SOS & Análisis SOS',
        icon: Truck,
        badge: 'Respuesta Inmediata',
        linkRoute: '#/emergency-dispatch',
        featuredProduct: {
          id: 'rescue_mobile',
          name: 'Laboratorio Portátil de Fluidos SOS',
          brand: 'TMD Tribología',
          category: 'Diagnóstico Predictivo',
          image: SHOWROOM_MARKETING_ASSETS.afex.banner,
          spec: 'Espectrometría ICP de aceites para prevención de fallas',
          route: '#/oil-lab'
        },
        quickLinks: [
          { label: 'Línea de Emergencias: (809) 560-1234', route: 'tel:18095601234' },
          { label: 'Despacho de Auxilio en Obra y Cantera', route: '#/emergency-dispatch' },
          { label: 'Laboratorio de Aceites & Fluidos SOS', route: '#/oil-lab' }
        ]
      }
    ],
    highlight: {
      title: 'Taller Central & Stock Local',
      desc: '+35,000 números de parte en inventario físico en Patio Km 22 y 12 bahías de diagnóstico y reparación para equipos pesados.',
      bannerImg: SHOWROOM_MARKETING_ASSETS.afex.banner,
      ctaLabel: 'Buscar Repuestos OEM',
      ctaRoute: '#/parts',
      badge: 'Patio Km 22 Autopista Duarte',
      secondaryCta: {
        label: 'Agendar Cita en Taller',
        route: '#/service'
      }
    }
  },

  /* ------------------------------------------------------------- */
  /* 5. MARCAS OFICIALES (Pabellón de Marcas Homologadas)          */
  /* ------------------------------------------------------------- */
  {
    id: 'brands',
    label: 'Marcas Oficiales',
    shortLabel: 'MARCAS',
    icon: Sparkles,
    headline: 'Distribuidores Oficiales Homologados en República Dominicana',
    subcategories: [],
    highlight: {
      title: 'Pabellón de Marcas Homologadas',
      desc: 'Garantía directa de fábrica respaldada por TMD, soporte técnico local en Patio Km 22 y repuestos 100% genuinos.',
      bannerImg: SHOWROOM_MARKETING_ASSETS.showroomBanner,
      ctaLabel: 'Ver Catálogo Completo',
      ctaRoute: '#/machinery',
      badge: 'Marcas Oficiales RD'
    }
  }
];
