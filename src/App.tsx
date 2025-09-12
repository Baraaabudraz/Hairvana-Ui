import { useEffect, useState, Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "./stores/auth-store";
import { PermissionProvider } from "./hooks/use-permissions";
import { SubscriptionProvider } from "./hooks/use-subscription";
import { ProtectedRoute } from "./components/protected-route";

// Auth Pages - Keep login as static import since it's needed immediately
import LoginPage from "./pages/auth/login";
import ResetPasswordPage from "./pages/auth/reset-password";
import ForgotPasswordPage from "./pages/auth/forgot-password";

// Dashboard Layout - Keep as static since it's the main layout
import DashboardLayout from "./layouts/dashboard-layout";

// Lazy load dashboard pages for code splitting
const DashboardPage = lazy(() => import("./pages/dashboard/index"));
const SalonsPage = lazy(() => import("./pages/dashboard/salons/index"));
const SalonDetailsPage = lazy(() => import("./pages/dashboard/salons/details"));
const EditSalonPage = lazy(() => import("./pages/dashboard/salons/edit"));
const NewSalonPage = lazy(() => import("./pages/dashboard/salons/new"));
const UsersPage = lazy(() => import("./pages/dashboard/users/index"));
const UserDetailsPage = lazy(() => import("./pages/dashboard/users/details"));
const EditUserPage = lazy(() => import("./pages/dashboard/users/edit"));
const NewUserPage = lazy(() => import("./pages/dashboard/users/new"));
const SubscriptionsPage = lazy(
  () => import("./pages/dashboard/subscriptions/index")
);
const SubscriptionDetailsPage = lazy(
  () => import("./pages/dashboard/subscriptions/details")
);
const NewSubscriptionPage = lazy(
  () => import("./pages/dashboard/subscriptions/new")
);
const AnalyticsPage = lazy(() => import("./pages/dashboard/analytics"));
const ReportsPage = lazy(() => import("./pages/dashboard/reports"));
const NotificationsPage = lazy(() => import("./pages/dashboard/notifications"));
const SettingsPage = lazy(() => import("./pages/dashboard/settings"));
const ProfilePage = lazy(() => import("./pages/dashboard/profile/index"));
const PlansPage = lazy(() => import("./pages/dashboard/plans/index"));
const EditPlanPage = lazy(() => import("./pages/dashboard/plans/edit"));
const NewPlanPage = lazy(() => import("./pages/dashboard/plans/new"));
const RolesPermissionsMatrixPage = lazy(
  () => import("./pages/dashboard/roles")
);

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
  </div>
);

function App() {
  const { user, isLoading, checkSession } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for existing session on app load
    checkSession().then(() => {
      setIsInitialized(true);
    });
  }, [checkSession]);

  useEffect(() => {
    if (!isLoading && isInitialized) {
      // If user is not logged in and not on auth pages, redirect to login
      if (!user && !location.pathname.includes("/auth/login") && !location.pathname.includes("/reset-password") && !location.pathname.includes("/salon/reset-password") && !location.pathname.includes("/auth/forgot-password")) {
        navigate("/auth/login");
      }

      // If user is logged in and on login page, redirect to dashboard
      if (user && location.pathname.includes("/auth/login")) {
        navigate("/dashboard");
      }
    }
  }, [user, isLoading, navigate, location.pathname, isInitialized]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <PermissionProvider>
      <SubscriptionProvider>
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/salon/reset-password" element={<ResetPasswordPage />} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
                <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="salons"
          element={
            <ProtectedRoute requiredResource="salons" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <SalonsPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="salons/:id"
          element={
            <ProtectedRoute requiredResource="salons" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <SalonDetailsPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="salons/:id/edit"
          element={
            <ProtectedRoute requiredResource="salons" requiredAction="edit">
            <Suspense fallback={<PageLoader />}>
              <EditSalonPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="salons/new"
          element={
            <ProtectedRoute requiredResource="salons" requiredAction="add">
            <Suspense fallback={<PageLoader />}>
              <NewSalonPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute requiredResource="users" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <UsersPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="users/:id"
          element={
            <ProtectedRoute requiredResource="users" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <UserDetailsPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="users/:id/edit"
          element={
            <ProtectedRoute requiredResource="users" requiredAction="edit">
            <Suspense fallback={<PageLoader />}>
              <EditUserPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="users/new"
          element={
            <ProtectedRoute requiredResource="users" requiredAction="add">
            <Suspense fallback={<PageLoader />}>
              <NewUserPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="plans"
          element={
            <ProtectedRoute requiredResource="subscriptions" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <PlansPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="plans/new"
          element={
            <ProtectedRoute requiredResource="subscriptions" requiredAction="add">
            <Suspense fallback={<PageLoader />}>
              <NewPlanPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="plans/:id/edit"
          element={
            <ProtectedRoute requiredResource="subscriptions" requiredAction="edit">
            <Suspense fallback={<PageLoader />}>
              <EditPlanPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="subscriptions"
          element={
            <ProtectedRoute requiredResource="subscriptions" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <SubscriptionsPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="subscriptions/:id"
          element={
            <ProtectedRoute requiredResource="subscriptions" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <SubscriptionDetailsPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="subscriptions/new"
          element={
            <ProtectedRoute requiredResource="subscriptions" requiredAction="add">
            <Suspense fallback={<PageLoader />}>
              <NewSubscriptionPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute requiredResource="analytics" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <AnalyticsPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute requiredResource="reports" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute requiredResource="notifications" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <NotificationsPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="roles"
          element={
            <ProtectedRoute requiredResource="roles" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <RolesPermissionsMatrixPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredResource="settings" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute requiredResource="dashboard" requiredAction="view">
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/auth/login"} replace />}
      />

      {/* Catch all other routes */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/auth/login"} replace />}
      />
    </Routes>
      </SubscriptionProvider>
    </PermissionProvider>
  );
}

export default App;
