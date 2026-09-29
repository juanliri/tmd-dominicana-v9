import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck, 
  DollarSign, 
  Wrench, 
  HardHat, 
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { FAQ_DATA, FAQItem } from '../data/faq';

interface FAQSectionProps {
  onNavigate: (route: string) => void;
  onOpenEstimate?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onNavigate, onOpenEstimate }) => {
  const [openId, setOpenId] = useState<string | null>('faq-mach-1');

  // Featured 4 high-yield FAQs for concise Homepage footprint
  const featuredFAQs = FAQ_DATA.slice(0, 4);

  const toggleItem = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const handleAction = (item: FAQItem) => {
    if (item.actionType === 'calc' || item.actionType === 'estimate') {
      if (onOpenEstimate) {
        onOpenEstimate();
      } else {
        onNavigate('#/tco-calculator');
      }
    } else if (item.actionType === 'route' && item.actionRoute) {
      onNavigate(item.actionRoute);
    } else if (item.actionType === 'whatsapp') {
      const msg = encodeURIComponent(
        `Hola TMD Dominicana, consulta sobre: "${item.question}".`
      );
      window.open(`https://wa.me/18095601234?text=${msg}`, '_blank');
    }
  };

  return (
    <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-2 sm:py-4 font-mono" id="faq-section">
      <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-4 sm:p-5 shadow-xl">
        
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                PREGUNTAS FRECUENTES
              </span>
              <span className="text-[10px] text-zinc-500 uppercase">
                Maquinaria, Financiamiento & Repuestos
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase font-display">
              DUDAS HABITUALES DE CONTRATISTAS
            </h2>
          </div>

          <button
            onClick={() => onNavigate('#/help')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold uppercase transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>CENTRO DE AYUDA</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* 2-Column Responsive Compact Accordion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3">
          {featuredFAQs.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-[3px] border transition-all ${
                  isOpen
                    ? 'bg-zinc-950 border-amber-400/50 shadow-xs'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full text-left p-3 flex items-center justify-between gap-2.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      ?
                    </span>
                    <h3 className="font-bold text-xs text-white uppercase font-display">
                      {item.question}
                    </h3>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 text-xs text-zinc-300 space-y-2 animate-in fade-in">
                    <p className="leading-relaxed text-[11px] text-zinc-300">
                      {item.answer}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                        {item.categoryLabel}
                      </span>
                      {item.actionLabel && (
                        <button
                          type="button"
                          onClick={() => handleAction(item)}
                          className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 hover:underline cursor-pointer uppercase"
                        >
                          <span>{item.actionLabel}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
