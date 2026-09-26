import React, { forwardRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

export type TmdButtonVariant = 
  | 'primary'      // High-contrast Amber-400 industrial CTA
  | 'secondary'    // Zinc-800 dark metallic container with zinc border
  | 'outline'      // Transparent with amber or zinc border
  | 'danger'       // Tactical Red/Rose emergency trigger (SOS / Delete)
  | 'success'      // Emerald green (NCF DGII / Authorized / Approved)
  | 'ghost'        // Subtle header/toolbar action
  | 'glow';        // High-energy spotlight button with amber ambient glow

export type TmdButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface TmdButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TmdButtonVariant;
  size?: TmdButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  loadingText?: string;
  badge?: string | number;
  fullWidth?: boolean;
}

const sizeClasses: Record<TmdButtonSize, string> = {
  xs: 'px-2 py-1 text-[11px] gap-1.5 rounded-[3px]',
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-[4px]',
  md: 'px-4 py-2 text-sm gap-2 rounded-[4px]',
  lg: 'px-5 py-2.5 text-base gap-2.5 rounded-[5px]',
  xl: 'px-6 py-3.5 text-lg gap-3 rounded-[6px] tracking-wide'
};

const iconSizes: Record<TmdButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
};

const variantClasses: Record<TmdButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400
    text-zinc-950 font-black border border-amber-300/60 shadow-lg shadow-amber-500/20
    active:scale-[0.98] transition-all duration-150 uppercase font-mono tracking-wider
  `,
  secondary: `
    bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold border border-zinc-700/80
    hover:border-zinc-500 shadow-sm active:scale-[0.98] transition-all duration-150 font-mono
  `,
  outline: `
    bg-transparent hover:bg-amber-500/10 text-amber-400 font-bold border border-amber-500/40
    hover:border-amber-400 active:scale-[0.98] transition-all duration-150 font-mono
  `,
  danger: `
    bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600
    text-white font-black border border-rose-500/40 shadow-lg shadow-rose-600/25
    active:scale-[0.98] transition-all duration-150 uppercase font-mono tracking-wider
  `,
  success: `
    bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600
    text-white font-black border border-emerald-400/40 shadow-lg shadow-emerald-600/20
    active:scale-[0.98] transition-all duration-150 uppercase font-mono tracking-wider
  `,
  ghost: `
    bg-transparent hover:bg-zinc-800/80 text-zinc-300 hover:text-white
    border border-transparent active:scale-[0.98] transition-all duration-150 font-mono
  `,
  glow: `
    bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-black
    border border-amber-200/80 shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:shadow-[0_0_30px_rgba(245,158,11,0.65)]
    active:scale-[0.98] transition-all duration-200 uppercase font-mono tracking-wider
  `
};

export const TmdButton = forwardRef<HTMLButtonElement, TmdButtonProps>(({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  loadingText,
  badge,
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}, ref) => {
  const isDisabled = disabled || isLoading;
  const iconSizeClass = iconSizes[size];

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center select-none cursor-pointer
        disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${iconSizeClass} animate-spin shrink-0`} />
          {loadingText ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${iconSizeClass} shrink-0`} />
          )}
          
          {children && <span>{children}</span>}
          
          {Icon && iconPosition === 'right' && (
            <Icon className={`${iconSizeClass} shrink-0`} />
          )}

          {badge !== undefined && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-black/30 text-current border border-current/20">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
});

TmdButton.displayName = 'TmdButton';
