import React, { useState, useEffect } from 'react';
import { ChevronUp, Bot, Scale, MessageSquare } from 'lucide-react';
import { useComparison } from '../../../context/ComparisonContext';

interface FloatingActionOrchestratorProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenChatbot?: () => void;
  isChatbotOpen?: boolean;
}

export const FloatingActionOrchestrator: React.FC<FloatingActionOrchestratorProps> = ({
  currentRoute,
  onNavigate,
  onOpenChatbot,
  isChatbotOpen = false
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { selectedMachineIds, openComparison } = useComparison();

  const isCheckoutOrAdmin = ['#/checkout', '#/admin', '#/admin-dashboard'].includes(currentRoute);
  const hasActiveComparison = selectedMachineIds.length > 0;

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isCheckoutOrAdmin) {
    return null;
  }

  // Dynamic bottom offset calculation to avoid mobile navigation overlap
  // Mobile Nav is h-16 (64px) + safe-area
  const bottomOffsetClass = 'bottom-20 sm:bottom-6';

  return (
    <div className={`fixed right-4 sm:right-6 ${bottomOffsetClass} z-40 flex flex-col items-end gap-2.5 font-mono pointer-events-none`}>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 shadow-xl backdrop-blur-md transition-all cursor-pointer pointer-events-auto active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-150"
          aria-label="Volver arriba"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* Floating Compare Pill (If 1+ machines are selected for comparison) */}
      {hasActiveComparison && (
        <button
          type="button"
          onClick={openComparison}
          className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs border border-amber-300 shadow-xl shadow-amber-500/25 transition-all cursor-pointer pointer-events-auto active:scale-95 animate-in bounce-in duration-200"
        >
          <Scale className="w-4 h-4 shrink-0" />
          <span>Comparar ({selectedMachineIds.length})</span>
        </button>
      )}
    </div>
  );
};
