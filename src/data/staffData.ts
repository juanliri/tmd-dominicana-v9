export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: 'Dirección Ejecutiva' | 'Operaciones & Maquinaria' | 'Ventas & Comercial' | 'Servicio Técnico & Talleres' | 'Repuestos & Logística' | 'Tecnología & IoT';
  photoUrl: string;
  imageFileName: string;
  email: string;
  phone: string;
  location: string;
  experienceYears: number;
  certifications: string[];
  bio: string;
  keySpecialties: string[];
  isLeadership?: boolean;
}

export const STAFF_PROFILES_DATA: StaffMember[] = [
  {
    id: 'staff-01',
    name: 'Eduardo López',
    role: 'Presidente Ejecutivo & Fundador (CEO)',
    department: 'Dirección Ejecutiva',
    photoUrl: '/assets/team_hd/eduardo_lopez_hd.jpg',
    imageFileName: 'eduardo_lopez_hd.jpg',
    email: 'elopez@tmd.rd',
    phone: '(809) 826-2222 Ext. 101',
    location: 'Sede Central Km 22, Autopista Duarte',
    experienceYears: 24,
    certifications: ['Alta Dirección Empresarial', 'JCB Global Executive Board', 'Liderazgo Industrial'],
    bio: 'Liderazgo visionario con más de 24 años al frente de Tecnomaquinarias Diesel S.R.L., consolidando a la empresa como el principal referente de maquinaria pesada, respaldo técnico y distribución oficial en República Dominicana.',
    keySpecialties: ['Estrategia Corporativa', 'Alianzas Internacionales', 'Desarrollo de Infraestructura'],
    isLeadership: true
  },
  {
    id: 'staff-02',
    name: 'Jorge Torres',
    role: 'Vicepresidente Comercial & Alianzas Estratégicas (CCO)',
    department: 'Ventas & Comercial',
    photoUrl: '/assets/team_hd/jorge_torres_hd.jpg',
    imageFileName: 'jorge_torres_hd.jpg',
    email: 'jtorres@tmd.rd',
    phone: '(809) 826-2222 Ext. 102',
    location: 'Sede Central Km 22, Autopista Duarte',
    experienceYears: 20,
    certifications: ['Gestión Comercial Internacional', 'Consultoría de Flotas Pesadas'],
    bio: 'Estratega comercial con amplia trayectoria liderando negociaciones de gran escala con consorcios viales, desarrolladores turísticos y alianzas público-privadas en todo el territorio nacional.',
    keySpecialties: ['Grandes Cuentas', 'Estructuración de Flotas', 'Leasing Maquinaria'],
    isLeadership: true
  },
  {
    id: 'staff-03',
    name: 'Blasina Fabián',
    role: 'Directora de Finanzas, Administración & Cumplimiento (CFO)',
    department: 'Dirección Ejecutiva',
    photoUrl: '/assets/team_hd/blasina_fabian_hd.jpg',
    imageFileName: 'blasina_fabian_hd.jpg',
    email: 'bfabian@tmd.rd',
    phone: '(809) 826-2222 Ext. 103',
    location: 'Sede Central Km 22, Autopista Duarte',
    experienceYears: 22,
    certifications: ['Dirección Financiera Corporativa', 'Auditoría Fiscal & DGII', 'Compliance Empresarial'],
    bio: 'Supervisa la solidez financiera, estructuración de garantías bancarias y líneas de crédito de leasing para clientes de construcción, minería y agroindustria.',
    keySpecialties: ['Finanzas Corporativas', 'Créditos de Maquinaria', 'Control de Gestión'],
    isLeadership: true
  },
  {
    id: 'staff-04',
    name: 'Brito Fuentes',
    role: 'Director de Operaciones & Maquinaria Pesada (COO)',
    department: 'Operaciones & Maquinaria',
    photoUrl: '/assets/team_hd/brito_fuentes_hd.jpg',
    imageFileName: 'brito_fuentes_hd.jpg',
    email: 'bfuentes@tmd.rd',
    phone: '(809) 826-2222 Ext. 104',
    location: 'Sede Central Km 22 & Patios Regionales',
    experienceYears: 21,
    certifications: ['Logística de Importación Pesada', 'Seguridad Ocupacional Minera', 'Supply Chain Management'],
    bio: 'Responsable de la cadena logística de recepción marítima, nacionalización en aduanas, alistamiento pre-entrega (PDI) y despacho terrestre de equipos en obra.',
    keySpecialties: ['Operaciones de Patio', 'Alistamiento PDI', 'Despliegue Nacional'],
    isLeadership: true
  },
  {
    id: 'staff-05',
    name: 'Leonardo Encarnación',
    role: 'Director de Posventa & Reconstrucción Mayor de Componentes',
    department: 'Servicio Técnico & Talleres',
    photoUrl: '/assets/team_hd/leonardo_encarnacion_hd.jpg',
    imageFileName: 'leonardo_encarnacion_hd.jpg',
    email: 'lencarnacion@tmd.rd',
    phone: '(809) 826-2222 Ext. 201',
    location: 'Talleres Centrales Km 22',
    experienceYears: 23,
    certifications: ['Master JCB UK Service Specialist', 'Cummins Heavy Duty Master', 'Bancos de Prueba Hidráulicos ZF'],
    bio: 'Líder técnico con certificación internacional de fábrica. Supervisa el centro de reconstrucción mayor de motores diésel, transmisiones y bombas hidráulicas con garantía de 0 horas.',
    keySpecialties: ['Reconstrucción Diésel', 'Hidráulica de Alta Presión', 'Control de Calidad'],
    isLeadership: true
  },
  {
    id: 'staff-06',
    name: 'Julio Aguasvivas',
    role: 'Gerente Nacional de Servicio Técnico & Despacho SOS',
    department: 'Servicio Técnico & Talleres',
    photoUrl: '/assets/team_hd/julio_aguasvivas_hd.jpg',
    imageFileName: 'julio_aguasvivas_hd.jpg',
    email: 'jaguasvivas@tmd.rd',
    phone: '(809) 826-2222 Ext. 202',
    location: 'Centro de Despacho SOS & Rutas Nacionales',
    experienceYears: 16,
    certifications: ['Coordinación de Emergencias Técnicas', 'Diagnóstico Electrónico de Campo', 'JCB LiveLink Telematics'],
    bio: 'Coordina la flota de talleres móviles y unidades de rescate técnico 24/7 en las tres regiones del país, asegurando tiempos de respuesta mínimos ante paradas imprevistas.',
    keySpecialties: ['Atención In Situ', 'Rutas de Emergencia', 'Diagnóstico Computarizado'],
    isLeadership: false
  },
  {
    id: 'staff-07',
    name: 'Miguel Ángel Cruz',
    role: 'Director Senior de Cuentas Clave & Sector Minero-Vial',
    department: 'Ventas & Comercial',
    photoUrl: '/assets/team_hd/miguel_angel_cruz_hd.jpg',
    imageFileName: 'miguel_angel_cruz_hd.jpg',
    email: 'mcruz@tmd.rd',
    phone: '(809) 826-2222 Ext. 105',
    location: 'Santo Domingo & Zona Norte',
    experienceYears: 18,
    certifications: ['Ingeniería de Minas & Maquinaria', 'Dimensionamiento de Rendimiento'],
    bio: 'Especialista en dimensionamiento de flota pesada para canteras, proyectos viales de alta exigencia y aplicaciones de movimiento masivo de tierras con equipos LiuGong y JCB.',
    keySpecialties: ['Minería & Canteras', 'Movimiento de Tierras', 'Estudios de Rendimiento'],
    isLeadership: false
  },
  {
    id: 'staff-08',
    name: 'Perkin Soriano',
    role: 'Gerente de Ventas de Maquinaria Nueva & División JCB',
    department: 'Ventas & Comercial',
    photoUrl: '/assets/team_hd/perkin_soriano_hd.jpg',
    imageFileName: 'perkin_soriano_hd.jpg',
    email: 'psoriano@tmd.rd',
    phone: '(809) 826-2222 Ext. 106',
    location: 'Showroom Km 22 & Sucursal Bávaro',
    experienceYears: 14,
    certifications: ['JCB Sales Master Certified', 'Asesoría Técnica de Equipos Compactos y de Carga'],
    bio: 'Asesor comercial senior especializado en retroexcavadoras 3CX, excavadoras de orugas y manipuladores telescópicos Loadall para el sector construcción y hotelero.',
    keySpecialties: ['Línea JCB Premier', 'Demostraciones en Vivo', 'Configuración de Accesorios'],
    isLeadership: false
  },
  {
    id: 'staff-09',
    name: 'Carmen Jáquez',
    role: 'Gerente de Repuestos Genuinos & Cadena de Suministro OEM',
    department: 'Repuestos & Logística',
    photoUrl: '/assets/team_hd/carmen_jaquez_hd.jpg',
    imageFileName: 'carmen_jaquez_hd.jpg',
    email: 'cjaquez@tmd.rd',
    phone: '(809) 826-2222 Ext. 301',
    location: 'Almacén Central Robotizado Km 22',
    experienceYears: 15,
    certifications: ['Gestión de Inventarios Industriales', 'Donaldson Filtration Certified', 'Fleetguard Master'],
    bio: 'Supervisa el stock permanente de más de 12,000 líneas de repuestos genuinos, kits de filtros y componentes de desgaste para despacho express a todo el país.',
    keySpecialties: ['Filtración Donaldson/Fleetguard', 'Despacho Express Nacional', 'Kits Preventivos'],
    isLeadership: false
  },
  {
    id: 'staff-10',
    name: 'Eduardo E. López',
    role: 'Director de Innovación Tecnológica & Ecosistemas Digitales (CIO)',
    department: 'Tecnología & IoT',
    photoUrl: '/assets/team_hd/eduardo_e_lopez_hd.jpg',
    imageFileName: 'eduardo_e_lopez_hd.jpg',
    email: 'eelopez@tmd.rd',
    phone: '(809) 826-2222 Ext. 401',
    location: 'Sede Central Km 22 & Lab Digital',
    experienceYears: 12,
    certifications: ['Cloud Architecture & IoT', 'Telemetría Satelital LiveLink™', 'Sistemas PWA & Fullbay Integration'],
    bio: 'Lidera la transformación digital de TMD Dominicana, integrando telemetría en vivo, gemelos digitales de maquinaria y el portal de autogestión de clientes.',
    keySpecialties: ['Telemetría Satelital', 'Plataforma Digital PWA', 'Mantenimiento Predictivo'],
    isLeadership: true
  },
  {
    id: 'staff-11',
    name: 'Elvys Alcántara',
    role: 'Director de Infraestructura IT & Redes Telemáticas LiveLink™',
    department: 'Tecnología & IoT',
    photoUrl: '/assets/team_hd/elvys_alcantara_hd.jpg',
    imageFileName: 'elvys_alcantara_hd.jpg',
    email: 'ealcantara@tmd.rd',
    phone: '(809) 826-2222 Ext. 402',
    location: 'Centro de Monitoreo Satelital Km 22',
    experienceYears: 17,
    certifications: ['Cisco CCNA/CCNP', 'Sistemas CAN-Bus & GPS Industrial', 'Ciberseguridad Operativa'],
    bio: 'Responsable de la infraestructura de servidores, enlaces satelitales con las flotas en campo y monitoreo continuo de alertas críticas de temperatura y presión.',
    keySpecialties: ['Enlaces Satelitales', 'Sensores IoT CAN-Bus', 'Soporte de Red'],
    isLeadership: false
  },
  {
    id: 'staff-12',
    name: 'Edwin Martínez',
    role: 'Gerente de Automatización, Mecatrónica & Diagnóstico Hidráulico',
    department: 'Servicio Técnico & Talleres',
    photoUrl: '/assets/team_hd/edwin_martinez_hd.jpg',
    imageFileName: 'edwin_martinez_hd.jpg',
    email: 'emartinez@tmd.rd',
    phone: '(809) 826-2222 Ext. 203',
    location: 'Laboratorio de Diagnóstico Km 22',
    experienceYears: 13,
    certifications: ['Ingeniería Mecatrónica', 'Calibración Electrohidráulica', 'JCB ServiceMaster Diagnostic'],
    bio: 'Especialista en resolución de fallas complejas, reprogramación de módulos ECU y calibración fina de sistemas de flujo variable en excavadoras y palas cargadoras.',
    keySpecialties: ['Mecatrónica Pesada', 'Escaneo ServiceMaster', 'Calibración Hidráulica'],
    isLeadership: false
  }
];
