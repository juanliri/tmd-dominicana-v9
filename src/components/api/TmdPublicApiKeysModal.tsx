import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Check, 
  Code, 
  Webhook, 
  ShieldCheck, 
  ExternalLink, 
  Terminal, 
  Radio, 
  FileJson, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Building2,
  Lock
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface TmdPublicApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TmdPublicApiKeysModal: React.FC<TmdPublicApiKeysModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedContractor, setSelectedContractor] = useState('Ingeniería Estrella S.A.');
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<'keys' | 'endpoints' | 'webhooks'>('keys');

  if (!isOpen) return null;

  const currentApiKey = environment === 'production' 
    ? 'tmd_live_sk_7f8a92bc44e18920fa581290bb0021ce' 
    : 'tmd_test_sk_sandbox_39201940192840192401824a';

  const webhookSecret = 'whsec_984fbc90a88172c7263541fa90218';

  const handleCopyKey = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(currentApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const sampleCurl = `curl -X GET "https://api.tmd.com.do/v1/telematics/fleet" \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "X-TMD-Contractor-RNC: 101-02948-1" \\
  -H "Content-Type: application/json"`;

  const handleCopyCurl = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleDownloadOpenApi = () => {
    triggerHaptic('medium');
    const openApiSchema = {
      openapi: '3.0.3',
      info: {
        title: 'TMD Dominicana Corporate REST API',
        version: '9.0.0',
        description: 'API Pública Empresarial para Integración de ERPs de Contratistas con Flota y Taller Km 22'
      },
      servers: [{ url: 'https://api.tmd.com.do/v1' }],
      paths: {
        '/telematics/fleet': {
          get: {
            summary: 'Consultar estado telemático y telemetría CAN-bus de la flota contratista',
            responses: { '200': { description: 'Flota activa con GPS, horómetros y combustible' } }
          }
        },
        '/inventory/parts/search': {
          get: {
            summary: 'Consultar stock mayorista en almacén central Km 22 en tiempo real',
            responses: { '200': { description: 'Piezas compatibles y disponibilidad inmediata' } }
          }
        },
        '/workorders/emergency': {
          post: {
            summary: 'Crear solicitud de auxilio técnico móvil 4x4 en obra',
            responses: { '201': { description: 'Despacho registrado en radar de auxilio técnico' } }
          }
        }
      }
    };

    const blob = new Blob([JSON.stringify(openApiSchema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tmd_openapi_v9_${selectedContractor.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-[5px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-display uppercase tracking-wide">
                  API Pública TMD & Integración ERP Corporativo
                </h3>
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                  REST & Webhooks
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Integración directa de telemetría CAN-bus, stock de piezas y órdenes de taller con SAP, Oracle o ERP propio
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 text-zinc-400 hover:text-white rounded-[2px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contractor Selector & Tabs */}
        <div className="px-6 py-3 bg-zinc-950/70 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400 font-mono">CONTRATISTA ASOCIADO:</span>
            <select
              value={selectedContractor}
              onChange={(e) => {
                triggerHaptic('light');
                setSelectedContractor(e.target.value);
              }}
              className="bg-zinc-900 border border-zinc-700 text-amber-400 font-bold text-xs rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-amber-400"
            >
              <option value="Ingeniería Estrella S.A.">Ingeniería Estrella S.A. (RNC: 101-02948-1)</option>
              <option value="Constructora Malespín S.R.L.">Constructora Malespín S.R.L. (RNC: 101-83920-4)</option>
              <option value="Constructora Rizek & Asoc.">Constructora Rizek & Asoc. (RNC: 102-99382-7)</option>
              <option value="Alba Sánchez & Asoc.">Alba Sánchez & Asoc. (RNC: 101-19283-9)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('keys')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-[2px] transition-all ${
                activeTab === 'keys'
                  ? 'bg-amber-400 text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              API Keys
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('endpoints')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-[2px] transition-all ${
                activeTab === 'endpoints'
                  ? 'bg-amber-400 text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Endpoints & cURL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('webhooks')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-[2px] transition-all ${
                activeTab === 'webhooks'
                  ? 'bg-amber-400 text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Webhooks Eventos
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto font-sans">
          {activeTab === 'keys' && (
            <div className="space-y-4">
              {/* Environment Toggle */}
              <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-[3px]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Entorno de Ejecución
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Utilice Sandbox para homologación técnica sin afectar registros operativos
                    </p>
                  </div>
                </div>

                <div className="flex items-center bg-zinc-900 border border-zinc-700 p-0.5 rounded-[2px]">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setEnvironment('production');
                    }}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-[2px] transition-all ${
                      environment === 'production'
                        ? 'bg-emerald-500 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    PRODUCCIÓN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setEnvironment('sandbox');
                    }}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-[2px] transition-all ${
                      environment === 'sandbox'
                        ? 'bg-amber-400 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    SANDBOX
                  </button>
                </div>
              </div>

              {/* API Key Box */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-[3px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">Bearer API Token (Secreto):</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Clave Activa & Verificada
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={currentApiKey}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-[2px] px-3 py-2 text-white font-mono text-xs select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="px-3 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                    <span>{copiedKey ? 'COPIADA' : 'COPIAR'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Cuota asignada: 50,000 llamadas/mes. Rate limit: 60 peticiones/segundo por IP.
                </p>
              </div>

              {/* Permissions scope */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[2px]">
                  <p className="text-xs font-bold text-white font-display uppercase tracking-wider mb-1">
                    Telemetría CAN-Bus
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Lectura en vivo de horómetro, GPS satelital, nivel de diésel y códigos de falla DTC SPN/FMI.
                  </p>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[2px]">
                  <p className="text-xs font-bold text-white font-display uppercase tracking-wider mb-1">
                    Inventario de Repuestos
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Consulta en vivo de existencias en Almacén Km 22, precios B2B contratista y reserva en mostrador.
                  </p>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[2px]">
                  <p className="text-xs font-bold text-white font-display uppercase tracking-wider mb-1">
                    Órdenes de Taller
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Seguimiento de bahías de taller, peritajes fotográficos e informes de espectrometría S.O.S.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black border border-emerald-500/40">
                      GET
                    </span>
                    <span className="font-mono text-xs text-white font-bold">/v1/telematics/fleet</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Retorna todas las máquinas asociadas al RNC con coordenadas WGS84, horómetros y estado de motor.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black border border-emerald-500/40">
                      GET
                    </span>
                    <span className="font-mono text-xs text-white font-bold">/v1/inventory/parts/search?q=LG40C0032</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Búsqueda exacta de repuestos OEM con stock en estantería Km 22 y tiempo estimado de entrega.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/20 text-amber-400 font-mono text-[10px] font-black border border-amber-500/40">
                      POST
                    </span>
                    <span className="font-mono text-xs text-white font-bold">/v1/workorders/emergency</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Genera una orden urgente de despacho de camioneta móvil 4x4 con coordenadas de avería en obra.
                  </p>
                </div>
              </div>

              {/* cURL Example */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-[3px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" /> Ejemplo de Solicitud en cURL
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCurl}
                    className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCurl ? 'COPIADO' : 'COPIAR CURL'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-black/60 rounded-[2px] text-xs font-mono text-emerald-400 overflow-x-auto border border-zinc-800">
                  {sampleCurl}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-[3px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">Webhook Endpoint URL del Contratista:</span>
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
                    HMAC-SHA256
                  </span>
                </div>
                <input
                  type="text"
                  defaultValue="https://erp.estrella.com.do/api/webhooks/tmd-listener"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-[2px] px-3 py-2 text-white font-mono text-xs"
                />

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-zinc-400">Firma Secreta del Webhook:</span>
                  <span className="text-zinc-300 font-mono bg-zinc-900 px-2 py-0.5 rounded-[2px] border border-zinc-700">
                    {webhookSecret}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Suscripción a Eventos en Tiempo Real
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2.5 bg-zinc-950 border border-zinc-800 rounded-[2px] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-zinc-700 text-amber-500" />
                    <div>
                      <p className="text-xs font-mono font-bold text-white">telematics.dtc_alarm</p>
                      <p className="text-[11px] text-zinc-400">Disparo inmediato ante sobrecalentamiento de motor o caída de presión de aceite</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-2.5 bg-zinc-950 border border-zinc-800 rounded-[2px] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-zinc-700 text-amber-500" />
                    <div>
                      <p className="text-xs font-mono font-bold text-white">workorder.completed</p>
                      <p className="text-[11px] text-zinc-400">Notificación al finalizar servicio en taller con reporte pericial adjunto</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-2.5 bg-zinc-950 border border-zinc-800 rounded-[2px] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-zinc-700 text-amber-500" />
                    <div>
                      <p className="text-xs font-mono font-bold text-white">geofence.exit_alert</p>
                      <p className="text-[11px] text-zinc-400">Alerta satelital si una maquinaria traspasa la geocerca delimitada</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encriptación TLS 1.3 y autenticación Bearer con firma criptográfica</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadOpenApi}
              className="w-full sm:w-auto px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono text-xs font-bold flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer"
            >
              <FileJson className="w-4 h-4" />
              <span>Descargar OpenAPI JSON</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-[2px] bg-amber-500 hover:bg-amber-400 text-black font-display uppercase tracking-wider text-xs font-bold transition-all cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
