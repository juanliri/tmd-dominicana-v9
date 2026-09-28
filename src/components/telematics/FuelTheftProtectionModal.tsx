import React, { useState } from 'react';
import { 
  X, 
  Fuel, 
  ShieldAlert, 
  AlertTriangle, 
  TrendingDown, 
  Bell, 
  CheckCircle2, 
  Download, 
  Clock, 
  MapPin, 
  Moon, 
  Lock, 
  Radio, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { LiveLinkUnit } from '../../types';

interface FuelTheftProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: LiveLinkUnit | null;
}

interface FuelIncident {
  id: string;
  timestamp: string;
  eventType: 'theft_alert' | 'unusual_burn' | 'fuel_refill' | 'normal';
  volumeLiters: number;
  fuelLevelBefore: number;
  fuelLevelAfter: number;
  location: string;
  engineStatus: 'off' | 'idle' | 'running';
  severity: 'critical' | 'warning' | 'normal';
}

const SAMPLE_FUEL_INCIDENTS: FuelIncident[] = [
  {
    id: 'inc_01',
    timestamp: '26 Sep 2026 02:42 AM',
    eventType: 'theft_alert',
    volumeLiters: -58.4,
    fuelLevelBefore: 78,
    fuelLevelAfter: 54,
    location: 'Campamento Nizao Km 4 - Estacionamiento Sur',
    engineStatus: 'off',
    severity: 'critical'
  },
  {
    id: 'inc_02',
    timestamp: '24 Sep 2026 11:15 AM',
    eventType: 'fuel_refill',
    volumeLiters: +180.0,
    fuelLevelBefore: 22,
    fuelLevelAfter: 95,
    location: 'Cisterna Móvil Isla Dominicana #3',
    engineStatus: 'off',
    severity: 'normal'
  },
  {
    id: 'inc_03',
    timestamp: '23 Sep 2026 04:18 PM',
    eventType: 'unusual_burn',
    volumeLiters: -12.5,
    fuelLevelBefore: 64,
    fuelLevelAfter: 59,
    location: 'Autopista Duarte Km 28 (Subida La Cumbre)',
    engineStatus: 'running',
    severity: 'warning'
  }
];

