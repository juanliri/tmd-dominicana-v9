import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, HardHat } from 'lucide-react';
import { Machine } from '../types';
import { Machine360Viewer } from './Machine360Viewer';
import { PriceEstimateModal } from './PriceEstimateModal';
import { MachineQuickCalculatorModal } from './MachineQuickCalculatorModal';

interface Machine360ModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (route: string) => void;
  initialTab?: '360' | 'video' | 'gallery' | 'dimensions' | string;
  activeTab?: string;
}

export const Machine360Modal: React.FC<Machine360ModalProps> = ({
  machine,
  isOpen,
  onClose,
  onNavigate,
  initialTab = '360',
  activeTab
}) => {
  const [estimateMachine, setEstimateMachine] = useState<Machine | null>(null);
  const [calcMachine, setCalcMachine] = useState<Machine | null>(null);

  if (!isOpen || !machine || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
        <div className="relative w-full max-w-6xl bg-zinc-950 rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
          {/* Close Button Floating */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-[2px] bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer shadow-lg"
            title="Cerrar Vista 360°"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Machine 360 Viewer */}
          <div className="flex-1 overflow-y-auto">
            <Machine360Viewer
              machine={machine}
              initialTab={((activeTab || initialTab) as '360' | 'video' | 'gallery' | 'dimensions')}
              onNavigate={(route) => {
                onClose();
                if (onNavigate) onNavigate(route);
              }}
              onOpenEstimate={(m) => setEstimateMachine(m)}
              onOpenCalculator={(m) => setCalcMachine(m)}
            />
          </div>
        </div>
      </div>

      {/* Sub-modals for Estimates & Financing */}
      {estimateMachine && (
        <PriceEstimateModal
          machine={estimateMachine}
          isOpen={Boolean(estimateMachine)}
          onClose={() => setEstimateMachine(null)}
          onNavigate={(route) => {
            setEstimateMachine(null);
            onClose();
            if (onNavigate) onNavigate(route);
          }}
        />
      )}

      {calcMachine && (
        <MachineQuickCalculatorModal
          machine={calcMachine}
          isOpen={Boolean(calcMachine)}
          onClose={() => setCalcMachine(null)}
          onNavigate={(route) => {
            setCalcMachine(null);
            onClose();
            if (onNavigate) onNavigate(route);
          }}
        />
      )}
    </>,
    document.body
  );
};
