import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { getRouteBreadcrumbs } from '../../../config/routes';

interface UniversalBreadcrumbsProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  customItemName?: string;
  className?: string;
}

export const UniversalBreadcrumbs: React.FC<UniversalBreadcrumbsProps> = ({
  currentRoute,
  onNavigate,
  customItemName,
  className = ''
}) => {
  const breadcrumbs = getRouteBreadcrumbs(currentRoute);

  // If on home, do not render breadcrumbs
  if (breadcrumbs.length <= 1 && !customItemName) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs font-mono py-2.5 px-3 rounded-lg bg-zinc-900/60 backdrop-blur-md border border-white/[0.06] text-zinc-400 overflow-x-auto no-scrollbar ${className}`}
    >
      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1 && !customItemName;
        return (
          <React.Fragment key={crumb.path}>
            {idx > 0 && (
              <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
            )}
            {idx === 0 && (
              <Home className="w-3 h-3 text-amber-500 shrink-0 mr-0.5" />
            )}
            {isLast ? (
              <span className="font-bold text-amber-400 truncate max-w-[200px] uppercase">
                {crumb.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(crumb.path)}
                className="hover:text-white transition-colors uppercase tracking-wider cursor-pointer shrink-0 truncate max-w-[160px]"
              >
                {crumb.label}
              </button>
            )}
          </React.Fragment>
        );
      })}

      {customItemName && (
        <>
          <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
          <span className="font-bold text-amber-400 truncate max-w-[240px] uppercase">
            {customItemName}
          </span>
        </>
      )}
    </nav>
  );
};
