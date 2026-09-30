import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  Radio, 
  AlertTriangle,
  Zap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { LiveLinkUnit } from '../../types';

interface FieldServiceDispatchRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUnit?: LiveLinkUnit | null;
}

interface MobileWorkshopUnit {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  technicianName: string;
  specialty: string;
  currentLocationName: string;
  lat: number;
  lng: number;
  status: 'available' | 'en_route' | 'on_site';
  etaMinutes: number;
  distanceKm: number;
  equipmentOnBoard: string[];
  phone: string;
}

const DOMINICAN_MOBILE_UNITS: MobileWorkshopUnit[] = [
  {
    id: 'mob_01',
    name: 'Unidad de Rescate 01 (Corredor Duarte)',
    vehicle: 'Toyota Hilux 4x4 Heavy Duty Tech Unit',
    plate: 'L-418920',
    technicianName: 'Ing. Rafael Peña (Master Tech LiuGong)',
    specialty: 'Mecánica Pesada, Orugas & Tren de Rodaje',
    currentLocationName: 'Autopista Duarte Km 28 (Pedro Brand)',
    lat: 18.6010,
    lng: -70.0650,
    status: 'available',
    etaMinutes: 25,
    distanceKm: 14.2,
    equipmentOnBoard: ['Generador 10 kVA', 'Compresor 175 PSI', 'Torquímetro 2500 Nm', 'Kit Sellos Hidráulicos'],
    phone: '+1 (809) 560-1234'
  },
  {
    id: 'mob_02',
    name: 'Unidad de Rescate 02 (Gran Santo Domingo)',
    vehicle: 'Isuzu D-Max 4x4 Diagnostic Command',
    plate: 'L-392110',
    technicianName: 'Manuel Almonte (Especialista Electrónico)',
    specialty: 'Diagnóstico J1939 CAN-Bus, Inyección & ECU',
    currentLocationName: 'Patio Central TMD Km 22 Autopista Duarte',
    lat: 18.5714,
    lng: -70.0381,
    status: 'available',
    etaMinutes: 15,
    distanceKm: 8.5,
    equipmentOnBoard: ['Escáner OEM LiuGong/JCB', 'Banco de Pruebas Sensores', 'Osciloscopio', 'Kit Baterías 24V'],
    phone: '+1 (809) 560-1235'
  },
  {
    id: 'mob_03',
    name: 'Unidad de Rescate 03 (Región Este)',
    vehicle: 'Toyota Hilux 4x4 Hydraulic Specialist',
    plate: 'L-450912',
    technicianName: 'Julio Santana (Técnico Senior Hidráulica)',
    specialty: 'Bombas Kawasaki, Mandos Finales & Válvulas',
    currentLocationName: 'Autovía del Este Km 45 (San Pedro de Macorís)',
    lat: 18.4600,
    lng: -69.3000,
    status: 'en_route',
    etaMinutes: 65,
    distanceKm: 68.0,
    equipmentOnBoard: ['Crimpadora Mangueras Gates', 'Manómetros 600 bar', 'Caudalímetro Digital', 'Aceite ISO 68'],
    phone: '+1 (809) 560-1236'
  },
  {
    id: 'mob_04',
    name: 'Unidad de Rescate 04 (Región Sur)',
    vehicle: 'Isuzu D-Max 4x4 Emergency Welder & Fluids',
    plate: 'L-389145',
    technicianName: 'Eduardo Morales (Especialista Soldadura Cantera)',
    specialty: 'Reconstrucción de Baldes, Zapatas & Soldadura',
    currentLocationName: 'Carretera Sánchez Km 12 (San Cristóbal / Haina)',
    lat: 18.4200,
    lng: -70.0800,
    status: 'on_site',
    etaMinutes: 45,
    distanceKm: 28.5,
    equipmentOnBoard: ['Motosoldadora Miller 400A', 'Electrodos Antidesgaste', 'Oxicorte', 'Extractor Hidráulico 50T'],
    phone: '+1 (809) 560-1237'
  }
];

