import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  FileText, 
  AlertTriangle, 
  PhoneCall, 
  Download, 
  ChevronRight,
  Zap,
  RotateCw
} from 'lucide-react';

interface OfficialWarrantyViewProps {
  onNavigate: (route: string) => void;
}

export const OfficialWarrantyView: React.FC<OfficialWarrantyViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'jcb' | 'liugong' | 'ammann' | 'parts'>('jcb');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* 1. Hero Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 md:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono text-[11px] uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Garantía Oficial de Fábrica & Respaldo MasterCare TMD</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
              Garantías & Respaldo Oficial <span className="text-amber-400">TMD Dominicana</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans max-w-2xl">
              Cada equipo vendido en República Dominicana cuenta con el respaldo directo del fabricante internacional y la cobertura total de repuestos originales, mano de obra certificada y soporte telemático LiveLink™.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 -mt-5 space-y-8">
        {/* 2. Brand Warranty Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-mono font-black text-sm">
                JCB
              </div>
              <span className="font-mono text-[10px] uppercase text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-[2px] bg-zinc-950">
                UK Tier-1 OEM
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">JCB PremierCover</span>
              <h3 className="text-lg font-mono font-bold text-white mt-0.5">2 Años ó 2,000 Horas</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Cobertura integral de tren de fuerza, sistema hidráulico de bomba de pistones axiales y estructura soldada de chasis de fábrica para retroexcavadoras 3CX, excavadoras JS y manipuladores Loadall.
            </p>
            <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px]">Diagnóstico computarizado JCB ServiceMaster</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px]">Telemetría LiveLink satelital en tiempo real</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-mono font-black text-xs">
                LIUGONG
              </div>
              <span className="font-mono text-[10px] uppercase text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-[2px] bg-zinc-950">
                Heavy Duty
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">LiuGong Heavy-Duty Care</span>
              <h3 className="text-lg font-mono font-bold text-white mt-0.5">2 Años ó 3,000 Horas</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Garantía extendida en motores diésel Cummins®, bombas Kawasaki® y transmisiones ZF® equipadas en excavadoras sobre orugas 922E y palas cargadoras 856H.
            </p>
            <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px]">Componentes clase mundial con repuestos en Km 22</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px]">Visitas periódicas de técnicos de fábrica</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-mono font-black text-xs">
                AMMANN
              </div>
              <span className="font-mono text-[10px] uppercase text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-[2px] bg-zinc-950">
                Swiss Compaction
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Ammann Compaction Shield</span>
              <h3 className="text-lg font-mono font-bold text-white mt-0.5">1 Año ó 1,500 Horas</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Garantía suiza de precisión en cajas excéntricas de vibración, tambores de alta resistencia y sistemas de amortiguación para rodillos compactadores de suelo y asfalto.
            </p>
            <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px]">Calibración de fuerza centrífuga en obra</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px]">Kits de sellos y aislantes de vibración en stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Steps to Register or Claim Warranty */}
        <div className="p-5 sm:p-7 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-2xl space-y-5">
          <div className="max-w-2xl">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
              ¿Cómo tramitar una solicitud de garantía en RD?
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Proceso ágil y sin burocracia para asegurar que tu máquina retorne a operación en el menor tiempo posible.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="w-6 h-6 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-mono font-bold text-xs">
                1
              </div>
              <h4 className="font-bold text-white uppercase text-xs">Reporte Inmediato</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Contacta a nuestra mesa de ayuda al (809) 826-2222 o genera una solicitud desde el Portal de Clientes con el número de serie (PIN/VIN).
              </p>
            </div>

            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="w-6 h-6 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-mono font-bold text-xs">
                2
              </div>
              <h4 className="font-bold text-white uppercase text-xs">Tele-Diagnóstico IoT</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Nuestro centro de monitoreo analiza las alertas CAN Bus y parámetros de presión en tiempo real a través de LiveLink™.
              </p>
            </div>

            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="w-6 h-6 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-mono font-bold text-xs">
                3
              </div>
              <h4 className="font-bold text-white uppercase text-xs">Despacho SOS a Obra</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Una camioneta de taller móvil acude a tu proyecto con repuestos OEM nuevos y herramientas especializadas de calibración.
              </p>
            </div>

            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="w-6 h-6 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-mono font-bold text-xs">
                4
              </div>
              <h4 className="font-bold text-white uppercase text-xs">Cierre & Registro</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Se entrega informe técnico digital firmado, reanudando la operación con repuestos garantizados y sin costo en cobertura.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 font-sans">
              ¿Deseas verificar la cobertura activa por número de serie (VIN/PIN)?
            </div>
            <button
              type="button"
              onClick={() => onNavigate('#/fullbay')}
              className="py-2 px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <span>Consultar en Taller Central Fullbay</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
