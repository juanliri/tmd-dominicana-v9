import React, { useState } from 'react';
import { 
  WifiOff, 
  Wifi, 
  Download, 
  BookOpen, 
  FileText, 
  Search, 
  CheckCircle2, 
  Wrench, 
  ShieldCheck, 
  HardHat, 
  Cpu, 
  Sparkles,
  RefreshCw,
  FolderDown,
  Flame,
  Fuel,
  Settings,
  AlertTriangle,
  Copy,
  Layers
} from 'lucide-react';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { TMDLogo } from '../common/BrandLogos';
import { 
  CRITICAL_TECHNICAL_DATASHEETS, 
  CRITICAL_PARTS_MANUALS, 
  TechnicalDatasheet, 
  PartsTechnicalManual 
} from '../../services/offlineVaultService';

export const OfflinePartsDocsManager: React.FC = () => {
  const { 
    effectiveOnline, 
    isSimulatedOffline, 
    toggleSimulatedOffline,
    syncState, 
    syncProgress,
    syncStatusLabel, 
    vaultState, 
    syncAllTechnicalVault, 
    openVaultModal 
  } = useOfflineSync();

  const [mainTab, setMainTab] = useState<'machinery' | 'manuals'>('machinery');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedDatasheet, setSelectedDatasheet] = useState<TechnicalDatasheet>(CRITICAL_TECHNICAL_DATASHEETS[0]);
  const [selectedManual, setSelectedManual] = useState<PartsTechnicalManual>(CRITICAL_PARTS_MANUALS[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredDatasheets = CRITICAL_TECHNICAL_DATASHEETS.filter((ds) => {
    const matchBrand = selectedBrand === 'all' || ds.brand === selectedBrand;
    const matchSearch = !searchQuery.trim() ||
      ds.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.keys(ds.criticalTorques).some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ds.criticalParts.some(p => p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchBrand && matchSearch;
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

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Banner with Real-Time Connectivity & Synchronization State */}
        <div className="p-5 sm:p-7 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
          
          <div className="flex items-start sm:items-center gap-4 relative z-10">
            <div className="h-12 px-2.5 rounded-[2px] bg-black/60 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-xs">
              <TMDLogo variant="icon-only" className="h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white">
                  Bóveda Técnica PWA: Acceso Total Offline
                </h1>
                <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  effectiveOnline 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-400/10 text-amber-400 border border-amber-400/30 animate-pulse'
                }`}>
                  {effectiveOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {effectiveOnline ? 'Conexión Activa (Sincronizado)' : 'Modo Mina Offline Activo'}
                </span>
                {isSimulatedOffline && (
                  <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Simulación de Campo
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
                Fichas técnicas maestras, pares de apriete, circuitos hidráulicos y tablas de equivalencia de filtros precacheados localmente mediante Service Worker v19.4 para minas y canteras de República Dominicana.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 relative z-10 self-start md:self-auto font-mono">
            <button
              onClick={toggleSimulatedOffline}
              className={`px-3 py-2 rounded-[2px] text-xs font-bold uppercase border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSimulatedOffline 
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40' 
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
            >
              {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5 text-purple-400" /> : <Wifi className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{isSimulatedOffline ? 'Restaurar Red' : 'Simular Sin Señal'}</span>
            </button>

            <button
              onClick={syncAllTechnicalVault}
              disabled={syncState === 'syncing'}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncState === 'syncing' ? 'Sincronizando Bóveda...' : 'Actualizar Bóveda (PWA)'}</span>
            </button>
          </div>
        </div>

        {/* Sync State Strip */}
        <div className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {vaultState.cachedDatasheetsCount} Fichas de Maquinaria
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <BookOpen className="w-3.5 h-3.5" /> {vaultState.cachedPartsManualsCount} Manuales & Tablas de Torque
            </span>
            <span className="text-zinc-500">
              Almacenamiento Local: <strong className="text-zinc-300 font-bold">{vaultState.totalCacheSizeMb}</strong>
            </span>
            <span className="text-zinc-500">
              Última Sincronización: <strong className="text-zinc-300 font-bold">{vaultState.lastSyncDate}</strong>
            </span>
          </div>

          <button
            onClick={openVaultModal}
            className="px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono font-bold text-xs uppercase transition-colors cursor-pointer"
          >
            Abrir Panel Detallado
          </button>
        </div>

        {/* Tabs & Search Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-[3px] border border-zinc-800 text-xs">
            <button
              onClick={() => setMainTab('machinery')}
              className={`px-3 py-1.5 rounded-[2px] transition-all flex items-center gap-1.5 cursor-pointer font-bold uppercase text-xs ${
                mainTab === 'machinery'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Fichas Técnicas ({CRITICAL_TECHNICAL_DATASHEETS.length})</span>
            </button>
            <button
              onClick={() => setMainTab('manuals')}
              className={`px-3 py-1.5 rounded-[2px] transition-all flex items-center gap-1.5 cursor-pointer font-bold uppercase text-xs ${
                mainTab === 'manuals'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Manuales & Torques ({CRITICAL_PARTS_MANUALS.length})</span>
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar modelo, torque, filtro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* VIEW: MACHINERY TECHNICAL DATASHEETS */}
        {mainTab === 'machinery' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Brand Filter + List */}
            <div className="lg:col-span-4 space-y-2.5">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-mono font-bold uppercase">
                {['all', 'JCB', 'LiuGong', 'Kubota', 'LS Tractor', 'AFEX', 'Ammann'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-2 py-1 rounded-[2px] transition-colors whitespace-nowrap cursor-pointer ${
                      selectedBrand === b 
                        ? 'bg-amber-400 text-black' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {b === 'all' ? 'Todas' : b}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredDatasheets.map((ds) => (
                  <div
                    key={ds.id}
                    onClick={() => setSelectedDatasheet(ds)}
                    className={`p-3.5 rounded-[3px] border transition-all cursor-pointer space-y-1 relative overflow-hidden ${
                      selectedDatasheet.id === ds.id
                        ? 'bg-zinc-900 border-amber-400 text-white shadow-2xl'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {selectedDatasheet.id === ds.id && <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase bg-zinc-950 border border-zinc-800 text-amber-400">
                        {ds.brand} • {ds.category}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Offline OK
                      </span>
                    </div>
                    <h4 className="text-xs font-black uppercase text-white tracking-tight">{ds.model}</h4>
                    <p className="text-[11px] text-zinc-400 font-sans line-clamp-1">{ds.tagline}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Active Datasheet Detailed Card */}
            <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-[5px] p-5 sm:p-6 space-y-5 shadow-2xl">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase bg-amber-400 text-black">
                    {selectedDatasheet.brand}
                  </span>
                  <h3 className="text-base sm:text-lg font-black uppercase text-white mt-1.5 tracking-tight">
                    {selectedDatasheet.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                    {selectedDatasheet.tagline}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy('ds', JSON.stringify(selectedDatasheet, null, 2))}
                  className="px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer uppercase"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copiedKey === 'ds' ? '¡Copiado!' : 'Copiar Ficha'}</span>
                </button>
              </div>

              {/* Grid Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
                <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
                  <h4 className="text-[11px] font-bold uppercase text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Motor Diésel
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Modelo:</span>
                      <span className="font-bold text-white">{selectedDatasheet.engineSpecs.engineModel}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Potencia:</span>
                      <span className="font-bold text-amber-400">{selectedDatasheet.engineSpecs.powerHp}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500">Tanque:</span>
                      <span className="font-bold text-zinc-300">{selectedDatasheet.engineSpecs.fuelTankCapacity}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
                  <h4 className="text-[11px] font-bold uppercase text-amber-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Circuito Hidráulico
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Bomba:</span>
                      <span className="font-bold text-white">{selectedDatasheet.hydraulicSpecs.mainPump}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Caudal Máx:</span>
                      <span className="font-bold text-amber-400">{selectedDatasheet.hydraulicSpecs.maxFlow}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500">Presión Alivio:</span>
                      <span className="font-bold text-white">{selectedDatasheet.hydraulicSpecs.systemPressure}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Torques Table */}
              <div className="space-y-2 font-mono">
                <h4 className="text-[11px] font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-400" /> Pares de Apriete y Torques Críticos de Taller
                </h4>
                <div className="rounded-[3px] border border-zinc-800 overflow-hidden divide-y divide-zinc-800 text-xs">
                  {Object.entries(selectedDatasheet.criticalTorques).map(([item, val]) => (
                    <div key={item} className="p-2.5 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-bold text-zinc-300 font-sans text-xs">{item}</span>
                      <span className="font-bold text-amber-400">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preventive Maintenance */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-bold uppercase text-white">
                  Programa de Mantenimiento Preventivo (PM)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedDatasheet.maintenanceIntervals.map((interval) => (
                    <div key={interval.hours} className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase">{interval.hours}</span>
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

        {/* VIEW: WORKSHOP MANUALS & HYDRAULIC SCHEMATICS */}
        {mainTab === 'manuals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredManuals.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedManual(m)}
                  className={`p-3.5 rounded-[3px] border transition-all cursor-pointer space-y-1 relative overflow-hidden ${
                    selectedManual.id === m.id
                      ? 'bg-zinc-900 border-amber-400 text-white shadow-2xl'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  {selectedManual.id === m.id && <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase bg-zinc-950 border border-zinc-800 text-amber-400">
                      {m.system}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{m.fileSize}</span>
                  </div>
                  <h4 className="text-xs font-black uppercase text-white tracking-tight">{m.title}</h4>
                  <p className="text-[11px] text-zinc-400 font-sans line-clamp-2">{m.overview}</p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-[5px] p-5 sm:p-6 space-y-5 shadow-2xl">
              <div>
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase bg-amber-400 text-black">
                  {selectedManual.system}
                </span>
                <h3 className="text-base sm:text-lg font-black uppercase text-white mt-1.5 tracking-tight">
                  {selectedManual.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-sans">
                  {selectedManual.overview}
                </p>
              </div>

              {selectedManual.crossReferenceTable && (
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-mono font-bold uppercase text-white tracking-wider">
                    Matriz de Equivalencias Cruzadas en Minas
                  </h4>
                  <div className="rounded-[3px] border border-zinc-800 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-950 text-zinc-400 text-[10px] uppercase font-mono font-bold border-b border-zinc-800">
                        <tr>
                          <th className="p-2.5">Código OEM</th>
                          <th className="p-2.5 text-amber-400">Donaldson</th>
                          <th className="p-2.5 text-cyan-400">Fleetguard</th>
                          <th className="p-2.5 text-emerald-400">Baldwin</th>
                          <th className="p-2.5">Aplicación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 font-mono text-xs">
                        {selectedManual.crossReferenceTable.map((row, idx) => (
                          <tr key={idx} className="bg-zinc-900/60 hover:bg-zinc-800/40">
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

              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-bold uppercase text-white tracking-wider">
                  Protocolo de Diagnóstico y Medición en Campo
                </h4>
                <div className="space-y-2">
                  {selectedManual.diagnosticSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-300">
                      <span className="w-5 h-5 rounded-[2px] bg-amber-400/10 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[10px] border border-amber-400/30">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed font-sans">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
