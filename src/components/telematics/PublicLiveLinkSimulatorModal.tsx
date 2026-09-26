import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Radio, 
  Activity, 
  Gauge, 
  Fuel, 
  Thermometer, 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  Wrench, 
  Lock, 
  Unlock, 
  DollarSign, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Sparkles, 
  Zap, 
  BatteryCharging, 
  Clock,
  Compass,
  ArrowRight
} from 'lucide-react';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface PublicLiveLinkSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (route: string) => void;
  defaultMachineModel?: string;
}

interface SimulatedMachine {
  id: string;
  name: string;
  brand: 'JCB' | 'LiuGong';
  type: string;
  vin: string;
  engineRpm: number;
  engineHours: number;
  idleHours: number;
  fuelLevel: number;
  fuelRatePerHour: number;
  defLevel: number;
  coolantTemp: number;
  oilPressure: number;
  batteryVoltage: number;
  locationName: string;
  geofenceRadius: number;
  status: 'working' | 'idle' | 'warning';
}

const SIMULATED_FLEET: SimulatedMachine[] = [
  {
    id: 'sim-jcb-3cx',
    name: 'JCB 3CX Eco 4x4 Plus',
    brand: 'JCB',
    type: 'Retroexcavadora',
    vin: 'JCB3CX-DOM-2026-8841',
    engineRpm: 1850,
    engineHours: 1248.6,
    idleHours: 242.0,
    fuelLevel: 74,
    fuelRatePerHour: 6.8,
    defLevel: 82,
    coolantTemp: 87,
    oilPressure: 3.8,
    batteryVoltage: 24.4,
    locationName: 'Circunvalación Los Alcarrizos, Santo Domingo Oeste',
    geofenceRadius: 400,
    status: 'working'
  },
  {
    id: 'sim-liugong-922e',
    name: 'LiuGong 922E HD Cummins',
    brand: 'LiuGong',
    type: 'Excavadora sobre Orugas',
    vin: 'LG922E-DOM-2026-1029',
    engineRpm: 1920,
    engineHours: 2150.4,
    idleHours: 490.5,
    fuelLevel: 62,
    fuelRatePerHour: 14.5,
    defLevel: 75,
    coolantTemp: 89,
    oilPressure: 4.1,
    batteryVoltage: 24.6,
    locationName: 'Cantera Minera Pueblo Viejo, Cotuí',
    geofenceRadius: 800,
    status: 'working'
  },
  {
    id: 'sim-jcb-js220',
    name: 'JCB JS220 LC Heavy Duty',
    brand: 'JCB',
    type: 'Excavadora 22 Toneladas',
    vin: 'JS220-DOM-2026-4432',
    engineRpm: 900,
    engineHours: 850.2,
    idleHours: 180.0,
    fuelLevel: 88,
    fuelRatePerHour: 4.2,
    defLevel: 90,
    coolantTemp: 82,
    oilPressure: 3.5,
    batteryVoltage: 24.2,
    locationName: 'Expansión Puerto Multimodal Caucedo, Boca Chica',
    geofenceRadius: 600,
    status: 'idle'
  }
];

