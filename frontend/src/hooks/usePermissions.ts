// src/hooks/usePermissions.ts
import { useAuth } from '../contexts/AuthContext';
import { Permission, RolePermissions, PermissionService } from '../services/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const checkPermission = (
    module: keyof RolePermissions,
    action: keyof Permission
  ): boolean => {
    if (!user?.role) return false;
    return PermissionService.hasPermission(user.role, module, action);
  };

  return {
    canView: (module: keyof RolePermissions) => checkPermission(module, 'view'),
    canCreate: (module: keyof RolePermissions) => checkPermission(module, 'create'),
    canEdit: (module: keyof RolePermissions) => checkPermission(module, 'edit'),
    canDelete: (module: keyof RolePermissions) => checkPermission(module, 'delete'),
    checkPermission
  };
};