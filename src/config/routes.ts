/**
 * TMD TECNOMAQUINARIAS DOMINICANA - CENTRALIZED ROUTE REGISTRY
 * 
 * Provides typed, single-source-of-truth route definitions, aliases,
 * category groupings, metadata, and breadcrumbs for scalable navigation.
 */

export type RouteCategory = 
  | 'showroom' 
  | 'technical' 
  | 'financial' 
  | 'operations' 
  | 'corporate' 
  | 'utility'
  | 'admin';

export type UserAccessRole = 'guest' | 'client' | 'staff' | 'admin';

export interface RouteBreadcrumb {
  label: string;
  path: string;
}

export interface RouteDefinition {
  id: string;
  canonicalPath: string;
  title: string;
  subtitle?: string;
  category: RouteCategory;
  aliases: string[];
  requiredRole?: UserAccessRole;
  isEligibleForComparison?: boolean;
  breadcrumbs: RouteBreadcrumb[];
  searchKeywords: string[];
}

export const ROUTE_REGISTRY: Record<string, RouteDefinition> = {
  HOME: {
    id: 'home',
    canonicalPath: '#/home',
    title: 'Showroom Principal',
    subtitle: 'Flota pesada, repuestos OEM y soporte técnico en RD',
    category: 'showroom',
    aliases: ['#/', '#/inicio', ''],
    isEligibleForComparison: true,
    breadcrumbs: [{ label: 'Inicio', path: '#/home' }],
    searchKeywords: ['inicio', 'home', 'showroom', 'portada', 'tmd', 'maquinaria', 'pesada', 'caterpillar', 'komatsu', 'sany']
  },
  MACHINERY: {
    id: 'machinery',
    canonicalPath: '#/machinery',
    title: 'Catálogo de Maquinaria Pesada',
    subtitle: 'Excavadoras, retroexcavadoras, rodillos, motoniveladoras y palas',
    category: 'showroom',
    aliases: ['#/equipos', '#/flota', '#/maquinarias', '#/catalogo-maquinaria'],
    isEligibleForComparison: true,
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Maquinaria', path: '#/machinery' }
    ],
    searchKeywords: ['maquinaria', 'excavadora', 'pala', 'motoniveladora', 'rodillo', 'retroexcavadora', 'bulldozer', 'flota', 'equipos', 'amarillo']
  },
  MACHINERY_HUB: {
    id: 'machinery-hub',
    canonicalPath: '#/machinery-hub',
    title: 'Centro de Maquinaria Pesada',
    subtitle: 'Explorar categorías, marcas y equipos disponibles en RD',
    category: 'showroom',
    aliases: ['#/equipos-hub', '#/maquinaria-hub'],
    isEligibleForComparison: true,
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Centro de Maquinaria', path: '#/machinery-hub' }
    ],
    searchKeywords: ['centro', 'hub', 'categorias', 'explorar', 'maquinaria', 'equipos', 'marcas']
  },
  PARTS: {
    id: 'parts',
    canonicalPath: '#/parts',
    title: 'Catálogo de Repuestos OEM',
    subtitle: 'Filtros, tren de rodaje, cilindros hidráulicos y kits de motor',
    category: 'showroom',
    aliases: ['#/repuestos', '#/piezas', '#/spare-parts', '#/partes'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Repuestos', path: '#/parts' }
    ],
    searchKeywords: ['repuestos', 'partes', 'piezas', 'filtros', 'orugas', 'hidráulica', 'inyectores', 'cummins', 'perkins', 'cat', 'tren de rodaje']
  },
  RENTAL: {
    id: 'rental',
    canonicalPath: '#/rental',
    title: 'Flota de Renta Industrial',
    subtitle: 'Alquiler por hora, día o mes con operador y telemetría LiveLink™',
    category: 'showroom',
    aliases: ['#/renta', '#/alquiler', '#/rent'],
    isEligibleForComparison: true,
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Renta de Equipos', path: '#/rental' }
    ],
    searchKeywords: ['renta', 'alquiler', 'leasing operativo', 'contratistas', 'alquiler maquinaria', 'obra']
  },
  PARTS_HUB: {
    id: 'parts-hub',
    canonicalPath: '#/parts-hub',
    title: 'Centro de Repuestos Genuinos & Filtros OEM',
    subtitle: 'Explorar categorías de repuestos, filtros y mantenimiento por marca',
    category: 'showroom',
    aliases: ['#/repuestos-hub', '#/piezas-hub'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Centro de Repuestos', path: '#/parts-hub' }
    ],
    searchKeywords: ['repuestos hub', 'filtros', 'piezas', 'oem', 'categorias repuestos']
  },
  RENTAL_HUB: {
    id: 'rental-hub',
    canonicalPath: '#/rental-hub',
    title: 'Centro de Renta de Maquinaria Pesada',
    subtitle: 'Tarifario, disponibilidad y modelos de alquiler en RD',
    category: 'showroom',
    aliases: ['#/renta-hub', '#/alquiler-hub'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Centro de Renta', path: '#/rental-hub' }
    ],
    searchKeywords: ['renta hub', 'alquiler equipos', 'tarifas renta', 'disponibilidad']
  },
  SERVICES_HUB: {
    id: 'services-hub',
    canonicalPath: '#/services-hub',
    title: 'Centro de Servicios Técnicos & Postventa',
    subtitle: 'Taller Km 22, SOS Móvil en obra, laboratorio diésel y telemetría',
    category: 'technical',
    aliases: ['#/servicios-hub', '#/taller-hub'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Centro de Servicios', path: '#/services-hub' }
    ],
    searchKeywords: ['servicios hub', 'taller central', 'sos movil', 'laboratorio', 'livelink']
  },
  BRANDS_DIRECTORY: {
    id: 'brands-directory',
    canonicalPath: '#/brands-directory',
    title: 'Directorio de Marcas Oficiales Homologadas',
    subtitle: 'JCB, LiuGong, Ammann, Kubota, Yanmar, LS Tractor y más',
    category: 'showroom',
    aliases: ['#/marcas', '#/directorio-marcas', '#/marcas-oficiales'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Directorio de Marcas', path: '#/brands-directory' }
    ],
    searchKeywords: ['marcas', 'directorio', 'jcb', 'liugong', 'ammann', 'kubota', 'yanmar']
  },
  SERVICE: {
    id: 'service',
    canonicalPath: '#/service',
    title: 'Taller Central Km 22 & Servicios',
    subtitle: 'Overhaul de motores, banco de prueba hidráulico y mantenimiento programado',
    category: 'technical',
    aliases: ['#/services', '#/taller', '#/servicios', '#/mantenimiento'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Taller & Servicios', path: '#/service' }
    ],
    searchKeywords: ['taller', 'mantenimiento', 'overhaul', 'hidráulica', 'banco de pruebas', 'servicios', 'km 22', 'mecanica']
  },
  EMERGENCY: {
    id: 'emergency',
    canonicalPath: '#/emergency',
    title: 'Despacho de Brigadas SOS 24/7',
    subtitle: 'Unidades móviles de rescate mecánico con llegada < 120 min',
    category: 'technical',
    aliases: ['#/emergency-dispatch', '#/sos', '#/rescue', '#/emergencias', '#/brigadas'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Servicios', path: '#/service' },
      { label: 'Despacho SOS 24/7', path: '#/emergency' }
    ],
    searchKeywords: ['emergencia', 'sos', 'rescate', 'brigada', 'averia', 'varado', 'urgente', '24/7', 'mecanico en obra']
  },
  OIL_LAB: {
    id: 'oil-lab',
    canonicalPath: '#/oil-lab',
    title: 'Laboratorio de Fluidos SOS-OIL™',
    subtitle: 'Espectrometría ASTM, conteo de partículas y análisis de desgaste',
    category: 'technical',
    aliases: ['#/laboratorio', '#/aceite', '#/analisis-aceite'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Laboratorio de Fluidos', path: '#/oil-lab' }
    ],
    searchKeywords: ['laboratorio', 'aceite', 'fluidos', 'astm', 'analisis', 'desgaste', 'viscosidad', 'espectrometria']
  },
  TECH_DOCS: {
    id: 'tech-docs',
    canonicalPath: '#/tech-docs',
    title: 'Biblioteca de Manuales & Planos',
    subtitle: 'Fichas técnicas oficiales, esquemas hidráulicos y pliegos de licitación',
    category: 'technical',
    aliases: ['#/manuals', '#/planos', '#/esquemas', '#/fichas-tecnicas', '#/licitaciones'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Manuales & Documentos', path: '#/tech-docs' }
    ],
    searchKeywords: ['manuales', 'fichas tecnicas', 'planos', 'esquemas', 'licitaciones', 'pliegos', 'compras dominicanas', 'dgcp']
  },
  ACADEMY: {
    id: 'academy',
    canonicalPath: '#/academy',
    title: 'Academia de Operadores TMD',
    subtitle: 'Certificación de operadores pesados y simuladores VR',
    category: 'technical',
    aliases: ['#/academia', '#/certificacion', '#/cursos'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Academia de Operadores', path: '#/academy' }
    ],
    searchKeywords: ['academia', 'operadores', 'certificacion', 'capacitacion', 'simulador', 'vr', 'seguridad industrial']
  },
  REMAN: {
    id: 'reman',
    canonicalPath: '#/reman',
    title: 'Centro de Reconstrucción REMAN',
    subtitle: 'Motores, transmisiones y bombas reconstruidas con 12 meses de garantía',
    category: 'technical',
    aliases: ['#/reconstruccion', '#/reman-center'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Centro REMAN', path: '#/reman' }
    ],
    searchKeywords: ['reman', 'reconstruccion', 'intercambio', 'motores reman', 'transmision reman', 'garantia']
  },
  TRADE_IN: {
    id: 'trade-in',
    canonicalPath: '#/trade-in',
    title: 'Trade-In & Equipos Seminuevos',
    subtitle: 'Tasación certificada de tu equipo usado para enganche de unidad nueva',
    category: 'showroom',
    aliases: ['#/used', '#/usados', '#/seminuevos', '#/tasacion'],
    isEligibleForComparison: true,
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Trade-In & Usados', path: '#/trade-in' }
    ],
    searchKeywords: ['usados', 'seminuevos', 'trade-in', 'tasacion', 'retoma', 'compra usada', 'inspeccion']
  },
  TCO: {
    id: 'tco',
    canonicalPath: '#/tco',
    title: 'Calculadora Costo Total TCO',
    subtitle: 'Proyección de combustible, neumáticos, depreciación y costo por hora',
    category: 'financial',
    aliases: ['#/tco-calculator', '#/costo-hora', '#/calculadora-tco'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Calculadora TCO', path: '#/tco' }
    ],
    searchKeywords: ['tco', 'costo total', 'costo por hora', 'calculadora', 'combustible', 'depreciacion', 'rentabilidad']
  },
  FINANCING: {
    id: 'financing',
    canonicalPath: '#/financing',
    title: 'Financiamiento & Leasing RD',
    subtitle: 'Planes a 60 meses con Banreservas, Banco Popular, BHD y Banco Santa Cruz',
    category: 'financial',
    aliases: ['#/leasing', '#/financiamiento', '#/credito', '#/bancos'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Financiamiento & Leasing', path: '#/financing' }
    ],
    searchKeywords: ['financiamiento', 'leasing', 'credito', 'prestamo', 'bancos', 'popular', 'banreservas', 'bhd', 'cuotas']
  },
  PMA_CONTRACTS: {
    id: 'pma-contracts',
    canonicalPath: '#/pma-contracts',
    title: 'Contratos de Mantenimiento PMA / CVA',
    subtitle: 'Cobertura integral de fluidos, filtros y mano de obra a costo fijo',
    category: 'financial',
    aliases: ['#/pma', '#/cva', '#/contratos-mantenimiento'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Contratos PMA / CVA', path: '#/pma-contracts' }
    ],
    searchKeywords: ['pma', 'cva', 'contrato mantenimiento', 'mantenimiento preventivo', 'costo fijo', 'garantia extendida']
  },
  CARBON_FOOTPRINT: {
    id: 'carbon-footprint',
    canonicalPath: '#/carbon-footprint',
    title: 'Calculadora de Huella de Carbono',
    subtitle: 'Cumplimiento ambiental MIMARENA, emisiones Tier 4F / Stage V',
    category: 'financial',
    aliases: ['#/eco', '#/mimarena', '#/huella-carbono'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Huella de Carbono', path: '#/carbon-footprint' }
    ],
    searchKeywords: ['carbono', 'emisiones', 'mimarena', 'ambiental', 'stage v', 'tier 4', 'eco', 'sostenibilidad']
  },
  LIVELINK: {
    id: 'livelink',
    canonicalPath: '#/livelink',
    title: 'Telemetría Satelital LiveLink™',
    subtitle: 'Monitoreo GPS en tiempo real, horómetro, consumo de diésel y geocercas',
    category: 'operations',
    aliases: ['#/telematics', '#/telemetria', '#/gps'],
    breadcrumbs: [
      { label: 'Portal', path: '#/portal' },
      { label: 'LiveLink™ GPS', path: '#/livelink' }
    ],
    searchKeywords: ['livelink', 'gps', 'telemetria', 'satelital', 'horometro', 'combustible', 'geocerca', 'flota']
  },
  FULLBAY: {
    id: 'fullbay',
    canonicalPath: '#/fullbay',
    title: 'Gestor de Taller Fullbay HD',
    subtitle: 'Órdenes de trabajo, asignación de bahías y control de mecánicos',
    category: 'operations',
    aliases: ['#/ordenes-taller', '#/taller-hd'],
    breadcrumbs: [
      { label: 'Portal', path: '#/portal' },
      { label: 'Taller Fullbay HD', path: '#/fullbay' }
    ],
    searchKeywords: ['fullbay', 'orden de trabajo', 'bahias', 'mecanicos', 'taller pesado', 'reparaciones']
  },
  PORTAL: {
    id: 'portal',
    canonicalPath: '#/portal',
    title: 'Portal Empresarial & Operativo TMD',
    subtitle: 'Acceso a facturas fiscales NCF B01, garantías, telemetría y centro de mando',
    category: 'operations',
    aliases: [
      '#/clientes', 
      '#/mi-cuenta', 
      '#/login', 
      '#/command-center', 
      '#/staff-ops', 
      '#/office-workflow',
      '#/portal/login',
      '#/portal/client',
      '#/portal/dealer',
      '#/portal/ops',
      '#/portal/admin',
      '#/portal/settings'
    ],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Portal TMD', path: '#/portal' }
    ],
    searchKeywords: ['portal', 'clientes', 'login', 'facturas', 'ncf', 'dgii', 'mi cuenta', 'historial', 'staff', 'admin']
  },
  CHECKOUT: {
    id: 'checkout',
    canonicalPath: '#/checkout',
    title: 'Proforma & Cotización Fiscal',
    subtitle: 'Generación de proforma NCF B01 y confirmación de orden',
    category: 'utility',
    aliases: ['#/cotizar', '#/carrito', '#/cart', '#/proforma'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Cotización & Carrito', path: '#/checkout' }
    ],
    searchKeywords: ['checkout', 'cotizar', 'carrito', 'orden', 'proforma', 'ncf', 'comprar', 'itbis']
  },
  ADMIN_DASHBOARD: {
    id: 'admin-dashboard',
    canonicalPath: '#/admin-dashboard',
    title: 'Admin HQ & Gestión Operativa',
    subtitle: 'Control de inventario Firestore, cotizaciones DGII y usuarios',
    category: 'admin',
    aliases: ['#/admin', '#/hq', '#/dashboard-admin'],
    requiredRole: 'admin',
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Admin HQ', path: '#/admin-dashboard' }
    ],
    searchKeywords: ['admin', 'hq', 'gestion', 'inventario', 'usuarios', 'panel', 'firestore']
  },
  ABOUT: {
    id: 'about',
    canonicalPath: '#/about',
    title: 'Nosotros & Liderazgo TMD',
    subtitle: 'Historia, certificaciones de calidad y equipo directivo en RD',
    category: 'corporate',
    aliases: ['#/empresa', '#/nosotros', '#/staff', '#/equipo', '#/team', '#/liderazgo'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Sobre TMD', path: '#/about' }
    ],
    searchKeywords: ['nosotros', 'empresa', 'historia', 'equipo', 'liderazgo', 'directores', 'quienes somos', 'tmd']
  },
  LOCATIONS: {
    id: 'branches',
    canonicalPath: '#/branches',
    title: 'Sedes & Patios en RD',
    subtitle: 'Sede Central Km 22 Autopista Duarte, Santiago, Bávaro y Azua',
    category: 'corporate',
    aliases: ['#/sucursales', '#/contact', '#/contacto', '#/sedes', '#/ubicaciones'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Sedes & Contacto', path: '#/branches' }
    ],
    searchKeywords: ['sedes', 'sucursales', 'km 22', 'santiago', 'bavaro', 'azua', 'contacto', 'direccion', 'telefono', 'mapa']
  },
  WARRANTY: {
    id: 'warranty',
    canonicalPath: '#/warranty',
    title: 'Garantía Oficial TMD Gold',
    subtitle: '24 meses o 4,000 horas de cobertura oficial de fábrica',
    category: 'corporate',
    aliases: ['#/garantias', '#/garantia', '#/cobertura'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Garantía Oficial', path: '#/warranty' }
    ],
    searchKeywords: ['garantia', 'cobertura', 'fabrica', 'garantia gold', 'horas de uso', 'respaldo']
  },
  PROJECTS: {
    id: 'projects',
    canonicalPath: '#/projects',
    title: 'Obras & Casos de Éxito',
    subtitle: 'Proyectos mineros, viales e inmobiliarios desarrollados con flota TMD',
    category: 'corporate',
    aliases: ['#/casos-exito', '#/obras', '#/magazine', '#/proyectos'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Proyectos & Obras', path: '#/projects' }
    ],
    searchKeywords: ['proyectos', 'obras', 'casos de exito', 'mineria', 'carreteras', 'construccion rd', 'testimonios']
  },
  HELP: {
    id: 'help',
    canonicalPath: '#/help',
    title: 'Centro de Ayuda & FAQ',
    subtitle: 'Preguntas frecuentes sobre importación, NCF, ITBIS y entregas',
    category: 'corporate',
    aliases: ['#/soporte', '#/faq', '#/ayuda'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Centro de Ayuda', path: '#/help' }
    ],
    searchKeywords: ['ayuda', 'faq', 'preguntas frecuentes', 'soporte', 'ncf', 'itbis', 'aduana', 'entrega']
  },
  BIO: {
    id: 'bio',
    canonicalPath: '#/bio',
    title: 'TMD Bio-Link & Enlaces Rápidos',
    subtitle: 'Acceso directo para redes sociales y WhatsApp comercial',
    category: 'utility',
    aliases: ['#/links', '#/biolink', '#/redes'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Bio-Link', path: '#/bio' }
    ],
    searchKeywords: ['bio', 'links', 'enlaces', 'instagram', 'whatsapp', 'redes sociales']
  },
  OFFLINE_VAULT: {
    id: 'offline-vault',
    canonicalPath: '#/offline-vault',
    title: 'Bóveda PWA Fuera de Línea',
    subtitle: 'Catálogos, manuales técnicos y fichas cacheadas en memoria local',
    category: 'utility',
    aliases: ['#/offline-docs', '#/boveda', '#/sin-conexion'],
    breadcrumbs: [
      { label: 'Inicio', path: '#/home' },
      { label: 'Bóveda Offline PWA', path: '#/offline-vault' }
    ],
    searchKeywords: ['boveda', 'offline', 'sin conexion', 'pwa', 'cache', 'indexeddb', 'descargas']
  }
};