export const FuelTheftProtectionModal: React.FC<FuelTheftProtectionModalProps> = ({
  isOpen,
  onClose,
  unit
}) => {
  const [isSentryActive, setIsSentryActive] = useState<boolean>(true);
  const [sentrySensitivity, setSentrySensitivity] = useState<'high' | 'medium'>('high');
  const [alertPhone, setAlertPhone] = useState<string>('+1 (809) 560-1234');
  const [notificationSuccess, setNotificationSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFuelPercent = unit?.fuelLevelPercent || 68;
  const tankCapacityLiters = 350; // Standard 20T excavator tank
  const currentLiters = Math.round((tankCapacityLiters * currentFuelPercent) / 100);

  const handleToggleSentry = () => {
    setIsSentryActive(!isSentryActive);
    setNotificationSuccess(true);
    setTimeout(() => setNotificationSuccess(false), 3000);
  };

  const handleExportIncidentReport = () => {
    const reportText = `=====================================================
TMD DOMINICANA - REPORTE DE TELEMETRÍA: SEGURIDAD DE COMBUSTIBLE
=====================================================
Equipo: ${unit?.model || 'LiuGong 922E'} | Serie: ${unit?.serialNumber || 'TMD-FLEET'}
Sensor: Ultrasonido CAN-Bus J1939 (SPN 96)
Fecha de Emisión: ${new Date().toLocaleDateString('es-DO')} ${new Date().toLocaleTimeString('es-DO')}

1. ESTADO ACTUAL DEL TANQUE:
   - Capacidad Total: ${tankCapacityLiters} Litros (~92.4 Galones)
   - Volumen en Tanque: ${currentLiters} Litros (${currentFuelPercent}%)
   - Centinela Satelital Nocturno: ${isSentryActive ? 'ACTIVO (Vigilancia 24/7)' : 'DESACTIVADO'}
   - Sensibilidad: ${sentrySensitivity === 'high' ? 'Alta (>15L en motor apagado)' : 'Media (>25L)'}

2. HISTORIAL DE INCIDENTES & VARIACIONES DE NIVEL:
${SAMPLE_FUEL_INCIDENTS.map(inc => `   [${inc.timestamp}] ${inc.eventType.toUpperCase()}
   - Volumen: ${inc.volumeLiters > 0 ? '+' : ''}${inc.volumeLiters} Litros (${inc.fuelLevelBefore}% -> ${inc.fuelLevelAfter}%)
   - Ubicación: ${inc.location}
   - Estado Motor: ${inc.engineStatus.toUpperCase()} | Severidad: ${inc.severity.toUpperCase()}`).join('\n\n')}

3. PROTOCOLO DE BLINDAJE TMD CONTRA ROBO DE DIÉSEL:
   - Alarma ultrasónica programada ante caídas >15L con motor apagado.
   - Envío de alerta push inmediata a celulares del jefe de seguridad de obra.
   - Enlace automático con coordenadas GPS del punto exacto de la extracción.
=====================================================
Certificado por Sistema de Telemetría Satelital TMD Dominicana.
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TMD_Seguridad_Combustible_${unit?.model || 'Equipo'}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-[5px] max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-amber-400 text-black shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  Algoritmo Predictivo & Centinela Antirrobo (Task #45)
                </span>
                <span className="text-[10px] text-zinc-400">
                  Sensor J1939 SPN 96
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mt-0.5 font-display">
                Seguridad de Combustible: {unit?.model || 'Excavadora LiuGong 922E'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportIncidentReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-zinc-700"
              title="Descargar reporte pericial de incidencias"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar TXT</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Top Tank Level & Sentry Status Deck */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Current Level Gauge */}
            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="uppercase font-bold text-[10px]">Volumen en Tanque</span>
                <Fuel className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{currentLiters} L</span>
                <span className="text-sm font-bold text-amber-400">({currentFuelPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-[1px] overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-[1px]"
                  style={{ width: `${currentFuelPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 block">Capacidad nominal: {tankCapacityLiters} L (~92 gal)</span>
            </div>

            {/* Sentry Mode Control */}
            <div className={`p-4 rounded-[3px] border space-y-2 flex flex-col justify-between ${
              isSentryActive 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className="uppercase font-bold text-[10px] tracking-wider flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Centinela Nocturno</span>
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${isSentryActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
              </div>

              <div>
                <span className="text-lg font-black uppercase font-display block">
                  {isSentryActive ? 'MODO VIGILANCIA ACTIVO' : 'CENTINELA DESACTIVADO'}
                </span>
                <p className="text-[10px] text-zinc-400 leading-tight mt-1">
                  Dispara alarma satelital si se detecta drenaje &gt;15L entre 10:00 PM y 06:00 AM con motor apagado.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleSentry}
                className={`w-full py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSentryActive 
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700' 
                    : 'bg-amber-400 hover:bg-amber-300 text-black'
                }`}
              >
                {isSentryActive ? 'Desactivar Centinela' : 'Activar Centinela 24/7'}
              </button>
            </div>

            {/* Predictive Algorithm Risk Score */}
            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="uppercase font-bold text-[10px]">Riesgo de Extracción</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>

              <div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  RIESGO BAJO (8%)
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight mt-1 font-sans">
                  Consumo promedio 18.2 L/h acorde a curva nominal del motor Cummins QSB 6.7 bajo carga de cantera.
                </p>
              </div>

              <div className="p-2 rounded-[2px] bg-zinc-900 text-[10px] text-zinc-400 flex items-center justify-between">
                <span>Diferencial Horómetro/Litros:</span>
                <strong className="text-emerald-400 font-mono">+0.3% (Normal)</strong>
              </div>
            </div>

          </div>

          {notificationSuccess && (
            <div className="p-3 rounded-[3px] bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Configuración del Centinela Satelital actualizada correctamente vía enlace módem 4G/J1939.</span>
            </div>
          )}

          {/* Incident Log Table */}
          <div className="p-4 bg-zinc-950 rounded-[3px] border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Bitácora de Variaciones Abruptas & Recargas de Combustible
                </h4>
              </div>
              <span className="text-[10px] text-zinc-500">Últimos 7 días</span>
            </div>

            <div className="space-y-2">
              {SAMPLE_FUEL_INCIDENTS.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-3 rounded-[3px] border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
                    inc.severity === 'critical'
                      ? 'bg-rose-950/20 border-rose-500/50'
                      : inc.severity === 'warning'
                        ? 'bg-amber-950/20 border-amber-400/40'
                        : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-[2px] border ${
                        inc.severity === 'critical'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : inc.severity === 'warning'
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-emerald-600 text-white border-emerald-600'
                      }`}>
                        {inc.eventType === 'theft_alert' ? 'ALERTA: DRENAJE NO AUTORIZADO' : inc.eventType === 'fuel_refill' ? 'RECARGA AUTORIZADA' : 'CONSUMO ANÓMALO'}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">{inc.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{inc.location}</span>
                    </div>
                  </div>

                  <div className="sm:text-right font-mono">
                    <span className={`text-base font-black ${
                      inc.volumeLiters > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {inc.volumeLiters > 0 ? '+' : ''}{inc.volumeLiters} Litros
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {inc.fuelLevelBefore}% → {inc.fuelLevelAfter}% (Motor: {inc.engineStatus.toUpperCase()})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Contacts & Geofenced Alerts Setup */}
          <div className="p-4 bg-zinc-950 rounded-[3px] border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Destinatario de Notificaciones de Emergencia (SMS / WhatsApp)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-bold">Teléfono del Supervisor de Obra</label>
                <input
                  type="text"
                  value={alertPhone}
                  onChange={(e) => setAlertPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white font-mono"
                  placeholder="+1 (809) 000-0000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-bold">Sensibilidad del Sensor Ultrasónico</label>
                <select
                  value={sentrySensitivity}
                  onChange={(e) => setSentrySensitivity(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white font-bold"
                >
                  <option value="high">Alta: Alerta ante caídas &gt; 15 Litros (Recomendada en obra)</option>
                  <option value="medium">Media: Alerta ante caídas &gt; 25 Litros</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telemetría J1939 encriptada con módem satelital Queclink integrado.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            Cerrar Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
