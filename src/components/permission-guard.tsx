import React from 'react';
import { usePermissions } from '../hooks/use-permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action?: string;
  fallback?: React.ReactNode;
  showIfNoPermission?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action = 'view',
  fallback = null,
  showIfNoPermission = false
}) => {
  const { hasPermission, canAccess, loading } = usePermissions();

  // Show loading while permissions are being fetched
  if (loading) {
    return null;
  }

  const hasRequiredPermission = hasPermission(resource, action);
  const canAccessResource = canAccess(resource);

  // If user has permission, show children
  if (hasRequiredPermission && canAccessResource) {
    return <>{children}</>;
  }

  // If showIfNoPermission is true, show children even without permission
  if (showIfNoPermission) {
    return <>{children}</>;
  }

  // Otherwise show fallback or nothing
  return <>{fallback}</>;
}; 