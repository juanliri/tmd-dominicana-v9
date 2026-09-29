import React, { useState, useEffect } from 'react';
import {
  Database,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Sparkles,
  Server,
  FileCode,
  HardHat,
  Cog,
  Radio,
  Check,
  Play,
  Terminal,
  Filter,
  CheckSquare,
  Square,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  scanGlobalCatalogObjects,
  extractAndNormalizeAllCatalogData,
  migrateGlobalCatalogObjectsToFirestore,
  MigrationProgress,
  MigrationSummary,
  GlobalCatalogSource
} from '../../utils/firestoreDataMigration';
import { Machine, Part } from '../../types';

interface DataMigrationUtilityProps {
  onMigrationComplete?: (summary: MigrationSummary) => void;
  className?: string;
}

export const DataMigrationUtility: React.FC<DataMigrationUtilityProps> = ({
  onMigrationComplete,
  className = ''
}) => {
  const [sources, setSources] = useState<GlobalCatalogSource[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [targetMaquinaria, setTargetMaquinaria] = useState(true);
  const [targetRepuestos, setTargetRepuestos] = useState(true);
  const [mirrorToInventory, setMirrorToInventory] = useState(true);
  const [batchSize, setBatchSize] = useState<number>(50);

  const [previewData, setPreviewData] = useState<{
    machines: Machine[];
    parts: Part[];
    brandCount: Record<string, number>;
  }>({
    machines: [],
    parts: [],
    brandCount: {}
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress>({
    totalItems: 0,
    processedItems: 0,
    currentBrand: 'All',
    currentBatch: 0,
    totalBatches: 0,
    collectionName: 'idle',
    status: 'idle',
    message: 'Listo para iniciar migración hacia Firestore.',
    logs: [],
    errors: []
  });

  const [lastSummary, setLastSummary] = useState<MigrationSummary | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'console' | 'preview_machines' | 'preview_parts' | 'sources'>('console');

  // Refresh and scan global objects
  const handleScan = () => {
    const scanned = scanGlobalCatalogObjects();
    setSources(scanned);

    const extracted = extractAndNormalizeAllCatalogData(selectedBrand);
    setPreviewData({
      machines: extracted.machines,
      parts: extracted.parts,
      brandCount: extracted.brandCount
    });
  };

  useEffect(() => {
    handleScan();
  }, [selectedBrand]);

  const handleStartMigration = async () => {
    setIsRunning(true);
    setLastSummary(null);

    const targetCollections: ('maquinaria' | 'repuestos' | 'inventory_machines' | 'inventory_parts')[] = [];
    if (targetMaquinaria) targetCollections.push('maquinaria');
    if (targetRepuestos) targetCollections.push('repuestos');
    if (mirrorToInventory) {
      targetCollections.push('inventory_machines');
      targetCollections.push('inventory_parts');
    }

    try {
      const summary = await migrateGlobalCatalogObjectsToFirestore({
        selectedBrand,
        targetCollections,
        batchSize,
        mirrorToInventory,
        onProgress: (p) => setProgress(p)
      });

      setLastSummary(summary);
      if (onMigrationComplete) {
        onMigrationComplete(summary);
      }
    } catch (err: any) {
      console.error('Migration failed:', err);
    } finally {
      setIsRunning(false);
      handleScan();
    }
  };

  const totalDetectedInWindow = sources.reduce((acc, s) => acc + s.itemCount, 0);
  const percentComplete = progress.totalItems > 0 
    ? Math.min(100, Math.round((progress.processedItems / progress.totalItems) * 100))
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero Control Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Motor de Sincronización Supabase Cloud
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {totalDetectedInWindow > 0 ? `${totalDetectedInWindow} Ítems Globales Detectados` : 'Fallback Multimarca Activo'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sincronización de Catálogo a Supabase Cloud & Vercel Edge
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Itera sobre los objetos de catálogo expuestos en <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-400 font-mono text-[11px]">window</code> por los módulos Vercel Edge (JCB, LiuGong, Kubota, Ammann, Repuestos OEM) y realiza la sincronización cloud hacia la infraestructura Supabase con respaldo local inmediato.
            </p>
          </div>

          {/* Action Trigger Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleScan}
              disabled={isRunning}
              className="px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold border border-zinc-700/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Volver a escanear el objeto window"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Escanear Window</span>
            </button>

            <button
              onClick={handleStartMigration}
              disabled={isRunning || (previewData.machines.length === 0 && previewData.parts.length === 0)}
              className="tmd-shimmer-btn px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Procesando Lotes... ({percentComplete}%)</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5 text-black" />
                  <span>Ejecutar Carga Masiva ({previewData.machines.length + previewData.parts.length} ítems)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80 text-xs">
          {/* Brand Filter */}
          <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
            <label className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" />
              Filtrar por Marca / Catálogo:
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              disabled={isRunning}
              className="w-full bg-zinc-900 border border-zinc-700 text-amber-400 font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-xs"
            >
              <option value="All">Todas las Marcas (Ecosistema Completo)</option>
              <option value="JCB">JCB (106 Equipos & Aditamentos)</option>
              <option value="LiuGong">LiuGong (Excavadoras & Cargadores)</option>
              <option value="Kubota">Kubota (Tractores & Excavadoras)</option>
              <option value="LS Tractor">LS Tractor (Tractores Agrícolas)</option>
              <option value="Yanmar">Yanmar (Tractores & Arroz)</option>
              <option value="Ammann">Ammann (Rodillos & Compactación)</option>
              <option value="IMER">IMER Group (Plantas & Concreto)</option>
              <option value="AFEX">AFEX (Sistemas Contra Incendios)</option>
              <option value="Yomel">Yomel / Orsi / Celli (Implementos)</option>
            </select>
          </div>

          {/* Collection Toggles */}
          <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
            <label className="text-[11px] font-bold text-zinc-400">Colecciones Destino:</label>
            <div className="flex items-center gap-3 pt-0.5">
              <button
                type="button"
                onClick={() => setTargetMaquinaria(!targetMaquinaria)}
                disabled={isRunning}
                className="flex items-center gap-1.5 text-zinc-300 hover:text-white cursor-pointer"
              >
                {targetMaquinaria ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-zinc-600" />}
                <span className="font-mono text-[11px]">maquinaria</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetRepuestos(!targetRepuestos)}
                disabled={isRunning}
                className="flex items-center gap-1.5 text-zinc-300 hover:text-white cursor-pointer"
              >
                {targetRepuestos ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-zinc-600" />}
                <span className="font-mono text-[11px]">repuestos</span>
              </button>
            </div>
          </div>

          {/* Inventory Mirroring */}
          <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
            <label className="text-[11px] font-bold text-zinc-400">Espejo en Inventario Admin:</label>
            <button
              type="button"
              onClick={() => setMirrorToInventory(!mirrorToInventory)}
              disabled={isRunning}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white cursor-pointer pt-0.5"
            >
              {mirrorToInventory ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-zinc-600" />}
              <span className="text-[11px]">inventory_machines/parts</span>
            </button>
          </div>

          {/* Batch Size Selection */}
          <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
            <label className="text-[11px] font-bold text-zinc-400">Tamaño de Lote (Batch):</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                disabled={isRunning}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-amber-400 font-bold text-xs shrink-0">{batchSize}/lote</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Live Execution Status */}
      {(isRunning || progress.status !== 'idle' || lastSummary) && (
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {progress.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {progress.status === 'migrating' && <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />}
              {progress.status === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
              {progress.status === 'idle' && <Database className="w-5 h-5 text-zinc-400" />}
              
              <div>
                <span className="font-black text-white block sm:inline mr-2">
                  {progress.status === 'completed' ? '¡Sincronización Cloud Exitosa!' : progress.status === 'migrating' ? 'Ejecutando Sincronización en Supabase Cloud...' : 'Estado de Operación'}
                </span>
                <span className="text-zinc-400 text-[11px]">{progress.message}</span>
              </div>
            </div>

            <div className="font-mono font-bold text-amber-400 bg-black px-3 py-1 rounded-xl border border-zinc-800">
              {progress.processedItems} / {progress.totalItems} Ítems ({percentComplete}%)
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 ${
                progress.status === 'completed'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : progress.status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          {/* Post-migration Summary Report */}
          {lastSummary && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Total Procesado</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{lastSummary.totalProcessed} docs</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Maquinarias</span>
                <span className="text-lg font-black text-white font-mono">{lastSummary.machineryCount}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Repuestos OEM</span>
                <span className="text-lg font-black text-white font-mono">{lastSummary.partsCount}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Lotes Atómicos</span>
                <span className="text-lg font-black text-amber-400 font-mono">{lastSummary.batchesCommitted} ({((lastSummary.durationMs || 0)/1000).toFixed(2)}s)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-tabs: Live Console Log vs Extracted Preview */}
      <div className="bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="flex border-b border-zinc-800 bg-zinc-900/60 px-4 sm:px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveSubTab('console')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'console'
                ? 'bg-zinc-950 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal de Ejecución ({progress.logs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sources')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'sources'
                ? 'bg-zinc-950 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Fuentes Globales Window ({sources.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('preview_machines')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'preview_machines'
                ? 'bg-zinc-950 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Maquinarias a Migrar ({previewData.machines.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('preview_parts')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'preview_parts'
                ? 'bg-zinc-950 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cog className="w-3.5 h-3.5" />
            <span>Repuestos a Migrar ({previewData.parts.length})</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* TAB 1: CONSOLE LOGS */}
          {activeSubTab === 'console' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-[11px] text-zinc-500">Live migration output stream & Firestore writeBatch commits</span>
                <span className="font-mono text-[11px] text-amber-400">{progress.logs.length} líneas</span>
              </div>

              <div className="p-4 rounded-2xl bg-black border border-zinc-800/90 font-mono text-xs text-zinc-300 max-h-72 overflow-y-auto space-y-1 select-text">
                {progress.logs.length === 0 ? (
                  <div className="text-zinc-600 py-4 text-center">
                    No hay registros de ejecución activos. Presiona "Ejecutar Carga Masiva" para iniciar el volcado a Firestore.
                  </div>
                ) : (
                  progress.logs.map((line, idx) => (
                    <div
                      key={idx}
                      className={`leading-relaxed ${
                        line.includes('ERROR')
                          ? 'text-rose-400'
                          : line.includes('confirmado') || line.includes('completada')
                          ? 'text-emerald-400'
                          : line.includes('Iniciando') || line.includes('Procesando')
                          ? 'text-amber-300'
                          : 'text-zinc-400'
                      }`}
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GLOBAL SOURCES DETECTOR */}
          {activeSubTab === 'sources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sources.map((src) => (
                <div
                  key={src.module.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{src.module.name}</h4>
                      <code className="inline-block mt-1 text-[11px] font-mono text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-zinc-800">
                        window.{src.detectedKey || src.module.globalKey}
                      </code>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        src.status === 'ready'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {src.status === 'ready' ? `${src.itemCount} Ítems` : 'Local Fallback'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                    <span className="font-mono text-zinc-500 truncate max-w-[200px]">
                      {src.module.url.split('/').pop()}
                    </span>
                    <span className="text-zinc-300 font-medium">Marca: {src.module.brand}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PREVIEW MACHINES */}
          {activeSubTab === 'preview_machines' && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {previewData.machines.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-xs hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.image}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover bg-black"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="px-1.5 py-0.2 bg-black text-amber-400 rounded text-[10px] font-mono border border-zinc-800">{m.modelCode}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {m.brand} • {m.powerHp} HP • {m.engine}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400">
                      US$ {m.basePriceUsd.toLocaleString()}
                    </span>
                    <span className="block text-[10px] font-mono text-zinc-500">ID: {m.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PREVIEW PARTS */}
          {activeSubTab === 'preview_parts' && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {previewData.parts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-xs hover:border-zinc-700"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{p.name}</span>
                      <span className="px-1.5 py-0.2 bg-black text-zinc-300 rounded text-[10px] font-mono border border-zinc-800">{p.partNumber}</span>
                      <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-400 rounded text-[10px] font-bold">{p.brand}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      Categoría: {p.category} • Stock: {p.stockQty} unidades
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400">
                      US$ {p.priceUsd.toLocaleString()}
                    </span>
                    <span className="block text-[10px] font-mono text-zinc-500">ID: {p.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