/**
 * Resolves any raw hash or alias path to its canonical RouteDefinition.
 */
export function resolveRoute(rawHash: string): RouteDefinition {
  if (!rawHash) return ROUTE_REGISTRY.HOME;
  
  // Extract path without query parameters or anchors
  const cleanPath = rawHash.split('?')[0].split('&')[0].trim().toLowerCase();

  // 1. Direct match with canonical path
  for (const key of Object.keys(ROUTE_REGISTRY)) {
    const route = ROUTE_REGISTRY[key];
    if (route.canonicalPath.toLowerCase() === cleanPath) {
      return route;
    }
  }

  // 2. Match with aliases
  for (const key of Object.keys(ROUTE_REGISTRY)) {
    const route = ROUTE_REGISTRY[key];
    if (route.aliases.some(alias => alias.toLowerCase() === cleanPath)) {
      return route;
    }
  }

  // 3. Dynamic sub-routes (e.g. #/machinery/cat-320d -> #/machinery)
  if (cleanPath.startsWith('#/machinery/') || cleanPath.startsWith('#/equipos/')) {
    return ROUTE_REGISTRY.MACHINERY;
  }
  if (cleanPath.startsWith('#/parts/') || cleanPath.startsWith('#/repuestos/')) {
    return ROUTE_REGISTRY.PARTS;
  }
  if (cleanPath.startsWith('#/portal') || cleanPath === '#/portal') {
    return ROUTE_REGISTRY.PORTAL;
  }

  // Default fallback
  return ROUTE_REGISTRY.HOME;
}

/**
 * Returns dynamic breadcrumbs for any route.
 */
export function getRouteBreadcrumbs(rawHash: string): RouteBreadcrumb[] {
  const route = resolveRoute(rawHash);
  return route.breadcrumbs;
}
