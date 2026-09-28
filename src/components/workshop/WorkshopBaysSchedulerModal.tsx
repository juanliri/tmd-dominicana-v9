import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  UserCheck, 
  Truck, 
  Activity, 
  Sparkles, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface WorkshopBaysSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMachineName?: string;
}

interface WorkshopBay {
  id: number;
  name: string;
  specialty: string;
  currentMachine: string;
  client: string;
  operationType: string;
  leadTechnician: string;
  progressPercent: number;
  status: 'occupied' | 'testing' | 'ready' | 'available';
  statusLabel: string;
  estimatedCompletion: string;
  partsStatus: string;
}

const WORKSHOP_BAYS: WorkshopBay[] = [
  {
    id: 1,
    name: 'Bahía 1: PDI & Diagnóstico Rápido',
    specialty: 'Inspección de pre-entrega de 85 puntos, escaneo ECM y telemetría LiveLink.',
    currentMachine: 'LiuGong 922E HD (Excavadora 22T)',
    client: 'Consorcio Vial Metropolitano S.R.L.',
    operationType: 'PDI Certificado + Calibración Pantalla',
    leadTechnician: 'Mec. David Guzmán (Cert. LiuGong)',
    progressPercent: 88,
    status: 'testing',
    statusLabel: 'CALIBRACIÓN FINAL',
    estimatedCompletion: 'Hoy 4:30 PM',
    partsStatus: 'Kits PDI Verificados 100%'
  },
  {
    id: 2,
    name: 'Bahía 2: Overhaul de Tren de Potencia',
    specialty: 'Desarme y reconstrucción mayor de motores Cummins/Yanmar y transmisiones ZF.',
    currentMachine: 'JCB 3CX Eco (Retroexcavadora)',
    client: 'Construcciones & Asfaltos del Cibao',
    operationType: 'Reparación Mayor de Inyección Common Rail',
    leadTechnician: 'Ing. Ricardo Céspedes (Jefe Motor)',
    progressPercent: 62,
    status: 'occupied',
    statusLabel: 'ARMADO DE CULATA',
    estimatedCompletion: 'En 2 días hábiles',
    partsStatus: 'Pistones & Camisas OEM en Patio'
  },
  {
    id: 3,
    name: 'Bahía 3: Banco de Pruebas Hidráulicas',
    specialty: 'Banco computarizado de 350 bar para bombas Kawasaki, Parker y válvulas proporcionales.',
    currentMachine: 'LiuGong 856H (Pala Cargadora 5T)',
    client: 'Agregados & Arenas de San Cristóbal',
    operationType: 'Prueba Dinámica de Caudal 360 L/min',
    leadTechnician: 'Mec. Kelvin Rosario (Tribólogo)',
    progressPercent: 94,
    status: 'testing',
    statusLabel: 'BANCO DE PRUEBA ACTIVO',
    estimatedCompletion: 'Hoy 6:00 PM',
    partsStatus: 'Sellos Viton OEM Instalados'
  },
  {
    id: 4,
    name: 'Bahía 4: Tren de Rodaje & Orugas',
    specialty: 'Prensa hidráulica móvil de 100T para pasadores de cadenas, zapatas y rodillos.',
    currentMachine: 'LiuGong 936E (Excavadora 36T)',
    client: 'Canteras del Este / Minera Punta Cana',
    operationType: 'Prensado de Cadenas & Rodillos Guía',
    leadTechnician: 'Mec. Wilson Peña (Especialista Tren)',
    progressPercent: 45,
    status: 'occupied',
    statusLabel: 'PRENSADO HIDRÁULICO',
    estimatedCompletion: 'En 3 días',
    partsStatus: 'Zapatas HD 800mm Despachadas'
  },
  {
    id: 5,
    name: 'Bahía 5: Calderería & Soldadura Estructural',
    specialty: 'Soldadura certificada 6G, barrenado de ojos de pluma in-situ y blindaje Hardox 500.',
    currentMachine: 'Balde de Roca 2.2 m³ (Excavadora 36T)',
    client: 'Consorcio Minero Dominicano',
    operationType: 'Revestimiento Antidesgaste Hardox 500',
    leadTechnician: 'Soldador Cert. 6G Ramón Ortiz',
    progressPercent: 78,
    status: 'occupied',
    statusLabel: 'SOLDADURA DE LABIO',
    estimatedCompletion: 'Mañana 11:00 AM',
    partsStatus: 'Dientes Tigre Listos'
  },
  {
    id: 6,
    name: 'Bahía 6: Mantenimiento Rápido & Lavado',
    specialty: 'Mantenimientos de 250h/500h/1000h, análisis S.O.S. y rampa de lavado técnico.',
    currentMachine: 'Ammann ASC 110 (Compactador 11T)',
    client: 'Ingeniería & Pavimentos S.A.',
    operationType: 'Servicio Preventivo 500h Completo',
    leadTechnician: 'Técnico Luis Morales',
    progressPercent: 100,
    status: 'ready',
    statusLabel: 'LISTO PARA DESPACHO',
    estimatedCompletion: 'DESPACHADO / LISTO',
    partsStatus: 'Filtros y Aceite Facturados'
  }
];

