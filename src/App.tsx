import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/auth-store';

// Auth Pages
import LoginPage from './pages/auth/login';

// Dashboard Pages
import DashboardLayout from './layouts/dashboard-layout';
import DashboardPage from './pages/dashboard/index';
import SalonsPage from './pages/dashboard/salons/index';
import SalonDetailsPage from './pages/dashboard/salons/details';
import EditSalonPage from './pages/dashboard/salons/edit';
import NewSalonPage from './pages/dashboard/salons/new';
import UsersPage from './pages/dashboard/users/index';
import UserDetailsPage from './pages/dashboard/users/details';
import EditUserPage from './pages/dashboard/users/edit';
import NewUserPage from './pages/dashboard/users/new';
import SubscriptionsPage from './pages/dashboard/subscriptions/index';
import SubscriptionDetailsPage from './pages/dashboard/subscriptions/details';
import NewSubscriptionPage from './pages/dashboard/subscriptions/new';
import AnalyticsPage from './pages/dashboard/analytics';
import ReportsPage from './pages/dashboard/reports';
import NotificationsPage from './pages/dashboard/notifications';
import SettingsPage from './pages/dashboard/settings';
import ProfilePage from './pages/dashboard/profile/index';

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
      if (!user && !location.pathname.includes('/auth/login')) {
        navigate('/auth/login');
      }
      
      // If user is logged in and on login page, redirect to dashboard
      if (user && location.pathname.includes('/auth/login')) {
        navigate('/dashboard');
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
        <Route index element={<DashboardPage />} />
        <Route path="salons" element={<SalonsPage />} />
        <Route path="salons/:id" element={<SalonDetailsPage />} />
        <Route path="salons/:id/edit" element={<EditSalonPage />} />
        <Route path="salons/new" element={<NewSalonPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailsPage />} />
        <Route path="users/:id/edit" element={<EditUserPage />} />
        <Route path="users/new" element={<NewUserPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="subscriptions/:id" element={<SubscriptionDetailsPage />} />
        <Route path="subscriptions/new" element={<NewSubscriptionPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth/login"} replace />} />
      
      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth/login"} replace />} />
    </Routes>
  );
}

export default App;