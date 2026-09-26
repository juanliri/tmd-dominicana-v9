import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TmdModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-[95vw]'
};

export const TmdModal: React.FC<TmdModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  badge,
  maxWidth = 'lg',
  children,
  footer,
  className = ''
}) => {
  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with Industrial Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`
              relative w-full ${maxWidthMap[maxWidth]} bg-zinc-950 border border-zinc-700/80
              rounded-[6px] shadow-2xl shadow-black/80 font-mono text-zinc-100
              overflow-hidden z-10 my-auto
              ${className}
            `}
          >
            {/* Top Engineering Indicator Line */}
            <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

            {/* Modal Header */}
            {(title || Icon) && (
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-start justify-between gap-4 bg-zinc-900/60">
                <div className="flex items-start gap-3 min-w-0">
                  {Icon && (
                    <div className="p-2 rounded-[4px] bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0">
                    {badge && <div className="mb-1">{badge}</div>}
                    {title && (
                      <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider truncate">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
              {children}
            </div>

            {/* Modal Footer */}
            {footer && (
              <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