export const WorkshopBaysSchedulerModal: React.FC<WorkshopBaysSchedulerModalProps> = ({
  isOpen,
  onClose,
  preselectedMachineName
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!isOpen) return null;

  const filteredBays = WORKSHOP_BAYS.filter(b => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  const occupiedCount = WORKSHOP_BAYS.filter(b => b.status === 'occupied' || b.status === 'testing').length;
  const readyCount = WORKSHOP_BAYS.filter(b => b.status === 'ready').length;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-950 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] font-mono text-white">
        
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  Planificador de Bahías de Trabajo — Taller Km 22
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-black uppercase">
                  6 BAHÍAS EN VIVO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans">
                Patio Central Autopista Duarte Km 22 • Capacidad Operativa: {Math.round((occupiedCount / 6) * 100)}% ({occupiedCount}/6 Ocupadas)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/18095608200?text=Hola%20TMD%20Dominicana,%20solicito%20agendar%20turno%20de%20taller%20en%20Km%2022%20para%20mantenimiento%20de%20maquinaria."
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agendar Bahía WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[2px] bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold mr-1">Filtrar:</span>
            {[
              { id: 'all', label: 'Todas (6)' },
              { id: 'occupied', label: 'En Desarme (3)' },
              { id: 'testing', label: 'En Pruebas (2)' },
              { id: 'ready', label: 'Listas (1)' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic('mechanicalClick');
                  setFilterStatus(tab.id);
                }}
                className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-amber-400 text-black font-black'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{readyCount} Lista para Salida</span>
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{occupiedCount} En Trabajo</span>
            </span>
          </div>
        </div>

        {/* Bays Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBays.map(bay => {
              const isReady = bay.status === 'ready';
              const isTesting = bay.status === 'testing';

              return (
                <div
                  key={bay.id}
                  className={`p-3.5 rounded-[3px] border transition-all flex flex-col justify-between ${
                    isReady
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-xs'
                      : isTesting
                      ? 'bg-amber-950/20 border-amber-400/40'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    {/* Bay Title & Status Pill */}
                    <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-zinc-800">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase font-mono block">
                          TALLER CENTRAL KM 22
                        </span>
                        <h4 className="text-xs font-black text-white uppercase tracking-tight">
                          {bay.name}
                        </h4>
                      </div>

                      <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase font-mono border shrink-0 ${
                        isReady
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : isTesting
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {bay.statusLabel}
                      </span>
                    </div>

                    {/* Machine & Client Info */}
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">Equipo en Bahía:</span>
                        <strong className="text-amber-400 font-bold block uppercase">{bay.currentMachine}</strong>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-300">
                        <span className="text-zinc-500 text-[10px] uppercase">Cliente:</span>
                        <span className="font-sans truncate max-w-[200px]">{bay.client}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-300">
                        <span className="text-zinc-500 text-[10px] uppercase">Operación:</span>
                        <span className="font-bold text-zinc-200">{bay.operationType}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-300">
                        <span className="text-zinc-500 text-[10px] uppercase">Técnico Líder:</span>
                        <span className="text-zinc-300 font-sans">{bay.leadTechnician}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Delivery Bar */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400">Avance de Orden:</span>
                      <span className="font-bold text-amber-400">{bay.progressPercent}%</span>
                    </div>

                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isReady ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${bay.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 font-mono">
                      <span>Piezas: <strong className="text-zinc-300">{bay.partsStatus}</strong></span>
                      <span className="text-emerald-400 font-bold">{bay.estimatedCompletion}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <Activity className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Monitoreo en tiempo real conectado al ERP de Taller y Almacén de Repuestos Km 22.</span>
          </div>

          <a
            href="https://wa.me/18095608200?text=Hola%20TMD%20Dominicana,%20solicito%20ingreso%20urgente%20de%20maquinaria%20a%20taller%20central%20Km%2022."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>Consultar Disponibilidad de Bahía Especial</span>
          </a>
        </div>

      </div>
    </div>,
    document.body
  );
};
