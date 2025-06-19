// resources/js/utils/permissions.ts
import { SharedData } from '@/types/SharedData';

export const hasRole = (page: SharedData, role: string): boolean => {
  return page.auth.user?.roles.includes(role) ?? false;
};

export const hasPermission = (page: SharedData, permission: string): boolean => {
  return page.auth.user?.permissions.includes(permission) ?? false;
};

export const hasAnyPermission = (page: SharedData, permissions: string[]): boolean => {
  return permissions.some(p => hasPermission(page, p));
};

export const hasAllPermissions = (page: SharedData, permissions: string[]): boolean => {
  return permissions.every(p => hasPermission(page, p));
};