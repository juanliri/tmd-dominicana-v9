import React from 'react';

export const TMD_OFFICIAL_LOGO_SRC = '/assets/logos/tmd_logo_official.png';
export const TMD_GOLD_LOGO_SRC = '/assets/logos/tmd_logo_gold.png';
export const TMD_ICON_MARK_SRC = '/assets/logos/tmd_icon_mark.png';
export const TMD_ICON_SVG_SRC = '/assets/logos/tmd_icon_mark.svg';

export interface TMDLogoProps {
  className?: string;
  variant?: 'official' | 'gold' | 'compact' | 'minimal' | 'white-text' | 'monochrome' | 'icon-only' | 'responsive';
  hideSubtext?: boolean;
}

/**
 * TMD Official Company Logo Component
 * Supports:
 * - 'official': Full authentic brand mark with 'TECNOMAQUINARIAS DIESEL' subtext
 * - 'icon-only': Compact TMD chevron icon mark without descriptive subtext (ideal for mobile, sticky bars & footer)
 * - 'responsive': Auto-switches to icon-only mark on mobile (<640px) and official full logo on desktop
 */
export const TMDLogo: React.FC<TMDLogoProps> = ({ 
  className = 'h-10', 
  variant = 'official',
  hideSubtext = false
}) => {
  if (variant === 'responsive') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        {/* Mobile / Compact Screens (< 640px): Icon-only mark without subtext */}
        <img
          src={TMD_ICON_MARK_SRC}
          alt="TMD"
          className="h-full w-auto object-contain select-none pointer-events-none drop-shadow-sm sm:hidden"
          draggable={false}
        />
        {/* Desktop / Tablet Screens (>= 640px): Official full brand logo */}
        <img
          src={TMD_OFFICIAL_LOGO_SRC}
          alt="TMD - Tecnomaquinarias Diesel"
          className="h-full w-auto object-contain select-none pointer-events-none drop-shadow-sm hidden sm:block"
          draggable={false}
        />
      </div>
    );
  }

  const isIconOnly = variant === 'icon-only' || variant === 'compact' || variant === 'minimal' || hideSubtext;
  let src = TMD_OFFICIAL_LOGO_SRC;
  if (variant === 'gold') {
    src = TMD_GOLD_LOGO_SRC;
  } else if (isIconOnly) {
    src = TMD_ICON_MARK_SRC;
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={src}
        alt={isIconOnly ? 'TMD' : 'TMD - Tecnomaquinarias Diesel'}
        className="h-full w-auto object-contain select-none pointer-events-none drop-shadow-sm"
        draggable={false}
      />
    </div>
  );
};

/**
 * Individual Brand Vector Logos for JCB, LiuGong, Ammann, LS Tractor, Kubota, AFEX, IMER
 */
