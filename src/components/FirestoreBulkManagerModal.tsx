import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Database,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  FileSpreadsheet,
  HardHat,
  Cog,
  FileCode,
  Layers,
  Sparkles,
  Server,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Globe,
  Radio
} from 'lucide-react';
import {
  bulkUploadMachinery,
  bulkUploadParts,
  bulkUploadPresupuestos,
  executeMasterBulkDataLoad,
  getFirestoreCollectionsStats,
  subscribeToMachinery,
  subscribeToParts,
  subscribeToPresupuestos,
  BulkUploadProgress,
  PresupuestoDoc,
  EXTENDED_MACHINES_DATA
} from '../services/firestoreCatalogService';
import { PARTS_DATA } from '../data/parts';
import { INITIAL_PRESUPUESTOS_DATA } from '../services/firestoreCatalogService';
import { TMD_CDN_MODULES, loadAllCdnProducts, getUnifiedStoreMachinery, getUnifiedStoreParts } from '../services/cdnCatalogLoader';
import { DataMigrationUtility } from './admin/DataMigrationUtility';
import { Machine, Part } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirestoreBulkManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUploaded?: () => void;
}

export const FirestoreBulkManagerModal: React.FC<FirestoreBulkManagerModalProps> = ({
  isOpen,
  onClose,
  onDataUploaded
}) => {
  const [activeTab, setActiveTab] = useState<'global_migration' | 'bulk_sync' | 'cdn_ecosystem' | 'inspect_collections' | 'custom_json'>('global_migration');
  const [stats, setStats] = useState<{
    machineryCount: number;
    partsCount: number;
    presupuestosCount: number;
    databaseId: string;
  }>({
    machineryCount: 0,
    partsCount: 0,
    presupuestosCount: 0,
    databaseId: firebaseConfig.firestoreDatabaseId || 'default'
  });

  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [cdnStatus, setCdnStatus] = useState<ReturnType<typeof loadAllCdnProducts>>({
    machines: [],
    parts: [],
    loadedModules: []
  });

  const [progress, setProgress] = useState<BulkUploadProgress>({
    total: 100,
    current: 0,
    status: 'idle',
    collectionName: 'all',
    message: 'Listo para inicializar la carga masiva en Firestore.',
    errors: []
  });

  const [liveMachines, setLiveMachines] = useState<Machine[]>([]);
  const [liveParts, setLiveParts] = useState<Part[]>([]);
  const [liveQuotes, setLiveQuotes] = useState<PresupuestoDoc[]>([]);

  const [customJsonTarget, setCustomJsonTarget] = useState<'maquinaria' | 'repuestos' | 'presupuestos'>('maquinaria');
  const [customJsonInput, setCustomJsonInput] = useState('');
  const [customJsonStatus, setCustomJsonStatus] = useState<string | null>(null);
  const [copiedDbId, setCopiedDbId] = useState(false);

  // Load stats and subscriptions
  const refreshStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await getFirestoreCollectionsStats();
      setStats(res);
      setCdnStatus(loadAllCdnProducts());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshStats();

    const unsubMach = subscribeToMachinery((data) => setLiveMachines(data));
    const unsubParts = subscribeToParts((data) => setLiveParts(data));
    const unsubQuotes = subscribeToPresupuestos((data) => setLiveQuotes(data));

    return () => {
      unsubMach();
      unsubParts();
      unsubQuotes();
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleMasterUpload = async () => {
    try {
      setProgress({
        total: 100,
        current: 0,
        status: 'in_progress',
        collectionName: 'all',
        message: 'Iniciando sincronización completa en Firestore...',
        errors: []
      });

      await executeMasterBulkDataLoad((p) => {
        setProgress(p);
      });

      await refreshStats();
      if (onDataUploaded) onDataUploaded();
    } catch (err: any) {
      setProgress({
        total: 100,
        current: 0,
        status: 'error',
        collectionName: 'all',
        message: `Error durante la carga masiva: ${err?.message || 'Fallo de permisos o red'}`,
        errors: [String(err)]
      });
    }
  };

  const handleUploadMachineryOnly = async () => {
    try {
      const allMachinery = getUnifiedStoreMachinery();
      setProgress({
        total: allMachinery.length,
        current: 0,
        status: 'in_progress',
        collectionName: 'maquinaria',
        message: `Cargando ${allMachinery.length} equipos a colección "maquinaria"...`,
        errors: []
      });

      await bulkUploadMachinery(allMachinery, (p) => setProgress(p));
      await refreshStats();
      if (onDataUploaded) onDataUploaded();
    } catch (err: any) {
      setProgress({
        total: 100,
        current: 0,
        status: 'error',
        collectionName: 'maquinaria',
        message: `Error al cargar maquinaria: ${err?.message || 'Error'}`,
        errors: [String(err)]
      });
    }
  };

  const handleUploadPartsOnly = async () => {
    try {
      const allParts = getUnifiedStoreParts();
      setProgress({
        total: allParts.length,
        current: 0,
        status: 'in_progress',
        collectionName: 'repuestos',
        message: `Cargando ${allParts.length} repuestos y aditamentos a colección "repuestos"...`,
        errors: []
      });

      await bulkUploadParts(allParts, (p) => setProgress(p));
      await refreshStats();
      if (onDataUploaded) onDataUploaded();
    } catch (err: any) {
      setProgress({
        total: 100,
        current: 0,
        status: 'error',
        collectionName: 'repuestos',
        message: `Error al cargar repuestos: ${err?.message || 'Error'}`,
        errors: [String(err)]
      });
    }
  };

  const handleUploadQuotesOnly = async () => {
    try {
      setProgress({
        total: INITIAL_PRESUPUESTOS_DATA.length,
        current: 0,
        status: 'in_progress',
        collectionName: 'presupuestos',
        message: 'Cargando colección "presupuestos"...',
        errors: []
      });

      await bulkUploadPresupuestos(INITIAL_PRESUPUESTOS_DATA, (p) => setProgress(p));
      await refreshStats();
      if (onDataUploaded) onDataUploaded();
    } catch (err: any) {
      setProgress({
        total: 100,
        current: 0,
        status: 'error',
        collectionName: 'presupuestos',
        message: `Error al cargar presupuestos: ${err?.message || 'Error'}`,
        errors: [String(err)]
      });
    }
  };

  const handleCustomJsonUpload = async () => {
    if (!customJsonInput.trim()) {
      setCustomJsonStatus('Por favor ingresa un payload JSON válido.');
      return;
    }

    try {
      const parsed = JSON.parse(customJsonInput);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      setCustomJsonStatus(`Procesando ${items.length} documento(s) para '${customJsonTarget}'...`);

      if (customJsonTarget === 'maquinaria') {
        await bulkUploadMachinery(items);
      } else if (customJsonTarget === 'repuestos') {
        await bulkUploadParts(items);
      } else {
        await bulkUploadPresupuestos(items);
      }

      setCustomJsonStatus(`¡Éxito! ${items.length} registro(s) subidos a '${customJsonTarget}'.`);
      setCustomJsonInput('');
      await refreshStats();
      if (onDataUploaded) onDataUploaded();
    } catch (err: any) {
      setCustomJsonStatus(`Error: ${err?.message || 'JSON inválido'}`);
    }
  };

  const copyDatabaseId = () => {
    navigator.clipboard.writeText(stats.databaseId);
    setCopiedDbId(true);
    setTimeout(() => setCopiedDbId(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[5px] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-amber-400 text-black flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight">Gestor de Carga Masiva Firestore</h2>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-1 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Conectado
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Sincronización para <span className="text-amber-400 font-bold">'maquinaria'</span>, <span className="text-amber-400 font-bold">'repuestos'</span> y <span className="text-amber-400 font-bold">'presupuestos'</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-zinc-800"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Database Info Bar */}
        <div className="px-3.5 sm:px-4 py-2 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-zinc-400">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase text-[10px]">Database ID:</span>
            <code className="bg-zinc-900 px-1.5 py-0.5 rounded-[2px] text-amber-400 font-mono text-[10px] border border-zinc-800 truncate max-w-[220px] sm:max-w-none">
              {stats.databaseId}
            </code>
            <button
              onClick={copyDatabaseId}
              className="p-1 rounded-[2px] hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Copiar ID"
            >
              {copiedDbId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={refreshStats}
              disabled={isLoadingStats}
              className="flex items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer uppercase text-[10px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin text-amber-400' : ''}`} />
              <span>Actualizar Conteo</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-3 sm:px-4 gap-1 pt-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('global_migration')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-t-[2px] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
              activeTab === 'global_migration'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-400 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Migración Global CDN</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk_sync')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-t-[2px] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
              activeTab === 'bulk_sync'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-400 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>1-Click Base de Datos</span>
          </button>

          <button
            onClick={() => setActiveTab('cdn_ecosystem')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-t-[2px] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
              activeTab === 'cdn_ecosystem'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-400 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1">
              Módulos Vercel
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inspect_collections')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-t-[2px] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
              activeTab === 'inspect_collections'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-400 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Colecciones ({liveMachines.length + liveParts.length + liveQuotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom_json')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-t-[2px] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
              activeTab === 'custom_json'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-400 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Ingesta JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4 bg-zinc-900">

          {/* TAB 0: GLOBAL MIGRATION ENGINE */}
          {activeTab === 'global_migration' && (
            <DataMigrationUtility
              onMigrationComplete={async () => {
                await refreshStats();
                if (onDataUploaded) onDataUploaded();
              }}
            />
          )}
          
          {/* TAB 1: 1-CLICK BULK SYNC */}
          {activeTab === 'bulk_sync' && (
            <div className="space-y-4">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-medium block uppercase">Colección: 'maquinaria'</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {liveMachines.length || stats.machineryCount}
                    </span>
                    <span className="text-[9px] text-zinc-500 block uppercase">Equipos Pesados Disponibles</span>
                  </div>
                  <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
                    <HardHat className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-medium block uppercase">Colección: 'repuestos'</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {liveParts.length || stats.partsCount}
                    </span>
                    <span className="text-[9px] text-zinc-500 block uppercase">Piezas OEM en Almacén Km 22</span>
                  </div>
                  <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
                    <Cog className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-medium block uppercase">Colección: 'presupuestos'</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {liveQuotes.length || stats.presupuestosCount}
                    </span>
                    <span className="text-[9px] text-zinc-500 block uppercase">Proformas con RNC & ITBIS</span>
                  </div>
                  <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Master Sync Action Button */}
              <div className="p-4 rounded-[3px] bg-zinc-950 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase">Sincronización y Carga Masiva Global</h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-xl">
                    Ejecuta lotes atómicos (`writeBatch`) para inicializar y sincronizar todos los datos técnicos de JCB, LiuGong, LS Tractor, Ammann, Repuestos OEM y Presupuestos maestros en Firestore.
                  </p>
                </div>

                <button
                  onClick={handleMasterUpload}
                  disabled={progress.status === 'in_progress'}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 text-black font-black rounded-[2px] text-xs flex items-center gap-2 whitespace-nowrap cursor-pointer uppercase shadow-xs shrink-0"
                >
                  <UploadCloud className={`w-4 h-4 ${progress.status === 'in_progress' ? 'animate-bounce' : ''}`} />
                  <span>{progress.status === 'in_progress' ? 'Cargando Lotes...' : 'Cargar Toda la BD'}</span>
                </button>
              </div>

              {/* Individual Collection Buttons */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Cargas Específicas por Colección</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={handleUploadMachineryOnly}
                    disabled={progress.status === 'in_progress'}
                    className="p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 uppercase">Cargar Maquinaria</span>
                      <HardHat className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-[10px] text-zinc-400 block">{EXTENDED_MACHINES_DATA.length} modelos con fichas técnicas y HP</span>
                  </button>

                  <button
                    onClick={handleUploadPartsOnly}
                    disabled={progress.status === 'in_progress'}
                    className="p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 uppercase">Cargar Repuestos</span>
                      <Cog className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-[10px] text-zinc-400 block">{PARTS_DATA.length} códigos de parte y desglose OEM</span>
                  </button>

                  <button
                    onClick={handleUploadQuotesOnly}
                    disabled={progress.status === 'in_progress'}
                    className="p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 uppercase">Cargar Presupuestos</span>
                      <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-[10px] text-zinc-400 block">{INITIAL_PRESUPUESTOS_DATA.length} proformas con RNC dominicano</span>
                  </button>
                </div>
              </div>

              {/* Progress Terminal */}
              <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
                  <span>Estado de la Operación</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-[2px] bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progress.status === 'error'
                        ? 'bg-red-500'
                        : progress.status === 'completed'
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                    }`}
                    style={{
                      width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`
                    }}
                  />
                </div>

                <div className="pt-1 flex items-start gap-2 text-[11px]">
                  {progress.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                  {progress.status === 'in_progress' && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0 mt-0.5" />}
                  {progress.status === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}
                  {progress.status === 'idle' && <Database className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />}
                  <span className={progress.status === 'completed' ? 'text-emerald-300' : progress.status === 'error' ? 'text-red-300' : 'text-zinc-300'}>
                    {progress.message}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INSPECT COLLECTIONS */}
          {activeTab === 'inspect_collections' && (
            <div className="space-y-4">
              
              {/* Sub-Tabs for collection viewer */}
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-[10px] text-zinc-400 uppercase">Colección:</span>
                <span className="px-2.5 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 font-mono text-[11px] border border-amber-400/20 uppercase font-bold">
                  maquinaria ({liveMachines.length})
                </span>
                <span className="px-2.5 py-0.5 rounded-[2px] bg-zinc-950 text-zinc-300 font-mono text-[11px] border border-zinc-800 uppercase font-bold">
                  repuestos ({liveParts.length})
                </span>
                <span className="px-2.5 py-0.5 rounded-[2px] bg-zinc-950 text-zinc-300 font-mono text-[11px] border border-zinc-800 uppercase font-bold">
                  presupuestos ({liveQuotes.length})
                </span>
              </div>

              {/* Sample Maquinaria Records */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Muestra de Maquinarias Sincronizadas</h4>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {liveMachines.slice(0, 5).map((m) => (
                    <div key={m.id} className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white uppercase">{m.name}</span>
                          <span className="px-1 py-0.2 bg-zinc-800 text-zinc-400 rounded-[2px] text-[9px] font-mono">{m.modelCode}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {m.brand} • {m.powerHp} HP • {(m.operatingWeightKg / 1000).toFixed(1)} TON • {m.engine}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-amber-400">
                        US$ {m.basePriceUsd.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Presupuestos Records */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Muestra de Presupuestos / Proformas</h4>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {liveQuotes.map((q) => (
                    <div key={q.id} className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 font-mono">{q.quoteNumber}</span>
                          <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-[2px] text-[9px] uppercase font-bold">{q.status}</span>
                        </div>
                        <span className="text-[10px] text-zinc-300 block font-medium uppercase">{q.companyName || q.clientName} (RNC: {q.rncOrCedula || 'N/A'})</span>
                        <span className="text-[10px] text-zinc-400">{q.itemsSummary}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="block font-bold text-white">
                          US$ {q.total.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-zinc-400">ITBIS: US$ {q.itbis.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CDN VERCEL MULTIBRAND ECOSYSTEM */}
          {activeTab === 'cdn_ecosystem' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-amber-400/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase">Ecosistema CDN TMD Vercel (10 Módulos)</h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-2xl">
                    Los scripts CDN enlazados en <code className="bg-zinc-900 px-1 py-0.2 rounded-[2px] text-amber-400 font-mono text-[10px]">index.html</code> inyectan los catálogos maestros multimarca con precios certificados, garantías TMD Km 22 y especificaciones de ingeniería.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    const unified = getUnifiedStoreMachinery();
                    setProgress({
                      total: unified.length,
                      current: 0,
                      status: 'in_progress',
                      collectionName: 'maquinaria',
                      message: `Iniciando sincronización completa del ecosistema CDN (${unified.length} equipos)...`,
                      errors: []
                    });
                    await bulkUploadMachinery(unified, (p) => setProgress(p));
                    await refreshStats();
                    if (onDataUploaded) onDataUploaded();
                  }}
                  className="px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 uppercase shadow-xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Sincronizar Ecosistema a Firestore</span>
                </button>
              </div>

              {/* Grid of the 10 CDN Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {TMD_CDN_MODULES.map((mod, idx) => {
                  const statusInfo = cdnStatus.loadedModules.find(m => m.id === mod.id);
                  const isLoaded = Boolean(statusInfo?.loaded);
                  const itemCount = statusInfo?.count || mod.expectedCount || 0;

                  return (
                    <div
                      key={mod.id}
                      className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-500">#{idx + 1}</span>
                            <h4 className="text-xs font-bold text-white uppercase">{mod.name}</h4>
                          </div>
                          <span className="inline-block mt-1 text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded-[2px] border border-amber-400/20">
                            window.{mod.globalKey}
                          </span>
                        </div>

                        <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-black border flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {itemCount > 0 ? `${itemCount} Prods` : 'Activo'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800 text-[10px] text-zinc-400">
                        <span className="truncate max-w-[200px] text-zinc-500 font-mono">
                          {mod.url.split('/').pop()}
                        </span>
                        <span className="text-zinc-300 font-medium uppercase">Marca: {mod.brand}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: INSPECT LIVE COLLECTIONS */}
          {activeTab === 'custom_json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Ingesta Masiva mediante JSON</h4>
                  <p className="text-[10px] text-zinc-400">Pega un objeto o array JSON con las especificaciones para subirlo directamente a la colección seleccionada.</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-zinc-400 uppercase">Colección Destino:</label>
                  <select
                    value={customJsonTarget}
                    onChange={(e: any) => setCustomJsonTarget(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-amber-400 text-xs rounded-[2px] px-2 py-1 font-mono uppercase"
                  >
                    <option value="maquinaria">maquinaria</option>
                    <option value="repuestos">repuestos</option>
                    <option value="presupuestos">presupuestos</option>
                  </select>
                </div>
              </div>

              <textarea
                value={customJsonInput}
                onChange={(e) => setCustomJsonInput(e.target.value)}
                placeholder={`[\n  {\n    "id": "nuevo-equipo-01",\n    "name": "Equipo Personalizado",\n    "brand": "JCB",\n    "category": "Excavadoras",\n    "modelCode": "JS-CUSTOM",\n    "powerHp": 150,\n    "operatingWeightKg": 18000,\n    "basePriceUsd": 120000,\n    "inStock": true\n  }\n]`}
                rows={8}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-[2px] font-mono text-xs text-zinc-200 focus:border-amber-400 outline-none"
              />

              {customJsonStatus && (
                <div className="p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs font-mono text-amber-400">
                  {customJsonStatus}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleCustomJsonUpload}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-[2px] text-xs flex items-center gap-1.5 cursor-pointer uppercase shadow-xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Procesar e Insertar en Firestore</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="uppercase">Seguridad ABAC y Validación de Esquemas Activa</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer border border-zinc-700 uppercase"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
