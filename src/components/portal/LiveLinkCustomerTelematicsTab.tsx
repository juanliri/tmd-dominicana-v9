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
  FileText
} from 'lucide-react';
import { LiveLinkUnit, LiveLinkTelemetrySummary, LiveLinkFaultCode, UserProfile } from '../../types';
import { fetchLiveLinkFleet, fetchLiveLinkSummary, sendLiveLinkCommand } from '../../services/livelinkService';
import { createFullbayOrderFromLiveLink } from '../../services/fullbayService';

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
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-neutral-900 to-amber-950 p-6 sm:p-8 text-white border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wide uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Fase 16 &bull; LiveLink™ Telematics Gateway 24/7 (CAN Bus J1939)</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Telemetría en Vivo de Flota Activa
            </h1>
            
            <p className="text-sm text-zinc-300 leading-relaxed">
              Monitoreo satelital continuo de <strong className="text-amber-400">temperatura de motor</strong>, <strong className="text-amber-400">horas de operación efectivas</strong>, y <strong className="text-amber-400">geocercas de seguridad</strong> en canteras, minas y obras en República Dominicana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Sincronizando CAN Bus...' : 'Actualizar Señal'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('#/emergency-dispatch')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>S.O.S Auxilio Vial</span>
            </button>
          </div>
        </div>

        {/* Global Fleet Quick Telemetry Metrics */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Flota Total</span>
              <div className="text-xl font-black text-white mt-1">{summary.totalUnits} <span className="text-xs font-normal text-zinc-400">equipos</span></div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> En Operación
              </span>
              <div className="text-xl font-black text-emerald-400 mt-1">{summary.runningUnits} <span className="text-xs font-normal text-zinc-400">trabajando</span></div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wider">En Ralentí</span>
              <div className="text-xl font-black text-amber-400 mt-1">{summary.idleUnits} <span className="text-xs font-normal text-zinc-400">en espera</span></div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Apagados / Taller</span>
              <div className="text-xl font-black text-zinc-300 mt-1">{summary.stoppedUnits} <span className="text-xs font-normal text-zinc-400">unidades</span></div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Alertas DTC
              </span>
              <div className="text-xl font-black text-rose-400 mt-1">{summary.criticalAlertsCount} <span className="text-xs font-normal text-zinc-400">críticas</span></div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-bold text-cyan-400 block uppercase tracking-wider">Salud CAN Bus</span>
              <div className="text-xl font-black text-cyan-400 mt-1">{summary.fleetHealthScore}% <span className="text-xs font-normal text-zinc-400">óptima</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Feedback Alert */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold transition-all animate-in slide-in-from-top-2 ${
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Equipos Conectados ({filteredFleet.length})
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Wifi className="w-3 h-3" /> 4G LTE
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por ficha, modelo, VIN o provincia..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Filter Buttons / Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 text-xs font-bold"
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
                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 text-xs font-bold"
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
                <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
                  <p className="text-xs text-zinc-400 font-medium">No se encontraron unidades con estos filtros.</p>
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
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-500 dark:bg-amber-500/15 shadow-sm' 
                          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/80 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              unit.status === 'running' 
                                ? 'bg-emerald-500 animate-pulse' 
                                : unit.status === 'idle' 
                                  ? 'bg-amber-500' 
                                  : 'bg-zinc-500'
                            }`} />
                            <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate">
                              {unit.name}
                            </h4>
                          </div>
                          
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            {unit.location.province} &bull; {unit.geofenceName}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                            {unit.horometerHours} h
                          </span>
                          {hasDtc && (
                            <span className="block mt-1 text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">
                              {unit.faultCodes.length} DTC
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Badges Row */}
                      <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-[11px]">
                        <span className={`flex items-center gap-1 font-bold ${
                          isOverheating ? 'text-rose-500' : 'text-zinc-600 dark:text-zinc-300'
                        }`}>
                          <Thermometer className="w-3 h-3" />
                          {unit.engineCoolantTempC}°C
                        </span>

                        <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-semibold">
                          <Fuel className="w-3 h-3 text-amber-500" />
                          {unit.fuelLevelPercent}%
                        </span>

                        <span className={`flex items-center gap-1 font-bold text-[10px] ${
                          unit.geofenceStatus === 'inside' 
                            ? 'text-emerald-500' 
                            : 'text-rose-500 font-black'
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
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              
              {/* Top Header of Selected Unit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-500 text-black">
                      {selectedUnit.brand}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      VIN: {selectedUnit.vin}
                    </span>
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      S/N: {selectedUnit.serialNumber}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {selectedUnit.name}
                  </h2>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{selectedUnit.location.address}, <strong>{selectedUnit.location.province}, RD</strong></span>
                  </p>
                </div>

                {/* Status Badges & Quick Action */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 ${
                    selectedUnit.status === 'running'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : selectedUnit.status === 'idle'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {selectedUnit.status === 'running' ? 'MOTOR EN MARCHA' : selectedUnit.status === 'idle' ? 'EN ESPERA (RALENTÍ)' : 'MOTOR APAGADO'}
                  </div>

                  <button
                    type="button"
                    onClick={handleExportTelematicsReport}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                    title="Exportar Registro CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Tabs Navigation for Telematics Inspector */}
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('realtime')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'realtime'
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Panel General</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('temperature')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'temperature'
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Temperaturas (°C)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('hours')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'hours'
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Horas de Operación</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('geofence')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'geofence'
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Geocercas RD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('diagnostics')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'diagnostics'
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Horómetro Acumulado</span>
                      <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1 font-mono">
                        {selectedUnit.horometerHours} <span className="text-xs font-semibold text-zinc-400">h</span>
                      </div>
                      <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Próx. Service: {selectedUnit.serviceCountdownHours}h
                      </div>
                    </div>

                    {/* Fuel Level */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Combustible Diésel</span>
                      <div className="text-2xl font-black text-amber-500 mt-1 font-mono">
                        {selectedUnit.fuelLevelPercent}%
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold">
                        Consumo: {selectedUnit.fuelConsumptionLph} L/hora
                      </div>
                    </div>

                    {/* Engine Temperature */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Temp. Refrigerante</span>
                      <div className={`text-2xl font-black mt-1 font-mono ${
                        selectedUnit.engineCoolantTempC > 95 ? 'text-rose-500' : 'text-zinc-900 dark:text-white'
                      }`}>
                        {selectedUnit.engineCoolantTempC}°C
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold">
                        Hidráulico: {selectedUnit.hydraulicOilTempC}°C
                      </div>
                    </div>

                    {/* Battery Voltage */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Batería Alternador</span>
                      <div className="text-2xl font-black text-cyan-500 mt-1 font-mono">
                        {selectedUnit.batteryVoltage} V
                      </div>
                      <div className="mt-2 text-[11px] text-emerald-500 font-bold">
                        DEF / Urea: {selectedUnit.defLevelPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Geofence & Location Quick Summary */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-50 to-amber-500/5 dark:from-zinc-800/50 dark:to-amber-500/10 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <div>
                          <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                            Geocerca Activa: {selectedUnit.geofenceName}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
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
                          className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          Configurar Geocerca
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePingUnit(selectedUnit)}
                          disabled={commandLoading}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                        >
                          Pitar / Luces
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remote Engine Lock / Immobilizer */}
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                          Inmovilizador Antirrobo Satelital
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                        Corta la inyección de combustible mediante el relé telemático CAN Bus. Bloquea el arranque no autorizado en horarios nocturnos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleImmobilizer(selectedUnit)}
                      disabled={commandLoading}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                        selectedUnit.immobilizerActive 
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md' 
                          : 'bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 text-white'
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
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Los sensores CAN Bus calibrados para el clima tropical de República Dominicana emiten advertencias tempranas si el refrigerante supera <strong>95°C</strong> o el aceite hidráulico supera <strong>85°C</strong> en condiciones de carga pesada en cantera.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coolant Gauge Card */}
                    <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-rose-500" /> Refrigerante de Motor
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          selectedUnit.engineCoolantTempC > 95 ? 'bg-rose-500 text-white' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {selectedUnit.engineCoolantTempC > 95 ? 'ALTA TEMPERATURA' : 'NORMAL'}
                        </span>
                      </div>

                      <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono">
                        {selectedUnit.engineCoolantTempC}°C
                      </div>

                      {/* Progress Bar Visualizer */}
                      <div className="space-y-1">
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              selectedUnit.engineCoolantTempC > 95 ? 'bg-rose-500' : selectedUnit.engineCoolantTempC > 88 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (selectedUnit.engineCoolantTempC / 120) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                          <span>0°C (Frío)</span>
                          <span>85°C (Óptimo)</span>
                          <span>110°C (Crítico)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                        <p className="font-bold text-zinc-900 dark:text-white">Diagnóstico Térmico:</p>
                        <p>{selectedUnit.engineCoolantTempC > 95 ? 'Se recomienda limpiar panal de radiador de polvo de cantera e inspeccionar nivel de anticongelante OAT 50/50.' : 'Bomba de agua y termostato operando dentro de tolerancias de fábrica.'}</p>
                      </div>
                    </div>

                    {/* Hydraulic Oil Gauge Card */}
                    <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-cyan-500" /> Aceite Hidráulico Principal
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500">
                          {selectedUnit.hydraulicOilTempC > 85 ? 'PRECAUCIÓN' : 'NORMAL'}
                        </span>
                      </div>

                      <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono">
                        {selectedUnit.hydraulicOilTempC}°C
                      </div>

                      {/* Progress Bar Visualizer */}
                      <div className="space-y-1">
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              selectedUnit.hydraulicOilTempC > 85 ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, (selectedUnit.hydraulicOilTempC / 100) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                          <span>20°C</span>
                          <span>65°C (Óptimo)</span>
                          <span>90°C (Límite)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                        <p className="font-bold text-zinc-900 dark:text-white">Salud del Circuito Hidráulico:</p>
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
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 text-center">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase">Total Horómetro</span>
                      <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono mt-1">
                        {selectedUnit.horometerHours} h
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Desde puesta en marcha</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 text-center">
                      <span className="text-xs text-emerald-500 font-bold uppercase">Horas Efectivas de Trabajo</span>
                      <div className="text-3xl font-black text-emerald-500 font-mono mt-1">
                        {(selectedUnit.horometerHours * 0.78).toFixed(1)} h
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">78% de Productividad</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 text-center">
                      <span className="text-xs text-amber-500 font-bold uppercase">Horas en Ralentí (Idle)</span>
                      <div className="text-3xl font-black text-amber-500 font-mono mt-1">
                        {(selectedUnit.horometerHours * 0.22).toFixed(1)} h
                      </div>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">22% en Espera de Camión</p>
                    </div>
                  </div>

                  {/* Scheduled Service Countdown Bar */}
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                          Próximo Mantenimiento Preventivo (PM-500h / PM-1000h)
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Horas restantes para cambio de aceite motor 15W40 y kit de 5 filtros OEM:
                        </p>
                      </div>
                      <span className="text-lg font-black text-amber-500 font-mono">
                        {selectedUnit.serviceCountdownHours} horas
                      </span>
                    </div>

                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${Math.max(10, 100 - (selectedUnit.serviceCountdownHours / 500) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-500">Último servicio: {(selectedUnit.horometerHours - (500 - selectedUnit.serviceCountdownHours)).toFixed(0)}h</span>
                      {onOpenServiceTab && (
                        <button
                          type="button"
                          onClick={onOpenServiceTab}
                          className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
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
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                            {selectedUnit.geofenceName}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Zona de operación registrada en <strong>{selectedUnit.location.province}, República Dominicana</strong>.
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                        selectedUnit.geofenceStatus === 'inside'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {selectedUnit.geofenceStatus === 'inside' ? '✓ DENTRO DE POLÍGONO' : '⚠ ALERTA DE CRUCE'}
                      </span>
                    </div>

                    {/* Geofence Map Graphic Preview */}
                    <div className="w-full h-48 rounded-2xl bg-zinc-950 border border-zinc-800 relative overflow-hidden flex items-center justify-center p-4">
                      {/* Grid Lines simulation */}
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      {/* Perimeter Circle */}
                      <div className="w-36 h-36 rounded-full border-2 border-dashed border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center animate-pulse relative">
                        <span className="text-[10px] font-mono text-emerald-400 absolute top-2 font-bold">Radio 500m</span>
                        
                        {/* Machine Pin */}
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg font-black text-xs z-10">
                          <Navigation className="w-4 h-4 fill-current" />
                        </div>
                      </div>

                      {/* Map Badges */}
                      <div className="absolute bottom-3 left-3 bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-700 text-[10px] text-zinc-300 font-mono">
                        GPS: {selectedUnit.location.lat.toFixed(4)}, {selectedUnit.location.lng.toFixed(4)}
                      </div>

                      <div className="absolute top-3 right-3 bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-700 text-[10px] text-zinc-300 font-bold">
                        Límite Obra: 25 km/h
                      </div>
                    </div>

                    {/* Geofence Parameters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-bold block">Radio Permitido</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-white mt-0.5">500 metros</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-bold block">Horario de Operación</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-white mt-0.5">06:00 - 19:00</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-bold block">Alerta por WhatsApp</span>
                        <span className="text-sm font-black text-emerald-500 mt-0.5">Activada</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-bold block">Último Reporte Satelital</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-white mt-0.5">Hace 2 min</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setGeofenceName(selectedUnit.geofenceName);
                        setShowGeofenceModal(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
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
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Códigos de Falla Telemática (J1939 CAN Bus)
                    </h3>
                    <span className="text-xs font-bold text-zinc-500">
                      Protocolo: SAE J1939 / ISO 15765
                    </span>
                  </div>

                  {selectedUnit.faultCodes && selectedUnit.faultCodes.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUnit.faultCodes.map((fc, idx) => (
                        <div 
                          key={idx}
                          className="p-5 rounded-2xl border border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-black bg-rose-500 text-white">
                                {fc.code}
                              </span>
                              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                Sistema: {fc.system}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                              {fc.description}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              Detectado: {new Date(fc.timestamp).toLocaleString('es-DO')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDispatchFullbay(selectedUnit, fc.code, fc.description)}
                              disabled={commandLoading}
                              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Despachar Taller Fullbay</span>
                            </button>

                            <a
                              href={`https://wa.me/18095601234?text=${encodeURIComponent(`Hola TMD Dominicana, mi equipo ${selectedUnit.name} (VIN: ${selectedUnit.vin}) presenta la falla telemática ${fc.code}: ${fc.description}. Solicito asistencia técnica.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                              title="Consultar por WhatsApp"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 text-xs font-semibold flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>
                        Sin códigos DTC activos en la ECU. La transmisión CAN Bus opera dentro de todas las tolerancias de fábrica OEM.
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl text-zinc-400 p-8 text-center">
              <Activity className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
              <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Selecciona un equipo de la lista izquierda</p>
              <p className="text-xs text-zinc-400 mt-1">Podrás inspeccionar temperaturas en tiempo real, horómetro y geocercas activas.</p>
            </div>
          )}
        </main>

      </div>

      {/* Geofence Configuration Modal */}
      {showGeofenceModal && selectedUnit && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  Configurar Geocerca Satelital
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGeofenceModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre del Proyecto / Obra / Cantera
                </label>
                <input
                  type="text"
                  value={geofenceName}
                  onChange={e => setGeofenceName(e.target.value)}
                  placeholder="Ej. Cantera Baní - Tramo Sur"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Radio del Perímetro de Seguridad ({geofenceRadius} metros)
                </label>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={geofenceRadius}
                  onChange={e => setGeofenceRadius(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>200m (Obra puntual)</span>
                  <span>1,500m (Cantera mediana)</span>
                  <span>5,000m (Tramo vial)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Alerta por Exceso de Velocidad en Obra ({geofenceAlertSpeed} km/h)
                </label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={geofenceAlertSpeed}
                  onChange={e => setGeofenceAlertSpeed(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300">
                Al salir del polígono, LiveLink™ enviará automáticamente una notificación SMS/WhatsApp al maestro de obra y al supervisor de patio.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowGeofenceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveGeofence}
                disabled={geofenceSaveSuccess}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow cursor-pointer"
              >
                {geofenceSaveSuccess ? 'Guardando...' : 'Guardar Geocerca'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
