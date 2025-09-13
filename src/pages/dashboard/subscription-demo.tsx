import React from 'react';
import { useSubscription } from '../../hooks/use-subscription';
import { SubscriptionGuard, UsageGuard, UsageIndicator, FeatureBadge } from '../../components/subscription-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  MapPin, 
  MessageSquare, 
  Bell,
  Settings,
  Zap
} from 'lucide-react';

export default function SubscriptionDemoPage() {
  const { 
    subscriptionInfo, 
    loading, 
    hasFeature, 
    canUseResource, 
    getUsagePercentage,
    isLimitReached 
  } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Demo</h1>
        <p className="text-gray-600">
          This page demonstrates how the subscription-based access control system works.
        </p>
      </div>

      {/* Current Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionInfo?.hasActiveSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {subscriptionInfo.planName?.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">
                  Status: {subscriptionInfo.subscription?.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UsageIndicator resourceType="bookings" />
                <UsageIndicator resourceType="staff" />
                <UsageIndicator resourceType="locations" />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No active subscription found</p>
              <Button>Subscribe Now</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Basic Booking Feature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Basic Booking
            </CardTitle>
            <CardDescription>
              Create and manage appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FeatureBadge feature="basic_booking" />
              
              <SubscriptionGuard feature="basic_booking">
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Appointment
                </Button>
              </SubscriptionGuard>
            </div>
          </CardContent>
        </Card>

        {/* Staff Management Feature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Management
            </CardTitle>
            <CardDescription>
              Add and manage staff members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FeatureBadge feature="staff_management" />
              
              <UsageGuard resourceType="staff">
                <Button className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Button>
              </UsageGuard>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Analytics Feature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Advanced Analytics
            </CardTitle>
            <CardDescription>
              View detailed business analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FeatureBadge feature="advanced_analytics" />
              
              <SubscriptionGuard feature="advanced_analytics">
                <Button className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </SubscriptionGuard>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Location Feature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Multi-Location
            </CardTitle>
            <CardDescription>
              Manage multiple salon locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FeatureBadge feature="multi_location" />
              
              <UsageGuard resourceType="locations">
                <Button className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </UsageGuard>
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications Feature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Notifications
            </CardTitle>
            <CardDescription>
              Send SMS notifications to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FeatureBadge feature="sms_notifications" />
              
              <SubscriptionGuard feature="sms_notifications">
                <Button className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send SMS
                </Button>
              </SubscriptionGuard>
            </div>
          </CardContent>
        </Card>

        {/* Custom Branding Feature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Custom Branding
            </CardTitle>
            <CardDescription>
              Customize your salon's branding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FeatureBadge feature="custom_branding" />
              
              <SubscriptionGuard feature="custom_branding">
                <Button className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Customize Branding
                </Button>
              </SubscriptionGuard>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      {subscriptionInfo?.hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              Current usage across all resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bookings</span>
                  <span>{subscriptionInfo.subscription?.usage.bookings || 0} / {subscriptionInfo.limits.bookings}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage('bookings')}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Staff</span>
                  <span>{subscriptionInfo.subscription?.usage.staff || 0} / {subscriptionInfo.limits.staff}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage('staff')}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Locations</span>
                  <span>{subscriptionInfo.subscription?.usage.locations || 0} / {subscriptionInfo.limits.locations}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage('locations')}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
