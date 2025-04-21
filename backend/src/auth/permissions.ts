import { UserRole } from '../users/user.schema';

export enum Permission {
  // Customer permissions
  VIEW_OWN_PROFILE = 'view_own_profile',
  UPDATE_OWN_PROFILE = 'update_own_profile',

  // Sales representative permissions
  VIEW_CUSTOMER_PROFILES = 'view_customer_profiles',
  MANAGE_LEADS = 'manage_leads',
  UPDATE_LEADS = 'update_leads',

  // Sales manager permissions
  VIEW_SALES_DASHBOARD = 'view_sales_dashboard',
  VIEW_TEAM_PERFORMANCE = 'view_team_performance',
  EXPORT_REPORTS = 'export_reports',

  // Marketing specialist permissions
  VIEW_MARKETING_DASHBOARD = 'view_marketing_dashboard',
  MANAGE_CAMPAIGNS = 'manage_campaigns',
  VIEW_ANALYTICS = 'view_analytics',

  // Data analyst permissions
  VIEW_DATA_DASHBOARD = 'view_data_dashboard',
  EXPORT_DATA = 'export_data',
  RUN_ANALYSIS = 'run_analysis',

  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CUSTOMER]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
  ],

  [UserRole.SALES_REP]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.VIEW_CUSTOMER_PROFILES,
    Permission.MANAGE_LEADS,
    Permission.UPDATE_LEADS,
  ],

  [UserRole.SALES_MANAGER]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.VIEW_CUSTOMER_PROFILES,
    Permission.MANAGE_LEADS,
    Permission.UPDATE_LEADS,
    Permission.VIEW_SALES_DASHBOARD,
    Permission.VIEW_TEAM_PERFORMANCE,
    Permission.EXPORT_REPORTS,
  ],

  [UserRole.MARKETING_SPECIALIST]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.VIEW_MARKETING_DASHBOARD,
    Permission.MANAGE_CAMPAIGNS,
    Permission.VIEW_ANALYTICS,
  ],

  [UserRole.DATA_ANALYST]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.VIEW_DATA_DASHBOARD,
    Permission.EXPORT_DATA,
    Permission.RUN_ANALYSIS,
  ],

  [UserRole.ADMIN]: Object.values(Permission),
};

export function hasPermission(userRole: UserRole, requiredPermission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(requiredPermission) ?? false;
}

export function hasPermissions(userRole: UserRole, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userRole, permission));
}