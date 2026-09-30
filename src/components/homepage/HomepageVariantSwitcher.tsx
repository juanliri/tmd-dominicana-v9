import React, { useState } from 'react';
import { Layers, Check, Sparkles, ChevronUp, ChevronDown, X, Info } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export type HomepageVariant = 'original' | 'via1' | 'via2' | 'via3';

interface HomepageVariantSwitcherProps {
  currentVariant: HomepageVariant;
  onSelectVariant: (variant: HomepageVariant) => void;
}

export const HomepageVariantSwitcher: React.FC<HomepageVariantSwitcherProps> = ({
  currentVariant,
  onSelectVariant,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const variantsList: {
    id: HomepageVariant;
    name: string;
    icon: string;
    tag: string;
    desc: string;
    highlight: string;
  }[] = [
    {
      id: 'via2',
      name: 'Vía 2: Flagship Dealership',
      icon: '👑',
      tag: '5 CAPÍTULOS CINEMÁTICOS',
      desc: 'Experiencia Apple B2B / Tesla Heavy Equipment. 4K Dealership Cinema, fortaleza Km 22, suite ejecutiva y pabellón oficial de marcas.',
      highlight: 'Máximo prestigio visual y autoridad institucional.',
    },
    {
      id: 'via3',
      name: 'Vía 3: Hybrid Diamond Engine',
      icon: '💎',
      tag: 'EQUILIBRADA & ALTA CONVERSIÓN',
      desc: 'Lo mejor de ambos mundos: 4K hero con docked conversion deck en el primer pliegue, showroom a 550px, ribbon operacional 24/7 y trade-in en 1 click.',
      highlight: 'Recomendada oficialmente por arquitectura.',
    },
    {
      id: 'via1',
      name: 'Vía 1: Transactional Cockpit',
      icon: '⚡',
      tag: 'VELOCIDAD B2B MÁXIMA',
      desc: 'Cockpit de inventario inmediato con filtros directos, matriz de especificaciones y menor distancia de scroll (<2,400px).',
      highlight: 'Para compras y cotizaciones rápidas.',
    },
    {
      id: 'original',
      name: 'Versión Original',
      icon: '🏛️',
      tag: 'LAYOUT BASE CLÁSICO',
      desc: 'Estructura previa con todos los 8 módulos independientes, carrusel y bloques originales completos.',
      highlight: 'Referencia comparativa completa.',
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-none">
      <div className="pointer-events-auto bg-zinc-950/95 text-white rounded-2xl border border-amber-500/50 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden transition-all duration-300">
        
        {/* Header Bar */}
        <div 
          onClick={() => {
            setIsExpanded(!isExpanded);
            triggerHaptic();
          }}
          className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 cursor-pointer border-b border-zinc-800 hover:border-amber-500/30 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
                  LABORATORIO COMPARATIVO DE HOMEPAGE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  4 VERSIONES ACTIVAS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans hidden sm:block">
                Activa: <strong className="text-white">{variantsList.find(v => v.id === currentVariant)?.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-zinc-400 hover:text-white p-1 rounded-md">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Selector Body */}
        {isExpanded && (
          <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-950">
            {variantsList.map((v) => {
              const isSelected = currentVariant === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    onSelectVariant(v.id);
                    triggerHaptic();
                  }}
                  className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between group ${
                    isSelected 
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/20' 
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{v.icon}</span>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-amber-500 text-zinc-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold font-condensed tracking-tight block text-white line-clamp-1">
                      {v.name.split(':')[0]}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400/90 block font-bold mt-0.5 uppercase">
                      {v.tag.split(' ')[0]} {v.tag.split(' ')[1] || ''}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-sans line-clamp-2 mt-2 leading-tight">
                    {v.highlight}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
