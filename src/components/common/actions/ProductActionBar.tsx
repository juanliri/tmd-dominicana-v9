import React from 'react';
import { 
  FileText, 
  ShoppingCart, 
  Layers, 
  Scale, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Machine, Part } from '../../../types';
import { TmdButton } from '../tmd-industrial';

export interface ProductActionBarProps {
  item: Machine | Part;
  type: 'machinery' | 'part' | 'rental';
  onViewDetails: (item: Machine | Part) => void;
  onQuote: (item: Machine | Part) => void;
  onToggleCompare?: (id: string) => void;
  isComparing?: boolean;
  onOpenSpecsDrawer?: (item: Machine | Part) => void;
  compact?: boolean;
}

export const ProductActionBar: React.FC<ProductActionBarProps> = ({
  item,
  type,
  onViewDetails,
  onQuote,
  onToggleCompare,
  isComparing = false,
  onOpenSpecsDrawer,
  compact = false
}) => {
  const isMachinery = type === 'machinery' || type === 'rental';

  return (
    <div className={`font-mono space-y-2 ${compact ? 'pt-1' : 'pt-2'}`}>
      {/* Primary Action Row: Two Main Touch Targets */}
      <div className="grid grid-cols-2 gap-2">
        <TmdButton
          variant="secondary"
          size={compact ? 'xs' : 'sm'}
          icon={FileText}
          fullWidth
          onClick={() => {
            if (onOpenSpecsDrawer) {
              onOpenSpecsDrawer(item);
            } else {
              onViewDetails(item);
            }
          }}
        >
          FICHA TÉCNICA
        </TmdButton>

        <TmdButton
          variant="primary"
          size={compact ? 'xs' : 'sm'}
          icon={ShoppingCart}
          fullWidth
          onClick={() => onQuote(item)}
        >
          COTIZAR
        </TmdButton>
      </div>

      {/* Auxiliary Utility Row: Compare Switch (if machinery) */}
      {isMachinery && onToggleCompare && (
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px]">
          <button
            type="button"
            onClick={() => onToggleCompare(item.id)}
            className={`
              inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none font-bold uppercase
              ${isComparing 
                ? 'text-amber-400' 
                : 'text-zinc-500 hover:text-zinc-300'}
            `}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isComparing ? 'En Comparador' : 'Comparar'}</span>
          </button>

          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="text-zinc-500 hover:text-amber-400 text-[11px] transition-colors inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Detalles</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
