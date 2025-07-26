import { useEffect, useState, Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "./stores/auth-store";

// Auth Pages - Keep login as static import since it's needed immediately
import LoginPage from "./pages/auth/login";

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
      // If user is not logged in and not on login page, redirect to login
      if (!user && !location.pathname.includes("/auth/login")) {
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
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/login" element={<LoginPage />} />

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
            <Suspense fallback={<PageLoader />}>
              <SalonsPage />
            </Suspense>
          }
        />
        <Route
          path="salons/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <SalonDetailsPage />
            </Suspense>
          }
        />
        <Route
          path="salons/:id/edit"
          element={
            <Suspense fallback={<PageLoader />}>
              <EditSalonPage />
            </Suspense>
          }
        />
        <Route
          path="salons/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <NewSalonPage />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <Suspense fallback={<PageLoader />}>
              <UsersPage />
            </Suspense>
          }
        />
        <Route
          path="users/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <UserDetailsPage />
            </Suspense>
          }
        />
        <Route
          path="users/:id/edit"
          element={
            <Suspense fallback={<PageLoader />}>
              <EditUserPage />
            </Suspense>
          }
        />
        <Route
          path="users/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <NewUserPage />
            </Suspense>
          }
        />
        <Route
          path="plans"
          element={
            <Suspense fallback={<PageLoader />}>
              <PlansPage />
            </Suspense>
          }
        />
        <Route
          path="plans/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <NewPlanPage />
            </Suspense>
          }
        />
        <Route
          path="plans/:id/edit"
          element={
            <Suspense fallback={<PageLoader />}>
              <EditPlanPage />
            </Suspense>
          }
        />
        <Route
          path="subscriptions"
          element={
            <Suspense fallback={<PageLoader />}>
              <SubscriptionsPage />
            </Suspense>
          }
        />
        <Route
          path="subscriptions/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <SubscriptionDetailsPage />
            </Suspense>
          }
        />
        <Route
          path="subscriptions/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <NewSubscriptionPage />
            </Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<PageLoader />}>
              <AnalyticsPage />
            </Suspense>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotificationsPage />
            </Suspense>
          }
        />
        <Route
          path="roles"
          element={
            <Suspense fallback={<PageLoader />}>
              <RolesPermissionsMatrixPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
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
  );
}

export default App;
