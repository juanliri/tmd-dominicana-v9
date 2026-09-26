import React, { useState, useMemo } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Truck, 
  RotateCw, 
  Star, 
  HelpCircle, 
  CheckCircle2, 
  PhoneCall, 
  ChevronRight, 
  ChevronLeft,
  Search, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Plus, 
  Check, 
  Sparkles, 
  Wrench, 
  DollarSign, 
  HardHat, 
  FileText,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { MACHINES_DATA } from '../../data/catalog';
import { PARTS_DATA } from '../../data/parts';
import { CONTRACTOR_TESTIMONIALS, CONTRACTOR_STATS } from '../../data/testimonials';
import { FAQ_DATA } from '../../data/faq';
import { useCart } from '../../context/CartContext';
import { Machine, Part } from '../../types';

interface AssuranceHubUnifiedProps {
  onNavigate: (route: string) => void;
  onSelectMachineByName?: (machineName: string) => void;
  onOpen360?: (machine: Machine) => void;
  onOpenEstimate?: () => void;
}

const DISPATCH_LOCATIONS = [
  { city: 'Santo Domingo / D.N.', time: '2 - 4 Horas', route: 'Salida directa Km 22 Duarte' },
  { city: 'Santiago / Cibao', time: 'Mismo Día (6h)', route: 'Vía Metro Pac & Expreso' },
  { city: 'Punta Cana / Bávaro', time: 'Hoy / < 24h', route: 'Ruta hotelera diaria' },
  { city: 'La Vega / Bonao', time: '3 - 5 Horas', route: 'Corredor Autopista Duarte' },
  { city: 'Cabo Rojo / Pedernales', time: '< 24 Horas', route: 'Carga Expresa Proyectos' }
];

