import React from 'react';
import { useSubscription } from '../hooks/use-subscription';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Lock, ArrowUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  className?: string;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  feature,
  children,
  fallback,
  showUpgrade = true,
  className = ""
}) => {
  const { hasFeature, subscriptionInfo, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!hasFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgrade) {
      return (
        <Card className={`border-dashed border-2 border-gray-300 ${className}`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Lock className="h-6 w-6 text-gray-400" />
            </div>
            <CardTitle className="text-lg">Feature Not Available</CardTitle>
            <CardDescription>
              This feature is not available in your current plan ({subscriptionInfo?.planName || 'No Plan'})
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/dashboard/subscriptions')}
              className="w-full"
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      );
    }

    return null;
  }

  return <>{children}</>;
};

interface UsageGuardProps {
  resourceType: 'bookings' | 'staff' | 'locations';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showWarning?: boolean;
  className?: string;
}

export const UsageGuard: React.FC<UsageGuardProps> = ({
  resourceType,
  children,
  fallback,
  showWarning = true,
  className = ""
}) => {
  const { canUseResource, isLimitReached, getUsagePercentage, subscriptionInfo, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (isLimitReached(resourceType)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showWarning) {
      return (
        <Card className={`border-dashed border-2 border-red-300 ${className}`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <CardTitle className="text-lg text-red-600">Limit Reached</CardTitle>
            <CardDescription>
              You've reached your {resourceType} limit. Upgrade to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/dashboard/subscriptions')}
              className="w-full"
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      );
    }

    return null;
  }

  return <>{children}</>;
};

interface UsageIndicatorProps {
  resourceType: 'bookings' | 'staff' | 'locations';
  showPercentage?: boolean;
  className?: string;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  resourceType,
  showPercentage = true,
  className = ""
}) => {
  const { subscriptionInfo, getUsagePercentage, loading } = useSubscription();

  if (loading || !subscriptionInfo?.hasActiveSubscription) {
    return null;
  }

  const limit = subscriptionInfo.limits[resourceType];
  const usage = subscriptionInfo.subscription?.usage[`${resourceType}Used`] || 0;
  const percentage = getUsagePercentage(resourceType);

  if (limit === 'unlimited') {
    return (
      <div className={`text-sm text-green-600 ${className}`}>
        {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}: Unlimited
      </div>
    );
  }

  const getColorClass = () => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`text-sm ${getColorClass()} ${className}`}>
      {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}: {usage}/{limit}
      {showPercentage && ` (${percentage}%)`}
    </div>
  );
};

interface FeatureBadgeProps {
  feature: string;
  className?: string;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({
  feature,
  className = ""
}) => {
  const { hasFeature, loading } = useSubscription();

  if (loading) {
    return null;
  }

  if (!hasFeature(feature)) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 ${className}`}>
        <Lock className="w-3 h-3 mr-1" />
        Not Available
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
      Available
    </span>
  );
};
