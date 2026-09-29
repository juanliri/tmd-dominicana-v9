import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  MapPin, 
  AlertTriangle, 
  Fuel, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Radio, 
  Wrench, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  Sliders, 
  ChevronRight,
  Truck,
  Volume2,
  VolumeX,
  Volume1
} from 'lucide-react';
import { LiveLinkUnit, LiveLinkTelemetrySummary } from '../../types';
import { fetchLiveLinkFleet, fetchLiveLinkSummary, sendLiveLinkCommand } from '../../services/livelinkService';
import { createFullbayOrderFromLiveLink } from '../../services/fullbayService';
import { industrialCabinAudio } from '../../utils/industrialAudio';

interface Props {
  onOpenFullbayWorkOrder?: (orderId?: string) => void;
}

export const LiveLinkTelematicsDashboard: React.FC<Props> = ({ onOpenFullbayWorkOrder }) => {
  const [fleet, setFleet] = useState<LiveLinkUnit[]>([]);
  const [summary, setSummary] = useState<LiveLinkTelemetrySummary | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<LiveLinkUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commandLoading, setCommandLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => industrialCabinAudio.getMuted());

  const loadData = async () => {
    try {
      const [units, sum] = await Promise.all([
        fetchLiveLinkFleet(),
        fetchLiveLinkSummary()
      ]);
      setFleet(units);
      setSummary(sum);
      if (units.length > 0 && !selectedUnit) {
        setSelectedUnit(units[0]);
      } else if (selectedUnit) {
        const updated = units.find(u => u.id === selectedUnit.id);
        if (updated) setSelectedUnit(updated);
      }
    } catch (e) {
      console.error('Error loading LiveLink telematics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 15000); // 15s poll
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleImmobilizer = async (unit: LiveLinkUnit) => {
    setCommandLoading(true);
    setFeedbackMessage(null);
    const res = await sendLiveLinkCommand(unit.id, 'toggle_immobilizer');
    setCommandLoading(false);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: res.message });
      industrialCabinAudio.playAlarm('warning');
      loadData();
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
    }
  };

  const handlePingUnit = async (unit: LiveLinkUnit) => {
    setCommandLoading(true);
    setFeedbackMessage(null);
    const res = await sendLiveLinkCommand(unit.id, 'ping_horn_lights');
    setCommandLoading(false);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: res.message });
      industrialCabinAudio.playAlarm('chime');
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
    }
  };

  const handleDispatchFullbay = async (unit: LiveLinkUnit, faultCode: string, desc: string) => {
    setCommandLoading(true);
    setFeedbackMessage(null);
    const res = await createFullbayOrderFromLiveLink(
      unit.id,
      faultCode,
      desc,
      {
        id: unit.id,
        name: unit.customerName,
        company: unit.customerCompany,
        phone: '(809) 560-1234'
      }
    );
    setCommandLoading(false);
    if (res.success) {
      setFeedbackMessage({ 
        type: 'success', 
        text: `¡Orden ${res.workOrder?.fullbayOrderNumber || ''} enviada al Taller Fullbay Km 22!` 
      });
      if (onOpenFullbayWorkOrder && res.workOrder?.id) {
        setTimeout(() => {
          onOpenFullbayWorkOrder(res.workOrder?.id);
        }, 1200);
      }
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
    }
  };

  const filteredFleet = fleet.filter(u => {
    if (filterBrand !== 'all' && u.brand !== filterBrand) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    return true;
  });

  return (
    <div id="livelink-telematics-root" className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-[5px] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold tracking-wider uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              JCB LIVELINK™ GATEWAY 24/7 • CONEXIÓN CAN BUS J1939
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-wider font-display">
              TELEMETRÍA DE FLOTA & DIAGNÓSTICO IOT DOMINICANA
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl font-mono uppercase">
              Monitoreo satelital en tiempo real de horómetros, combustible, códigos de falla DTC J1939 y geocercas activas en obras nacionales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cabin Audio Toggle (Task #48) */}
            <button
              onClick={() => {
                const nextMuted = industrialCabinAudio.toggleMute();
                setIsAudioMuted(nextMuted);
                if (!nextMuted) {
                  industrialCabinAudio.playAlarm('chime');
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-[3px] border font-mono font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                isAudioMuted 
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300' 
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
              }`}
              title={isAudioMuted ? 'Activar alarmas sonoras de cabina (Web Audio API)' : 'Silenciar alarmas de cabina'}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
              <span>{isAudioMuted ? 'CABINA: MUTE' : 'SONIDO CABINA'}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-mono font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'SINCRONIZANDO...' : 'ACTUALIZAR'}
            </button>
            <button
              onClick={() => onOpenFullbayWorkOrder && onOpenFullbayWorkOrder()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-mono font-black uppercase text-xs tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Wrench className="w-3.5 h-3.5 text-black" />
              TALLER FULLBAY
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-5 border-t border-zinc-800/80 font-mono">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">UNIDADES EN FLOTA</span>
              <div className="text-lg font-black text-white mt-1 font-display">{summary.totalUnits} EQUIPOS</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3">
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> EN OPERACIÓN
              </span>
              <div className="text-lg font-black text-emerald-400 mt-1 font-display">{summary.runningUnits} ACTIVOS</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">RALENTÍ (IDLE)</span>
              <div className="text-lg font-black text-amber-400 mt-1 font-display">{summary.idleUnits}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">DETENIDOS / TALLER</span>
              <div className="text-lg font-black text-zinc-300 mt-1 font-display">{summary.stoppedUnits}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3">
              <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 uppercase">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> ALERTAS DTC
              </span>
              <div className="text-lg font-black text-rose-400 mt-1 font-display">{summary.criticalAlertsCount} CRÍTICAS</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">SALUD DE FLOTA</span>
              <div className="text-lg font-black text-amber-400 mt-1 font-display">{summary.fleetHealthScore}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className={`p-3.5 rounded-[4px] flex items-center gap-3 text-xs font-mono font-bold uppercase transition-all ${
          feedbackMessage.type === 'success' 
            ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/30' 
            : 'bg-zinc-900 text-rose-400 border border-rose-500/30'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Machine List & Machine Detail Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Fleet Selector & Filters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[5px] p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
              <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 font-display">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                UNIDADES CONECTADAS ({filteredFleet.length})
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <select
                  value={filterBrand}
                  onChange={e => setFilterBrand(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-[3px] px-2 py-1 text-zinc-300 uppercase focus:outline-none focus:border-amber-500"
                >
                  <option value="all">TODAS LAS MARCAS</option>
                  <option value="JCB">JCB</option>
                  <option value="LiuGong">LIUGONG</option>
                  <option value="Kubota">KUBOTA</option>
                  <option value="Ammann">AMMANN</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-[3px] px-2 py-1 text-zinc-300 uppercase focus:outline-none focus:border-amber-500"
                >
                  <option value="all">TODOS ESTADOS</option>
                  <option value="running">EN OPERACIÓN</option>
                  <option value="idle">RALENTÍ</option>
                  <option value="stopped">DETENIDOS</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredFleet.map(unit => {
                const isSelected = selectedUnit?.id === unit.id;
                const hasDtc = unit.faultCodes && unit.faultCodes.length > 0;

                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className={`p-3.5 rounded-[4px] border transition-all cursor-pointer text-left relative ${
                      isSelected 
                        ? 'bg-zinc-900 border-amber-500 ring-1 ring-amber-500/30' 
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            unit.status === 'running' 
                              ? 'bg-emerald-400 animate-pulse' 
                              : unit.status === 'idle' 
                                ? 'bg-amber-400' 
                                : 'bg-zinc-600'
                          }`} />
                          <h3 className="text-xs font-bold text-white uppercase">
                            {unit.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono uppercase mt-0.5">
                          {unit.customerCompany} • {unit.location.province}
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-amber-400">
                          {unit.horometerHours} h
                        </span>
                        {hasDtc && (
                          <span className="block mt-1 text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-[2px] uppercase">
                            {unit.faultCodes.length} DTC
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800 font-mono uppercase">
                      <span className="flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-amber-400" />
                        {unit.fuelLevelPercent}% DIÉSEL
                      </span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        PRÓX: {unit.serviceCountdownHours}H
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Machine Telemetry & Diagnostics Control */}
        <div className="lg:col-span-7">
          {selectedUnit ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-[5px] p-5 sm:p-6 shadow-sm space-y-6 text-white">
              
              {/* Top Unit Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold bg-amber-500 text-black uppercase">
                      {selectedUnit.brand}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      VIN: {selectedUnit.vin}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider mt-1 font-display">
                    {selectedUnit.name}
                  </h2>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1 font-mono uppercase">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {selectedUnit.location.address} ({selectedUnit.location.province}, RD)
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-[3px] border text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 ${
                    selectedUnit.status === 'running'
                      ? 'bg-zinc-900 text-emerald-400 border-emerald-500/40'
                      : selectedUnit.status === 'idle'
                        ? 'bg-zinc-900 text-amber-400 border-amber-500/40'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {selectedUnit.status === 'running' ? 'MOTOR EN MARCHA' : selectedUnit.status === 'idle' ? 'EN ESPERA (RALENTÍ)' : 'MOTOR APAGADO'}
                  </div>
                </div>
              </div>

              {/* Gauges & Telemetry Readouts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="bg-zinc-900 p-3.5 rounded-[3px] border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-bold uppercase">HORÓMETRO TOTAL</span>
                  <div className="text-lg font-black text-white mt-1">
                    {selectedUnit.horometerHours} <span className="text-[10px] text-zinc-500">HRS</span>
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-400 font-bold uppercase">
                    PRÓX: {selectedUnit.serviceCountdownHours}H
                  </div>
                </div>

                <div className="bg-zinc-900 p-3.5 rounded-[3px] border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-bold uppercase">COMBUSTIBLE DIÉSEL</span>
                  <div className="text-lg font-black text-amber-400 mt-1">
                    {selectedUnit.fuelLevelPercent}%
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-400 uppercase">
                    CONSUMO: {selectedUnit.fuelConsumptionLph} L/H
                  </div>
                </div>

                <div className="bg-zinc-900 p-3.5 rounded-[3px] border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-bold uppercase">TEMP. REFRIGERANTE</span>
                  <div className={`text-lg font-black mt-1 ${
                    selectedUnit.engineCoolantTempC > 95 ? 'text-rose-400' : 'text-white'
                  }`}>
                    {selectedUnit.engineCoolantTempC}°C
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-400 uppercase">
                    HIDRÁULICO: {selectedUnit.hydraulicOilTempC}°C
                  </div>
                </div>

                <div className="bg-zinc-900 p-3.5 rounded-[3px] border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-bold uppercase">BATERÍA & CAN BUS</span>
                  <div className="text-lg font-black text-amber-400 mt-1">
                    {selectedUnit.batteryVoltage} V
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-400 font-bold uppercase">
                    DEF: {selectedUnit.defLevelPercent}%
                  </div>
                </div>
              </div>

              {/* Geofence & Security Module */}
              <div className="bg-zinc-900 p-4 rounded-[4px] border border-zinc-800 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-white font-display">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    GEOCERCA Y PROTECCIÓN ANTIRROBO GPS
                  </div>
                  <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-zinc-950 text-emerald-400 border border-zinc-800 uppercase">
                    {selectedUnit.geofenceName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-[11px] text-zinc-400">
                    COORDENADAS: LAT {selectedUnit.location.lat.toFixed(4)}, LNG {selectedUnit.location.lng.toFixed(4)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePingUnit(selectedUnit)}
                      disabled={commandLoading}
                      className="px-3 py-1.5 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer border border-zinc-700"
                    >
                      PITAR / LUCES
                    </button>
                    <button
                      onClick={() => handleToggleImmobilizer(selectedUnit)}
                      disabled={commandLoading}
                      className={`px-3 py-1.5 rounded-[3px] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer ${
                        selectedUnit.immobilizerActive 
                          ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {selectedUnit.immobilizerActive ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          DESBLOQUEAR MOTOR
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          BLOQUEO REMOTO MOTOR
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* DTC Diagnostic Codes & 1-Click Fullbay Bridge */}
              <div className="space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 font-display">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    CÓDIGOS DE DIAGNÓSTICO TELEMÁTICO (J1939 CAN BUS)
                  </h3>
                  <button
                    onClick={() => industrialCabinAudio.playAlarm('critical')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer self-start sm:self-auto"
                    title="Emitir tono piezoeléctrico de alarma crítica de cabina"
                  >
                    <Volume1 className="w-3 h-3" />
                    <span>PROBAR ALARMA ACÚSTICA CABINA</span>
                  </button>
                </div>

                {selectedUnit.faultCodes && selectedUnit.faultCodes.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUnit.faultCodes.map((fc, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-[4px] border border-rose-500/30 bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-[2px] font-mono text-[11px] font-black bg-rose-500 text-white uppercase">
                              {fc.code}
                            </span>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase">
                              SISTEMA: {fc.system}
                            </span>
                          </div>
                          <p className="text-xs text-rose-300">
                            {fc.description}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDispatchFullbay(selectedUnit, fc.code, fc.description)}
                          disabled={commandLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow shrink-0 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5 text-black" />
                          DESPACHAR FULLBAY
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-[4px] border border-zinc-800 bg-zinc-900 text-emerald-400 text-xs font-bold uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    SIN CÓDIGOS DE FALLA ACTIVOS. CAN BUS OPERANDO DENTRO DE TOLERANCIAS OEM.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-zinc-800 rounded-[5px] text-zinc-500 text-xs font-mono uppercase bg-zinc-950">
              SELECCIONE UN EQUIPO PARA INSPECCIONAR TELEMETRÍA
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
