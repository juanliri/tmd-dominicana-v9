import React, { forwardRef } from 'react';
import { LucideIcon, AlertCircle } from 'lucide-react';

export interface TmdInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  unitPrefix?: string; // e.g. "USD $" or "DOP $"
  unitSuffix?: string; // e.g. "hrs", "gal/h", "bar", "kg"
  onClear?: () => void;
  fullWidth?: boolean;
}

export const TmdInput = forwardRef<HTMLInputElement, TmdInputProps>(({
  label,
  helperText,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  unitPrefix,
  unitSuffix,
  onClear,
  fullWidth = true,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const generatedId = id || (label ? `tmd-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`font-mono space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label 
            htmlFor={generatedId}
            className="block text-xs font-bold text-zinc-300 uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-amber-400 ml-1">*</span>}
          </label>
        </div>
      )}

      <div className="relative flex items-center">
        {unitPrefix && (
          <span className="absolute left-3 text-xs font-black text-amber-400 select-none pointer-events-none z-10">
            {unitPrefix}
          </span>
        )}

        {LeftIcon && !unitPrefix && (
          <div className="absolute left-3 text-zinc-500 pointer-events-none z-10">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={generatedId}
          disabled={disabled}
          className={`
            w-full bg-zinc-950/90 text-white placeholder-zinc-600 text-sm font-mono
            border rounded-[4px] py-2.5 transition-all duration-150
            focus:outline-none focus:ring-1
            disabled:opacity-50 disabled:bg-zinc-900 disabled:cursor-not-allowed
            ${error 
              ? 'border-rose-500/80 focus:border-rose-400 focus:ring-rose-500/30' 
              : 'border-zinc-700/80 hover:border-zinc-500 focus:border-amber-400 focus:ring-amber-400/30'}
            ${unitPrefix ? 'pl-16' : LeftIcon ? 'pl-9' : 'pl-3.5'}
            ${unitSuffix ? 'pr-14' : RightIcon ? 'pr-9' : 'pr-3.5'}
            ${className}
          `}
          {...props}
        />

        {unitSuffix && (
          <span className="absolute right-3 text-xs font-bold text-zinc-400 select-none pointer-events-none">
            {unitSuffix}
          </span>
        )}

        {RightIcon && !unitSuffix && (
          <div className="absolute right-3 text-zinc-500 pointer-events-none">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {error ? (
        <p className="flex items-center gap-1 text-xs text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-zinc-500">{helperText}</p>
      ) : null}
    </div>
  );
});

TmdInput.displayName = 'TmdInput';

export interface TmdSelectOption {
  value: string;
  label: string;
  badge?: string;
}

export interface TmdSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: TmdSelectOption[];
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const TmdSelect = forwardRef<HTMLSelectElement, TmdSelectProps>(({
  label,
  options = [],
  helperText,
  error,
  fullWidth = true,
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const generatedId = id || (label ? `tmd-select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`font-mono space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={generatedId}
          className="block text-xs font-bold text-zinc-300 uppercase tracking-wider"
        >
          {label}
          {props.required && <span className="text-amber-400 ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={generatedId}
        className={`
          w-full bg-zinc-950/90 text-white text-sm font-mono
          border rounded-[4px] py-2.5 px-3.5 transition-all duration-150
          focus:outline-none focus:ring-1 appearance-none cursor-pointer
          ${error 
            ? 'border-rose-500/80 focus:border-rose-400 focus:ring-rose-500/30' 
            : 'border-zinc-700/80 hover:border-zinc-500 focus:border-amber-400 focus:ring-amber-400/30'}
          ${className}
        `}
        {...props}
      >
        {children || options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white py-1">
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="flex items-center gap-1 text-xs text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-zinc-500">{helperText}</p>
      ) : null}
    </div>
  );
});

TmdSelect.displayName = 'TmdSelect';
