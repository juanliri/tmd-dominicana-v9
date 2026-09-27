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
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-md font-mono text-xs shadow-sm">
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('#/home') : (window.location.hash = '#/home')}
          className="flex items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors p-1 -ml-1 rounded hover:bg-zinc-900 cursor-pointer"
          title="Ir al Showroom Principal"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="sr-only">Inicio</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />

        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('#/portal') : (window.location.hash = '#/portal')}
          className="text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
        >
          Portal TMD
        </button>

        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            {item.active || !item.onClick && !item.path ? (
              <span className="font-semibold text-white tracking-wide">
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
                className="text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Role Capsule Badge */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 hidden sm:inline">
          Acceso:
        </span>
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span>{roleLabel}</span>
        </div>
      </div>
    </div>
  );
};
