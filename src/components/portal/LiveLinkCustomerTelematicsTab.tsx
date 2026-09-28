import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Thermometer,
  Gauge,
  Compass,
  Layers,
  Search,
  Bell,
  Check,
  Download,
  Share2,
  ExternalLink,
  Info,
  Calendar,
  PhoneCall,
  Navigation,
  FileText,
  TrendingDown,
  Droplet,
  ShieldAlert
} from 'lucide-react';
import { LiveLinkUnit, LiveLinkTelemetrySummary, LiveLinkFaultCode, UserProfile } from '../../types';
import { fetchLiveLinkFleet, fetchLiveLinkSummary, sendLiveLinkCommand } from '../../services/livelinkService';
import { createFullbayOrderFromLiveLink } from '../../services/fullbayService';
import { downloadTelematicsReportPDF } from '../../utils/pdfGenerator';
import { RoutePlaybackModal } from '../telematics/RoutePlaybackModal';
import { IdleTimeProductivityModal } from '../telematics/IdleTimeProductivityModal';
import { FuelTheftProtectionModal } from '../telematics/FuelTheftProtectionModal';
import { BatteryHealthModal } from '../telematics/BatteryHealthModal';
import { FieldServiceDispatchRadarModal } from '../emergency/FieldServiceDispatchRadarModal';
import { GeofenceManagerModal } from '../telematics/GeofenceManagerModal';
import { CarbonFootprintAuditModal } from '../sustainability/CarbonFootprintAuditModal';
import { HydraulicPressureMonitorModal } from '../telematics/HydraulicPressureMonitorModal';
import { RemoteImmobilizerModal } from '../telematics/RemoteImmobilizerModal';
import { DefFluidLevelModal } from '../telematics/DefFluidLevelModal';
import { ImpactGForceMonitorModal } from '../telematics/ImpactGForceMonitorModal';
import { TmdProMemberPointsModal } from '../loyalty/TmdProMemberPointsModal';
import { Leaf, Award } from 'lucide-react';

interface LiveLinkCustomerTelematicsTabProps {
  currentUser: { uid: string; email?: string | null; displayName?: string | null } | null;
  userProfile: UserProfile | null;
  onNavigate: (route: string) => void;
  onOpenServiceTab?: () => void;
}

