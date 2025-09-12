import { useState, useEffect, createContext, useContext } from 'react';
import { apiFetch } from '../api/client';

interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  features: string[];
  limits: {
    bookings: number | 'unlimited';
    staff: number | 'unlimited';
    locations: number | 'unlimited';
  };
  planName: string | null;
  subscription: {
    id: string;
    status: string;
    usage: {
      bookingsUsed: number;
      staffUsed: number;
      locationsUsed: number;
    };
  } | null;
}

interface SubscriptionContextType {
  subscriptionInfo: SubscriptionInfo | null;
  loading: boolean;
  hasFeature: (feature: string) => boolean;
  canUseResource: (resourceType: string) => boolean;
  getUsagePercentage: (resourceType: string) => number;
  isLimitReached: (resourceType: string) => boolean;
  refreshSubscriptionInfo: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/v0/salon/subscription/info');
      if (response.success) {
        setSubscriptionInfo(response.data);
      } else {
        console.error('Failed to fetch subscription info:', response.error);
        setSubscriptionInfo(null);
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error);
      setSubscriptionInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const hasFeature = (feature: string): boolean => {
    if (!subscriptionInfo?.hasActiveSubscription) return false;
    return subscriptionInfo.features.includes(feature);
  };

  const canUseResource = (resourceType: string): boolean => {
    if (!subscriptionInfo?.hasActiveSubscription) return false;
    
    const limit = subscriptionInfo.limits[resourceType as keyof typeof subscriptionInfo.limits];
    if (limit === 'unlimited') return true;
    
    const usage = subscriptionInfo.subscription?.usage[`${resourceType}Used` as keyof typeof subscriptionInfo.subscription.usage] || 0;
    return usage < limit;
  };

  const getUsagePercentage = (resourceType: string): number => {
    if (!subscriptionInfo?.hasActiveSubscription) return 0;
    
    const limit = subscriptionInfo.limits[resourceType as keyof typeof subscriptionInfo.limits];
    if (limit === 'unlimited') return 0;
    
    const usage = subscriptionInfo.subscription?.usage[`${resourceType}Used` as keyof typeof subscriptionInfo.subscription.usage] || 0;
    return Math.round((usage / limit) * 100);
  };

  const isLimitReached = (resourceType: string): boolean => {
    return !canUseResource(resourceType);
  };

  const refreshSubscriptionInfo = async () => {
    await fetchSubscriptionInfo();
  };

  const value: SubscriptionContextType = {
    subscriptionInfo,
    loading,
    hasFeature,
    canUseResource,
    getUsagePercentage,
    isLimitReached,
    refreshSubscriptionInfo
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
