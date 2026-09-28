import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Cpu,
  AlertTriangle,
  Flame,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  CheckCircle2,
  Terminal,
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CanBusGatewaySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineSerial?: string;
  onFaultInjected?: (fault: { spn: number; fmi: number; description: string }) => void;
}

interface CanPacket {
  id: string;
  pgn: string;
  pgnName: string;
  hexData: string;
  decoded: string;
  timestamp: string;
  priority: number;
}

export const CanBusGatewaySimulatorModal: React.FC<CanBusGatewaySimulatorModalProps> = ({
  isOpen,
  onClose,
  machineSerial = 'LG-922E-RD-2024-001',
  onFaultInjected
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activeFault, setActiveFault] = useState<string | null>(null);
  const [packetRateHz, setPacketRateHz] = useState<number>(2);
  const [packets, setPackets] = useState<CanPacket[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<'teltonika' | 'queclink'>('teltonika');
  const [networkMode, setNetworkMode] = useState<'4g' | 'satellite'>('4g');

  const pgnDefinitions = [
    { pgn: '65262', name: 'ET1 (Engine Temperature)', hex: '68 7D 00 00 00 00 00 00', decode: (fault: string | null) => fault === 'SPN110' ? 'Coolant: 112°C [OVERHEAT CRITICAL]' : 'Coolant: 88°C, Oil: 92°C' },
    { pgn: '65263', name: 'EFL/P1 (Fluid Pressure)', hex: '1A 5C 62 00 00 00 00 00', decode: (fault: string | null) => fault === 'SPN100' ? 'Oil Press: 0.9 bar [LOW CRITICAL]' : 'Oil Press: 4.8 bar, Fuel: 3.2 bar' },
    { pgn: '61444', name: 'EEC1 (Electronic Controller 1)', hex: '05 7D 82 2C 19 00 F0 00', decode: () => 'Engine Speed: 1850 RPM, Torque: 72%' },
    { pgn: '65257', name: 'LFE (Fuel Economy)', hex: '38 21 00 00 12 04 00 00', decode: () => 'Fuel Rate: 16.4 L/h, Throttle: 65%' },
    { pgn: '65217', name: 'VD (Vehicle Distance)', hex: 'A4 01 22 00 00 00 00 00', decode: () => 'High-Res Distance: 4,821.5 km' },
    { pgn: '65279', name: 'HYD (Hydraulic System)', hex: '00 A8 01 20 00 00 00 00', decode: (fault: string | null) => fault === 'SPN1081' ? 'Main Relief: 358 bar [PEAK SPIKE]' : 'Main Relief: 285 bar, Flow: 220 L/min' },
  ];

  useEffect(() => {
    if (!isOpen || !isRunning) return;

    const interval = setInterval(() => {
      const randomDef = pgnDefinitions[Math.floor(Math.random() * pgnDefinitions.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

      const newPacket: CanPacket = {
        id: Math.random().toString(36).substring(2, 9),
        pgn: randomDef.pgn,
        pgnName: randomDef.name,
        hexData: randomDef.hex,
        decoded: randomDef.decode(activeFault),
        timestamp: timeStr,
        priority: activeFault ? 1 : 3
      };

      setPackets(prev => [newPacket, ...prev.slice(0, 24)]);
    }, 1000 / packetRateHz);

    return () => clearInterval(interval);
  }, [isOpen, isRunning, packetRateHz, activeFault]);

  const handleInjectFault = (faultKey: string, spn: number, fmi: number, description: string) => {
    if (activeFault === faultKey) {
      setActiveFault(null);
    } else {
      setActiveFault(faultKey);
      if (onFaultInjected) {
        onFaultInjected({ spn, fmi, description });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-[5px] w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[3px] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100 font-display uppercase tracking-wider">
                  Pasarela Telemática IoT CAN-Bus J1939
                </h3>
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                  Tasks #41 & #42
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simulador interactivo de tramas J1939 y banco de inyección de fallas para demostraciones en vivo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Hardware Specs */}
        <div className="p-4 bg-zinc-900/70 border-b border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px]">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">Módem Telemático</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedGateway('teltonika')}
                className={`flex-1 py-1 px-2 rounded-[2px] text-[11px] font-bold transition-all cursor-pointer ${
                  selectedGateway === 'teltonika'
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Teltonika FMC650
              </button>
              <button
                onClick={() => setSelectedGateway('queclink')}
                className={`flex-1 py-1 px-2 rounded-[2px] text-[11px] font-bold transition-all cursor-pointer ${
                  selectedGateway === 'queclink'
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Queclink GV350
              </button>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px]">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">Enlace Transmisión</span>
            <div className="flex gap-2">
              <button
                onClick={() => setNetworkMode('4g')}
                className={`flex-1 py-1 px-2 rounded-[2px] text-[11px] font-bold transition-all cursor-pointer ${
                  networkMode === '4g'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Claro 4G LTE-M
              </button>
              <button
                onClick={() => setNetworkMode('satellite')}
                className={`flex-1 py-1 px-2 rounded-[2px] text-[11px] font-bold transition-all cursor-pointer ${
                  networkMode === 'satellite'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Iridium Satélite
              </button>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px]">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">Frecuencia Tramas</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={packetRateHz}
                onChange={(e) => setPacketRateHz(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-amber-400 w-8 text-right">
                {packetRateHz} Hz
              </span>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Flujo de Telemetría</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-zinc-600'}`} />
                <span className="text-xs font-mono font-bold text-zinc-200">
                  {isRunning ? 'EN VIVO (ONLINE)' : 'PAUSADO'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2 rounded-[2px] text-xs font-bold transition-all cursor-pointer ${
                isRunning ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Content Split: Fault Injection vs Raw CAN Stream */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: Fault Injection Switchboard */}
          <div className="lg:col-span-5 p-4 border-r border-zinc-800 bg-zinc-950 overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Inyector de Fallas (Demostraciones en Vivo)
                </h4>
                {activeFault && (
                  <button
                    onClick={() => setActiveFault(null)}
                    className="text-[10px] font-mono text-zinc-400 hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                Haga clic en cualquiera de las fallas simuladas para forzar la emisión del código DTC J1939 correspondiente y verificar la reacción del portal telemático.
              </p>
            </div>

            {/* Fault Buttons */}
            <div className="space-y-2.5">
              {/* Fault 1: Coolant Temp */}
              <div
                onClick={() => handleInjectFault('SPN110', 110, 0, 'Sobrecalentamiento Severo Refrigerante Motor')}
                className={`p-3 rounded-[3px] border transition-all cursor-pointer ${
                  activeFault === 'SPN110'
                    ? 'bg-red-500/20 border-red-500 text-red-100 shadow-lg shadow-red-500/10'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-4 h-4 ${activeFault === 'SPN110' ? 'text-red-400 animate-bounce' : 'text-zinc-400'}`} />
                    <span className="text-xs font-bold font-mono">SPN 110 / FMI 0</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-bold ${
                    activeFault === 'SPN110' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {activeFault === 'SPN110' ? 'ACTIVO (112°C)' : 'INACTIVO'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Sobrecalentamiento severo de refrigerante motor Cummins QSB6.7 (&gt;108°C). Dispara apagado preventivo.
                </p>
              </div>

              {/* Fault 2: Oil Pressure */}
              <div
                onClick={() => handleInjectFault('SPN100', 100, 1, 'Pérdida Crítica de Presión de Aceite de Motor')}
                className={`p-3 rounded-[3px] border transition-all cursor-pointer ${
                  activeFault === 'SPN100'
                    ? 'bg-red-500/20 border-red-500 text-red-100 shadow-lg shadow-red-500/10'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${activeFault === 'SPN100' ? 'text-red-400 animate-bounce' : 'text-zinc-400'}`} />
                    <span className="text-xs font-bold font-mono">SPN 100 / FMI 1</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-bold ${
                    activeFault === 'SPN100' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {activeFault === 'SPN100' ? 'ACTIVO (0.9 bar)' : 'INACTIVO'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Pérdida crítica de presión de lubricación de motor (&lt;1.2 bar). Riesgo inminente de amarre de cigüeñal.
                </p>
              </div>

              {/* Fault 3: Hydraulic Spike */}
              <div
                onClick={() => handleInjectFault('SPN1081', 1081, 3, 'Pico de Presión Hidráulica Excesiva en Válvula Principal')}
                className={`p-3 rounded-[3px] border transition-all cursor-pointer ${
                  activeFault === 'SPN1081'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-100 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className={`w-4 h-4 ${activeFault === 'SPN1081' ? 'text-amber-400 animate-spin' : 'text-zinc-400'}`} />
                    <span className="text-xs font-bold font-mono">SPN 1081 / FMI 3</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-bold ${
                    activeFault === 'SPN1081' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {activeFault === 'SPN1081' ? 'ACTIVO (358 bar)' : 'INACTIVO'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Sobreesfuerzo en roca de cantera. Válvula de alivio principal excedida por encima de 350 bar continuos.
                </p>
              </div>
            </div>

            {/* Target Machine Box */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-[3px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-400">Equipo Vinculado:</span>
                <span className="text-amber-400 font-mono font-bold">{machineSerial}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Velocidad Baudrate:</span>
                <span className="text-zinc-300 font-mono">250 kbps (SAE J1939-11)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live CAN-Bus Raw Hex Stream & Decoded Inspector */}
          <div className="lg:col-span-7 bg-zinc-950 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-display">
                  Consola de Tramas CAN-Bus J1939 en Tiempo Real
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {packets.length} tramas en búfer
              </span>
            </div>

            <div className="flex-1 bg-black border border-zinc-800 rounded-[3px] p-3 font-mono text-xs overflow-y-auto space-y-1.5 max-h-[380px]">
              {packets.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-xs">
                  Iniciando pasarela de datos...
                </div>
              ) : (
                packets.map((pkt) => (
                  <div
                    key={pkt.id}
                    className={`p-1.5 rounded-[2px] flex flex-col md:flex-row md:items-center justify-between gap-1 border ${
                      pkt.priority === 1
                        ? 'bg-red-950/40 border-red-500/40 text-red-300'
                        : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500">{pkt.timestamp}</span>
                      <span className={`px-1 py-0.2 rounded-[2px] text-[9px] font-bold ${
                        pkt.priority === 1 ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        PGN {pkt.pgn}
                      </span>
                      <span className="text-[11px] font-bold text-zinc-200">{pkt.pgnName}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-zinc-500 tracking-wider">{pkt.hexData}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-zinc-600" />
                      <span className={`font-semibold ${pkt.priority === 1 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                        {pkt.decoded}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 p-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-[3px] flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compatibilidad probada con ECUs Cummins ECM, Rexroth RC, JCB LiveLink y LiuGong Telediagnostics.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Transmisión encriptada vía protocolo UDP binario a puerto 20882 TMD Telematics Hub</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar Pasarela
          </button>
        </div>

      </div>
    </div>
  );
};
