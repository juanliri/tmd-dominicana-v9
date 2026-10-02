import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Radio, 
  Wrench, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Database,
  ExternalLink,
  Cpu,
  ArrowUpRight,
  Receipt,
  Users,
  Mail,
  Calendar,
  Send,
  Building2
} from 'lucide-react';
import { IntegrationsHealthStatus } from '../../types';
import { fetchIntegrationsHealth, syncFullbayWithDashboard } from '../../services/fullbayService';
import { QuickBooksClient } from '../../services/integrations/quickbooks';
import { MethodCrmClient } from '../../services/integrations/methodcrm';
import { MicrosoftGraphClient } from '../../services/integrations/microsoftGraph';

export const AdminIntegrationsHealthView: React.FC = () => {
  const [health, setHealth] = useState<IntegrationsHealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [testingService, setTestingService] = useState<string | null>(null);

  const loadHealthData = async () => {
    try {
      const data = await fetchIntegrationsHealth();
      setHealth(data);
    } catch (e) {
      console.error('Error fetching integrations health:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHealthData();
  };

  const handleForceFullbaySync = async () => {
    setSyncInProgress(true);
    setFeedback(null);
    try {
      const result = await syncFullbayWithDashboard();
      if (result.success) {
        setFeedback(`¡Sincronización manual exitosa! ${result.syncedOrdersCount} órdenes de servicio y ${result.syncedTechniciansCount} mecánicos actualizados desde Fullbay Connect.`);
      } else {
        setFeedback('Sincronización completada con advertencias.');
      }
      loadHealthData();
    } catch {
      setFeedback('Error al forzar sincronización con Fullbay.');
    } finally {
      setSyncInProgress(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleTestQuickBooks = async () => {
    setTestingService('quickbooks');
    try {
      const qbo = new QuickBooksClient({
        realmId: '93414520938',
        accessToken: 'mock-oauth2-bearer',
        environment: 'sandbox'
      });
      const res = await qbo.createInvoice({
        customerId: 'CUST-DGII-001',
        customerEmail: 'contabilidad@constructoradelcibao.do',
        ncfNumber: 'B0100000459',
        currency: 'USD',
        lines: [{ description: 'Excavadora LiuGong 922E HD', amount: 145000, quantity: 1, unitPrice: 145000 }]
      });
      if (res.success) {
        setFeedback(`¡QuickBooks Online Conectado! Factura fiscal de prueba generada con éxito (ID: ${res.invoiceId}, NCF: ${res.docNumber}).`);
      }
    } catch {
      setFeedback('Error al verificar conexión con QuickBooks Online.');
    } finally {
      setTestingService(null);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleTestMethodCrm = async () => {
    setTestingService('methodcrm');
    try {
      const method = new MethodCrmClient({
        apiKey: 'mth_api_prod_9941a',
        companyAccount: 'tmd_dominicana'
      });
      const res = await method.createOpportunity({
        name: 'Oportunidad Flota 3x LiuGong 922E HD',
        amount: 435000,
        currency: 'USD',
        stage: 'Quote Sent',
        assignedRep: 'Ing. Carlos Mendoza',
        equipmentInterest: 'LiuGong 922E HD'
      });
      if (res.success) {
        setFeedback(`¡Method:CRM Enlazado! Oportunidad comercial sincronizada (ID: ${res.opportunityId}) en etapa "Quote Sent".`);
      }
    } catch {
      setFeedback('Error al conectar con Method:CRM REST API.');
    } finally {
      setTestingService(null);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleTestOutlook = async () => {
    setTestingService('outlook');
    try {
      const graph = new MicrosoftGraphClient({
        tenantId: 'tmd-msft-365-tenant',
        clientId: 'tmd-o365-client-id',
        userEmail: 'ventas@tmd.rd'
      });
      const res = await graph.sendEmail({
        to: ['gerencia@tmd.rd'],
        subject: 'Prueba de Despacho Proforma - Microsoft 365 Graph API',
        bodyHtml: '<p>Verificación de enlace con Microsoft 365 Exchange Online para TMD Dominicana.</p>'
      });
      if (res.success) {
        setFeedback(`¡Microsoft 365 Graph API Activo! Mensaje transaccional enviado vía Outlook (ID: ${res.messageId}).`);
      }
    } catch {
      setFeedback('Error al validar Microsoft 365 Graph API.');
    } finally {
      setTestingService(null);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-8 text-center font-mono">
        <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase text-zinc-400">Verificando estado de pasarelas y APIs...</p>
      </div>
    );
  }

  const services = health?.services;

  return (
    <div className="space-y-5 font-mono text-zinc-200">
      {/* Header bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                GATEWAYS OPERACIONALES
              </span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-zinc-400 text-xs">Monitoreo Cloud Run & Feeds Externos</span>
            </div>
            <h2 className="text-lg font-black text-white uppercase font-display tracking-tight">
              ESTADO DE INTEGRACIONES & PASARELAS DE DATOS
            </h2>
            <p className="text-xs text-zinc-400">
              Control de enlace entre Google Cloud Run, Fullbay Connect REST, JCB LiveLink ISO 15143-3, KubotaNOW AEMP 2.0 y DGII NCF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refrescar</span>
            </button>
            <button
              onClick={handleForceFullbaySync}
              disabled={syncInProgress}
              className="px-3.5 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Wrench className="w-3.5 h-3.5 text-black" />
              <span>{syncInProgress ? 'Sincronizando...' : 'Forzar Sync Fullbay'}</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-[3px] bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Services Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Google Cloud Run Backend */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-[2px] bg-blue-500/10 text-blue-400">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white font-display">GOOGLE CLOUD RUN</h3>
                <span className="text-[10px] text-zinc-400">Node.js Express Gateway</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              {services?.cloudRun.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Latencia Proxy</span>
              <span className="font-bold text-white tabular-nums">{services?.cloudRun.latencyMs} ms</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Uptime Contenedor</span>
              <span className="font-bold text-white tabular-nums">{services?.cloudRun.uptimeHours} h</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>Memoria Asignada:</span>
            <span className="font-bold text-zinc-200">{services?.cloudRun.memoryMb} MB / 1024 MB</span>
          </div>
        </div>

        {/* 2. Fullbay Connect REST API */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-[2px] bg-amber-500/10 text-amber-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white font-display">FULLBAY CONNECT</h3>
                <span className="text-[10px] text-zinc-400">Taller & Repuestos V2 API</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              {services?.fullbayConnect.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Shop ID Vinculado</span>
              <span className="font-bold text-amber-400 text-[11px] truncate block">{services?.fullbayConnect.activeShopId}</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Latencia REST</span>
              <span className="font-bold text-white tabular-nums">{services?.fullbayConnect.latencyMs} ms</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>Última Sincronización:</span>
            <span className="text-zinc-300">{new Date(services?.fullbayConnect.lastSyncTime || Date.now()).toLocaleTimeString('es-DO')}</span>
          </div>
        </div>

        {/* 3. JCB LiveLink Telematics (ISO 15143-3) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-[2px] bg-amber-400/10 text-amber-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white font-display">JCB LIVELINK FEED</h3>
                <span className="text-[10px] text-zinc-400">ISO 15143-3 / AEMP 2.0</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              {services?.jcbLiveLink.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Unidades Conectadas</span>
              <span className="font-bold text-emerald-400 tabular-nums">{services?.jcbLiveLink.unitsOnline} Activas</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Latencia CAN Bus</span>
              <span className="font-bold text-white tabular-nums">{services?.jcbLiveLink.latencyMs} ms</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>Protocolo de Datos:</span>
            <span className="text-zinc-300 font-bold">AEMP 2.0 Telematics Feed</span>
          </div>
        </div>

        {/* 4. KubotaNOW Telematics */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-[2px] bg-orange-500/10 text-orange-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white font-display">KUBOTANOW AEMP</h3>
                <span className="text-[10px] text-zinc-400">Tractores M7 / Agrícola</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              {services?.kubotaAemp.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Unidades en Campo</span>
              <span className="font-bold text-emerald-400 tabular-nums">{services?.kubotaAemp.unitsOnline} Activas</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Respuesta Servidor</span>
              <span className="font-bold text-white tabular-nums">{services?.kubotaAemp.latencyMs} ms</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>Ubicación Servidor:</span>
            <span className="text-zinc-300">San Juan de la Maguana / RD</span>
          </div>
        </div>

        {/* 5. Google Gemini AI Engine */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-[2px] bg-purple-500/10 text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white font-display">GEMINI 3.8 FLASH</h3>
                <span className="text-[10px] text-zinc-400">Diagnóstico IA & Repuestos</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              {services?.geminiAi.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Modelo Activo</span>
              <span className="font-bold text-purple-400 text-[11px] truncate block">{services?.geminiAi.model}</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Tiempo Inferencia</span>
              <span className="font-bold text-white tabular-nums">{services?.geminiAi.latencyMs} ms</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>Modo Resiliencia:</span>
            <span className="text-zinc-300 font-bold">Fallback Local Activo</span>
          </div>
        </div>

        {/* 6. DGII Fiscal Sequence Service */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-[2px] bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white font-display">DGII COMPROBANTES</h3>
                <span className="text-[10px] text-zinc-400">NCF B01 & B02 Fiscal</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              {services?.dgiiFiscalService.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Secuencia Fiscal</span>
              <span className="font-bold text-emerald-400 tabular-nums">Año Fiscal {services?.dgiiFiscalService.activeSequenceYear}</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Validación RNC</span>
              <span className="font-bold text-white">En Línea</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>Tipos Habilitados:</span>
            <span className="text-zinc-300 font-bold">B01, B02, B14, B15</span>
          </div>
        </div>

        {/* 7. Intuit QuickBooks Online (QBO) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-[2px] bg-emerald-500/10 text-emerald-400">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white font-display">QUICKBOOKS ONLINE</h3>
                <span className="text-[10px] text-zinc-400">Contabilidad & NCF Sync</span>
              </div>
            </div>
            <button
              onClick={handleTestQuickBooks}
              disabled={testingService === 'quickbooks'}
              className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase hover:bg-emerald-500/30 cursor-pointer disabled:opacity-50"
            >
              {testingService === 'quickbooks' ? 'Probando...' : 'Test Sync'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Realm ID QBO</span>
              <span className="font-bold text-emerald-400 font-mono text-[11px]">93414520938</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Plan de Cuentas</span>
              <span className="font-bold text-white">ITBIS & DGII OK</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>Sincronización:</span>
            <span className="text-zinc-300 font-bold">Bilateral Automática</span>
          </div>
        </div>

        {/* 8. Method:CRM Integration */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-[2px] bg-blue-500/10 text-blue-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white font-display">METHOD:CRM REST API</h3>
                <span className="text-[10px] text-zinc-400">Embudo de Ventas & Oportunidades</span>
              </div>
            </div>
            <button
              onClick={handleTestMethodCrm}
              disabled={testingService === 'methodcrm'}
              className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase hover:bg-blue-500/30 cursor-pointer disabled:opacity-50"
            >
              {testingService === 'methodcrm' ? 'Probando...' : 'Test Lead'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Cuenta Empresa</span>
              <span className="font-bold text-blue-400 font-mono text-[11px]">tmd_dominicana</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Etapa Lead</span>
              <span className="font-bold text-white">Quote Sent</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>Enlace QBO:</span>
            <span className="text-zinc-300 font-bold">Nativo 2-Vías</span>
          </div>
        </div>

        {/* 9. Microsoft 365 / Outlook Graph API */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-[2px] bg-sky-500/10 text-sky-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white font-display">MICROSOFT 365 OUTLOOK</h3>
                <span className="text-[10px] text-zinc-400">Graph API / Correo & Calendario</span>
              </div>
            </div>
            <button
              onClick={handleTestOutlook}
              disabled={testingService === 'outlook'}
              className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase hover:bg-sky-500/30 cursor-pointer disabled:opacity-50"
            >
              {testingService === 'outlook' ? 'Probando...' : 'Test Mail'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Buzón Oficial</span>
              <span className="font-bold text-sky-400 font-mono text-[11px] truncate block">ventas@tmd.rd</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase">Calendario Taller</span>
              <span className="font-bold text-white">Bahías Km 22 Sync</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span>Entregabilidad:</span>
            <span className="text-zinc-300 font-bold">100% In-Box Corporativo</span>
          </div>
        </div>

      </div>

      {/* Integration Architectural Summary Banner */}
      <div className="p-4 rounded-[4px] bg-zinc-900/60 border border-zinc-800 text-xs space-y-2">
        <h4 className="font-bold text-amber-400 uppercase text-[11px] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          ARQUITECTURA DE DATOS UNIFICADA (TMD DOMINICANA)
        </h4>
        <p className="text-zinc-400 leading-relaxed text-[11px]">
          La plataforma en Google Cloud Run actúa como orquestador central: las solicitudes de repuestos y órdenes de taller se enrutan a <strong className="text-zinc-200">Fullbay Connect</strong>; la telemetría en tiempo real de tractores y excavadoras se extrae de los feeds <strong className="text-zinc-200">JCB LiveLink</strong> y <strong className="text-zinc-200">KubotaNOW AEMP 2.0</strong>; y el catálogo comercial de venta de maquinaria nueva junto a los controles administrativos residen en <strong className="text-zinc-200">el Motor de Base de Datos Cloud ERP</strong>.
        </p>
      </div>
    </div>
  );
};
