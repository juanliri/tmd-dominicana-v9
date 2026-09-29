import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Navigation, 
  MessageSquare, 
  ShieldCheck, 
  Truck, 
  ExternalLink,
  Car,
  Wrench
} from 'lucide-react';
import tmdEntranceImg from '../../assets/images/tmd_sede_central_entrance_km22.jpg';
import tmdPosterImg from '../../assets/images/patio_km22_video_poster_1789964094212.jpg';
import tmdDealershipImg from '../../assets/images/tmd_dealership_bg_1790439101712.jpg';

interface BranchesContactViewProps {
  onNavigate: (route: string) => void;
}

interface Branch {
  id: string;
  name: string;
  badge: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  whatsapp: string;
  email: string;
  hoursWeekday: string;
  hoursSaturday: string;
  features: string[];
  image: string;
  mapEmbedUrl: string;
  wazeUrl: string;
  googleMapsUrl: string;
  type: 'headquarters' | 'distribution' | 'service';
}

const BRANCHES: Branch[] = [
  {
    id: 'hq-km22',
    name: 'Sede Central & Mega Patio de Pruebas',
    badge: 'Showroom Principal • 15,000 m²',
    address: 'Autopista Duarte Km 22, La Guáyiga, Carretera Hato Nuevo',
    city: 'Pedro Brand / Santo Domingo Oeste',
    region: 'Gran Santo Domingo',
    phone: '+1 (809) 826-2222',
    whatsapp: '18095601234',
    email: 'ventas@tmddominicana.com',
    hoursWeekday: 'Lunes a Viernes: 7:30 AM - 5:30 PM',
    hoursSaturday: 'Sábados: 8:00 AM - 12:30 PM (Emergencias SOS 24/7)',
    features: [
      'Exhibición de Flota 2026 (JCB, LiuGong, Ammann, LS Tractor)',
      'Pista de Pruebas de Excavación y Rendimiento de Balde',
      'Almacén Central Robotizado (+8,000 Repuestos OEM)',
      'Taller Mayor de Reconstrucción de Motores y Bombas Hidráulicas',
      'Laboratorio Certificado de Análisis de Aceites y Fluidos',
      'Base de Despacho Central para Camionetas Móviles SOS'
    ],
    image: tmdEntranceImg,
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30278.43!2d-70.02!3d18.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMzJzAwLjAiTiA3MMKwMDEnMDAuMCJX!5e0!3m2!1ses!2sdo!4v1600000000000',
    wazeUrl: 'https://waze.com/ul?q=Autopista+Duarte+Km+22+Tecnomaquinarias+Diesel',
    googleMapsUrl: 'https://maps.google.com/?q=Autopista+Duarte+Km+22+Tecnomaquinarias+Diesel+Dominicana',
    type: 'headquarters'
  },
  {
    id: 'cibao-santiago',
    name: 'Centro de Distribución Cibao (Santiago)',
    badge: 'Hub Regional Norte',
    address: 'Av. Circunvalación Norte Km 7, Sector El Ingenio',
    city: 'Santiago de los Caballeros',
    region: 'Región Norte / Cibao',
    phone: '+1 (809) 582-4411',
    whatsapp: '18095601234',
    email: 'cibao@tmddominicana.com',
    hoursWeekday: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
    hoursSaturday: 'Sábados: 8:00 AM - 12:00 PM',
    features: [
      'Punto de Despacho Rápido de Filtros y Mangueras Prensadas',
      'Flota de Renta Inmediata para Proyectos Viales del Cibao',
      'Bahías de Mantenimiento Preventivo Rápido',
      'Atención Directa a Minas de Áridos y Obras en Puerto Plata / La Vega'
    ],
    image: tmdPosterImg,
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60156.4!2d-70.7!3d19.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI3JzAwLjAiTiA3MMKwNDInMDAuMCJX!5e0!3m2!1ses!2sdo!4v1600000000000',
    wazeUrl: 'https://waze.com/ul?q=Santiago+Circunvalacion+Norte+Tecnomaquinarias',
    googleMapsUrl: 'https://maps.google.com/?q=Circunvalacion+Norte+Santiago+Tecnomaquinarias+Diesel',
    type: 'distribution'
  },
  {
    id: 'este-puntacana',
    name: 'Sucursal Este & Soporte Hotelero (Bávaro - Punta Cana)',
    badge: 'Hub Turístico & Obras',
    address: 'Boulevard Turístico del Este Km 14, Cruce de Verón',
    city: 'Bávaro - Punta Cana / La Altagracia',
    region: 'Región Este',
    phone: '+1 (809) 455-8899',
    whatsapp: '18095601234',
    email: 'este@tmddominicana.com',
    hoursWeekday: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
    hoursSaturday: 'Sábados: 8:00 AM - 1:00 PM (Turnos de Emergencia)',
    features: [
      'Atención Especializada a Desarrollos Turísticos y Hoteleros',
      'Stock de Manipuladores Telescópicos JCB y Mini-Excavadoras',
      'Servicio Técnico SOS para Generadores Diésel y Torres de Luz',
      'Despacho Exprés de Aceites Hidráulicos y Elementos Filtrantes'
    ],
    image: tmdDealershipImg,
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60156.4!2d-68.4!3d18.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDM2JzAwLjAiTiA2OMKwMjQnMDAuMCJX!5e0!3m2!1ses!2sdo!4v1600000000000',
    wazeUrl: 'https://waze.com/ul?q=Bavaro+Boulevard+Turistico+Tecnomaquinarias',
    googleMapsUrl: 'https://maps.google.com/?q=Boulevard+Turistico+del+Este+Veron+Tecnomaquinarias',
    type: 'service'
  }
];

