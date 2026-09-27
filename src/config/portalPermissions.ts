/**
 * TMD DOMINICANA — PORTAL PERMISSIONS & RBAC ENGINE
 * 
 * Centralized role-based access control for the portal system.
 * Defines granular permissions per role and provides helper utilities
 * for permission checks throughout the portal UI.
 */

// =========================================================================
// ROLE HIERARCHY (Level 1 = External, Level 4 = Super Admin)
// =========================================================================
export type PortalRole = 
  | 'client'      // Level 1: External — Contractor / buyer
  | 'dealer'      // Level 1: External — Provincial sub-distributor
  | 'mechanic'    // Level 2: Internal — Patio / field technician
  | 'sales'       // Level 2: Internal — Sales executive
  | 'warehouse'   // Level 2: Internal — Warehouse / bodega operator
  | 'finance'     // Level 3: Internal — Accounting & DGII
  | 'admin';      // Level 4: Internal — General Management / Super Admin

export const PORTAL_ROLE_LABELS: Record<PortalRole, string> = {
  client: 'CONTRATISTA / CLIENTE',
  dealer: 'DISTRIBUIDOR PROVINCIAL',
  mechanic: 'TÉCNICO DE PATIO / CAMPO',
  sales: 'EJECUTIVO COMERCIAL',
  warehouse: 'BODEGUERO / ALMACÉN',
  finance: 'CONTABILIDAD & DGII',
  admin: 'DIRECCIÓN GENERAL'
};

export const PORTAL_ROLE_HIERARCHY: Record<PortalRole, number> = {
  client: 1,
  dealer: 1,
  mechanic: 2,
  sales: 2,
  warehouse: 2,
  finance: 3,
  admin: 4
};

export const PORTAL_ROLE_COLORS: Record<PortalRole, { bg: string; text: string; border: string }> = {
  client: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  dealer: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  mechanic: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  sales: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  warehouse: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  finance: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  admin: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' }
};

// =========================================================================
// GRANULAR PERMISSIONS
// =========================================================================
export interface PortalPermissions {
  // Quotes
  canViewOwnQuotes: boolean;
  canViewAllQuotes: boolean;
  canCreateQuotes: boolean;
  canApproveQuotes: boolean;
  canExportQuotePdf: boolean;

  // Work Orders
  canViewOwnOrders: boolean;
  canViewAllOrders: boolean;
  canCreateOrders: boolean;
  canAssignOrders: boolean;
  canUpdateOrderStatus: boolean;

  // Inventory
  canViewInventory: boolean;
  canModifyInventory: boolean;
  canScanQr: boolean;
  canAuthorizeGatePass: boolean;

  // Fleet / Telematics
  canViewOwnFleet: boolean;
  canViewAllFleet: boolean;
  canDispatchFieldService: boolean;

  // Financials
  canViewFinancials: boolean;
  canGenerateNcf: boolean;
  canViewRevenueMetrics: boolean;

  // Users & Admin
  canManageUsers: boolean;
  canChangeRoles: boolean;
  canAccessAuditLog: boolean;
  canAccessIntegrations: boolean;
  canAccessPatio: boolean;
  canAccessCrmFunnel: boolean;

  // Pro Member
  canViewProMember: boolean;
  canRedeemRewards: boolean;

  // Technical Docs
  canViewTechDocs: boolean;
  canUploadTechDocs: boolean;

  // Fullbay Shop
  canAccessFullbay: boolean;

  // Office Workflow
  canAccessOfficeWorkflow: boolean;
}