export const BrandLogo: React.FC<{ brandId: string; className?: string }> = ({ brandId, className = 'h-8' }) => {
  const normalizedId = brandId.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normalizedId.includes('jcb')) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <svg viewBox="0 0 220 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          <rect width="220" height="90" rx="4" fill="#F59E0B" />
          <rect x="8" y="8" width="204" height="74" fill="#000000" />
          <rect x="12" y="16" width="28" height="28" fill="#F59E0B" rx="2" />
          <text x="26" y="36" fill="#000000" fontSize="16" fontWeight="900" textAnchor="middle" fontStyle="italic">JCB</text>
          <text x="122" y="66" fill="#FFFFFF" fontSize="62" fontWeight="900" textAnchor="middle" letterSpacing="2">JCB</text>
        </svg>
      </div>
    );
  }

  if (normalizedId.includes('liugong')) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <svg viewBox="0 0 280 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          {/* LG Shield Icon */}
          <path d="M4 8 H26 V38 H44 V52 H4 Z" fill="currentColor" className="text-[#002B66] dark:text-sky-400" />
          <polygon points="12,16 34,16 20,30" fill="#EA580C" />
          {/* LIUGONG Wordmark */}
          <text x="56" y="46" fill="currentColor" className="text-[#002B66] dark:text-zinc-100" fontSize="44" fontWeight="900" letterSpacing="3">LIUGONG</text>
        </svg>
      </div>
    );
  }

  if (normalizedId.includes('ammann')) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <svg viewBox="0 0 260 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          <text x="0" y="42" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" fontSize="46" fontWeight="900" letterSpacing="2">AMM</text>
          <text x="120" y="42" fill="#E11D48" fontSize="46" fontWeight="900" letterSpacing="2">A</text>
          <text x="160" y="42" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" fontSize="46" fontWeight="900" letterSpacing="2">NN</text>
        </svg>
      </div>
    );
  }

  if (normalizedId.includes('ls') || normalizedId.includes('tractor')) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <svg viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          {/* Red Accent Swoosh */}
          <path d="M85 8 Q 115 4 125 18 Q 105 14 85 8 Z" fill="#E11D48" />
          {/* LS Italic */}
          <text x="10" y="48" fill="currentColor" className="text-[#002B66] dark:text-sky-400" fontSize="56" fontWeight="900" fontStyle="italic">LS</text>
          {/* Tractor */}
          <text x="96" y="48" fill="currentColor" className="text-zinc-600 dark:text-zinc-200" fontSize="44" fontWeight="800">Tractor</text>
        </svg>
      </div>
    );
  }

  if (normalizedId.includes('kubota') || normalizedId.includes('escorts')) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <svg viewBox="0 0 280 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          {/* Hexagon Wrench Symbol */}
          <polygon points="25,4 45,15 45,39 25,50 5,39 5,15" fill="#DC2626" />
          <circle cx="25" cy="27" r="8" fill="#FFFFFF" />
          <path d="M25 21 L 28 27 L 22 27 Z" fill="#DC2626" />
          {/* Kubota Wordmark */}
          <text x="60" y="42" fill="#0d9488" fontSize="44" fontWeight="900" letterSpacing="1">Kubota</text>
          <text x="60" y="62" fill="currentColor" className="text-zinc-800 dark:text-zinc-300" fontSize="13" fontWeight="800" letterSpacing="1">Escorts Kubota Limited</text>
        </svg>
      </div>
    );
  }

  if (normalizedId.includes('afex')) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <svg viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          <text x="0" y="40" fill="#B91C1C" fontSize="46" fontWeight="900" letterSpacing="2">AFEX</text>
          <text x="2" y="55" fill="#1F2937" className="dark:fill-zinc-300" fontSize="9" fontWeight="900" letterSpacing="1.5">FIRE SUPPRESSION SYSTEMS</text>
        </svg>
      </div>
    );
  }

  if (normalizedId.includes('imer')) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <svg viewBox="0 0 260 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          {/* Drum Mixer Badge */}
          <circle cx="30" cy="30" r="26" stroke="#0D9488" strokeWidth="5" fill="none" />
          <path d="M30 12 Q 42 30 30 48 Q 18 30 30 12 Z" fill="#0D9488" />
          {/* IMER CONCRETE */}
          <text x="70" y="38" fill="#0D9488" fontSize="34" fontWeight="900" letterSpacing="1.5">IMER</text>
          <text x="70" y="54" fill="#0D9488" fontSize="14" fontWeight="900" letterSpacing="2">CONCRETE</text>
          <line x1="70" y1="58" x2="250" y2="58" stroke="#0D9488" strokeWidth="2" />
          <text x="70" y="68" fill="#64748B" className="dark:fill-zinc-400" fontSize="8" fontWeight="800" letterSpacing="1">BATCHING PLANT SOLUTIONS</text>
        </svg>
      </div>
    );
  }

  return (
    <span className="px-3 py-1 rounded-lg bg-zinc-800 text-amber-400 font-black text-xs uppercase tracking-wider">
      {brandId}
    </span>
  );
};
