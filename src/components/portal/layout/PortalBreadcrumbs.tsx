import React from 'react';
import { ChevronRight, Home, Shield, HardHat, Wrench, Settings } from 'lucide-react';
import { PortalRole, PORTAL_ROLE_LABELS, PORTAL_ROLE_COLORS } from '../../../config/portalPermissions';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
  active?: boolean;
}

interface PortalBreadcrumbsProps {
  items: BreadcrumbItem[];
  currentRole?: PortalRole;
  onNavigate?: (path: string) => void;
}

export const PortalBreadcrumbs: React.FC<PortalBreadcrumbsProps> = ({
  items,
  currentRole = 'client',
  onNavigate
}) => {
  const roleStyle = PORTAL_ROLE_COLORS[currentRole] || PORTAL_ROLE_COLORS.client;
  const roleLabel = PORTAL_ROLE_LABELS[currentRole] || 'USUARIO';

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-zinc-900/60 dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800/60 rounded font-mono text-[11px] shadow-2xs">
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('#/home') : (window.location.hash = '#/home')}
          className="flex items-center gap-1 text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-0.5 -ml-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-900 cursor-pointer"
          title="Ir al Showroom Principal"
        >
          <Home className="w-3 h-3" />
          <span className="sr-only">Inicio</span>
        </button>

        <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-zinc-600 shrink-0" />

        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('#/portal') : (window.location.hash = '#/portal')}
          className="text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
        >
          Portal TMD
        </button>

        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-zinc-600 shrink-0" />
            {item.active || !item.onClick && !item.path ? (
              <span className="font-semibold text-zinc-900 dark:text-white tracking-wide">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else if (item.path && onNavigate) onNavigate(item.path);
                  else if (item.path) window.location.hash = item.path;
                }}
                className="text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};