// =========================================================================
// PERMISSION MATRIX PER ROLE
// =========================================================================
const PERMISSION_MATRIX: Record<PortalRole, PortalPermissions> = {
  client: {
    canViewOwnQuotes: true,
    canViewAllQuotes: false,
    canCreateQuotes: true,
    canApproveQuotes: false,
    canExportQuotePdf: true,
    canViewOwnOrders: true,
    canViewAllOrders: false,
    canCreateOrders: true,
    canAssignOrders: false,
    canUpdateOrderStatus: false,
    canViewInventory: false,
    canModifyInventory: false,
    canScanQr: true,
    canAuthorizeGatePass: false,
    canViewOwnFleet: true,
    canViewAllFleet: false,
    canDispatchFieldService: false,
    canViewFinancials: false,
    canGenerateNcf: false,
    canViewRevenueMetrics: false,
    canManageUsers: false,
    canChangeRoles: false,
    canAccessAuditLog: false,
    canAccessIntegrations: false,
    canAccessPatio: false,
    canAccessCrmFunnel: false,
    canViewProMember: true,
    canRedeemRewards: true,
    canViewTechDocs: true,
    canUploadTechDocs: false,
    canAccessFullbay: false,
    canAccessOfficeWorkflow: false
  },
  dealer: {
    canViewOwnQuotes: true,
    canViewAllQuotes: false,
    canCreateQuotes: true,
    canApproveQuotes: false,
    canExportQuotePdf: true,
    canViewOwnOrders: true,
    canViewAllOrders: false,
    canCreateOrders: true,
    canAssignOrders: false,
    canUpdateOrderStatus: false,
    canViewInventory: true,
    canModifyInventory: false,
    canScanQr: true,
    canAuthorizeGatePass: false,
    canViewOwnFleet: true,
    canViewAllFleet: false,
    canDispatchFieldService: false,
    canViewFinancials: false,
    canGenerateNcf: false,
    canViewRevenueMetrics: false,
    canManageUsers: false,
    canChangeRoles: false,
    canAccessAuditLog: false,
    canAccessIntegrations: false,
    canAccessPatio: false,
    canAccessCrmFunnel: false,
    canViewProMember: true,
    canRedeemRewards: true,
    canViewTechDocs: true,
    canUploadTechDocs: false,
    canAccessFullbay: false,
    canAccessOfficeWorkflow: false
  },
  mechanic: {
    canViewOwnQuotes: false,
    canViewAllQuotes: false,
    canCreateQuotes: false,
    canApproveQuotes: false,
    canExportQuotePdf: false,
    canViewOwnOrders: true,
    canViewAllOrders: true,
    canCreateOrders: true,
    canAssignOrders: false,
    canUpdateOrderStatus: true,
    canViewInventory: true,
    canModifyInventory: false,
    canScanQr: true,
    canAuthorizeGatePass: false,
    canViewOwnFleet: false,
    canViewAllFleet: true,
    canDispatchFieldService: true,
    canViewFinancials: false,
    canGenerateNcf: false,
    canViewRevenueMetrics: false,
    canManageUsers: false,
    canChangeRoles: false,
    canAccessAuditLog: false,
    canAccessIntegrations: false,
    canAccessPatio: false,
    canAccessCrmFunnel: false,
    canViewProMember: false,
    canRedeemRewards: false,
    canViewTechDocs: true,
    canUploadTechDocs: true,
    canAccessFullbay: true,
    canAccessOfficeWorkflow: false
  },
  sales: {
    canViewOwnQuotes: true,
    canViewAllQuotes: true,
    canCreateQuotes: true,
    canApproveQuotes: false,
    canExportQuotePdf: true,
    canViewOwnOrders: true,
    canViewAllOrders: true,
    canCreateOrders: true,
    canAssignOrders: false,
    canUpdateOrderStatus: false,
    canViewInventory: true,
    canModifyInventory: false,
    canScanQr: true,
    canAuthorizeGatePass: false,
    canViewOwnFleet: false,
    canViewAllFleet: true,
    canDispatchFieldService: false,
    canViewFinancials: false,
    canGenerateNcf: false,
    canViewRevenueMetrics: false,
    canManageUsers: false,
    canChangeRoles: false,
    canAccessAuditLog: false,
    canAccessIntegrations: false,
    canAccessPatio: false,
    canAccessCrmFunnel: true,
    canViewProMember: false,
    canRedeemRewards: false,
    canViewTechDocs: true,
    canUploadTechDocs: false,
    canAccessFullbay: false,
    canAccessOfficeWorkflow: true
  },
  warehouse: {
    canViewOwnQuotes: false,
    canViewAllQuotes: false,
    canCreateQuotes: false,
    canApproveQuotes: false,
    canExportQuotePdf: false,
    canViewOwnOrders: true,
    canViewAllOrders: true,
    canCreateOrders: false,
    canAssignOrders: false,
    canUpdateOrderStatus: false,
    canViewInventory: true,
    canModifyInventory: true,
    canScanQr: true,
    canAuthorizeGatePass: true,
    canViewOwnFleet: false,
    canViewAllFleet: false,
    canDispatchFieldService: false,
    canViewFinancials: false,
    canGenerateNcf: false,
    canViewRevenueMetrics: false,
    canManageUsers: false,
    canChangeRoles: false,
    canAccessAuditLog: false,
    canAccessIntegrations: false,
    canAccessPatio: true,
    canAccessCrmFunnel: false,
    canViewProMember: false,
    canRedeemRewards: false,
    canViewTechDocs: true,
    canUploadTechDocs: true,
    canAccessFullbay: false,
    canAccessOfficeWorkflow: false
  },
  finance: {
    canViewOwnQuotes: true,
    canViewAllQuotes: true,
    canCreateQuotes: true,
    canApproveQuotes: true,
    canExportQuotePdf: true,
    canViewOwnOrders: true,
    canViewAllOrders: true,
    canCreateOrders: false,
    canAssignOrders: false,
    canUpdateOrderStatus: false,
    canViewInventory: true,
    canModifyInventory: false,
    canScanQr: false,
    canAuthorizeGatePass: false,
    canViewOwnFleet: false,
    canViewAllFleet: false,
    canDispatchFieldService: false,
    canViewFinancials: true,
    canGenerateNcf: true,
    canViewRevenueMetrics: true,
    canManageUsers: false,
    canChangeRoles: false,
    canAccessAuditLog: true,
    canAccessIntegrations: false,
    canAccessPatio: false,
    canAccessCrmFunnel: true,
    canViewProMember: false,
    canRedeemRewards: false,
    canViewTechDocs: false,
    canUploadTechDocs: false,
    canAccessFullbay: false,
    canAccessOfficeWorkflow: true
  },
  admin: {
    canViewOwnQuotes: true,
    canViewAllQuotes: true,
    canCreateQuotes: true,
    canApproveQuotes: true,
    canExportQuotePdf: true,
    canViewOwnOrders: true,
    canViewAllOrders: true,
    canCreateOrders: true,
    canAssignOrders: true,
    canUpdateOrderStatus: true,
    canViewInventory: true,
    canModifyInventory: true,
    canScanQr: true,
    canAuthorizeGatePass: true,
    canViewOwnFleet: true,
    canViewAllFleet: true,
    canDispatchFieldService: true,
    canViewFinancials: true,
    canGenerateNcf: true,
    canViewRevenueMetrics: true,
    canManageUsers: true,
    canChangeRoles: true,
    canAccessAuditLog: true,
    canAccessIntegrations: true,
    canAccessPatio: true,
    canAccessCrmFunnel: true,
    canViewProMember: true,
    canRedeemRewards: true,
    canViewTechDocs: true,
    canUploadTechDocs: true,
    canAccessFullbay: true,
    canAccessOfficeWorkflow: true
  }
};

