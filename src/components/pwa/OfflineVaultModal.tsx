import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  X, 
  Search, 
  BookOpen, 
  Cpu, 
  ShieldCheck, 
  Wrench, 
  FileText, 
  Sliders, 
  Layers, 
  AlertTriangle, 
  Flame, 
  Fuel, 
  HardHat, 
  Settings, 
  Database,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { 
  CRITICAL_TECHNICAL_DATASHEETS, 
  CRITICAL_PARTS_MANUALS, 
  TechnicalDatasheet, 
  PartsTechnicalManual 
} from '../../services/offlineVaultService';

export const OfflineVaultModal: React.FC = () => {
  const {
    isOnline,
    isSimulatedOffline,
    effectiveOnline,
    toggleSimulatedOffline,
    syncState,
    syncProgress,
    syncStatusLabel,
    vaultState,
    isVaultModalOpen,
    closeVaultModal,
    syncAllTechnicalVault,
    clearVaultCache
  } = useOfflineSync();

  const [activeTab, setActiveTab] = useState<'datasheets' | 'manuals' | 'storage'>('datasheets');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDatasheet, setSelectedDatasheet] = useState<TechnicalDatasheet>(CRITICAL_TECHNICAL_DATASHEETS[0]);
  const [selectedManual, setSelectedManual] = useState<PartsTechnicalManual>(CRITICAL_PARTS_MANUALS[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isVaultModalOpen || typeof document === 'undefined') return null;

  const filteredDatasheets = CRITICAL_TECHNICAL_DATASHEETS.filter((ds) => {
    const matchBrand = selectedBrand === 'all' || ds.brand === selectedBrand;
    const matchQuery = !searchQuery.trim() || 
      ds.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.keys(ds.criticalTorques).some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ds.criticalParts.some(p => p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchBrand && matchQuery;
  });

  const filteredManuals = CRITICAL_PARTS_MANUALS.filter((m) => {
    return !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.targetEquipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.crossReferenceTable && m.crossReferenceTable.some(row => 
        row.oemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.donaldson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.fleetguard.toLowerCase().includes(searchQuery.toLowerCase())
      ));
  });

  const handleCopySpecs = (title: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(title);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-6xl max-h-[92vh] bg-zinc-900 text-zinc-100 rounded-[5px] border border-zinc-800 shadow-2xl flex flex-col overflow-hidden font-mono">
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-amber-400" />
        
        {/* Top Header & Real-Time Sync Status Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  Bóveda Técnica PWA para Minas & Campo
                </h2>
                <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  effectiveOnline 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-400/20 text-amber-400 border border-amber-400/30 animate-pulse'
                }`}>
                  {effectiveOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {effectiveOnline ? 'Online (Sincronizado)' : 'Modo Mina Activo (Offline)'}
                </span>
                {isSimulatedOffline && (
                  <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Simulación Activa
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                Acceso completo sin conexión a torques, presiones hidráulicas, matrices de filtración y manuales de taller.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Simulation Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleSimulatedOffline}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSimulatedOffline 
                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/50' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
              }`}
              title="Permite probar la navegación sin señal directamente en el navegador"
            >
              {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5 text-purple-400" /> : <Wifi className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{isSimulatedOffline ? 'Salir de Modo Mina' : 'Simular Sin Señal'}</span>
            </button>

            {/* Precache All Action Button */}
            <button
              type="button"
              onClick={syncAllTechnicalVault}
              disabled={syncState === 'syncing'}
              className="px-3.5 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncState === 'syncing' ? 'Precargando...' : 'Sincronizar Bóveda'}</span>
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={closeVaultModal}
              className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer text-xs uppercase"
              aria-label="Cerrar bóveda técnica"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Progress Bar if actively syncing */}
        {syncState === 'syncing' && (
          <div className="px-5 py-2 bg-amber-400/10 border-b border-amber-400/30 text-xs font-bold text-amber-300 space-y-1">
            <div className="flex items-center justify-between uppercase">
              <span>{syncStatusLabel}</span>
              <span>{syncProgress}%</span>
            </div>
            <div className="w-full bg-zinc-950 rounded-[1px] h-1 overflow-hidden">
              <div 
                className="bg-amber-400 h-1 transition-all duration-200"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Sync State Metrics Strip */}
        <div className="px-4 sm:px-6 py-2.5 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-zinc-400 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" /> {vaultState.cachedDatasheetsCount} Fichas Maquinaria
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold uppercase">
              <BookOpen className="w-3.5 h-3.5" /> {vaultState.cachedPartsManualsCount} Manuales & Torques
            </span>
            <span className="text-zinc-500 uppercase">
              Caché: <strong className="text-zinc-300 font-mono">{vaultState.totalCacheSizeMb}</strong>
            </span>
            <span className="text-zinc-500 uppercase">
              Último Sync: <strong className="text-zinc-300 font-mono">{vaultState.lastSyncDate}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-zinc-400">Service Worker v19.4 Activo</span>
          </div>
        </div>

        {/* Navigation Tabs & Search Controls */}
        <div className="p-3 sm:p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-[2px] border border-zinc-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('datasheets')}
              className={`px-3 py-1.5 rounded-[2px] uppercase transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'datasheets' 
                  ? 'bg-amber-400 text-black font-bold shadow-xs' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Fichas Técnicas ({CRITICAL_TECHNICAL_DATASHEETS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manuals')}
              className={`px-3 py-1.5 rounded-[2px] uppercase transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'manuals' 
                  ? 'bg-amber-400 text-black font-bold shadow-xs' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Manuales & Torques ({CRITICAL_PARTS_MANUALS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-1.5 rounded-[2px] uppercase transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'storage' 
                  ? 'bg-amber-400 text-black font-bold shadow-xs' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Almacenamiento PWA</span>
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar torque, bomba, código OEM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Content View Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: MACHINERY TECHNICAL DATASHEETS */}
          {activeTab === 'datasheets' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Brand Filter + Machinery List */}
              <div className="lg:col-span-4 space-y-3">
                {/* Brand Filter Badges */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold uppercase">
                  {['all', 'JCB', 'LiuGong', 'Kubota', 'LS Tractor', 'AFEX', 'Ammann'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBrand(b)}
                      className={`px-2.5 py-1 rounded-[2px] transition-colors whitespace-nowrap cursor-pointer ${
                        selectedBrand === b 
                          ? 'bg-amber-400 text-black font-bold shadow-xs' 
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {b === 'all' ? 'Todas' : b}
                    </button>
                  ))}
                </div>

                {/* Machines List */}
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredDatasheets.map((ds) => (
                    <div
                      key={ds.id}
                      onClick={() => setSelectedDatasheet(ds)}
                      className={`p-3 rounded-[2px] border transition-all cursor-pointer space-y-1 ${
                        selectedDatasheet.id === ds.id
                          ? 'bg-zinc-950 border-amber-400 text-white shadow-xs'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold uppercase bg-zinc-900 text-amber-400 border border-amber-400/20">
                          {ds.brand} • {ds.category}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Offline OK
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase">{ds.model}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 font-sans">{ds.tagline}</p>
                    </div>
                  ))}
                  {filteredDatasheets.length === 0 && (
                    <div className="p-6 text-center text-zinc-500 text-xs">
                      No se encontraron fichas para "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: In-Depth Technical Datasheet Viewer */}
              <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-[2px] p-4 sm:p-5 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase bg-amber-400 text-black">
                        {selectedDatasheet.brand}
                      </span>
                      <span className="text-xs text-zinc-400 font-bold uppercase">
                        {selectedDatasheet.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider mt-1">
                      {selectedDatasheet.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                      {selectedDatasheet.tagline}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySpecs('all', JSON.stringify(selectedDatasheet, null, 2))}
                    className="px-2.5 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700 uppercase"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copiedKey === 'all' ? '¡Copiado!' : 'Copiar Ficha'}</span>
                  </button>
                </div>

                {/* Engine & Hydraulics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Engine Specs */}
                  <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5 tracking-wider">
                      <Flame className="w-3.5 h-3.5" /> Especificaciones de Motor
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-zinc-800">
                        <span className="text-zinc-500 uppercase">Modelo:</span>
                        <span className="font-bold text-white font-mono">{selectedDatasheet.engineSpecs.engineModel}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-800">
                        <span className="text-zinc-500 uppercase">Potencia Neta:</span>
                        <span className="font-bold text-amber-400 font-mono">{selectedDatasheet.engineSpecs.powerHp} ({selectedDatasheet.engineSpecs.powerKw})</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-800">
                        <span className="text-zinc-500 uppercase">Cilindrada:</span>
                        <span className="font-bold text-white font-mono">{selectedDatasheet.engineSpecs.displacement}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-800">
                        <span className="text-zinc-500 uppercase">Consumo Estimado:</span>
                        <span className="font-bold text-white font-mono">{selectedDatasheet.engineSpecs.fuelConsumptionAvg}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-500 uppercase">Tanque Diésel:</span>
                        <span className="font-bold text-white font-mono">{selectedDatasheet.engineSpecs.fuelTankCapacity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hydraulic Specs */}
                  <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5 tracking-wider">
                      <Wrench className="w-3.5 h-3.5" /> Circuito Hidráulico & Bombas
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-zinc-800">
                        <span className="text-zinc-500 uppercase">Bomba Principal:</span>
                        <span className="font-bold text-white font-mono">{selectedDatasheet.hydraulicSpecs.mainPump}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-800">
                        <span className="text-zinc-500 uppercase">Caudal Máximo:</span>
                        <span className="font-bold text-amber-400 font-mono">{selectedDatasheet.hydraulicSpecs.maxFlow}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-800">
                        <span className="text-zinc-500 uppercase">Presión de Alivio (MRV):</span>
                        <span className="font-bold text-white font-mono">{selectedDatasheet.hydraulicSpecs.systemPressure}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-800">
                        <span className="text-zinc-500 uppercase">Presión Pilotaje:</span>
                        <span className="font-bold text-white font-mono">{selectedDatasheet.hydraulicSpecs.pilotPressure}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-500 uppercase">Capacidad Aceite:</span>
                        <span className="font-bold text-white font-mono">{selectedDatasheet.hydraulicSpecs.hydraulicTankCapacity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critical Torques Table */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5" /> Pares de Apriete & Torques Críticos en Taller
                  </h4>
                  <div className="rounded-[2px] border border-zinc-800 overflow-hidden divide-y divide-zinc-800 text-xs">
                    {Object.entries(selectedDatasheet.criticalTorques).map(([item, val]) => (
                      <div key={item} className="p-2.5 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-zinc-300">{item}</span>
                        <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/20">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fluid Capacities & Critical Parts Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fluid Capacities */}
                  <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5 tracking-wider">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" /> Capacidades de Fluidos
                    </h4>
                    <div className="space-y-1 text-xs">
                      {Object.entries(selectedDatasheet.fluidCapacities).map(([fluid, cap]) => (
                        <div key={fluid} className="flex justify-between py-0.5 text-zinc-400">
                          <span className="text-zinc-500 uppercase">{fluid}:</span>
                          <span className="font-bold text-zinc-200 font-mono">{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Critical Parts OEM */}
                  <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5 tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-amber-400" /> Repuestos Críticos Recomendados
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {selectedDatasheet.criticalParts.map((part) => (
                        <div key={part.partNumber} className="flex items-center justify-between p-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-[11px]">
                          <div>
                            <span className="font-mono font-bold text-amber-400">{part.partNumber}</span>
                            <span className="text-zinc-400 ml-1.5 font-sans">{part.description}</span>
                          </div>
                          {part.crossReference && (
                            <span className="text-[10px] text-zinc-500 font-mono">{part.crossReference}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preventive Maintenance Checkpoints */}
                <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">
                    Intervalos de Mantenimiento Preventivo (PM Program)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {selectedDatasheet.maintenanceIntervals.map((interval) => (
                      <div key={interval.hours} className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-1">
                        <span className="text-xs font-bold text-amber-400 uppercase font-mono">{interval.hours}</span>
                        <ul className="list-disc list-inside text-zinc-400 text-[11px] space-y-0.5 font-sans">
                          {interval.tasks.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKSHOP MANUALS & HYDRAULIC SCHEMATICS */}
          {activeTab === 'manuals' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Manuals List */}
              <div className="lg:col-span-4 space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredManuals.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedManual(m)}
                    className={`p-3 rounded-[2px] border transition-all cursor-pointer space-y-1 ${
                      selectedManual.id === m.id
                        ? 'bg-zinc-950 border-amber-400 text-white shadow-xs'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold uppercase bg-zinc-900 text-amber-400 border border-amber-400/20">
                        {m.system}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">{m.fileSize}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase">{m.title}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 font-sans">{m.overview}</p>
                  </div>
                ))}
              </div>

              {/* Right Column: Manual Detailed Content & Cross-Reference Table */}
              <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-[2px] p-4 sm:p-5 space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase bg-amber-400 text-black">
                      {selectedManual.system}
                    </span>
                    <span className="text-xs text-zinc-400 font-bold uppercase">
                      Equipos: {selectedManual.targetEquipment}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider mt-1">
                    {selectedManual.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 font-sans">
                    {selectedManual.overview}
                  </p>
                </div>

                {/* Cross-Reference Table if available */}
                {selectedManual.crossReferenceTable && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                      Matriz Cruzada de Equivalencias Directas
                    </h4>
                    <div className="rounded-[2px] border border-zinc-800 overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-900 text-zinc-400 text-[10px] uppercase font-bold border-b border-zinc-800">
                          <tr>
                            <th className="p-2.5">Código OEM</th>
                            <th className="p-2.5 text-amber-400">Donaldson</th>
                            <th className="p-2.5 text-cyan-400">Fleetguard</th>
                            <th className="p-2.5 text-emerald-400">Baldwin</th>
                            <th className="p-2.5">Aplicación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 font-mono">
                          {selectedManual.crossReferenceTable.map((row, idx) => (
                            <tr key={idx} className="bg-zinc-950 hover:bg-zinc-900 transition-colors">
                              <td className="p-2.5 font-bold text-white">{row.oemCode}</td>
                              <td className="p-2.5 font-bold text-amber-400">{row.donaldson}</td>
                              <td className="p-2.5 text-zinc-300">{row.fleetguard}</td>
                              <td className="p-2.5 text-zinc-300">{row.baldwin}</td>
                              <td className="p-2.5 font-sans text-zinc-400 text-[11px]">{row.application}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Diagnostic & Technical Steps */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                    Protocolo de Diagnóstico & Medición en Campo
                  </h4>
                  <div className="space-y-1.5">
                    {selectedManual.diagnosticSteps.map((step, idx) => (
                      <div key={idx} className="p-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-300">
                        <span className="w-4 h-4 rounded-[1px] bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed font-sans">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schematics & Safety Ratings */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                    Componentes Críticos & Parámetros Nominales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedManual.schematicDetails.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white uppercase">{item.component}</span>
                          <span className="font-mono font-bold text-amber-400">{item.specValue}</span>
                        </div>
                        <p className="text-[11px] text-rose-400 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{item.safetyWarning}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE & SERVICE WORKER HEALTH */}
          {activeTab === 'storage' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="p-5 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[2px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/30">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Desglose de Almacenamiento Local (PWA Cache)
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">
                      Capacidad total utilizada para almacenar fichas de maquinaria pesada, manuales de torque y app shell.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Fichas Técnicas</span>
                    <div className="text-lg font-bold text-amber-400 font-mono">{vaultState.cachedDatasheetsCount}</div>
                    <span className="text-[10px] text-zinc-400">JCB, LiuGong, Kubota, LS</span>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Manuales & Torques</span>
                    <div className="text-lg font-bold text-emerald-400 font-mono">{vaultState.cachedPartsManualsCount}</div>
                    <span className="text-[10px] text-zinc-400">Hidráulica y Filtración</span>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tamaño en Disco</span>
                    <div className="text-lg font-bold text-white font-mono">{vaultState.totalCacheSizeMb}</div>
                    <span className="text-[10px] text-emerald-400 uppercase">100% Disponible Offline</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Estrategia de Caché Service Worker v19.4</h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] font-sans">
                    <li><strong className="text-zinc-200 font-mono">Cache-First</strong> para fichas técnicas, diagramas de torques y esquemas hidráulicos.</li>
                    <li><strong className="text-zinc-200 font-mono">Stale-While-Revalidate</strong> para imágenes de maquinaria y fuentes de Google.</li>
                    <li><strong className="text-zinc-200 font-mono">IndexedDB / LocalStorage</strong> de contingencia ante navegadores con almacenamiento restringido.</li>
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={syncAllTechnicalVault}
                    className="px-3.5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Forzar Actualización de Bóveda</span>
                  </button>

                  <button
                    type="button"
                    onClick={clearVaultCache}
                    className="px-3.5 py-2 rounded-[2px] bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar Caché Local</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-zinc-400 uppercase tracking-wider">
          <span>
            Bóveda técnica certificada para operaciones mineras en Pueblo Viejo Cotuí, Falcondo Bonao y proyectos viales sin señal.
          </span>
          <span className="font-bold text-amber-400 font-mono">TMD PWA Ready</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