export const BranchesContactView: React.FC<BranchesContactViewProps> = ({ onNavigate }) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('hq-km22');
  const [bookingName, setBookingName] = useState('');
  const [bookingCompany, setBookingCompany] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingInterest, setBookingInterest] = useState('demo-patio');
  const [isBooked, setIsBooked] = useState(false);

  const selectedBranch = BRANCHES.find(b => b.id === selectedBranchId) || BRANCHES[0];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    setTimeout(() => {
      // Auto clear after 4s
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* 1. Header with Live Status Banner */}
      <div className="bg-zinc-900 border-b border-zinc-800 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 md:py-14 font-display">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400 type-badge mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Red Nacional de Sedes, Talleres & Mega Patios TMD</span>
            </div>
            <h1 className="text-2xl sm:text-4xl type-section-title text-white mb-3">
              Sedes & Contacto Directo en <span className="text-amber-400">República Dominicana</span>
            </h1>
            <p className="text-xs sm:text-sm type-body text-zinc-400 max-w-2xl font-sans">
              Más de 20,000 m² combinados de infraestructura industrial en Santo Domingo, Santiago y Bávaro para entrega inmediata, demostración en terreno y soporte posventa 24/7.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 -mt-5 space-y-6">
        {/* 2. Fast Branch Navigation Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BRANCHES.map((branch) => {
            const isSelected = branch.id === selectedBranchId;
            return (
              <button
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={`p-4 rounded-[5px] text-left transition-all border cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 text-white border-amber-400 shadow-2xl'
                    : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {isSelected && <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isSelected
                        ? 'bg-amber-400 text-black'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}>
                      {branch.region}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Activa</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold uppercase tracking-tight mb-1 text-white">
                    {branch.name}
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-400 font-sans">
                    {branch.address}
                  </p>
                </div>

                <div className={`mt-3 pt-2.5 border-t text-xs font-mono flex items-center justify-between ${
                  isSelected ? 'border-zinc-800 text-amber-400' : 'border-zinc-800/60 text-zinc-500'
                }`}>
                  <span>{branch.phone}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Ver Instalaciones →</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. Detailed Selected Branch Hub */}
        <div className="rounded-[5px] bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Branch Details & Features */}
          <div className="lg:col-span-7 p-5 sm:p-7 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono uppercase mb-2">
                <Building2 className="w-3 h-3" />
                <span>{selectedBranch.badge}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                {selectedBranch.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 flex items-start gap-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{selectedBranch.address}, {selectedBranch.city}</span>
              </p>
            </div>

            {/* Operational Hours & Direct Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs font-sans">
              <div className="space-y-1">
                <span className="font-mono font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Horarios de Atención:</span>
                </span>
                <p className="text-zinc-400 text-[11px]">{selectedBranch.hoursWeekday}</p>
                <p className="text-zinc-400 text-[11px]">{selectedBranch.hoursSaturday}</p>
              </div>

              <div className="space-y-1">
                <span className="font-mono font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Líneas Directas:</span>
                </span>
                <p className="text-zinc-400 text-[11px]">
                  Tel: <a href={`tel:${selectedBranch.phone.replace(/[^0-9]/g, '')}`} className="font-mono font-bold text-amber-400 hover:underline">{selectedBranch.phone}</a>
                </p>
                <p className="text-zinc-400 text-[11px]">
                  Email: <span className="font-mono text-zinc-300">{selectedBranch.email}</span>
                </p>
              </div>
            </div>

            {/* Facility Highlights */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Servicios y Capacidades en esta Sede:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedBranch.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 p-2 rounded-[2px] bg-zinc-950 border border-zinc-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-[11px] font-sans leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick GPS & Routing Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={selectedBranch.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold rounded-[2px] text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={selectedBranch.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold rounded-[2px] text-xs uppercase tracking-wider transition-colors border border-zinc-700"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Waze</span>
              </a>

              <a
                href={`https://wa.me/${selectedBranch.whatsapp}?text=Hola%20TMD%20Dominicana,%20deseo%20contactar%20a%20la%20sede%20${encodeURIComponent(selectedBranch.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold rounded-[2px] text-xs uppercase tracking-wider transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp de Turno</span>
              </a>
            </div>
          </div>

          {/* Right Column: Photo & Interactive Test Drive Appointment Form */}
          <div className="lg:col-span-5 bg-zinc-950 text-white p-5 sm:p-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-800 space-y-4">
            <div className="space-y-4">
              <div className="relative aspect-video rounded-[3px] overflow-hidden border border-zinc-800">
                <img
                  src={selectedBranch.image}
                  alt={selectedBranch.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    Patio & Taller Certificado TMD
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-tight text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Agendar Prueba en Patio / Visita VIP</span>
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Prueba de fuerza hidráulica, evaluación con tus propios operadores y atención con un asesor senior.
                </p>
              </div>

              {isBooked ? (
                <div className="p-4 rounded-[3px] bg-zinc-900 border border-emerald-500/40 text-emerald-400 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Cita Agendada Exitosamente!</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans">
                    Nuestro equipo de {selectedBranch.city} se pondrá en contacto al teléfono proporcionado para coordinar el acceso al patio de pruebas.
                  </p>
                  <button
                    onClick={() => setIsBooked(false)}
                    className="mt-2 text-xs font-mono font-bold text-amber-400 underline cursor-pointer"
                  >
                    Agendar otra cita
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3 font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        placeholder="Ej. Ing. Rafael Mejía"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-[2px] text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Empresa / RNC</label>
                      <input
                        type="text"
                        required
                        value={bookingCompany}
                        onChange={(e) => setBookingCompany(e.target.value)}
                        placeholder="Constructora / Minera"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-[2px] text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Teléfono / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        placeholder="(809) 000-0000"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-[2px] text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Fecha Deseada</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-[2px] text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Motivo de la Visita</label>
                    <select
                      value={bookingInterest}
                      onChange={(e) => setBookingInterest(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-[2px] text-xs font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="demo-patio">Prueba Dinámica de Maquinaria en Patio</option>
                      <option value="inspeccion-usados">Inspección de Equipos Usados Certificados 150 Pts</option>
                      <option value="retiro-repuestos">Retiro Inmediato de Repuestos / Kits OEM</option>
                      <option value="reunion-comercial">Reunión de Leasing y Flota con Gerencia</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold uppercase rounded-[2px] text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Confirmar Solicitud de Visita</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 4. SOS Mobile Rescue Notice */}
        <div className="p-4 sm:p-5 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500" />
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[2px] bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                ¿Tu máquina está detenida en un proyecto u obra distante?
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Despachamos camionetas de taller móvil con mecánicos certificados y repuestos genuinos directo a tu cantera o carretera.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('#/emergency-dispatch')}
            className="px-4 py-2 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider shrink-0 transition-colors cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Solicitar Taller Móvil SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
