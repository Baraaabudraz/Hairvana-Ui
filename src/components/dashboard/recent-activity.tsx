"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fetchRecentActivity, RecentActivity as RecentActivityType, PaginationInfo } from "@/api/dashboard";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type ActivityStatus = "pending" | "urgent" | "success";

const statusColors: Record<ActivityStatus, string> = {
  pending: "bg-blue-100 text-blue-800",
  urgent: "bg-red-100 text-red-800",
  success: "bg-green-100 text-green-800",
};

const typeIcons: Record<string, string> = {
  subscription: "💳",
  cancellation: "❌",
  salon_registration: "🏪",
  user_registration: "👤",
  login: "🔐"
};

const typeColors: Record<string, string> = {
  subscription: "text-green-600",
  cancellation: "text-red-600",
  salon_registration: "text-blue-600",
  user_registration: "text-purple-600",
  login: "text-orange-600"
};

// Helper function to safely format relative time
const formatRelativeTime = (date: Date): string => {
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "recently";
  }
};

// Loading skeleton component
const ActivitySkeleton = () => (
  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
        <div className="h-6 bg-gray-300 rounded-full w-16"></div>
      </div>
      <div className="h-3 bg-gray-300 rounded w-48 mb-2"></div>
      <div className="flex items-center gap-4 mb-2">
        <div className="h-3 bg-gray-300 rounded w-20"></div>
        <div className="h-5 bg-gray-300 rounded-full w-16"></div>
      </div>
      <div className="h-3 bg-gray-300 rounded w-24"></div>
    </div>
  </div>
);

function RecentActivityContent() {
  const [activities, setActivities] = useState<RecentActivityType[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalActivities: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadRecentActivity = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(false);
      const data = await fetchRecentActivity(page, 10);
      setActivities(data.activities || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error loading recent activity:", error);
      setError(true);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentActivity(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadRecentActivity(newPage);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest platform activities including users, salons, subscriptions, and logins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <ActivitySkeleton key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest platform activities including users, salons, subscriptions, and logins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Could not load recent activity from the server</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest subscription activities and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity to display</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {typeIcons[activity.type] || "📋"}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.avatar || undefined} alt={activity.user} />
                    <AvatarFallback>
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${typeColors[activity.type] || 'text-gray-900'}`}>
                      {activity.title}
                    </p>
                    <Badge className={statusColors[activity.status]}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    {activity.amount && (
                      <p className="text-xs text-green-600 font-medium">
                        ${activity.amount.toLocaleString()}
                      </p>
                    )}
                    {activity.userRole && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                        {activity.userRole}
                      </span>
                    )}
                    {activity.planName && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {activity.planName}
                      </span>
                    )}
                    {activity.salonName && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {activity.salonName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(new Date(activity.timestamp))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalActivities)} of{" "}
                {pagination.totalActivities} activities
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === pagination.currentPage;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentActivity() {
  return (
    <ErrorBoundary>
      <RecentActivityContent />
    </ErrorBoundary>
  );
}
