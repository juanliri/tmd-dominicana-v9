import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  Award, 
  MapPin, 
  ShieldCheck, 
  Target, 
  Users, 
  CheckCircle2, 
  Phone, 
  Mail, 
  ExternalLink,
  Clock,
  Sparkles,
  Truck,
  Wrench,
  Download,
  Calendar,
  Layers,
  Search,
  X,
  ChevronRight,
  ChevronUp,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Filter,
  Globe2,
  Network,
  LayoutGrid,
  TrendingUp,
  Cpu,
  Compass,
  ArrowRight,
  HardHat,
  Cog,
  Check
} from 'lucide-react';
import { STAFF_PROFILES_DATA, StaffMember } from '../data/staffData';
import { OFFICIAL_BRANDS, SHOWROOM_MARKETING_ASSETS } from '../data/brandsData';
import { TMDLogo, BrandLogo } from './common/BrandLogos';
import { StaffOrganigramaView } from './team/StaffOrganigramaView';
import { PatioKm22DroneVideoShowcase } from './media/PatioKm22DroneVideoShowcase';
import { TestDriveBookingModal } from './media/TestDriveBookingModal';

interface AboutViewProps {
  onNavigate?: (route: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  // Staff Directory Filtering State
  const [viewMode, setViewMode] = useState<'organigrama' | 'grid'>('organigrama');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState<boolean>(false);
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>('all');

  // Floating Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const departments = [
    'Todos',
    'Dirección Ejecutiva',
    'Ventas & Comercial',
    'Servicio Técnico & Talleres',
    'Repuestos & Logística',
    'Tecnología & IoT'
  ];

  const filteredStaff = useMemo(() => {
    return STAFF_PROFILES_DATA.filter(person => {
      const matchesDept = selectedDepartment === 'Todos' || person.department === selectedDepartment;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        person.name.toLowerCase().includes(q) ||
        person.role.toLowerCase().includes(q) ||
        person.department.toLowerCase().includes(q) ||
        person.keySpecialties.some(s => s.toLowerCase().includes(q)) ||
        person.certifications.some(c => c.toLowerCase().includes(q));

      return matchesDept && matchesSearch;
    });
  }, [selectedDepartment, searchQuery]);

  const pillars = [
    {
      id: 'p1',
      title: 'Excelentes Resultados',
      subtitle: 'Productividad & Menor Costo Operativo',
      desc: 'Maquinaria de vanguardia configurada para maximizar la producción por hora en las condiciones climáticas y geológicas más exigentes de República Dominicana.',
      icon: TrendingUp
    },
    {
      id: 'p2',
      title: 'Calidad de Procesos',
      subtitle: 'Normas ISO & Bancos de Prueba',
      desc: 'Bahías de reconstrucción certificadas, bancos de prueba computarizados y registro histórico digital de mantenimiento de cada equipo con telemetría CAN Bus.',
      icon: ShieldCheck
    },
    {
      id: 'p3',
      title: 'Precios Competitivos',
      subtitle: 'Repuestos OEM Directos & Leasing',
      desc: 'Relación costo-beneficio inmejorable en maquinaria pesada nueva, repuestos genuinos importados de fábrica y alianzas de financiamiento con la banca nacional.',
      icon: Award
    },
    {
      id: 'p4',
      title: 'Conveniencia & Urgencia',
      subtitle: 'Soporte 24/7 en Canteras & Minas',
      desc: 'Entendemos que una máquina detenida detiene la obra. Flota de servicio móvil en campo y almacén central en Km 22 con despacho en menos de 24 horas.',
      icon: Clock
    }
  ];

