import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Search, 
  CheckCircle, 
  Lock, 
  ExternalLink, 
  ShieldAlert, 
  Cpu, 
  Wrench,
  Layers,
  Sparkles
} from 'lucide-react';
import { TECHNICAL_DOCS_DATA } from '../../data/technicalDocsData';
import { TechnicalDocument, TechDocType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { UniversalBreadcrumbs } from '../common/navigation/UniversalBreadcrumbs';

import techDocsBannerImg from '../../assets/images/jcb_machinery_banner_1789963695284.jpg';

interface TechnicalDocsViewProps {
  onNavigate?: (route: string) => void;
}

export const TechnicalDocsView: React.FC<TechnicalDocsViewProps> = ({ onNavigate }) => {
  const { currentUser, userProfile } = useAuth();
  const { showToast } = useCart();
  const isProMember = !!userProfile?.proMemberTier;
  const [docsList, setDocsList] = useState<TechnicalDocument[]>(TECHNICAL_DOCS_DATA);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const docTypes = [
    { key: 'all', label: 'Todos los Documentos' },
    { key: 'operator_manual', label: 'Manuales de Operador' },
    { key: 'parts_catalog', label: 'Catálogos de Repuestos' },
    { key: 'workshop_manual', label: 'Manuales de Taller' },
    { key: 'tsb_bulletin', label: 'Boletines TSB' },
    { key: 'hydraulic_schematic', label: 'Esquemas Hidráulicos' },
    { key: 'electrical_diagram', label: 'Esquemas Eléctricos' }
  ];

  const brands = ['all', 'JCB', 'LiuGong', 'Cummins', 'Donaldson', 'Ammann'];

  const filteredDocs = docsList.filter(doc => {
    const matchesType = selectedType === 'all' || doc.docType === selectedType;
    const matchesBrand = selectedBrand === 'all' || doc.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.codeRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.modelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesBrand && matchesSearch;
  });

  const handleDownload = (doc: TechnicalDocument) => {
    setDownloadingDocId(doc.id);
    setTimeout(() => {
      setDownloadingDocId(null);
      // Update local download counter
      setDocsList(prev => prev.map(d => d.id === doc.id ? { ...d, downloadCount: d.downloadCount + 1 } : d));
      showToast(`Descargando documento técnico oficial: ${doc.title} (${doc.codeRef}) en PDF.`);
    }, 1200);
  };

  const getDocTypeIcon = (type: TechDocType) => {
    switch (type) {
      case 'tsb_bulletin':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'workshop_manual':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'electrical_diagram':
        return <Cpu className="w-4 h-4 text-emerald-500" />;
      case 'hydraulic_schematic':
        return <Layers className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-24 font-mono">
      {/* ========================================================================= */}
      {/* TIER-1 BRAND DEPARTMENT LANDING HUB HERO (Apple / Tesla / SpaceX Grade)    */}
      {/* ========================================================================= */}
      <div className="relative bg-zinc-950 text-white border-b border-zinc-800 overflow-hidden">
        {/* Atmospheric Industrial Machinery Backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={techDocsBannerImg}
            alt="Centro de Documentación Técnica TMD Dominicana"
            className="w-full h-full object-cover object-center opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />
        </div>

        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-9 relative z-10 space-y-5">
          {onNavigate && (
            <UniversalBreadcrumbs currentRoute="#/tech-docs" onNavigate={onNavigate} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Department Identity & Credentials (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-black uppercase tracking-wider shadow-sm">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>BIBLIOTECA TÉCNICA OFICIAL TMD • HOMOLOGACIÓN OEM DIRECTA</span>
                </span>
                <span className="px-2.5 py-1 rounded-[3px] bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase">
                  PDF 100% ORIGINALES
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight font-display text-white leading-tight">
                MANUALES DE TALLER, <span className="text-amber-400">ESQUEMAS & BOLETINES TSB</span>
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-3xl">
                Biblioteca técnica de ingeniería para mecánicos, jefes de mantenimiento y operadores. Especificaciones de apriete con torquímetro, despieces de repuestos genuinos JCB / LiuGong y diagramas de circuitos hidráulicos hasta 350 bar.
              </p>

              {/* 4 Verified Technical Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className="p-2.5 rounded-[4px] bg-zinc-900/80 border border-zinc-800/90 flex flex-col justify-center">
                  <span className="text-[10px] font-black text-amber-400 uppercase">BIBLIOTECA</span>
                  <span className="text-[11px] font-bold text-white uppercase mt-0.5">140+ MANUALES</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-zinc-900/80 border border-zinc-800/90 flex flex-col justify-center">
                  <span className="text-[10px] font-black text-blue-400 uppercase">CIRCUITOS</span>
                  <span className="text-[11px] font-bold text-white uppercase mt-0.5">BANCO 350 BAR</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-zinc-900/80 border border-zinc-800/90 flex flex-col justify-center">
                  <span className="text-[10px] font-black text-emerald-400 uppercase">ACTUALIZACIÓN</span>
                  <span className="text-[11px] font-bold text-white uppercase mt-0.5">TSB 2026 RD</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-zinc-900/80 border border-zinc-800/90 flex flex-col justify-center">
                  <span className="text-[10px] font-black text-purple-400 uppercase">DESCARGA</span>
                  <span className="text-[11px] font-bold text-white uppercase mt-0.5">PDF DIRECTO</span>
                </div>
              </div>
            </div>

            {/* Right: Technical Support Fast Action Card (4 cols) */}
            <div className="lg:col-span-4 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 rounded-[6px] p-5 border border-zinc-800 shadow-2xl space-y-3 font-mono relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-display">
                  <Sparkles className="w-3.5 h-3.5" />
                  CONSULTA TÉCNICA DIRECTA
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">INGENIERÍA KM 22</span>
              </div>

              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                ¿Requiere un manual de taller descontinuado o asistencia en lectura de códigos de error DTC ECM?
              </p>

              <a
                href="https://wa.me/18095601234?text=Hola%20TMD%20Dominicana,%20solicito%20asistencia%20del%20departamento%20t%C3%A9cnico%20con%20un%20manual%20o%20diagrama%20el%C3%A9ctrico/hidr%C3%A1ulico."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-[3px] bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-zinc-800 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>CONSULTAR CON JEFE DE TALLER →</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-6">
        {/* Search & Brand Filter */}
        <div className="bg-zinc-950 rounded-[5px] p-3.5 border border-zinc-800 space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="BUSCAR POR TÍTULO, CÓDIGO O MODELO (3CX, 6BTA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-[10px] font-bold text-zinc-500 uppercase shrink-0">MARCA:</span>
              {brands.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-2.5 py-1 rounded-[3px] text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                    selectedBrand === b
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {b === 'all' ? 'TODAS' : b}
                </button>
              ))}
            </div>
          </div>

          {/* Document Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-800 scrollbar-none">
            {docTypes.map(t => (
              <button
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                className={`px-2.5 py-1 rounded-[3px] text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === t.key
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase px-1 mb-4">
          <span>{filteredDocs.length} DOCUMENTOS ENCONTRADOS</span>
          <span>DESCARGAS OFICIALES TMD EN PDF</span>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => {
            const isDownloading = downloadingDocId === doc.id;

            return (
              <div
                key={doc.id}
                className="bg-zinc-950 rounded-[5px] p-4 sm:p-5 border border-zinc-800 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-[3px] bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {getDocTypeIcon(doc.docType)}
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block font-display">
                          {doc.brand} • {doc.modelCode}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-zinc-500">
                          {doc.codeRef}
                        </span>
                      </div>
                    </div>

                    {doc.isProOnly && (
                      <span className="px-2 py-0.5 rounded-[3px] bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold uppercase border border-amber-500/20 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>PRO</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-white uppercase font-display leading-snug mb-1.5">
                    {doc.title}
                  </h3>

                  <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed mb-3 uppercase">
                    {doc.summary}
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-[3px] bg-zinc-900 text-[10px] text-zinc-400 font-mono uppercase mb-3.5 border border-zinc-800">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">TAMAÑO</span>
                      <strong className="text-zinc-200">{doc.fileSizeBytes}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">IDIOMA</span>
                      <strong className="text-zinc-200">{doc.language}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">DESCARGAS</span>
                      <strong className="text-amber-400">{doc.downloadCount}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => handleDownload(doc)}
                    className={`w-full py-2 px-3 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isDownloading
                        ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-wait'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-xs'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading ? 'GENERANDO DESCARGA...' : 'DESCARGAR PDF'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
