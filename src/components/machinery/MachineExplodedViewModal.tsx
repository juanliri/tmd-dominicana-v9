import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Cpu,
  Wrench,
  Zap,
  Sparkles,
  Download,
  X,
  Info,
  CheckCircle2,
  Maximize2,
  Box,
  RotateCcw,
  ShoppingCart
} from 'lucide-react';

interface MachineExplodedViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineModel?: string;
}

interface LayerItem {
  id: string;
  name: string;
  category: string;
  visible: boolean;
  color: string;
  description: string;
  keyComponents: { name: string; partNumber: string; priceUsd: number }[];
}

export const MachineExplodedViewModal: React.FC<MachineExplodedViewModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD Excavadora de Orugas',
  machineModel = '922E HD (Tier 3 / Cummins 6BTA 5.9)'
}) => {
  const [layers, setLayers] = useState<LayerItem[]>([
    {
      id: 'bodywork',
      name: 'Carrocería & Cabina FOPS/ROPS',
      category: 'Estructura Exterior',
      visible: true,
      color: '#f59e0b',
      description: 'Chapa de protección balística, contrapeso de 4,500 kg y cabina presurizada con climatizador.',
      keyComponents: [
        { name: 'Cristal Panorámico Frontal Tintado', partNumber: 'CAB-922-GLS01', priceUsd: 480 },
        { name: 'Asiento Neumático Ergonómico Grammer', partNumber: 'CAB-922-ST04', priceUsd: 1250 }
      ]
    },
    {
      id: 'powertrain',
      name: 'Tren de Potencia (Motor Cummins)',
      category: 'Motorización Diésel',
      visible: true,
      color: '#ef4444',
      description: 'Motor Cummins 6BTA 5.9 turboalimentado de 150 HP @ 1,950 RPM con bomba de inyección mecánica en línea Bosch.',
      keyComponents: [
        { name: 'Conjunto Turboalimentador Holset HX35W', partNumber: 'ENG-HOLSET-HX35', priceUsd: 1420 },
        { name: 'Bomba de Inyección Mecánica Bosch', partNumber: 'ENG-INJ-BOSCH-6B', priceUsd: 2890 },
        { name: 'Bomba de Agua y Termostato OEM', partNumber: 'ENG-WTR-PUMP-922', priceUsd: 360 }
      ]
    },
    {
      id: 'hydraulics',
      name: 'Sistema Hidráulico Kawasaki 350 Bar',
      category: 'Fluidos & Presión',
      visible: true,
      color: '#3b82f6',
      description: 'Bombas gemelas de pistones de caudal variable Kawasaki K3V112DT (2 x 224 L/min) y válvula de control principal Parker.',
      keyComponents: [
        { name: 'Bomba Principal Tandem Kawasaki K3V112', partNumber: 'HYD-KAW-K3V112', priceUsd: 6850 },
        { name: 'Bloque Válvula de Control Principal 350 Bar', partNumber: 'HYD-VALV-MAIN-922', priceUsd: 4900 },
        { name: 'Kit Empacaduras Cilindro Pluma (Boom)', partNumber: 'HYD-SEAL-BOOM-922', priceUsd: 295 }
      ]
    },
    {
      id: 'undercarriage',
      name: 'Tren de Rodaje & Mandos Finales',
      category: 'Tracción & Orugas',
      visible: true,
      color: '#10b981',
      description: '49 tejas por lado de triple garra (600 mm), rodillos superiores templados e inferiores blindados para roca abrasiva.',
      keyComponents: [
        { name: 'Motor de Traslación con Reductor Planetario', partNumber: 'UND-TRV-MTR-922', priceUsd: 4100 },
        { name: 'Rueda Guía Delantera (Idler) con Resorte', partNumber: 'UND-IDLER-TENS-922', priceUsd: 890 },
        { name: 'Rodillo Inferior de Doble Pestaña', partNumber: 'UND-ROL-INF-922', priceUsd: 145 }
      ]
    },
    {
      id: 'electronics',
      name: 'ECM, Mazo de Cables & CAN-Bus J1939',
      category: 'Electrónica & Satelital',
      visible: true,
      color: '#8b5cf6',
      description: 'Módulo de control de potencia del motor (EPC), módem telemático satelital 4G y pantalla LCD a color de 7 pulgadas.',
      keyComponents: [
        { name: 'Computadora Principal ECU/ECM Cummins', partNumber: 'ELC-ECM-CUM-6B', priceUsd: 3100 },
        { name: 'Módem Satelital Telemático TMD LiveLink', partNumber: 'IOT-MDM-LIVE-4G', priceUsd: 750 }
      ]
    }
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState<string>('hydraulics');

  if (!isOpen) return null;

  const toggleLayer = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId) || layers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  EXPLODED VIEW 3D • INGENIERÍA
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  {machineModel}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Visor de Despiece y Capas Mecánicas
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Visualizer Simulation Stage */}
        <div className="relative bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 p-6 border-b border-zinc-800 min-h-[220px] flex items-center justify-center overflow-hidden shrink-0">
          {/* Grid lines background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Schematic Representation of Layers */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl">
            {layers.map((layer, index) => {
              const isSelected = selectedLayerId === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`p-3 rounded-[3px] border transition-all cursor-pointer select-none text-center ${
                    !layer.visible
                      ? 'opacity-30 bg-zinc-950 border-zinc-850'
                      : isSelected
                      ? 'bg-zinc-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                  style={{ minWidth: '130px' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayer(layer.id);
                      }}
                      className="text-zinc-500 hover:text-white"
                    >
                      {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
                    </button>
                  </div>
                  <span className="text-[11px] font-bold text-white block uppercase tracking-tight font-display">
                    {layer.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block truncate">
                    Capa {index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer Deep Dive & Spare Parts */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[50vh] text-xs">
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedLayer.color }}
                />
                <h3 className="font-bold text-white text-xs font-display uppercase tracking-wide">
                  {selectedLayer.name}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-[2px] bg-zinc-800 text-amber-400 text-[10px] font-bold uppercase">
                {selectedLayer.category}
              </span>
            </div>
            <p className="text-zinc-300 font-sans text-xs leading-relaxed">
              {selectedLayer.description}
            </p>
          </div>

          {/* Key Components List with Parts Integration */}
          <div>
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block font-display mb-2">
              Componentes Críticos & Repuestos Genuinos Asociados:
            </span>
            <div className="space-y-2">
              {selectedLayer.keyComponents.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-[2px] flex items-center justify-between hover:border-zinc-700 transition-colors"
                >
                  <div>
                    <span className="font-bold text-zinc-200 text-xs block font-sans">{comp.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Part Number OEM: <strong className="text-amber-400">{comp.partNumber}</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white text-xs">
                      US$ {comp.priceUsd.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Pedir Pieza</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-zinc-500 font-mono">
            Planos de Ingeniería Homologados por LiuGong & JCB Factory
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayers(layers.map(l => ({ ...l, visible: true })))}
              className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Mostrar Todas las Capas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
