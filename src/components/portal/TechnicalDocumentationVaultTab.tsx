import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ALL_OFFICIAL_BROCHURES, MACHINE_PDFS_MAP, OfficialBrochure } from '../../data/machinePdfsData';

interface FichaItem {
  id: string;
  brand: string;
  modelCode: string;
  machineId: string;
  fileName: string;
  fileUrl: string;
}

export const TechnicalDocumentationVaultTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [activeDocType, setActiveDocType] = useState<'all' | 'brochures' | 'fichas'>('all');

  // Convert the 40 machine-specific fichas (plus all mappings) into list items
  const fichasItems: FichaItem[] = useMemo(() => {
    return Object.values(MACHINE_PDFS_MAP).map(m => ({
      id: `ficha-${m.machineId}`,
      brand: m.brand,
      modelCode: m.modelCode,
      machineId: m.machineId,
      fileName: m.fichaFileName,
      fileUrl: m.fichaPdfUrl
    }));
  }, []);

  const brands = useMemo(() => {
    const list = new Set<string>();
    ALL_OFFICIAL_BROCHURES.forEach(b => list.add(b.brand));
    fichasItems.forEach(f => list.add(f.brand));
    return ['all', ...Array.from(list).sort()];
  }, [fichasItems]);

  const filteredBrochures = useMemo(() => {
    return ALL_OFFICIAL_BROCHURES.filter(b => {
      const matchesSearch = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = selectedBrand === 'all' || b.brand.toLowerCase() === selectedBrand.toLowerCase();
      return matchesSearch && matchesBrand;
    });
  }, [searchQuery, selectedBrand]);

  const filteredFichas = useMemo(() => {
    return fichasItems.filter(f => {
      const matchesSearch = 
        f.modelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = selectedBrand === 'all' || f.brand.toLowerCase() === selectedBrand.toLowerCase();
      return matchesSearch && matchesBrand;
    });
  }, [fichasItems, searchQuery, selectedBrand]);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[5px] p-4 sm:p-5 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
                ARCHIVO TÉCNICO OFICIAL
              </span>
              <span className="text-zinc-500 text-xs font-mono">SEDE CENTRAL KM 22 • REP. DOMINICANA</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Bóveda de Catálogos & Fichas Técnicas Oficiales</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Descargue los folletos oficiales multi-página emitidos directamente por fabricantes internacionales (JCB, Kubota, LiuGong, Ammann, LS Tractor, Yanmar) y fichas técnicas homologadas para financiamiento bancario en Bagrícola, Banco Popular, Banreservas y BHD.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-center">
              <span className="block text-lg font-black text-amber-400 leading-none">42</span>
              <span className="text-[9px] text-zinc-400 uppercase font-bold">Catálogos Fábrica</span>
            </div>
            <div className="px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-center">
              <span className="block text-lg font-black text-emerald-400 leading-none">259</span>
              <span className="text-[9px] text-zinc-400 uppercase font-bold">Fichas de Taller</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900 p-3.5 rounded-[5px] border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo (ej. 3CX, 220X, SVL97, 856H)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Doc Type Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-zinc-950 rounded-[3px] border border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveDocType('all')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer uppercase ${
                activeDocType === 'all' ? 'bg-amber-400 text-black shadow-xs font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({filteredBrochures.length + filteredFichas.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveDocType('brochures')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer uppercase ${
                activeDocType === 'brochures' ? 'bg-amber-400 text-black shadow-xs font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Catálogos Fábrica ({filteredBrochures.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveDocType('fichas')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer uppercase ${
                activeDocType === 'fichas' ? 'bg-amber-400 text-black shadow-xs font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Fichas Técnicas ({filteredFichas.length})
            </button>
          </div>
        </div>

        {/* Brand Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0 mr-1">MARCA:</span>
          {brands.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBrand(b)}
              className={`px-2.5 py-1 rounded-[2px] text-[11px] font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedBrand.toLowerCase() === b.toLowerCase()
                  ? 'bg-zinc-800 text-amber-400 border border-amber-400/40 shadow-xs'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {b === 'all' ? 'TODAS LAS MARCAS' : b}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: OFFICIAL MANUFACTURER BROCHURES */}
      {(activeDocType === 'all' || activeDocType === 'brochures') && filteredBrochures.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Catálogos Oficiales de Fábrica ({filteredBrochures.length})</span>
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">EDICIONES MULTI-PÁGINA ALTA RESOLUCIÓN</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredBrochures.map((doc: OfficialBrochure) => (
              <div 
                key={doc.id}
                className="bg-zinc-950 rounded-[3px] border border-zinc-800 hover:border-amber-400/40 p-3.5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-black uppercase">
                      {doc.brand}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono font-bold">
                      {doc.sizeMb} MB
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                    {doc.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                    Categoría: <span className="text-zinc-300 font-semibold">{doc.category}</span>
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
                  <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Oficial Fábrica</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Abrir en pestaña nueva"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={doc.fileUrl}
                      download={doc.fileName}
                      className="px-2.5 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center gap-1 transition-all cursor-pointer"
                      title="Descargar PDF"
                    >
                      <Download className="w-3 h-3" />
                      <span>Descargar</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: TECHNICAL SPEC SHEETS (FICHAS TÉCNICAS DE TALLER) */}
      {(activeDocType === 'all' || activeDocType === 'fichas') && filteredFichas.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Fichas Técnicas de Taller & Banco ({filteredFichas.length})</span>
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">HOMOLOGACIÓN BANCARIA & TOLERANCIAS OEM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredFichas.map((ficha: FichaItem) => (
              <div 
                key={ficha.id}
                className="bg-zinc-950 rounded-[3px] border border-zinc-800 hover:border-zinc-700 p-3 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">
                      {ficha.brand}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-900 text-zinc-400 text-[9px] font-mono">
                      PDF
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-100">
                    Mod. {ficha.modelCode}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                    {ficha.fileName}
                  </p>
                </div>

                <div className="pt-2.5 mt-2 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Banco Aprobado</span>
                  </span>
                  <a
                    href={ficha.fileUrl}
                    download={ficha.fileName}
                    className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-amber-400 hover:text-black text-amber-400 font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px] uppercase"
                    title="Descargar Ficha Técnica"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredBrochures.length === 0 && filteredFichas.length === 0 && (
        <div className="p-8 text-center bg-zinc-950 rounded-[5px] border border-zinc-800">
          <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-zinc-400 uppercase">
            No se encontraron documentos para la búsqueda "{searchQuery}"
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedBrand('all'); }}
            className="mt-3 px-3 py-1.5 rounded-[2px] bg-amber-400 text-black text-xs font-bold uppercase cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