  const milestones = [
    {
      year: '2002',
      title: 'Fundación en Santo Domingo',
      desc: 'Nace Tecnomaquinarias Diesel S.R.L. brindando reconstrucción especializada diésel e hidráulica para contratistas e ingenieros civiles.'
    },
    {
      year: '2008',
      title: 'Distribución Oficial JCB (UK)',
      desc: 'Acuerdo de exclusividad de retroexcavadoras 3CX/4CX, excavadoras JS220 y manipuladores Loadall con soporte directo de Inglaterra.'
    },
    {
      year: '2014',
      title: 'Inauguración Mega Sede Km 22',
      desc: 'Apertura de más de 15,000 m² de showroom, patio de pruebas y almacén central en Autopista Duarte con conexión a todas las regiones.'
    },
    {
      year: '2018',
      title: 'Alianza LiuGong & Telemetría IoT',
      desc: 'Incorporación de palas cargadoras 856H y excavadoras pesadas para minería con monitoreo satelital LiveLink™ 24/7.'
    },
    {
      year: '2022',
      title: 'Expansión Hub Cibao & Bávaro-Punta Cana',
      desc: 'Nuevos centros de servicio en Santiago de los Caballeros y Bávaro con talleres móviles para proyectos turísticos e infraestructuras.'
    },
    {
      year: '2026',
      title: 'Ecosistema Digital Twin & Fullbay Lab',
      desc: 'Plataforma PWA conectada a CAN Bus, laboratorio móvil de análisis de fluidos y sistema predictivo de órdenes de servicio en bahías.'
    }
  ];