export const AssuranceHubUnified: React.FC<AssuranceHubUnifiedProps> = ({
  onNavigate,
  onSelectMachineByName,
  onOpen360,
  onOpenEstimate
}) => {
  const { addToCart, formatPrice } = useCart();
  const [activeTab, setActiveTab] = useState<'guarantee' | 'parts' | 'testimonials' | 'faq'>('guarantee');
  
  // Parts sub-state
  const [partSearch, setPartSearch] = useState('');
  const [partCategory, setPartCategory] = useState('all');
  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [addedPartId, setAddedPartId] = useState<string | null>(null);

  // FAQ sub-state
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-mach-1');

  // Testimonials carousel index
  const [testiIdx, setTestiIdx] = useState(0);

  const filteredParts = useMemo(() => {
    return PARTS_DATA.filter((p: Part) => {
      const matchCat = partCategory === 'all' || p.category.toLowerCase().includes(partCategory.toLowerCase());
      const query = partSearch.trim().toLowerCase();
      const matchQuery = !query || p.name.toLowerCase().includes(query) || p.partNumber.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
      return matchCat && matchQuery;
    }).slice(0, 8);
  }, [partCategory, partSearch]);

  const handleAddPart = (part: Part) => {
    addToCart(part, 1);
    setAddedPartId(part.id);
    setTimeout(() => setAddedPartId(null), 1500);
  };

  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1780px] mx-auto py-4 sm:py-6" id="assurance-hub">
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden relative">
        {/* Subtle architectural background texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Master Hub Header */}
        <div className="relative z-10 border-b border-zinc-800 bg-zinc-900/90 px-5 sm:px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-display">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-amber-500 text-black type-badge shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Respaldo Integral Oficial TMD
              </span>
              <span className="text-zinc-400 type-kicker hidden sm:inline text-[11px]">
                Sede Central Km 22 Duarte • Soporte 24/7 en Todo el País
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl type-section-title text-white">
              Garantía, Repuestos OEM y Confianza en Obra
            </h2>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800/80 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('guarantee')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'guarantee'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Garantía & 4 Pilares</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('parts')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'parts'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Repuestos OEM Km 22</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('testimonials')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'testimonials'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Contratistas en RD</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Preguntas Frecuentes</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Garantía MasterCare & 4 Pilares + 360 Visuals */}
        {activeTab === 'guarantee' && (
          <div className="relative z-10 p-5 sm:p-8 space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">Stock Físico Km 22 Duarte</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Más de 15,000 m² de inventario real con entrega inmediata de maquinaria, accesorios y repuestos originales.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <span>● Salida express en 2 a 4 horas</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">Taller Móvil SOS 24/7</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Camionetas 4x4 equipadas con herramientas diagnósticas oficiales para asistencia directa en canteras, minas y obras.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <span>● Cobertura en las 32 provincias</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">Financiamiento Bancario NCF</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Leasing comercial y tasas preferenciales con Banco Popular, Banreservas y BHD. Comprobante fiscal B01 con ITBIS DGII.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <span>● Hasta 60 meses de plazo</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">Técnicos Certificados Fábrica</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Personal certificado en Reino Unido (JCB) y China (LiuGong) con protocolos de servicio y telemetría LiveLink™.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <span>● 3 Años Garantía Oficial</span>
                </div>
              </div>
            </div>

            {/* Quick Interactive 360° Teaser Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                  <RotateCw className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Inspección Virtual 360° de Cabina & Motor</h4>
                  <p className="text-xs text-zinc-400">Gira los equipos principales antes de visitarnos en el Km 22.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const jcb = MACHINES_DATA.find((m: Machine) => m.brand.toLowerCase() === 'jcb') || MACHINES_DATA[0];
                    if (onOpen360) onOpen360(jcb);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Ver JCB 3CX 360°</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const lg = MACHINES_DATA.find((m: Machine) => m.brand.toLowerCase() === 'liugong') || MACHINES_DATA[1];
                    if (onOpen360) onOpen360(lg);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-zinc-700"
                >
                  <span>Ver LiuGong 922E</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Repuestos OEM Km 22 & Dispatch Simulator */}
        {activeTab === 'parts' && (
          <div className="relative z-10 p-5 sm:p-8 space-y-5 animate-fadeIn">
            {/* Parts Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              {/* Category selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                {[
                  { id: 'all', label: 'Todo el Stock' },
                  { id: 'Filtros', label: 'Filtros' },
                  { id: 'Desgaste', label: 'Dientes & Desgaste' },
                  { id: 'Hidráulica', label: 'Hidráulica' },
                  { id: 'Motor', label: 'Motor' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPartCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      partCategory === c.id
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Regional Dispatch Simulator */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] text-zinc-400 uppercase font-black">Ruta RD:</span>
                  <select
                    value={selectedCityIdx}
                    onChange={(e) => setSelectedCityIdx(Number(e.target.value))}
                    className="bg-transparent border-0 text-xs font-bold text-white cursor-pointer focus:outline-none"
                  >
                    {DISPATCH_LOCATIONS.map((loc, idx) => (
                      <option key={idx} value={idx} className="bg-zinc-900 text-white">
                        {loc.city} ({loc.time})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('#/parts')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Catálogo Completo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Parts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredParts.map((part: Part) => {
                const isAdded = addedPartId === part.id;
                return (
                  <div 
                    key={part.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black mb-2.5 border border-zinc-800">
                        <img 
                          src={part.image} 
                          alt={part.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-amber-400 text-[10px] font-mono font-bold border border-white/10">
                          {part.brand}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {part.name}
                      </h4>
                      <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                        Cod: {part.partNumber}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] text-zinc-500 block uppercase">Inversión</span>
                        <span className="text-xs font-black text-amber-400">{formatPrice(part.priceUsd)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddPart(part)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-800 hover:bg-amber-500 hover:text-black text-white'
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isAdded ? 'Agregado' : 'Pedir'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Contratistas en RD */}
        {activeTab === 'testimonials' && (
          <div className="relative z-10 p-5 sm:p-8 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-zinc-300 font-bold">
                  {CONTRACTOR_STATS.averageRating} / 5.0 — {CONTRACTOR_STATS.totalReviews} contratistas verificados
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTestiIdx(prev => Math.max(0, prev - 1))}
                  disabled={testiIdx === 0}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTestiIdx(prev => Math.min(CONTRACTOR_TESTIMONIALS.length - 3, prev + 1))}
                  disabled={testiIdx >= CONTRACTOR_TESTIMONIALS.length - 3}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CONTRACTOR_TESTIMONIALS.slice(testiIdx, testiIdx + 3).map((testi: any) => (
                <div 
                  key={testi.id}
                  className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        📍 {testi.province}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(testi.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <h4 className="text-sm font-black text-white">{testi.author}</h4>
                    <p className="text-[11px] text-zinc-400 font-medium">{testi.role} • {testi.company}</p>
                    <p className="text-xs text-zinc-300 italic leading-relaxed pt-1">
                      "{testi.review}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-bold text-amber-400">{testi.equipmentUsed.join(', ')}</span>
                    <span className="text-[10px]">{testi.highlightMetric.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Preguntas Frecuentes & DGII */}
        {activeTab === 'faq' && (
          <div className="relative z-10 p-5 sm:p-8 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FAQ_DATA.slice(0, 6).map((faq: any) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all ${
                      isOpen
                        ? 'bg-zinc-900 border-amber-500/50 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {faq.question}
                      </span>
                      <span className={`text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/60">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <div className="text-xs text-zinc-400">
                ¿Pregunta adicional sobre importación, NCF B01 o financiamiento con banca dominicana?
              </div>
              <a
                href="https://wa.me/18095601234?text=Hola%20TMD%2C%20quisiera%20asesor%C3%ADa%20t%C3%A9cnica%20y%20comercial"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <span>Chatear con Especialista por WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