// =========================================================================
// PERMISSION CHECK UTILITIES
// =========================================================================

/**
 * Get the full permission set for a given role.
 * Falls back to client permissions for unknown roles.
 */
export function getPermissions(role: PortalRole | string): PortalPermissions {
  const normalized = (role || 'client').toLowerCase() as PortalRole;
  return PERMISSION_MATRIX[normalized] || PERMISSION_MATRIX.client;
}

/**
 * Check a single permission by key for a given role.
 */
export function hasPermission(
  role: PortalRole | string,
  permission: keyof PortalPermissions
): boolean {
  const perms = getPermissions(role);
  return perms[permission] === true;
}

/**
 * Check if a role has ANY of the specified permissions.
 */
export function hasAnyPermission(
  role: PortalRole | string,
  permissions: (keyof PortalPermissions)[]
): boolean {
  const perms = getPermissions(role);
  return permissions.some((p) => perms[p] === true);
}

/**
 * Check if a role has ALL of the specified permissions.
 */
export function hasAllPermissions(
  role: PortalRole | string,
  permissions: (keyof PortalPermissions)[]
): boolean {
  const perms = getPermissions(role);
  return permissions.every((p) => perms[p] === true);
}

/**
 * Get the hierarchy level of a role (1=external, 4=admin).
 */
export function getRoleLevel(role: PortalRole | string): number {
  const normalized = (role || 'client').toLowerCase() as PortalRole;
  return PORTAL_ROLE_HIERARCHY[normalized] || 1;
}

/**
 * Check if roleA has an equal or higher hierarchy level than roleB.
 */
export function isRoleAtLeast(roleA: PortalRole | string, roleB: PortalRole): boolean {
  return getRoleLevel(roleA) >= getRoleLevel(roleB);
}

/**
 * Determine which portal sub-path a role should be directed to.
 */
export function getPortalPathForRole(role: PortalRole | string): string {
  const level = getRoleLevel(role);
  if (level >= 4) return '#/portal/admin';
  if (level >= 2) return '#/portal/ops';
  return '#/portal/client';
}

/**
 * Map a legacy UserRole ('client'|'staff'|'admin') to a PortalRole.
 * This bridge function enables gradual migration from the old 3-role system.
 */
export function legacyRoleToPortalRole(legacyRole: string): PortalRole {
  const normalized = (legacyRole || 'client').toLowerCase();
  switch (normalized) {
    case 'admin':
      return 'admin';
    case 'staff':
      return 'sales'; // Default staff mapping — can be refined per user profile
    case 'client':
    default:
      return 'client';
  }
}
