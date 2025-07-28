import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/sidebar';
import { Header } from '../components/dashboard/header';
import { ProtectedRoute } from '../components/protected-route';

export default function DashboardLayout() {
  return (
    <ProtectedRoute requiredResource="dashboard" requiredAction="view">
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}