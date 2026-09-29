import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Award, 
  Truck, 
  CheckCircle2, 
  ExternalLink,
  Phone
} from 'lucide-react';
import { OFFICIAL_BRANDS, SHOWROOM_MARKETING_ASSETS } from '../../data/brandsData';

interface BrandsDirectoryProps {
  onNavigate: (route: string) => void;
}

export const BrandsDirectoryView: React.FC<BrandsDirectoryProps> = ({ onNavigate }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredBrands = selectedFilter === 'all' 
    ? OFFICIAL_BRANDS 
    : OFFICIAL_BRANDS.filter(b => b.category.toLowerCase().includes(selectedFilter.toLowerCase()) || b.country.toLowerCase().includes(selectedFilter.toLowerCase()));

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* 1. BREADCRUMBS */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-3 border-b border-slate-200/80 dark:border-white/[0.06] text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-2">
        <button onClick={() => onNavigate('#/home')} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
          Inicio
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
        <span className="text-slate-900 dark:text-white font-bold">Directorio Oficial de Marcas Homologadas</span>
      </div>

      {/* 2. HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-slate-900 to-black text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-white/10">
        <div className="max-w-[1780px] mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-black uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Garantía Oficial de Fábrica · Soporte Técnico Directo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Directorio de Fabricantes <br />
              <span className="text-amber-400">Homologados en República Dominicana</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              TMD Dominicana es el distribuidor oficial y centro de servicio autorizado para los líderes mundiales 
              en movimiento de tierras, minería pesada, compactación vial y soluciones agrícolas.
            </p>
          </div>
        </div>
      </div>

      {/* 3. FILTER CHIPS */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0c0c10] sticky top-14 sm:top-16 z-20">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Todas las Marcas (10)' },
            { id: 'construcción', label: 'Construcción Pesada' },
            { id: 'minería', label: 'Minería & Carga' },
            { id: 'compactación', label: 'Compactación Vial' },
            { id: 'agrícola', label: 'Agrícola & Forestal' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-amber-400 text-black shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. BRAND SHOWCASE CARDS */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="rounded-2xl bg-white dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.08] hover:border-amber-400 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-lg text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-zinc-700">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {brand.name}
                      </h3>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        {brand.category}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-[4px] bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-400">
                    {brand.country}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {brand.tagline}
                </p>

                {/* Equipment lines */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2">
                    Líneas Homologadas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.equipmentLines.map((line, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 rounded-[4px] bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-white/[0.04] text-[10px] font-semibold text-slate-700 dark:text-zinc-300"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <button
                  onClick={() => onNavigate(`#/machinery?brand=${brand.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <span>Ver Modelos en Patio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate(`#/parts?brand=${brand.id}`)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Repuestos OEM →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
