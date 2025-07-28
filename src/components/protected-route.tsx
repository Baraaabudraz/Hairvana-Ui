import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/use-permissions';
import { useAuthStore } from '../stores/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredResource?: string;
  requiredAction?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredResource,
  requiredAction = 'view',
  fallback
}) => {
  const { user, token } = useAuthStore();
  const { hasPermission, canAccess, loading } = usePermissions();
  const location = useLocation();

  // Show loading while permissions are being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific resource required, just check authentication
  if (!requiredResource) {
    return <>{children}</>;
  }

  // Check if user has permission for the required resource and action
  const hasRequiredPermission = hasPermission(requiredResource, requiredAction);
  const canAccessResource = canAccess(requiredResource);

  if (!hasRequiredPermission || !canAccessResource) {
    // If fallback is provided, show it
    if (fallback) {
      return <>{fallback}</>;
    }

    // Otherwise show forbidden page
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-300 mb-4">403</div>
          <h1 className="text-2xl font-semibold text-gray-700 mb-2">Access Forbidden</h1>
          <p className="text-gray-500 mb-6">
            You don't have permission to access this resource.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 