  const filteredBrands = useMemo(() => {
    if (activeBrandFilter === 'all') return OFFICIAL_BRANDS;
    return OFFICIAL_BRANDS.filter(b => b.category.toLowerCase().includes(activeBrandFilter.toLowerCase()));
  }, [activeBrandFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 font-display">
      {/* 1. UNIFIED EXECUTIVE HERO & IDENTITY BENTO (Compact & Unified) */}
      <section className="space-y-4">
        {/* Main Bento Header Card */}
        <div className="rounded-[5px] bg-zinc-950 text-white border border-zinc-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Executive Identity (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-[3px] bg-zinc-900 border border-zinc-800 text-amber-400 type-badge flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  TRAYECTORIA SÓLIDA EN RD • 2002-2026
                </span>
                <span className="px-2.5 py-0.5 rounded-[3px] bg-zinc-900 text-zinc-300 type-badge border border-zinc-800">
                  SOCIO ESTRATÉGICO OFICIAL
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl type-section-title text-white">
                TECNOMAQUINARIAS DIESEL <span className="text-amber-400">S.R.L.</span>
              </h1>

              <p className="text-xs sm:text-sm type-body text-zinc-300 max-w-2xl font-sans">
                Socio estratégico de las principales empresas constructoras, mineras y agroindustriales de la República Dominicana. Más de 24 años entregando maquinaria pesada de clase mundial, 35,000+ repuestos OEM garantizados y asistencia técnica especializada en campo.
              </p>

              {/* Dynamic Brand Photos Mini-Bar */}
              <div className="flex items-center gap-2 pt-1 flex-wrap font-mono">
                <div className="flex -space-x-2 overflow-hidden items-center py-1">
                  {OFFICIAL_BRANDS.slice(0, 5).map((b) => (
                    b.technicalIcon ? (
                      <img
                        key={b.id}
                        src={b.technicalIcon}
                        alt={b.name}
                        referrerPolicy="no-referrer"
                        className="inline-block h-8 w-8 rounded-[3px] ring-2 ring-zinc-900 object-cover bg-zinc-800"
                      />
                    ) : null
                  ))}
                </div>
                <span className="text-[11px] text-zinc-400 font-bold uppercase">
                  DISTRIBUIDORES: JCB • LIUGONG • AMMANN • LS TRACTOR • DONALDSON
                </span>
              </div>

              {/* Core Philosophy Callout */}
              <div className="p-3.5 sm:p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  FILOSOFÍA INSTITUCIONAL TMD:
                </span>
                <p className="text-xs sm:text-sm font-bold text-white italic leading-snug">
                  &ldquo;Cada máquina entregada a nuestros clientes es considerada un <span className="text-amber-400 underline decoration-amber-400/50">ACTIVO de TMD</span> y cuenta con el respaldo total de nuestro equipo técnico durante toda su vida útil.&rdquo;
                </p>
              </div>
            </div>

            {/* Right: Key Operational Metrics Grid (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 font-mono">
              <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-center space-y-0.5 shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-amber-400">15,000+ M²</span>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">PATIO CENTRAL KM 22</span>
                <span className="text-[9px] text-zinc-500 block uppercase">PISTAS Y SHOWROOM</span>
              </div>

              <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-center space-y-0.5 shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-amber-400">12 BAHÍAS</span>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">TALLER CENTRAL</span>
                <span className="text-[9px] text-zinc-500 block uppercase">GRÚAS Y BANCOS HD</span>
              </div>

              <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-center space-y-0.5 shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-amber-400">35,000+</span>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">REPUESTOS OEM</span>
                <span className="text-[9px] text-zinc-500 block uppercase">STOCK INMEDIATO</span>
              </div>

              <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-center space-y-0.5 shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-emerald-400">24/7 SOS</span>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">SERVICIO MÓVIL</span>
                <span className="text-[9px] text-zinc-500 block uppercase">RESCATE EN OBRA</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Strategic Pillars in a Unified 4-Col Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-[3px] bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-black text-zinc-500">0{idx + 1}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white mb-0.5 uppercase tracking-wider">
                    {p.title}
                  </h3>
                  <span className="text-[10px] text-amber-400 font-mono font-bold block mb-1.5 uppercase">
                    {p.subtitle}
                  </span>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. STRATEGIC SEDE KM 22 & COMPACT VIDEO SHOWCASE */}
      <section className="space-y-3.5">
        <div className="p-4 sm:p-6 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-amber-400 uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>SEDE CENTRAL &amp; PISTA DE PRUEBAS • 15,000+ M²</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
              AUTOPISTA DUARTE KM 22, PEDRO BRAND, SANTO DOMINGO
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mt-0.5 font-sans">
              Showroom de maquinaria pesada, almacén central de repuestos y taller mayor de componentes diésel con pista de pruebas propia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 font-display">
            <button
              type="button"
              onClick={() => setIsTestDriveModalOpen(true)}
              className="px-3.5 py-2 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>AGENDAR DEMO</span>
            </button>
            <a
              href="https://maps.google.com/?q=Autopista+Duarte+Km+22+Santo+Domingo+Tecnomaquinarias+Diesel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 text-zinc-300 hover:text-white font-black uppercase tracking-wider rounded-[3px] border border-zinc-800 text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>GOOGLE MAPS</span>
            </a>
          </div>
        </div>

        {/* Compact Video Component */}
        <PatioKm22DroneVideoShowcase 
          onScheduleTestDrive={() => setIsTestDriveModalOpen(true)}
          onNavigate={onNavigate}
          compact
        />
      </section>

      {/* 3. DYNAMIC OFFICIAL BRAND PAVILION WITH REAL MARKETING PHOTOS & TECH ASSETS */}
      <section id="official-brands" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
              <Globe2 className="w-3 h-3" />
              <span>DISTRIBUCIÓN OFICIAL &amp; RESPALDO DIRECTO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
              MARCAS GLOBALES REPRESENTADAS EN REPÚBLICA DOMINICANA
            </h2>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 font-display">
            {[
              { id: 'all', label: 'TODAS' },
              { id: 'construcción', label: 'CONSTRUCCIÓN' },
              { id: 'minería', label: 'MINERÍA' },
              { id: 'vial', label: 'VIAL' },
              { id: 'agro', label: 'AGRÍCOLA' },
              { id: 'seguridad', label: 'PROTECCIÓN' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveBrandFilter(cat.id)}
                className={`px-2.5 py-1 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  activeBrandFilter === cat.id
                    ? 'bg-zinc-800 text-amber-400 border-zinc-700 shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Cards Grid with Real Banner Photos & 3D Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo Banner Header */}
                <div className="relative h-36 w-full bg-zinc-950 overflow-hidden">
                  {brand.bannerImage ? (
                    <img 
                      src={brand.bannerImage} 
                      alt={brand.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-950" />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between font-mono">
                    <span className="px-2 py-0.5 rounded-[2px] bg-zinc-950/90 border border-zinc-800 text-white text-[10px] font-bold uppercase">
                      {brand.country}
                    </span>
                    <span className="px-2 py-0.5 rounded-[2px] bg-amber-500 text-black text-[9px] font-black uppercase">
                      {brand.category}
                    </span>
                  </div>

                  {/* Brand Logo / Tech Icon at Bottom of Banner */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      {brand.technicalIcon && (
                        <div className="w-10 h-10 rounded-[3px] bg-zinc-950 p-1 border border-zinc-800 shadow-md shrink-0">
                          <img 
                            src={brand.technicalIcon} 
                            alt={brand.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-black text-white leading-none uppercase">
                          {brand.name}
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-amber-400 block mt-0.5 uppercase">
                          DISTRIBUCIÓN OFICIAL RD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-3.5 sm:p-4 space-y-3">
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {brand.tagline}
                  </p>

                  {/* Equipment Lines */}
                  <div className="space-y-1 pt-2 border-t border-zinc-800 font-mono">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
                      LÍNEAS CERTIFICADAS EN RD:
                    </span>
                    {brand.equipmentLines.slice(0, 3).map((line, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                        <Check className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate uppercase">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="p-3 sm:px-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs font-display">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  GARANTÍA 2-3 AÑOS
                </span>
                
                <div className="flex items-center gap-2">
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('#/machinery')}
                      className="px-2.5 py-1 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>VER EQUIPOS</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. STRATEGIC ORGANIZATIONAL HIERARCHY & STAFF DIRECTORY */}
      <section id="staff-directory" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
              <Users className="w-3 h-3" />
              <span>ESTRUCTURA PROFESIONAL &amp; CERTIFICACIONES</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
              DIRECTORIO EJECUTIVO, COMERCIAL &amp; DE INGENIERÍA
            </h2>
          </div>

          {/* View Mode Switcher Toggle */}
          <div className="inline-flex p-1 rounded-[3px] bg-zinc-900 border border-zinc-800 shrink-0 font-display">
            <button
              onClick={() => setViewMode('organigrama')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'organigrama'
                  ? 'bg-amber-500 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>ORGANIGRAMA</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>DIRECTORIO ({STAFF_PROFILES_DATA.length})</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3.5 sm:p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 font-mono">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BUSCAR POR NOMBRE, CARGO, ESPECIALIDAD (JCB, CUMMINS, SOS)..."
                className="w-full pl-9 pr-8 py-2 bg-zinc-950 border border-zinc-800 rounded-[3px] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 uppercase"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-zinc-400 font-mono text-right shrink-0">
              <span className="font-bold text-amber-400">{filteredStaff.length}</span> PERFILES ACTIVOS
            </div>
          </div>

          {/* Department Filter Buttons */}
          {viewMode === 'grid' && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800 font-display">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-2.5 py-1 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    selectedDepartment === dept
                      ? 'bg-zinc-800 text-amber-400 border-zinc-700 shadow-xs'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Display: Hierarchical Organigrama vs Cards Grid */}
        {viewMode === 'organigrama' ? (
          <div className="animate-fadeIn">
            <StaffOrganigramaView
              onSelectMember={setSelectedStaff}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn font-display">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className="p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={staff.photoUrl}
                      alt={staff.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-[3px] object-cover border border-zinc-700 shrink-0 group-hover:border-amber-400 transition-colors"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-white truncate uppercase">
                        {staff.name}
                      </h4>
                      <p className="text-[11px] font-mono text-amber-400 font-bold truncate uppercase">
                        {staff.role}
                      </p>
                      <span className="text-[10px] text-zinc-500 block truncate uppercase font-mono">
                        {staff.department}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3 font-sans">
                    {staff.bio}
                  </p>

                  {/* Certifications preview */}
                  <div className="flex flex-wrap gap-1 font-mono">
                    {staff.certifications.slice(0, 2).map((cert, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-amber-400 text-[9px] font-bold uppercase truncate"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500 uppercase">{staff.experienceYears}+ AÑOS EXP.</span>
                  <span className="text-amber-400 font-bold uppercase flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-display">
                    VER PERFIL <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Staff Member Detail Modal */}
      {selectedStaff && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn font-display">
          <div className="relative w-full max-w-lg bg-zinc-950 rounded-[5px] p-6 border border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Top */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedStaff.photoUrl}
                  alt={selectedStaff.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-[3px] object-cover border border-amber-400 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-black text-white uppercase">
                    {selectedStaff.name}
                  </h3>
                  <p className="text-xs font-mono font-bold text-amber-400 uppercase">
                    {selectedStaff.role}
                  </p>
                  <span className="text-[11px] font-mono text-zinc-400 uppercase">
                    {selectedStaff.department} • {selectedStaff.experienceYears} AÑOS DE EXPERIENCIA
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className="p-1.5 rounded-[3px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-500">
                PERFIL &amp; TRAYECTORIA
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900 p-3 rounded-[3px] border border-zinc-800 font-sans">
                {selectedStaff.bio}
              </p>
            </div>

            {/* Certifications */}
            <div className="space-y-1.5 font-mono">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>CERTIFICACIONES OFICIALES</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedStaff.certifications.map((cert, cIdx) => (
                  <span
                    key={cIdx}
                    className="px-2.5 py-1 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-bold uppercase flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{cert}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-1.5 font-mono">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                ESPECIALIDADES TÉCNICAS
              </h4>
              <div className="flex flex-wrap gap-1">
                {selectedStaff.keySpecialties.map((spec, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-0.5 rounded-[2px] bg-zinc-900 text-[11px] font-bold text-zinc-300 border border-zinc-800 uppercase"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Actions */}
            <div className="pt-3 border-t border-zinc-800 flex gap-2 font-display">
              <a
                href={`mailto:${selectedStaff.email}`}
                className="flex-1 py-2.5 px-3 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>EMAIL</span>
              </a>

              <a
                href={`https://wa.me/18098262222?text=Hola%20TMD,%20solicito%20atención%20con%20${encodeURIComponent(selectedStaff.name)}%20(${encodeURIComponent(selectedStaff.role)})`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-[3px] bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-zinc-800 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WHATSAPP</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 5. COMPANY TIMELINE (2002-2026) */}
      <section className="p-6 sm:p-8 rounded-[5px] bg-zinc-950 text-white border border-zinc-800 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-400">
            EVOLUCIÓN CONTINUA
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            HITOS CLAVE DE TECNOMAQUINARIAS DIESEL
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((item, mIdx) => (
            <div key={mIdx} className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-1.5 font-mono">
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-500 text-black font-black text-xs font-mono inline-block">
                {item.year}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-white uppercase font-display">{item.title}</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Test Drive Booking Modal */}
      <TestDriveBookingModal
        isOpen={isTestDriveModalOpen}
        onClose={() => setIsTestDriveModalOpen(false)}
      />

      {/* Floating Scroll-to-Top Pill */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-40 p-3 sm:px-4 sm:py-2.5 rounded-[3px] bg-amber-500 text-black shadow-2xl border border-amber-400 font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-3 font-display"
          aria-label="Volver arriba en nosotros"
        >
          <ChevronUp className="w-4 h-4 stroke-[3]" />
          <span className="text-xs hidden sm:inline">SUBIR</span>
        </button>
      )}
    </div>
  );
};
