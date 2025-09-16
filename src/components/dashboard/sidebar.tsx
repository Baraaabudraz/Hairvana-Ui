import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  CreditCard,
  Home,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Bell,
  Scissors,
  X,
  Menu,
  Headphones,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionGuard } from "@/components/permission-guard";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Salons", href: "/dashboard/salons", icon: Building2, resource: "salons" },
  { name: "Users", href: "/dashboard/users", icon: Users, resource: "users" },
  {
    name: "Plans",
    href: "/dashboard/plans",
    icon: CreditCard,
    resource: "subscriptions",
  },
  {
    name: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
    resource: "subscriptions",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    resource: "analytics",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: MessageSquare,
    resource: "reports",
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    resource: "notifications",
  },
  {
    name: "Roles & Permissions",
    href: "/dashboard/roles",
    icon: Shield,
    resource: "roles",
  },
  {
    name: "Support",
    href: "/dashboard/support",
    icon: Headphones,
    resource: "support",
  },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, resource: "settings" },
];

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const { canAccess } = usePermissions();

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={cn(
          "relative z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-900/80"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  );

  function SidebarContent() {
    // Filter navigation based on user permissions
    const filteredNav = navigation.filter((item) => {
      if (!item.resource) return true; // Always show items without resource requirement
      return canAccess(item.resource);
    });
    return (
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hairvana
            </span>
          </div>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {filteredNav.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      location.pathname.startsWith(item.href));
                  
                  // If no resource is specified, render without PermissionGuard
                  if (!item.resource) {
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                            isActive
                              ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600"
                              : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-6 w-6 shrink-0",
                              isActive
                                ? "text-purple-600"
                                : "text-gray-400 group-hover:text-purple-600"
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  }
                  
                  return (
                    <PermissionGuard key={item.name} resource={item.resource} action="view">
                      <li>
                        <Link
                          to={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                            isActive
                              ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600"
                              : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-6 w-6 shrink-0",
                              isActive
                                ? "text-purple-600"
                                : "text-gray-400 group-hover:text-purple-600"
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    </PermissionGuard>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Admin Access
                    </p>
                    <p className="text-xs text-gray-600">
                      Full platform control
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}
