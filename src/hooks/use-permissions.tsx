import { useState, useEffect, useContext, createContext, useRef } from 'react';
import { apiFetch } from '../lib/api';

interface Permission {
  resource: string;
  action: string;
  allowed: boolean;
}

interface UserPermissions {
  permissions: Permission[];
  accessibleResources: string[];
  role: string | null;
}

interface PermissionContextType {
  permissions: UserPermissions | null;
  loading: boolean;
  hasPermission: (resource: string, action: string) => boolean;
  canAccess: (resource: string) => boolean;
  userRole: string | null;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      // Prevent duplicate calls
      if (loadingRef.current) {
        console.log('🔍 Permissions already loading, skipping duplicate call');
        return;
      }
      
      try {
        loadingRef.current = true;
        const response = await apiFetch('/auth/permissions');
        if (response.success) {
          setPermissions(response.data);
        } else {
          console.error('Failed to fetch permissions:', response.error);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };

    // Only fetch once
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchPermissions();
    }
  }, []);

  const hasPermission = (resource: string, action: string): boolean => {
    if (!permissions) return false;
    
    return permissions.permissions.some(
      p => p.resource === resource && p.action === action && p.allowed
    );
  };

  const canAccess = (resource: string): boolean => {
    if (!permissions) return false;
    
    return permissions.accessibleResources.includes(resource);
  };

  const value: PermissionContextType = {
    permissions,
    loading,
    hasPermission,
    canAccess,
    userRole: permissions?.role || null
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}; 