export const FieldServiceDispatchRadarModal: React.FC<FieldServiceDispatchRadarModalProps> = ({
  isOpen,
  onClose,
  targetUnit
}) => {
  const [selectedMobileId, setSelectedMobileId] = useState<string>('mob_01');
  const [dispatchedSuccess, setDispatchedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedMobile = DOMINICAN_MOBILE_UNITS.find(u => u.id === selectedMobileId) || DOMINICAN_MOBILE_UNITS[0];

  const handleRequestDispatch = () => {
    setDispatchedSuccess(true);
    setTimeout(() => {
      // Keep feedback for 4s
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-[5px] max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-amber-400 text-black shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  Despacho de Unidades 4x4 con GPS en Vivo (Task #81)
                </span>
                <span className="text-[10px] text-zinc-400">
                  Cobertura Nacional RD
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mt-0.5 font-display">
                Radar de Auxilio Técnico en Campo 24/7
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Target Breakdown Machine Alert Bar */}
          {targetUnit && (
            <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
                <div>
                  <span className="text-zinc-500 uppercase text-[10px] block">Equipo que Requiere Asistencia:</span>
                  <strong className="text-white uppercase font-display text-sm">
                    {targetUnit.model} ({targetUnit.serialNumber})
                  </strong>
                  <span className="text-zinc-400 text-[11px] block mt-0.5">
                    Ubicación satelital: {targetUnit.location ? `${targetUnit.location.address}, ${targetUnit.location.province}` : 'Cantera Nizao, San Cristóbal'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-rose-400 uppercase block">
                  {targetUnit.faultCodes.length > 0 ? `${targetUnit.faultCodes.length} Código(s) DTC Activos` : 'Avería Mecánica Reportada'}
                </span>
                <span className="text-[10px] text-zinc-500">Prioridad: ALTA (Respuesta &lt; 45 min)</span>
              </div>
            </div>
          )}

          {dispatchedSuccess && (
            <div className="p-4 rounded-[3px] bg-emerald-950/30 border border-emerald-500/60 text-emerald-300 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider font-display text-white">
                  ¡Despacho Autorizado de {selectedMobile.name}!
                </h4>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                El técnico <strong>{selectedMobile.technicianName}</strong> ha recibido la orden en su tableta de campo. Tiempo estimado de arribo: <strong>{selectedMobile.etaMinutes} minutos</strong>. Se ha compartido el enlace de seguimiento en vivo a su WhatsApp.
              </p>
            </div>
          )}

          {/* Active 4x4 Fleet List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DOMINICAN_MOBILE_UNITS.map((mobile) => {
              const isSelected = mobile.id === selectedMobileId;
              const isAvailable = mobile.status === 'available';

              return (
                <div
                  key={mobile.id}
                  onClick={() => setSelectedMobileId(mobile.id)}
                  className={`p-4 rounded-[3px] border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-zinc-950 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-[2px] border ${
                            isAvailable
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : mobile.status === 'en_route'
                                ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                          }`}>
                            {isAvailable ? 'DISPONIBLE INMEDIATO' : mobile.status === 'en_route' ? 'EN RUTA' : 'EN OBRA'}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">Placa: {mobile.plate}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white uppercase leading-snug font-display">
                          {mobile.name}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-amber-400 font-mono block">
                          ~{mobile.etaMinutes} min
                        </span>
                        <span className="text-[10px] text-zinc-500">{mobile.distanceKm} km de distancia</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[2px] bg-zinc-900 text-xs text-zinc-300 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{mobile.currentLocationName}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        <span className="text-white font-bold">{mobile.technicianName}</span> • {mobile.specialty}
                      </div>
                    </div>
                  </div>

                  {/* Equipment onboard tags */}
                  <div className="space-y-1.5 pt-1 border-t border-zinc-800">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">
                      Equipamiento a Bordo:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {mobile.equipmentOnBoard.map((eq, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300 uppercase"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Select button */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-500">
                      Vehículo: {mobile.vehicle}
                    </span>
                    <span className={`text-[11px] font-bold uppercase flex items-center gap-1 ${
                      isSelected ? 'text-amber-400' : 'text-zinc-500'
                    }`}>
                      {isSelected ? '✓ Seleccionada para Despacho' : 'Click para Seleccionar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer with Dispatch Trigger */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-zinc-400 text-[11px]">
              Centro de Despacho 24/7: Patio Central Km 22, Autopista Duarte.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleRequestDispatch}
              className="px-5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Despachar {selectedMobile.name.split(' (')[0]} (~{selectedMobile.etaMinutes} min)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
