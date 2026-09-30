import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { HomeViewVia2 } from './homepage/HomeViewVia2';
import { HomeViewVia3 } from './homepage/HomeViewVia3';
import { HomeViewVia1 } from './homepage/HomeViewVia1';
import { HomeViewOriginal } from './homepage/HomeViewOriginal';
import { HomepageVariantSwitcher, HomepageVariant } from './homepage/HomepageVariantSwitcher';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackVariant: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class HomepageErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Homepage variant render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 pt-24">
          <div className="max-w-md w-full p-6 rounded-2xl bg-zinc-900 border border-amber-500/40 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-condensed uppercase tracking-tight">
              Recuperación Automática de Vista
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Ocurrió un error al cargar los componentes de esta versión. Puedes cambiar a otra variante de la Homepage inmediatamente.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  this.props.fallbackVariant();
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs uppercase font-mono"
              >
                Cargar Vía 2 (Flagship)
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-white font-bold text-xs uppercase font-mono border border-zinc-700 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Recargar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onSelectMachine: (machineId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectMachine }) => {
  // Read initial variant from URL query params or localStorage
  const getInitialVariant = (): HomepageVariant => {
    try {
      const hash = window.location.hash || '';
      const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
      const hashParams = new URLSearchParams(hashQuery);
      const searchParams = new URLSearchParams(window.location.search);
      
      const queryVariant = (
        hashParams.get('variant') || 
        hashParams.get('via') || 
        searchParams.get('variant') || 
        searchParams.get('via')
      )?.toLowerCase();

      if (queryVariant === 'original') return 'original';
      if (queryVariant === 'via1' || queryVariant === '1') return 'via1';
      if (queryVariant === 'via2' || queryVariant === '2') return 'via2';
      if (queryVariant === 'via3' || queryVariant === '3') return 'via3';

      const stored = localStorage.getItem('tmd_homepage_variant');
      if (stored === 'original' || stored === 'via1' || stored === 'via2' || stored === 'via3') {
        return stored;
      }
    } catch {
      // Fallback
    }
    return 'via2';
  };

  const [currentVariant, setCurrentVariant] = useState<HomepageVariant>(getInitialVariant);

  // Sync when hash changes in URL
  useEffect(() => {
    const handleHashChange = () => {
      const v = getInitialVariant();
      setCurrentVariant(v);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectVariant = useCallback((variant: HomepageVariant) => {
    setCurrentVariant(variant);
    try {
      localStorage.setItem('tmd_homepage_variant', variant);
      
      // Update hash URL query without causing page jump
      const hashBase = window.location.hash.split('?')[0] || '#/home';
      window.history.replaceState(null, '', `${hashBase}?variant=${variant}`);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div className="relative">
      {/* Top Laboratory Bar for 1-click instant comparison */}
      <div className="sticky top-0 z-40 bg-zinc-950/95 border-b border-amber-500/40 backdrop-blur-xl px-4 py-2.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-amber-400 font-bold tracking-wider uppercase">
              MODO COMPARATIVO TMD
            </span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="text-zinc-400 hidden sm:inline text-[11px]">
              Compara las 4 opciones de Homepage en vivo:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: 'via3', label: '💎 Vía 3: Híbrida (Recomendada)' },
              { id: 'via2', label: '👑 Vía 2: Flagship Dealership' },
              { id: 'via1', label: '⚡ Vía 1: Cockpit B2B' },
              { id: 'original', label: '🏛️ Original: V9 Clásica' }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVariant(v.id as HomepageVariant)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  currentVariant === v.id
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30 font-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <HomepageErrorBoundary fallbackVariant={() => handleSelectVariant('via2')}>
        {/* Dynamic View Rendering based on user preference */}
        {currentVariant === 'via2' && (
          <HomeViewVia2 onNavigate={onNavigate} onSelectMachine={onSelectMachine} />
        )}
        {currentVariant === 'via3' && (
          <HomeViewVia3 onNavigate={onNavigate} onSelectMachine={onSelectMachine} />
        )}
        {currentVariant === 'via1' && (
          <HomeViewVia1 onNavigate={onNavigate} onSelectMachine={onSelectMachine} />
        )}
        {currentVariant === 'original' && (
          <HomeViewOriginal onNavigate={onNavigate} onSelectMachine={onSelectMachine} />
        )}
      </HomepageErrorBoundary>

      {/* Floating Laboratory Switcher Bar */}
      <HomepageVariantSwitcher 
        currentVariant={currentVariant} 
        onSelectVariant={handleSelectVariant} 
      />
    </div>
  );
};
