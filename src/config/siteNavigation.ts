import { ROUTE_REGISTRY, RouteDefinition, RouteCategory, UserAccessRole, resolveRoute } from './routes';

export interface SiteNavigationItem {
  id: string;
  name: string;
  shortName?: string;
  path: string;
  description: string;
  category: RouteCategory;
  requiredRole?: UserAccessRole;
  aliases: string[];
  isEligibleForComparison?: boolean;
  searchKeywords: string[];
  iconName?: string;
  inHeaderNav?: boolean;
  inMobileNav?: boolean;
}

/**
 * TMD TECNOMAQUINARIAS DOMINICANA - UNIFIED SITE NAVIGATION CONFIGURATION
 * 
 * Provides an enterprise mapping of all route IDs to display names, paths,
 * access roles, search keywords, and navigation groups.
 */
export const SiteNavigation = {
  /**
   * Complete dictionary of navigation routes indexed by standard ID
   */
  ROUTES: {
    home: {
      id: 'home',
      name: 'Inicio / Showroom',
      shortName: 'Inicio',
      path: '#/home',
      description: 'Showroom de maquinaria pesada, repuestos y servicios en RD',
      category: 'showroom' as RouteCategory,
      aliases: ['#/', '#/inicio', ''],
      isEligibleForComparison: true,
      searchKeywords: ['inicio', 'home', 'showroom', 'portada', 'tmd', 'maquinaria'],
      iconName: 'Home',
      inHeaderNav: true,
      inMobileNav: true
    },
    machinery: {
      id: 'machinery',
      name: 'Catálogo de Maquinaria Pesada',
      shortName: 'Maquinaria',
      path: '#/machinery',
      description: 'Excavadoras, retroexcavadoras, rodillos, motoniveladoras y palas',
      category: 'showroom' as RouteCategory,
      aliases: ['#/equipos', '#/flota', '#/maquinarias', '#/catalogo-maquinaria'],
      isEligibleForComparison: true,
      searchKeywords: ['maquinaria', 'excavadora', 'pala', 'motoniveladora', 'rodillo', 'retroexcavadora'],
      iconName: 'Truck',
      inHeaderNav: true,
      inMobileNav: true
    },
    'machinery-hub': {
      id: 'machinery-hub',
      name: 'Centro de Maquinaria Pesada',
      shortName: 'Centro Maquinaria',
      path: '#/machinery-hub',
      description: 'Explorar categorías, marcas y equipos disponibles',
      category: 'showroom' as RouteCategory,
      aliases: ['#/equipos-hub', '#/maquinaria-hub'],
      isEligibleForComparison: true,
      searchKeywords: ['centro', 'hub', 'categorias', 'explorar', 'maquinaria', 'equipos', 'marcas'],
      iconName: 'Layers',
      inHeaderNav: false,
      inMobileNav: false
    },
    parts: {
      id: 'parts',
      name: 'Catálogo de Repuestos OEM',
      shortName: 'Repuestos',
      path: '#/parts',
      description: 'Filtros, tren de rodaje, cilindros hidráulicos y kits de motor',
      category: 'showroom' as RouteCategory,
      aliases: ['#/repuestos', '#/piezas', '#/spare-parts', '#/partes'],
      searchKeywords: ['repuestos', 'partes', 'piezas', 'filtros', 'orugas', 'hidráulica'],
      iconName: 'Cog',
      inHeaderNav: true,
      inMobileNav: true
    },
    rental: {
      id: 'rental',
      name: 'Flota de Renta Industrial',
      shortName: 'Renta',
      path: '#/rental',
      description: 'Alquiler con o sin operador y flete lowboy provincial',
      category: 'showroom' as RouteCategory,
      aliases: ['#/renta', '#/alquiler', '#/rent'],
      isEligibleForComparison: true,
      searchKeywords: ['renta', 'alquiler', 'leasing operativo', 'lowboy'],
      iconName: 'Layers',
      inHeaderNav: true,
      inMobileNav: false
    },
    'parts-hub': {
      id: 'parts-hub',
      name: 'Centro de Repuestos Genuinos & Filtros OEM',
      shortName: 'Centro Repuestos',
      path: '#/parts-hub',
      description: 'Explorar categorías de repuestos y filtros OEM',
      category: 'showroom' as RouteCategory,
      aliases: ['#/repuestos-hub', '#/piezas-hub'],
      searchKeywords: ['repuestos hub', 'filtros', 'piezas', 'oem'],
      iconName: 'Cog',
      inHeaderNav: false,
      inMobileNav: false
    },
    'rental-hub': {
      id: 'rental-hub',
      name: 'Centro de Renta de Maquinaria Pesada',
      shortName: 'Centro Renta',
      path: '#/rental-hub',
      description: 'Tarifario y modelos de renta de maquinaria pesada',
      category: 'showroom' as RouteCategory,
      aliases: ['#/renta-hub', '#/alquiler-hub'],
      isEligibleForComparison: true,
      searchKeywords: ['renta hub', 'alquiler equipos', 'tarifas renta'],
      iconName: 'Layers',
      inHeaderNav: false,
      inMobileNav: false
    },
    'services-hub': {
      id: 'services-hub',
      name: 'Centro de Servicios Técnicos & Postventa',
      shortName: 'Centro Servicios',
      path: '#/services-hub',
      description: 'Taller Km 22, SOS en obra y telemetría satelital',
      category: 'technical' as RouteCategory,
      aliases: ['#/servicios-hub', '#/taller-hub'],
      searchKeywords: ['servicios hub', 'taller central', 'sos movil'],
      iconName: 'Wrench',
      inHeaderNav: false,
      inMobileNav: false
    },
    'brands-directory': {
      id: 'brands-directory',
      name: 'Directorio de Marcas Oficiales Homologadas',
      shortName: 'Marcas',
      path: '#/brands-directory',
      description: 'Fabricantes OEM autorizados en República Dominicana',
      category: 'showroom' as RouteCategory,
      aliases: ['#/marcas', '#/directorio-marcas'],
      searchKeywords: ['marcas', 'directorio', 'jcb', 'liugong', 'ammann'],
      iconName: 'Sparkles',
      inHeaderNav: false,
      inMobileNav: false
    },
    service: {
      id: 'service',
      name: 'Taller Central Km 22 & Servicios',
      shortName: 'Taller',
      path: '#/service',
      description: 'Overhaul de motores, banco de prueba hidráulico y mantenimiento',
      category: 'technical' as RouteCategory,
      aliases: ['#/services', '#/taller', '#/servicios', '#/mantenimiento'],
      searchKeywords: ['taller', 'mantenimiento', 'overhaul', 'hidráulica', 'km 22'],
      iconName: 'Wrench',
      inHeaderNav: true,
      inMobileNav: true
    },
    livelink: {
      id: 'livelink',
      name: 'Telemetría Satelital LiveLink™ IoT',
      shortName: 'LiveLink™',
      path: '#/livelink',
      description: 'Monitoreo en tiempo real de horómetros, combustible y fallas DTC',
      category: 'operations' as RouteCategory,
      aliases: ['#/telematics', '#/telemetria', '#/iot', '#/gps'],
      searchKeywords: ['livelink', 'telemetria', 'iot', 'gps', 'horometro', 'canbus'],
      iconName: 'Cpu',
      inHeaderNav: true,
      inMobileNav: false
    },
    fullbay: {
      id: 'fullbay',
      name: 'Control de Taller Fullbay Heavy-Duty',
      shortName: 'Fullbay',
      path: '#/fullbay',
      description: 'Gestión digital de órdenes de trabajo, mecánicos y bahías',
      category: 'operations' as RouteCategory,
      aliases: ['#/ordenes-trabajo', '#/taller-workflow', '#/shop-manager'],
      searchKeywords: ['fullbay', 'ordenes de trabajo', 'bahias', 'tecnicos'],
      iconName: 'ClipboardList',
      inHeaderNav: false,
      inMobileNav: false
    },
    emergency: {
      id: 'emergency',
      name: 'Despacho de Brigadas SOS 24/7',
      shortName: 'Brigada SOS',
      path: '#/emergency',
      description: 'Unidades móviles de rescate mecánico con llegada < 120 min',
      category: 'technical' as RouteCategory,
      aliases: ['#/emergency-dispatch', '#/sos', '#/rescue', '#/emergencias'],
      searchKeywords: ['emergencia', 'sos', 'rescate', 'brigada', 'averia', '24/7'],
      iconName: 'Flame',
      inHeaderNav: false,
      inMobileNav: false
    },
    oilLab: {
      id: 'oil-lab',
      name: 'Laboratorio de Fluidos SOS-OIL™',
      shortName: 'Lab Aceite',
      path: '#/oil-lab',
      description: 'Espectrometría ASTM, conteo de partículas y análisis de desgaste',
      category: 'technical' as RouteCategory,
      aliases: ['#/laboratorio', '#/aceite', '#/analisis-aceite'],
      searchKeywords: ['laboratorio', 'aceite', 'fluidos', 'astm', 'desgaste'],
      iconName: 'FlaskConical',
      inHeaderNav: false,
      inMobileNav: false
    },
    techDocs: {
      id: 'tech-docs',
      name: 'Biblioteca de Manuales & Planos',
      shortName: 'Manuales',
      path: '#/tech-docs',
      description: 'Fichas técnicas oficiales, esquemas hidráulicos y pliegos de licitación',
      category: 'technical' as RouteCategory,
      aliases: ['#/manuals', '#/planos', '#/esquemas', '#/fichas-tecnicas'],
      searchKeywords: ['manuales', 'fichas tecnicas', 'planos', 'esquemas', 'licitaciones'],
      iconName: 'BookOpen',
      inHeaderNav: false,
      inMobileNav: false
    },
    academy: {
      id: 'academy',
      name: 'Academia de Operadores TMD',
      shortName: 'Academia',
      path: '#/academy',
      description: 'Certificación de operadores pesados y simuladores VR',
      category: 'technical' as RouteCategory,
      aliases: ['#/academia', '#/certificacion', '#/cursos'],
      searchKeywords: ['academia', 'operadores', 'certificacion', 'capacitacion'],
      iconName: 'GraduationCap',
      inHeaderNav: false,
      inMobileNav: false
    },
    reman: {
      id: 'reman',
      name: 'Centro de Reconstrucción REMAN',
      shortName: 'REMAN',
      path: '#/reman',
      description: 'Motores, transmisiones y bombas con 12 meses de garantía',
      category: 'technical' as RouteCategory,
      aliases: ['#/reconstruccion', '#/overhaul-center'],
      searchKeywords: ['reman', 'reconstruccion', 'overhaul', 'bombas'],
      iconName: 'RotateCcw',
      inHeaderNav: false,
      inMobileNav: false
    },
    tradeIn: {
      id: 'trade-in',
      name: 'Trade-In & Equipos Certificados',
      shortName: 'Usados',
      path: '#/trade-in',
      description: 'Recibimos tu equipo usado como parte de pago con inspección técnica',
      category: 'showroom' as RouteCategory,
      aliases: ['#/used', '#/usados', '#/tasacion'],
      searchKeywords: ['trade-in', 'usados', 'tasacion', 'intercambio'],
      iconName: 'RefreshCw',
      inHeaderNav: false,
      inMobileNav: false
    },
    tco: {
      id: 'tco',
      name: 'Calculadora de Costo TCO',
      shortName: 'Calculadora TCO',
      path: '#/tco',
      description: 'Simula consumo de combustible, mantenimiento preventivo y retorno',
      category: 'financial' as RouteCategory,
      aliases: ['#/tco-calculator', '#/calculadora', '#/costos-operativos'],
      searchKeywords: ['tco', 'calculadora', 'costos', 'combustible', 'galones'],
      iconName: 'Calculator',
      inHeaderNav: false,
      inMobileNav: false
    },
    financing: {
      id: 'financing',
      name: 'Financiamiento & Leasing RD',
      shortName: 'Financiamiento',
      path: '#/financing',
      description: 'Arrendamiento financiero con Banreservas, Popular y BHD',
      category: 'financial' as RouteCategory,
      aliases: ['#/leasing', '#/financiamiento', '#/credito'],
      searchKeywords: ['leasing', 'financiamiento', 'credito', 'bancos', 'banreservas'],
      iconName: 'Landmark',
      inHeaderNav: true,
      inMobileNav: false
    },
    pma: {
      id: 'pma',
      name: 'Contratos de Mantenimiento CVA/PMA',
      shortName: 'Contratos PMA',
      path: '#/pma',
      description: 'Acuerdos de valor del cliente con visitas programadas y fluidos',
      category: 'financial' as RouteCategory,
      aliases: ['#/pma-contracts', '#/cva', '#/mantenimiento-programado'],
      searchKeywords: ['pma', 'cva', 'contratos', 'mantenimiento preventivo'],
      iconName: 'ShieldCheck',
      inHeaderNav: false,
      inMobileNav: false
    },
    carbon: {
      id: 'carbon',
      name: 'Calculadora de Huella de Carbono',
      shortName: 'Eco Huella',
      path: '#/carbon',
      description: 'Auditoría de emisiones CO2 y compensación ambiental MIMARENA',
      category: 'corporate' as RouteCategory,
      aliases: ['#/carbon-footprint', '#/eco', '#/mimarena', '#/sostenibilidad'],
      searchKeywords: ['carbono', 'co2', 'emisiones', 'eco', 'mimarena'],
      iconName: 'Leaf',
      inHeaderNav: false,
      inMobileNav: false
    },
    warranty: {
      id: 'warranty',
      name: 'Garantía Oficial & Respaldo TMD',
      shortName: 'Garantía',
      path: '#/warranty',
      description: 'Cobertura de tren de fuerza, hidráulica y sistema eléctrico',
      category: 'corporate' as RouteCategory,
      aliases: ['#/garantias', '#/garantia', '#/cobertura'],
      searchKeywords: ['garantia', 'cobertura', 'respaldo', 'tren motriz'],
      iconName: 'Award',
      inHeaderNav: false,
      inMobileNav: false
    },
    projects: {
      id: 'projects',
      name: 'Casos de Éxito & Obras en RD',
      shortName: 'Proyectos',
      path: '#/projects',
      description: 'Nuestra maquinaria impulsando megaproyectos en todo el país',
      category: 'corporate' as RouteCategory,
      aliases: ['#/casos-exito', '#/obras', '#/magazine', '#/referencias'],
      searchKeywords: ['obras', 'proyectos', 'pedernales', 'metro', 'carreteras'],
      iconName: 'Building',
      inHeaderNav: false,
      inMobileNav: false
    },
    about: {
      id: 'about',
      name: 'Sobre Nosotros & Liderazgo',
      shortName: 'Empresa',
      path: '#/about',
      description: 'Historia, valores, equipo ejecutivo e infraestructura técnica',
      category: 'corporate' as RouteCategory,
      aliases: ['#/empresa', '#/nosotros', '#/staff', '#/equipo', '#/liderazgo'],
      searchKeywords: ['nosotros', 'empresa', 'historia', 'equipo', 'directores'],
      iconName: 'Users',
      inHeaderNav: false,
      inMobileNav: false
    },
    branches: {
      id: 'branches',
      name: 'Sucursales & Talleres Autorizados',
      shortName: 'Sucursales',
      path: '#/branches',
      description: 'Sede Central Km 22, Santiago, Punta Cana y Dajabón',
      category: 'corporate' as RouteCategory,
      aliases: ['#/sucursales', '#/contact', '#/contacto', '#/ubicaciones'],
      searchKeywords: ['sucursales', 'contacto', 'direccion', 'telefono', 'km 22'],
      iconName: 'MapPin',
      inHeaderNav: false,
      inMobileNav: false
    },
    help: {
      id: 'help',
      name: 'Centro de Ayuda & Preguntas Frecuentes',
      shortName: 'Ayuda',
      path: '#/help',
      description: 'Respuestas a consultas frecuentes, guías de compra y soporte',
      category: 'corporate' as RouteCategory,
      aliases: ['#/soporte', '#/faq', '#/preguntas-frecuentes'],
      searchKeywords: ['ayuda', 'soporte', 'faq', 'preguntas', 'manual'],
      iconName: 'HelpCircle',
      inHeaderNav: false,
      inMobileNav: false
    },
    bio: {
      id: 'bio',
      name: 'TMD Bio-Link & Redes Sociales',
      shortName: 'Bio Link',
      path: '#/bio',
      description: 'Acceso directo mobile-first para Instagram, TikTok, WhatsApp y cotizaciones',
      category: 'utility' as RouteCategory,
      aliases: ['#/links', '#/biolink', '#/redes'],
      searchKeywords: ['bio', 'links', 'enlaces', 'instagram', 'whatsapp', 'redes'],
      iconName: 'Share2',
      inHeaderNav: false,
      inMobileNav: false
    },
    portal: {
      id: 'portal',
      name: 'Portal Empresarial & Operativo TMD',
      shortName: 'Portal TMD',
      path: '#/portal',
      description: 'Telemetría, cotizaciones B01, órdenes de taller, inventario y centro de mando',
      category: 'utility' as RouteCategory,
      aliases: [
        '#/cliente', 
        '#/clientes', 
        '#/mi-cuenta', 
        '#/login', 
        '#/portal/login', 
        '#/portal/client', 
        '#/portal/dealer', 
        '#/portal/ops', 
        '#/portal/admin', 
        '#/portal/settings'
      ],
      requiredRole: 'client' as UserAccessRole,
      searchKeywords: ['portal', 'cliente', 'mis maquinas', 'facturas', 'ncf', 'staff', 'admin'],
      iconName: 'UserCheck',
      inHeaderNav: false,
      inMobileNav: true
    },
    checkout: {
      id: 'checkout',
      name: 'Generador de Proforma Formal',
      shortName: 'Cotización',
      path: '#/checkout',
      description: 'Emisión de proforma con RNC, NCF B01 y cotización bancaria',
      category: 'utility' as RouteCategory,
      aliases: ['#/proforma', '#/cotizacion', '#/carrito'],
      searchKeywords: ['checkout', 'proforma', 'cotizacion', 'ncf', 'rnc', 'itbis'],
      iconName: 'FileCheck',
      inHeaderNav: false,
      inMobileNav: false
    },
    commandCenter: {
      id: 'command-center',
      name: 'Centro de Mando Operativo Staff',
      shortName: 'Command Center',
      path: '#/command-center',
      description: 'Despacho de brigadas, asignación de bahías y control de inventario',
      category: 'admin' as RouteCategory,
      aliases: ['#/staff-ops', '#/office-workflow', '#/despacho'],
      requiredRole: 'staff' as UserAccessRole,
      searchKeywords: ['staff', 'operaciones', 'despacho', 'control interno'],
      iconName: 'Radio',
      inHeaderNav: false,
      inMobileNav: false
    },
    admin: {
      id: 'admin',
      name: 'Panel de Administración & Control HQ',
      shortName: 'Admin HQ',
      path: '#/admin',
      description: 'Control de precios, usuarios, auditoría y métricas del sistema',
      category: 'admin' as RouteCategory,
      aliases: ['#/admin-dashboard', '#/hq', '#/sistema'],
      requiredRole: 'admin' as UserAccessRole,
      searchKeywords: ['admin', 'administrador', 'hq', 'usuarios', 'auditoria'],
      iconName: 'ShieldAlert',
      inHeaderNav: false,
      inMobileNav: false
    }
  },

  /**
   * Get an array of all defined routes
   */
  getAllRoutes(): SiteNavigationItem[] {
    return Object.values(this.ROUTES);
  },

  /**
   * Find route by standard route ID
   */
  getById(id: string): SiteNavigationItem | undefined {
    return (this.ROUTES as Record<string, SiteNavigationItem>)[id];
  },

  /**
   * Find route by canonical path
   */
  getByPath(path: string): SiteNavigationItem | undefined {
    return Object.values(this.ROUTES).find((r) => r.path === path);
  },

  /**
   * Get all routes belonging to a category
   */
  getByCategory(category: RouteCategory): SiteNavigationItem[] {
    return Object.values(this.ROUTES).filter((r) => r.category === category);
  },

  /**
   * Resolve any raw route or alias to its canonical RouteDefinition
   */
  resolve(rawRoute: string): RouteDefinition {
    return resolveRoute(rawRoute);
  },

  /**
   * Header main navigation routes
   */
  getHeaderNavItems(): SiteNavigationItem[] {
    return Object.values(this.ROUTES).filter((r) => r.inHeaderNav);
  },

  /**
   * Mobile bottom navigation routes
   */
  getMobileNavItems(): SiteNavigationItem[] {
    return Object.values(this.ROUTES).filter((r) => r.inMobileNav);
  }
};
