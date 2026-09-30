import React, { useState, useEffect, useCallback } from 'react';
import { HomeViewVia2 } from './homepage/HomeViewVia2';
import { HomeViewVia3 } from './homepage/HomeViewVia3';
import { HomeViewVia1 } from './homepage/HomeViewVia1';
import { HomeViewOriginal } from './homepage/HomeViewOriginal';
import { HomepageVariantSwitcher, HomepageVariant } from './homepage/HomepageVariantSwitcher';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onSelectMachine: (machineId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectMachine }) => {
  // Read initial variant from URL query params or localStorage
  const getInitialVariant = (): HomepageVariant => {
    try {
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
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

      {/* Floating Laboratory Switcher Bar */}
      <HomepageVariantSwitcher 
        currentVariant={currentVariant} 
        onSelectVariant={handleSelectVariant} 
      />
    </div>
  );
};