export const PublicLiveLinkSimulatorModal: React.FC<PublicLiveLinkSimulatorModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  defaultMachineModel
}) => {
  const [selectedMachine, setSelectedMachine] = useState<SimulatedMachine>(() => {
    if (defaultMachineModel?.toLowerCase().includes('liugong')) {
      return SIMULATED_FLEET[1];
    }
    return SIMULATED_FLEET[0];
  });

  const [activeDtc, setActiveDtc] = useState<{
    code: string;
    description: string;
    severity: 'critical' | 'warning';
    suggestedAction: string;
  } | null>(null);

  const [immobilizerActive, setImmobilizerActive] = useState<boolean>(false);
  const [hornPinged, setHornPinged] = useState<boolean>(false);

  if (!isOpen || typeof document === 'undefined') return null;

  // Economic calculations in RD$
  const DIESEL_PRICE_DOP_PER_GAL = 242; // Precio promedio gasoil óptimo en RD
  const idleGallons = selectedMachine.idleHours * (selectedMachine.fuelRatePerHour * 0.264172 * 0.45);
  const idleCostDop = idleGallons * DIESEL_PRICE_DOP_PER_GAL;

  const handleTriggerDtc = (type: 'oil' | 'fuel_water') => {
    if (type === 'oil') {
      setActiveDtc({
        code: 'SPN 100 FMI 1',
        description: 'Presión de aceite de motor por debajo del umbral mínimo de seguridad (2.1 bar)',
        severity: 'critical',
        suggestedAction: 'Parada inmediata sugerida. Despacho urgente de kit de filtros y aceite 15W40 desde Km 22.'
      });
    } else {
      setActiveDtc({
        code: 'SPN 97 FMI 3',
        description: 'Agua detectada en sedimentador primario de combustible diésel',
        severity: 'warning',
        suggestedAction: 'Drenar trampa de agua antes del próximo encendido para proteger inyectores Common Rail.'
      });
    }
  };

  const handleClearDtc = () => {
    setActiveDtc(null);
  };

  const handlePingHorn = () => {
    setHornPinged(true);
    setTimeout(() => setHornPinged(false), 3000);
  };

  const handleWhatsAppDispatch = () => {
    const text = encodeURIComponent(
      `Hola TMD Dominicana, estoy probando el simulador LiveLink del equipo ${selectedMachine.name} (VIN: ${selectedMachine.vin}). Me interesa cotizar este equipo con telemetría satelital incluida.`
    );
    window.open(`https://wa.me/18095608484?text=${text}`, '_blank');
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-[5px] shadow-2xl overflow-hidden text-zinc-100 my-auto font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP ACCENT STRIP */}
        <div className="h-1 w-full bg-amber-400" />

        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-start sm:items-center justify-between gap-4 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/20">
                  Simulador Interactivo de Telemetría
                </span>
                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline uppercase">
                  ISO 15143-3 / AEMP 2.0 CAN-Bus
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white uppercase mt-0.5 tracking-tight">
                JCB LiveLink™ & LiuGong Telematics en Vivo
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* MACHINE SELECTOR PILL DOCK */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Seleccionar Unidad de Demostración en República Dominicana:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SIMULATED_FLEET.map((machine) => {
                const isSelected = selectedMachine.id === machine.id;
                return (
                  <button
                    key={machine.id}
                    type="button"
                    onClick={() => {
                      setSelectedMachine(machine);
                      setActiveDtc(null);
                    }}
                    className={`p-3 rounded-[2px] border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-950 border-amber-400 text-white shadow-xs'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {machine.brand}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        machine.status === 'working' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                      }`} />
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-white mt-0.5 truncate uppercase">
                      {machine.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                      {machine.vin}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* REALTIME CAN-BUS GAUGES GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Horometer */}
            <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
                <span>Horómetro</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                {selectedMachine.engineHours.toFixed(1)} <span className="text-xs font-normal text-zinc-400">h</span>
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                {selectedMachine.idleHours.toFixed(1)}h en ralentí
              </span>
            </div>

            {/* RPM */}
            <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
                <span>Régimen Motor</span>
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                {selectedMachine.engineRpm} <span className="text-xs font-normal text-zinc-400">RPM</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5 uppercase">
                {selectedMachine.engineRpm > 1200 ? 'En producción' : 'Ralentí'}
              </span>
            </div>

            {/* Fuel Level & Rate */}
            <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
                <span>Combustible</span>
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                {selectedMachine.fuelLevel}% <span className="text-xs font-normal text-zinc-400">{selectedMachine.fuelRatePerHour} L/h</span>
              </div>
              <div className="w-full bg-zinc-800 h-1 rounded-[1px] mt-1.5 overflow-hidden">
                <div 
                  className={`h-full ${selectedMachine.fuelLevel > 20 ? 'bg-amber-400' : 'bg-red-500'}`} 
                  style={{ width: `${selectedMachine.fuelLevel}%` }}
                />
              </div>
            </div>

            {/* Oil Pressure */}
            <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
                <span>Presión Aceite</span>
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                {activeDtc?.code.includes('100') ? '1.9' : selectedMachine.oilPressure} <span className="text-xs font-normal text-zinc-400">bar</span>
              </div>
              <span className={`text-[10px] font-semibold block mt-0.5 uppercase ${
                activeDtc?.code.includes('100') ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-400'
              }`}>
                {activeDtc?.code.includes('100') ? 'Baja Presión' : 'Presión Óptima'}
              </span>
            </div>

            {/* Coolant Temp */}
            <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
                <span>Temp. Agua</span>
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                {selectedMachine.coolantTemp}°C
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Rango normal 80-92°C
              </span>
            </div>

            {/* Battery Voltage */}
            <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
                <span>Alternador</span>
                <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                {selectedMachine.batteryVoltage} <span className="text-xs font-normal text-zinc-400">V</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5 uppercase">
                Sistema 24V HD
              </span>
            </div>
          </div>

          {/* INTERACTIVE DTC FAULT SIMULATOR & WORKSHOP BRIDGE */}
          <div className="p-4 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Simulador de Diagnóstico CAN-Bus & Alertas de Falla DTC</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                  Prueba cómo el sistema LiveLink detecta anomalías en obra y las reporta directamente al taller central Km 22:
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleTriggerDtc('oil')}
                  className="px-2.5 py-1 rounded-[2px] bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Simular Falla Crítica (Aceite)
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerDtc('fuel_water')}
                  className="px-2.5 py-1 rounded-[2px] bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-400 text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Simular Alerta (Agua en Diésel)
                </button>
                {activeDtc && (
                  <button
                    type="button"
                    onClick={handleClearDtc}
                    className="px-2.5 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase transition-all cursor-pointer"
                  >
                    Restablecer
                  </button>
                )}
              </div>
            </div>

            {activeDtc ? (
              <div className="p-3.5 rounded-[2px] bg-red-950/40 border border-red-500/40 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                    <span className="font-mono font-bold text-xs text-red-400 uppercase">
                      {activeDtc.code} • {activeDtc.severity === 'critical' ? 'PARADA CRÍTICA' : 'ADVERTENCIA TÉCNICA'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Detectado en CAN-Bus ECU #001
                  </span>
                </div>
                <p className="text-xs text-zinc-200 font-medium font-sans">
                  {activeDtc.description}
                </p>
                <div className="text-[11px] text-amber-300/90 bg-amber-400/10 p-2 rounded-[2px] border border-amber-400/20 font-sans">
                  <span className="font-bold uppercase font-mono">Acción Recomendada TMD:</span> {activeDtc.suggestedAction}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://wa.me/18095608484?text=${encodeURIComponent(
                      `ALERTA TALLER TMD: Código ${activeDtc.code} en ${selectedMachine.name} (VIN ${selectedMachine.vin}) en ${selectedMachine.locationName}. Solicito asistencia técnica.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Despachar Mecánico Fullbay 24/7 vía WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-400 font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Todos los módulos electrónicos reportan parámetros normales. Cero códigos activos de falla DTC.</span>
              </div>
            )}
          </div>

          {/* TWO COLUMNS: GEOLOCATION / GEOFENCE & FUEL IDLE LOSS ECONOMIC CALCULATOR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* GEOLOCATION & REMOTE CONTROLS */}
            <div className="p-4 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Ubicación GPS Satelital & Geocerca en RD</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-[2px] border border-emerald-500/20 uppercase">
                  GPS Activo 4G/Sat
                </span>
              </div>

              <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-xs font-bold text-zinc-200 uppercase">
                  {selectedMachine.locationName}
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Radio Geocerca: {selectedMachine.geofenceRadius}m</span>
                  <span className="text-emerald-400 uppercase">Dentro de zona segura</span>
                </div>
              </div>

              {/* Remote Commands Simulation */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Comandos Telemáticos Remotos:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImmobilizerActive(!immobilizerActive)}
                    className={`p-2 rounded-[2px] border text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      immobilizerActive
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    {immobilizerActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{immobilizerActive ? 'Inmovilizador ACTIVO' : 'Inmovilizar Motor'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePingHorn}
                    className="p-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Radio className={`w-3.5 h-3.5 text-amber-400 ${hornPinged ? 'animate-ping' : ''}`} />
                    <span>{hornPinged ? '¡Bocina y Luces Sonando!' : 'Localizar en Cantera'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FUEL & IDLE LOSS ECONOMIC CALCULATOR */}
            <div className="p-4 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Impacto Económico de Tiempos Muertos (RD$)</span>
                </h4>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/20 uppercase">
                  Gasoil Óptimo RD$ 242/gal
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase block">Horas Ralentí Inútil</span>
                  <span className="text-sm sm:text-base font-bold text-white font-mono">
                    {selectedMachine.idleHours.toFixed(0)} horas
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    {((selectedMachine.idleHours / selectedMachine.engineHours) * 100).toFixed(1)}% del tiempo total
                  </span>
                </div>

                <div className="p-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase block">Costo Diésel Desperdiciado</span>
                  <span className="text-sm sm:text-base font-bold text-amber-400 font-mono">
                    RD$ {idleCostDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    ~USD ${(idleCostDop / USD_TO_DOP_RATE).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-[2px] bg-amber-400/10 border border-amber-400/20 text-[11px] text-amber-200 leading-relaxed font-sans">
                💡 <span className="font-bold">Ahorro con LiveLink™:</span> Al detectar operadores que dejan el motor encendido al almorzar o esperar camiones, los contratistas en RD reducen hasta un 18% en gastos operativos de combustible al mes.
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-400">
            <span className="text-white font-bold uppercase">LiveLink™ incluido sin costo</span> por 5 años en compra de equipos JCB y LiuGong con TMD Dominicana.
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleWhatsAppDispatch}
              className="px-3.5 py-1.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Cotizar con Telemetría</span>
            </button>

            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('#/portal');
                }}
                className="px-3.5 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Ir a Portal Clientes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