export const LiveLinkCustomerTelematicsTab: React.FC<LiveLinkCustomerTelematicsTabProps> = ({
  currentUser,
  userProfile,
  onNavigate,
  onOpenServiceTab
}) => {
  const [fleet, setFleet] = useState<LiveLinkUnit[]>([]);
  const [summary, setSummary] = useState<LiveLinkTelemetrySummary | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<LiveLinkUnit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [commandLoading, setCommandLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Filters & Search
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeDetailTab, setActiveDetailTab] = useState<'realtime' | 'temperature' | 'geofence' | 'hours' | 'diagnostics'>('realtime');

  // Geofence Modal State
  const [showGeofenceModal, setShowGeofenceModal] = useState<boolean>(false);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(500);
  const [geofenceName, setGeofenceName] = useState<string>('');
  const [geofenceAlertSpeed, setGeofenceAlertSpeed] = useState<number>(30);
  const [geofenceSaveSuccess, setGeofenceSaveSuccess] = useState<boolean>(false);

  // Sprint 8 Task #49 & #50 Modals State
  const [showRoutePlaybackModal, setShowRoutePlaybackModal] = useState<boolean>(false);
  const [showIdleModal, setShowIdleModal] = useState<boolean>(false);

  // Sprint 9 Task #45, #54 & #81 Modals State
  const [showFuelTheftModal, setShowFuelTheftModal] = useState<boolean>(false);
  const [showBatteryModal, setShowBatteryModal] = useState<boolean>(false);
  const [showDispatchRadarModal, setShowDispatchRadarModal] = useState<boolean>(false);
  const [showCarbonModal, setShowCarbonModal] = useState<boolean>(false);
  const [showHydraulicModal, setShowHydraulicModal] = useState<boolean>(false);
  const [showImmobilizerModal, setShowImmobilizerModal] = useState<boolean>(false);
  const [showDefModal, setShowDefModal] = useState<boolean>(false);
  const [showImpactModal, setShowImpactModal] = useState<boolean>(false);
  const [showPointsModal, setShowPointsModal] = useState<boolean>(false);

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
    }, 12000); // Poll every 12 seconds for real-time telemetry
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
        name: userProfile?.displayName || unit.customerName,
        company: userProfile?.companyName || unit.customerCompany,
        phone: userProfile?.phone || '(809) 560-1234'
      }
    );
    setCommandLoading(false);
    if (res.success) {
      setFeedbackMessage({ 
        type: 'success', 
        text: `¡Orden de servicio #${res.workOrder?.fullbayOrderNumber || 'FB-9021'} enviada exitosamente a Taller Fullbay Km 22!` 
      });
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
    }
  };

  const handleSaveGeofence = () => {
    if (!selectedUnit) return;
    setGeofenceSaveSuccess(true);
    setTimeout(() => {
      setGeofenceSaveSuccess(false);
      setShowGeofenceModal(false);
      setFeedbackMessage({
        type: 'success',
        text: `Geocerca "${geofenceName || selectedUnit.geofenceName}" actualizada (${geofenceRadius}m de radio, límite ${geofenceAlertSpeed} km/h).`
      });
    }, 1000);
  };

  const handleExportTelematicsReport = () => {
    if (!selectedUnit) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Unidad,Marca,VIN,Horómetro (h),Temp Refrigerante (°C),Temp Hidráulico (°C),Nivel Combustible (%),Consumo (L/h),Geocerca,Estado,Ubicación,Fecha\n"
      + `"${selectedUnit.name}","${selectedUnit.brand}","${selectedUnit.vin}",${selectedUnit.horometerHours},${selectedUnit.engineCoolantTempC},${selectedUnit.hydraulicOilTempC},${selectedUnit.fuelLevelPercent},${selectedUnit.fuelConsumptionLph},"${selectedUnit.geofenceName}","${selectedUnit.status}","${selectedUnit.location.address} - ${selectedUnit.location.province}",${new Date().toLocaleString('es-DO')}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telemetria_livelink_${selectedUnit.vin}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFleet = fleet.filter(u => {
    if (filterBrand !== 'all' && u.brand !== filterBrand) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchName = u.name.toLowerCase().includes(term);
      const matchVin = u.vin.toLowerCase().includes(term);
      const matchLoc = u.location.address.toLowerCase().includes(term) || u.location.province.toLowerCase().includes(term);
      const matchGeo = u.geofenceName.toLowerCase().includes(term);
      if (!matchName && !matchVin && !matchLoc && !matchGeo) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* LiveLink Header Banner */}
      <div className="rounded-[5px] bg-zinc-900 p-6 sm:p-8 text-white border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-bold tracking-wide uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>LiveLink™ Telematics Gateway 24/7 (CAN Bus J1939)</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display uppercase">
              Telemetría en Vivo de Flota Activa
            </h1>
            
            <p className="text-sm text-zinc-300 leading-relaxed font-sans">
              Monitoreo satelital continuo de <strong className="text-amber-400">temperatura de motor</strong>, <strong className="text-amber-400">horas de operación efectivas</strong>, y <strong className="text-amber-400">geocercas de seguridad</strong> en canteras, minas y obras en República Dominicana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-display uppercase tracking-wider font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Sincronizando CAN Bus...' : 'Actualizar Señal'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPointsModal(true)}
              className="px-4 py-2.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-display uppercase tracking-wider font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Club Pro-Member</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('#/emergency-dispatch')}
              className="px-4 py-2.5 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-display uppercase tracking-wider font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>S.O.S Auxilio Vial</span>
            </button>
          </div>
        </div>

        {/* Global Fleet Quick Telemetry Metrics */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-zinc-800">
            <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 block font-display uppercase tracking-wider">Flota Total</span>
              <div className="text-xl font-black text-white mt-1 font-mono">{summary.totalUnits} <span className="text-xs font-normal text-zinc-500 font-sans">equipos</span></div>
            </div>

            <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 font-display uppercase tracking-wider">
                <span className="w-2 h-2 rounded-[1px] bg-emerald-500 animate-ping" /> En Operación
              </span>
              <div className="text-xl font-black text-emerald-400 mt-1 font-mono">{summary.runningUnits} <span className="text-xs font-normal text-zinc-500 font-sans">trabajando</span></div>
            </div>

            <div
              onClick={() => setShowIdleModal(true)}
              className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-amber-400/60 transition-colors"
              title="Click para ver auditoría de horas en ralentí vs horas productivas de excavación"
            >
              <span className="text-[11px] font-bold text-amber-400 block font-display uppercase tracking-wider">En Ralentí (Ver)</span>
              <div className="text-xl font-black text-amber-400 mt-1 font-mono">{summary.idleUnits} <span className="text-xs font-normal text-zinc-500 font-sans">en espera</span></div>
            </div>

            <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 block font-display uppercase tracking-wider">Apagados / Taller</span>
              <div className="text-xl font-black text-zinc-300 mt-1 font-mono">{summary.stoppedUnits} <span className="text-xs font-normal text-zinc-500 font-sans">unidades</span></div>
            </div>

            <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 font-display uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Alertas DTC
              </span>
              <div className="text-xl font-black text-rose-400 mt-1 font-mono">{summary.criticalAlertsCount} <span className="text-xs font-normal text-zinc-500 font-sans">críticas</span></div>
            </div>

            <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] font-bold text-cyan-400 block font-display uppercase tracking-wider">Salud CAN Bus</span>
              <div className="text-xl font-black text-cyan-400 mt-1 font-mono">{summary.fleetHealthScore}% <span className="text-xs font-normal text-zinc-500 font-sans">óptima</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Feedback Alert */}
      {feedbackMessage && (
        <div className={`p-4 rounded-[3px] flex items-center gap-3 text-xs sm:text-sm font-bold transition-all animate-in slide-in-from-top-2 font-mono ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main Telematics Layout: Fleet List (Left Aside) + Detail Telemetry Console (Right Main) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Units List & Multi-Filters */}
        <aside className="lg:col-span-4 sticky top-24 self-start space-y-4 max-h-[calc(100vh-7.5rem)] overflow-y-auto scrollbar-thin pr-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[5px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
                  Equipos Conectados ({filteredFleet.length})
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[2px] border border-emerald-500/20">
                <Wifi className="w-3 h-3" /> 4G LTE
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por ficha, modelo, VIN o provincia..."
                className="w-full pl-9 pr-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs font-sans text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Filter Buttons / Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-[2px] px-2.5 py-1.5 text-zinc-300 text-xs font-mono font-bold"
              >
                <option value="all">Todas las Marcas</option>
                <option value="JCB">JCB</option>
                <option value="LiuGong">LiuGong</option>
                <option value="Kubota">Kubota</option>
                <option value="Ammann">Ammann</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-[2px] px-2.5 py-1.5 text-zinc-300 text-xs font-mono font-bold"
              >
                <option value="all">Todos Estados</option>
                <option value="running">En Marcha</option>
                <option value="idle">En Ralentí</option>
                <option value="stopped">Apagados</option>
              </select>
            </div>

            {/* Fleet Unit Cards List */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredFleet.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-[3px]">
                  <p className="text-xs text-zinc-400 font-medium font-sans">No se encontraron unidades con estos filtros.</p>
                </div>
              ) : (
                filteredFleet.map(unit => {
                  const isSelected = selectedUnit?.id === unit.id;
                  const hasDtc = unit.faultCodes && unit.faultCodes.length > 0;
                  const isOverheating = unit.engineCoolantTempC > 95;

                  return (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className={`p-3.5 rounded-[3px] border transition-all cursor-pointer text-left relative ${
                        isSelected 
                          ? 'bg-amber-400/10 border-amber-400/50 shadow-sm' 
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-[1px] shrink-0 ${
                              unit.status === 'running' 
                                ? 'bg-emerald-500 animate-pulse' 
                                : unit.status === 'idle' 
                                  ? 'bg-amber-400' 
                                  : 'bg-zinc-600'
                            }`} />
                            <h4 className="text-xs font-bold text-white truncate">
                              {unit.name}
                            </h4>
                          </div>
                          
                          <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1 font-sans">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            {unit.location.province} &bull; {unit.geofenceName}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {unit.horometerHours} h
                          </span>
                          {hasDtc && (
                            <span className="block mt-1 text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-[2px] border border-rose-500/20">
                              {unit.faultCodes.length} DTC
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Badges Row */}
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                        <span className={`flex items-center gap-1 font-bold ${
                          isOverheating ? 'text-rose-400' : 'text-zinc-300'
                        }`}>
                          <Thermometer className="w-3 h-3" />
                          {unit.engineCoolantTempC}°C
                        </span>

                        <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                          <Fuel className="w-3 h-3 text-amber-400" />
                          {unit.fuelLevelPercent}%
                        </span>

                        <span className={`flex items-center gap-1 font-bold text-[10px] ${
                          unit.geofenceStatus === 'inside' 
                            ? 'text-emerald-400' 
                            : 'text-rose-400 font-black'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {unit.geofenceStatus === 'inside' ? 'En Geocerca' : 'ALERTA PERÍMETRO'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Right Column: Deep Telemetry Console for Selected Machine */}
        <main className="lg:col-span-8 space-y-6">
          {selectedUnit ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-[5px] p-6 sm:p-7 shadow-sm space-y-6">
              
              {/* Top Header of Selected Unit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-[2px] text-xs font-display uppercase tracking-wider font-bold bg-amber-400 text-black">
                      {selectedUnit.brand}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded-[2px] border border-zinc-800">
                      VIN: {selectedUnit.vin}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      S/N: {selectedUnit.serialNumber}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display uppercase">
                    {selectedUnit.name}
                  </h2>

                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 pt-0.5 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{selectedUnit.location.address}, <strong className="text-zinc-300">{selectedUnit.location.province}, RD</strong></span>
                  </p>
                </div>

                {/* Status Badges & Quick Action */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-[2px] border text-xs font-mono font-bold flex items-center gap-2 ${
                    selectedUnit.status === 'running'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : selectedUnit.status === 'idle'
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    <span className="w-2 h-2 rounded-[1px] bg-current animate-pulse" />
                    {selectedUnit.status === 'running' ? 'MOTOR EN MARCHA' : selectedUnit.status === 'idle' ? 'EN ESPERA (RALENTÍ)' : 'MOTOR APAGADO'}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDispatchRadarModal(true)}
                    className="px-2.5 py-1.5 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-bold font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Despachar Unidad Móvil de Auxilio Técnico 4x4 con GPS en Vivo"
                  >
                    <Truck className="w-3.5 h-3.5 text-white" />
                    <span>Auxilio 4x4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRoutePlaybackModal(true)}
                    className="px-2.5 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-400/40 font-bold font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Reproducir Historial Satelital de Rutas (7 Días)"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>Playback GPS (7D)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGeofenceModal(true)}
                    className="px-2.5 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/40 font-bold font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Monitorear Geocercas Poligonales Dinámicas de Obra/Cantera"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Geocercas</span>
                  </button>

                  {/* Task #44: Remote Engine Immobilizer Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowImmobilizerModal(true)}
                    className="px-2.5 py-1.5 rounded-[2px] bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-500/40 font-bold font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Inmovilización Remota Antirrobo de Motor CAN-Bus J1939"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Inmovilizador</span>
                  </button>

                  {/* Task #60: DEF / Urea Monitor Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowDefModal(true)}
                    className="px-2.5 py-1.5 rounded-[2px] bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-500/40 font-bold font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Monitoreo de Nivel de Fluido DEF / Urea y Sistema Anti-Derate"
                  >
                    <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DEF / Urea</span>
                  </button>

                  {/* Task #59: Impact & Rollover G-Force Monitor Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowImpactModal(true)}
                    className="px-2.5 py-1.5 rounded-[2px] bg-amber-950/60 hover:bg-amber-900/80 text-amber-400 border border-amber-500/40 font-bold font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Acelerómetro 3-Ejes: Detección de Choques, Vuelcos y Caja Negra J1939"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Impactos & Vuelco</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadTelematicsReportPDF(selectedUnit)}
                    className="px-2.5 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Exportar Reporte Oficial PDF de Telemetría CAN-Bus"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Reporte PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportTelematicsReport}
                    className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                    title="Exportar Registro CSV"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>

              {/* Sub-Tabs Navigation for Telematics Inspector */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('realtime')}
                  className={`px-3.5 py-1.5 rounded-[2px] text-xs font-display uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'realtime'
                      ? 'bg-amber-400 text-black font-black'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Panel General</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('temperature')}
                  className={`px-3.5 py-1.5 rounded-[2px] text-xs font-display uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'temperature'
                      ? 'bg-amber-400 text-black font-black'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Temperaturas (°C)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('hours')}
                  className={`px-3.5 py-1.5 rounded-[2px] text-xs font-display uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'hours'
                      ? 'bg-amber-400 text-black font-black'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Horas de Operación</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('geofence')}
                  className={`px-3.5 py-1.5 rounded-[2px] text-xs font-display uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'geofence'
                      ? 'bg-amber-400 text-black font-black'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Geocercas RD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('diagnostics')}
                  className={`px-3.5 py-1.5 rounded-[2px] text-xs font-display uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'diagnostics'
                      ? 'bg-amber-400 text-black font-black'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Diagnósticos DTC ({selectedUnit.faultCodes.length})</span>
                </button>
              </div>

              {/* TAB 1: REALTIME DASHBOARD OVERVIEW */}
              {activeDetailTab === 'realtime' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Primary 4 Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Horometer */}
                    <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800">
                      <span className="text-[11px] font-bold text-zinc-400 block font-display uppercase tracking-wider">Horómetro Acumulado</span>
                      <div className="text-2xl font-black text-white mt-1 font-mono">
                        {selectedUnit.horometerHours} <span className="text-xs font-normal text-zinc-500 font-sans">h</span>
                      </div>
                      <div className="mt-2 text-[11px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Próx. Service: {selectedUnit.serviceCountdownHours}h
                      </div>
                    </div>

                    {/* Fuel Level */}
                    <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-zinc-400 block font-display uppercase tracking-wider">Combustible Diésel</span>
                        <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
                          {selectedUnit.fuelLevelPercent}%
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-400 font-mono">
                          Consumo: {selectedUnit.fuelConsumptionLph} L/h
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowFuelTheftModal(true)}
                        className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-1 border-t border-zinc-900"
                        title="Abrir Algoritmo Predictivo y Centinela Antirrobo de Diésel"
                      >
                        <span>Centinela Antirrobo</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Engine Temperature & Hydraulic Pressure */}
                    <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-zinc-400 block font-display uppercase tracking-wider">Temp. Motor & Hidráulico</span>
                        <div className={`text-2xl font-black mt-1 font-mono ${
                          selectedUnit.engineCoolantTempC > 95 ? 'text-rose-400' : 'text-white'
                        }`}>
                          {selectedUnit.engineCoolantTempC}°C
                        </div>
                        <div className="mt-1 text-[11px] text-cyan-400 font-mono">
                          Aceite: {selectedUnit.hydraulicOilTempC}°C &bull; 318 Bar
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowHydraulicModal(true)}
                        className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-1 border-t border-zinc-900"
                        title="Abrir telemetría de presión hidráulica 350 bar y sobreesfuerzo"
                      >
                        <span>Presión 350 Bar</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Battery Voltage */}
                    <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-zinc-400 block font-display uppercase tracking-wider">Batería Alternador</span>
                        <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">
                          {selectedUnit.batteryVoltage} V
                        </div>
                        <div className="mt-1 text-[11px] text-emerald-400 font-mono">
                          DEF / Urea: {selectedUnit.defLevelPercent}%
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 pt-1 border-t border-zinc-900">
                        <button
                          type="button"
                          onClick={() => setShowBatteryModal(true)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          title="Inspeccionar salud del bus eléctrico 24V y alternador"
                        >
                          <span>Diagnóstico 24V</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <span className="text-zinc-700">&bull;</span>
                        <button
                          type="button"
                          onClick={() => setShowDefModal(true)}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          title="Abrir telemetría de urea DEF y protección anti-derate Tier 4F"
                        >
                          <span>DEF Urea</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Geofence & Location Quick Summary */}
                  <div className="p-5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h4 className="text-xs font-black text-white font-display uppercase tracking-wider">
                            Geocerca Activa: {selectedUnit.geofenceName}
                          </h4>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            Coordenadas GPS: Lat {selectedUnit.location.lat.toFixed(4)}, Lng {selectedUnit.location.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGeofenceName(selectedUnit.geofenceName);
                            setShowGeofenceModal(true);
                          }}
                          className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer border border-zinc-700"
                        >
                          Configurar Geocerca
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePingUnit(selectedUnit)}
                          disabled={commandLoading}
                          className="px-3 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                          Pitar / Luces
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remote Engine Lock / Immobilizer */}
                  <div className="p-5 rounded-[3px] bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-black text-white font-display uppercase tracking-wider">
                          Inmovilizador Antirrobo Satelital
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-400 max-w-md font-sans">
                        Corta la inyección de combustible mediante el relé telemático CAN Bus. Bloquea el arranque no autorizado en horarios nocturnos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleImmobilizer(selectedUnit)}
                      disabled={commandLoading}
                      className={`px-4 py-2.5 rounded-[2px] text-xs font-display uppercase tracking-wider font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                        selectedUnit.immobilizerActive 
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md' 
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                      }`}
                    >
                      {selectedUnit.immobilizerActive ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Desactivar Bloqueo de Motor</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Activar Bloqueo Remoto</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: DETAILED TEMPERATURE MONITORING */}
              {activeDetailTab === 'temperature' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="p-4 rounded-[3px] bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 flex items-start gap-3 font-sans">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      Los sensores CAN Bus calibrados para el clima tropical de República Dominicana emiten advertencias tempranas si el refrigerante supera <strong>95°C</strong> o el aceite hidráulico supera <strong>85°C</strong> en condiciones de carga pesada en cantera.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coolant Gauge Card */}
                    <div className="p-5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-rose-400" /> Refrigerante de Motor
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase ${
                          selectedUnit.engineCoolantTempC > 95 ? 'bg-rose-500 text-white' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {selectedUnit.engineCoolantTempC > 95 ? 'ALTA TEMPERATURA' : 'NORMAL'}
                        </span>
                      </div>

                      <div className="text-3xl font-black text-white font-mono">
                        {selectedUnit.engineCoolantTempC}°C
                      </div>

                      {/* Progress Bar Visualizer */}
                      <div className="space-y-1">
                        <div className="w-full bg-zinc-800 h-2.5 rounded-[1px] overflow-hidden flex">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              selectedUnit.engineCoolantTempC > 95 ? 'bg-rose-500' : selectedUnit.engineCoolantTempC > 88 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, (selectedUnit.engineCoolantTempC / 120) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                          <span>0°C (Frío)</span>
                          <span>85°C (Óptimo)</span>
                          <span>110°C (Crítico)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800/80 text-xs text-zinc-400 space-y-1 font-sans">
                        <p className="font-bold text-white font-display uppercase tracking-wider text-[11px]">Diagnóstico Térmico:</p>
                        <p>{selectedUnit.engineCoolantTempC > 95 ? 'Se recomienda limpiar panal de radiador de polvo de cantera e inspeccionar nivel de anticongelante OAT 50/50.' : 'Bomba de agua y termostato operando dentro de tolerancias de fábrica.'}</p>
                      </div>
                    </div>

                    {/* Hydraulic Oil Gauge Card */}
                    <div className="p-5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-cyan-400" /> Aceite Hidráulico Principal
                        </span>
                        <span className="px-2.5 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {selectedUnit.hydraulicOilTempC > 85 ? 'PRECAUCIÓN' : 'NORMAL'}
                        </span>
                      </div>

                      <div className="text-3xl font-black text-white font-mono">
                        {selectedUnit.hydraulicOilTempC}°C
                      </div>

                      {/* Progress Bar Visualizer */}
                      <div className="space-y-1">
                        <div className="w-full bg-zinc-800 h-2.5 rounded-[1px] overflow-hidden flex">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              selectedUnit.hydraulicOilTempC > 85 ? 'bg-amber-400' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${Math.min(100, (selectedUnit.hydraulicOilTempC / 100) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                          <span>20°C</span>
                          <span>65°C (Óptimo)</span>
                          <span>90°C (Límite)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800/80 text-xs text-zinc-400 space-y-1 font-sans">
                        <p className="font-bold text-white font-display uppercase tracking-wider text-[11px]">Salud del Circuito Hidráulico:</p>
                        <p>Viscosidad ISO VG 46/68 estable. Válvulas proporcionales y enfriador de aceite funcionando al 100%.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: OPERATING HOURS & PRODUCTIVITY BREAKDOWN */}
              {activeDetailTab === 'hours' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-xs text-zinc-400 font-display uppercase tracking-wider block">Total Horómetro</span>
                      <div className="text-3xl font-black text-white font-mono mt-1">
                        {selectedUnit.horometerHours} h
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 font-sans">Desde puesta en marcha</p>
                    </div>

                    <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-xs text-emerald-400 font-display uppercase tracking-wider block">Horas Efectivas</span>
                      <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                        {(selectedUnit.horometerHours * 0.78).toFixed(1)} h
                      </div>
                      <p className="text-[11px] text-emerald-400 font-mono font-bold mt-1">78% de Productividad</p>
                    </div>

                    <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-xs text-amber-400 font-display uppercase tracking-wider block">Horas en Ralentí</span>
                      <div className="text-3xl font-black text-amber-400 font-mono mt-1">
                        {(selectedUnit.horometerHours * 0.22).toFixed(1)} h
                      </div>
                      <p className="text-[11px] text-amber-400 font-mono font-bold mt-1">22% en Espera</p>
                      <button
                        type="button"
                        onClick={() => setShowIdleModal(true)}
                        className="mt-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center justify-center gap-1 uppercase tracking-wider cursor-pointer mx-auto"
                      >
                        <span>Auditoría de Desperdicio</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Trigger Banner for Idle Fuel Waste (Sprint 8 Task #50) */}
                  <div className="p-3.5 rounded-[3px] bg-gradient-to-r from-amber-950/30 via-zinc-950 to-zinc-950 border border-amber-400/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-[2px] bg-amber-400 text-black shrink-0">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                          Control de Desperdicio Diésel & Emisiones por Ralentí
                        </h5>
                        <p className="text-[11px] text-zinc-400 font-sans">
                          Calcule el impacto financiero en pesos dominicanos (RD$) y desgaste de intervalos PM-250h.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowIdleModal(true)}
                      className="px-3 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold font-display uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-sm"
                    >
                      Abrir Calculador de Ralentí
                    </button>
                  </div>

                  {/* Sprint 10 Task #96: ISO 14001 Carbon Footprint & Green Efficiency Banner */}
                  <div className="p-3.5 rounded-[3px] bg-gradient-to-r from-emerald-950/30 via-zinc-950 to-zinc-950 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-[2px] bg-emerald-500 text-black shrink-0">
                        <Leaf className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                          Auditoría de Huella de Carbono & Certificado Verde ISO 14001
                        </h5>
                        <p className="text-[11px] text-zinc-400 font-sans">
                          Cálculo oficial de toneladas de CO2 evitadas y retorno financiero conforme al GHG Protocol EPA.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCarbonModal(true)}
                      className="px-3 py-1.5 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black font-display uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-sm"
                    >
                      Auditoría CO2 / ISO 14001
                    </button>
                  </div>

                  {/* Scheduled Service Countdown Bar */}
                  <div className="p-5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-white font-display uppercase tracking-wider">
                          Próximo Mantenimiento Preventivo (PM-500h / PM-1000h)
                        </h4>
                        <p className="text-xs text-zinc-400 font-sans">
                          Horas restantes para cambio de aceite motor 15W40 y kit de filtros OEM:
                        </p>
                      </div>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        {selectedUnit.serviceCountdownHours} horas
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 h-2.5 rounded-[1px] overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full rounded-[1px]"
                        style={{ width: `${Math.max(10, 100 - (selectedUnit.serviceCountdownHours / 500) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 font-mono text-xs">
                      <span className="text-[11px] text-zinc-500">Último servicio: {(selectedUnit.horometerHours - (500 - selectedUnit.serviceCountdownHours)).toFixed(0)}h</span>
                      {onOpenServiceTab && (
                        <button
                          type="button"
                          onClick={onOpenServiceTab}
                          className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-display uppercase tracking-wider"
                        >
                          <span>Ver Historial de Mantenimiento</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GEOFENCES (DOMINICAN GEOFENCING) */}
              {activeDetailTab === 'geofence' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="p-5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
                            {selectedUnit.geofenceName}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 font-sans">
                          Zona de operación registrada en <strong>{selectedUnit.location.province}, República Dominicana</strong>.
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-[2px] text-xs font-mono font-bold uppercase tracking-wider border ${
                        selectedUnit.geofenceStatus === 'inside'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {selectedUnit.geofenceStatus === 'inside' ? '✓ DENTRO DE POLÍGONO' : '⚠ ALERTA DE CRUCE'}
                      </span>
                    </div>

                    {/* Geofence Map Graphic Preview */}
                    <div className="w-full h-48 rounded-[3px] bg-zinc-950 border border-zinc-800 relative overflow-hidden flex items-center justify-center p-4">
                      {/* Grid Lines simulation */}
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      {/* Perimeter Circle */}
                      <div className="w-36 h-36 rounded-full border-2 border-dashed border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center animate-pulse relative">
                        <span className="text-[10px] font-mono text-emerald-400 absolute top-2 font-bold">Radio 500m</span>
                        
                        {/* Machine Pin */}
                        <div className="w-8 h-8 rounded-[2px] bg-amber-400 text-black flex items-center justify-center shadow-lg font-black text-xs z-10">
                          <Navigation className="w-4 h-4 fill-current" />
                        </div>
                      </div>

                      {/* Map Badges */}
                      <div className="absolute bottom-3 left-3 bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-[2px] border border-zinc-700 text-[10px] text-zinc-300 font-mono">
                        GPS: {selectedUnit.location.lat.toFixed(4)}, {selectedUnit.location.lng.toFixed(4)}
                      </div>

                      <div className="absolute top-3 right-3 bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-[2px] border border-zinc-700 text-[10px] text-zinc-300 font-mono font-bold">
                        Límite Obra: 25 km/h
                      </div>
                    </div>

                    {/* Geofence Parameters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-display uppercase tracking-wider block">Radio Permitido</span>
                        <span className="text-sm font-bold text-white mt-0.5 font-mono">500 metros</span>
                      </div>
                      <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-display uppercase tracking-wider block">Horario de Operación</span>
                        <span className="text-sm font-bold text-white mt-0.5 font-mono">06:00 - 19:00</span>
                      </div>
                      <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-display uppercase tracking-wider block">Alerta por WhatsApp</span>
                        <span className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">Activada</span>
                      </div>
                      <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-display uppercase tracking-wider block">Último Reporte</span>
                        <span className="text-sm font-bold text-white mt-0.5 font-mono">Hace 2 min</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setGeofenceName(selectedUnit.geofenceName);
                        setShowGeofenceModal(true);
                      }}
                      className="w-full py-2.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-display uppercase tracking-wider font-bold text-xs transition-colors cursor-pointer border border-zinc-700"
                    >
                      Editar Parámetros de Geocerca o Crear Nuevo Polígono
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: DTC DIAGNOSTIC CODES & FULLBAY INTEGRATION */}
              {activeDetailTab === 'diagnostics' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Códigos de Falla Telemática (J1939 CAN Bus)
                    </h3>
                    <span className="text-xs font-mono text-zinc-400">
                      SAE J1939 / ISO 15765
                    </span>
                  </div>

                  {selectedUnit.faultCodes && selectedUnit.faultCodes.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUnit.faultCodes.map((fc, idx) => (
                        <div 
                          key={idx}
                          className="p-5 rounded-[3px] border border-rose-500/40 bg-rose-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-[2px] font-mono text-xs font-black bg-rose-500 text-white">
                                {fc.code}
                              </span>
                              <span className="text-xs font-mono font-bold text-zinc-400">
                                Sistema: {fc.system}
                              </span>
                            </div>
                            <p className="text-xs font-sans text-rose-300">
                              {fc.description}
                            </p>
                            <p className="text-[11px] text-zinc-500 font-mono">
                              Detectado: {new Date(fc.timestamp).toLocaleString('es-DO')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDispatchFullbay(selectedUnit, fc.code, fc.description)}
                              disabled={commandLoading}
                              className="px-4 py-2.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-display uppercase tracking-wider font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Despachar Taller Fullbay</span>
                            </button>

                            <a
                              href={`https://wa.me/18095601234?text=${encodeURIComponent(`Hola TMD Dominicana, mi equipo ${selectedUnit.name} (VIN: ${selectedUnit.vin}) presenta la falla telemática ${fc.code}: ${fc.description}. Solicito asistencia técnica.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                              title="Consultar por WhatsApp"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-[3px] border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs font-semibold flex items-center gap-3 font-sans">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>
                        Sin códigos DTC activos en la ECU. La transmisión CAN Bus opera dentro de todas las tolerancias de fábrica OEM.
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[5px] text-zinc-400 p-8 text-center bg-zinc-900">
              <Activity className="w-12 h-12 text-zinc-600 mb-3" />
              <p className="text-sm font-bold text-zinc-300 font-display uppercase tracking-wider">Selecciona un equipo de la lista izquierda</p>
              <p className="text-xs text-zinc-500 mt-1 font-sans">Podrás inspeccionar temperaturas en tiempo real, horómetro y geocercas activas.</p>
            </div>
          )}
        </main>

      </div>

      {/* Task #43: Dynamic Polygonal Geofence Manager Modal */}
      <GeofenceManagerModal
        isOpen={showGeofenceModal}
        onClose={() => setShowGeofenceModal(false)}
      />

      {/* Route Playback 7-Day GPS Modal (Sprint 8 Task #49) */}
      <RoutePlaybackModal
        isOpen={showRoutePlaybackModal}
        onClose={() => setShowRoutePlaybackModal(false)}
        unit={selectedUnit}
      />

      {/* Idle Time & Fuel Waste Analytics Modal (Sprint 8 Task #50) */}
      <IdleTimeAnalyticsModal
        isOpen={showIdleModal}
        onClose={() => setShowIdleModal(false)}
        unit={selectedUnit}
      />

      {/* Fuel Theft Protection & Night Sentry Modal (Sprint 9 Task #45) */}
      <FuelTheftProtectionModal
        isOpen={showFuelTheftModal}
        onClose={() => setShowFuelTheftModal(false)}
        unit={selectedUnit}
      />

      {/* 24V Electrical Bus & Battery Health Modal (Sprint 9 Task #54) */}
      <BatteryHealthModal
        isOpen={showBatteryModal}
        onClose={() => setShowBatteryModal(false)}
        unit={selectedUnit}
      />

      {/* 4x4 Mobile Field Rescue Dispatch Radar Modal (Sprint 9 Task #81) */}
      <FieldServiceDispatchRadarModal
        isOpen={showDispatchRadarModal}
        onClose={() => setShowDispatchRadarModal(false)}
        targetUnit={selectedUnit}
      />

      {/* Task #96: ISO 14001 Carbon Footprint Audit Modal */}
      <CarbonFootprintAuditModal
        isOpen={showCarbonModal}
        onClose={() => setShowCarbonModal(false)}
      />

      {/* Task #53: 350 Bar Hydraulic Pressure & Rock Overload Monitor Modal */}
      <HydraulicPressureMonitorModal
        isOpen={showHydraulicModal}
        onClose={() => setShowHydraulicModal(false)}
        unit={selectedUnit}
      />

      {/* Task #44: Remote Engine Immobilizer Anti-Theft Modal */}
      <RemoteImmobilizerModal
        isOpen={showImmobilizerModal}
        onClose={() => setShowImmobilizerModal(false)}
        machineName={selectedUnit?.name}
        machineSerial={selectedUnit?.serialNumber}
        currentLocation={selectedUnit?.location ? `${selectedUnit.location.address}, ${selectedUnit.location.province}` : undefined}
      />

      {/* Task #50: J1939 Idle vs Productive Hours & Fuel Waste Audit Modal */}
      <IdleTimeProductivityModal
        isOpen={showIdleModal}
        onClose={() => setShowIdleModal(false)}
        machineName={selectedUnit?.name}
        machineSerial={selectedUnit?.serialNumber}
        totalEngineHours={selectedUnit?.operatingHours}
      />

      {/* Task #60: DEF Fluid (Urea) & Anti-Derate Monitor Modal */}
      <DefFluidLevelModal
        isOpen={showDefModal}
        onClose={() => setShowDefModal(false)}
        machineName={selectedUnit?.name}
        machineSerial={selectedUnit?.serialNumber}
      />

      {/* Task #59: Impact & Rollover G-Force Black Box Modal */}
      <ImpactGForceMonitorModal
        isOpen={showImpactModal}
        onClose={() => setShowImpactModal(false)}
        machineName={selectedUnit?.name}
        machineSerial={selectedUnit?.serialNumber}
      />

      {/* Task #69: TMD Pro-Member Rewards & Points Modal */}
      <TmdProMemberPointsModal
        isOpen={showPointsModal}
        onClose={() => setShowPointsModal(false)}
        contractorName={userProfile?.companyName || 'Constructora Dominicana S.R.L.'}
        rnc={userProfile?.rnc || '1-01-02412-2'}
      />

    </div>
  );
};
