"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Users,
  Building2,
  Shield,
  Crown,
  Calendar,
  DollarSign,
  Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fetchUsers, updateUserStatus, deleteUser } from "@/api/users";
import { fetchRoles } from "@/api/roles";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { Value } from "@radix-ui/react-select";

type UserRole = "admin" | "super_admin" | "salon" | "user";
type UserStatus = "active" | "pending" | "suspended";

interface Salon {
  id: string;
  name: string;
  location: string;
  subscription: string;
  bookingsCount: number;
  revenue: number;
  status: string;
}

interface UserRoleObject {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRoleObject | UserRole; // Allow both object and string for backward compatibility
  status: UserStatus;
  join_date: string;
  last_login: string | null;
  avatar: string;
  // Admin specific
  permissions?: string[];
  // Salon specific - Updated for one-to-many relationship
  salons?: Salon[];
  totalSalons?: number;
  totalRevenue?: number;
  totalBookings?: number;
  // Regular user specific
  totalSpent?: number;
  favoriteServices?: string[];
  suspensionReason?: string;
  // Add color property to User interface
  color?: string;
}

interface UserStats {
  total: number;
  admin: number;
  salon: number;
  user: number;
  active: number;
  pending: number;
  suspended: number;
}

const roleColors: Record<UserRole, string> = {
  super_admin: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  salon: "bg-green-100 text-green-800",
  user: "bg-gray-100 text-gray-800",
};

const statusColors: Record<UserStatus, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
};

const roleIcons = {
  super_admin: Crown,
  admin: Shield,
  salon: Building2,
  user: Users,
};

// Helper function to safely format dates
const formatDateSafely = (
  dateString: string | null | undefined,
  fallback: string = "N/A"
): string => {
  if (!dateString) return fallback;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return fallback;

  return formatDistanceToNow(date, { addSuffix: true });
};

// Helper function to safely get role properties
const getRoleInfo = (role: UserRoleObject | UserRole) => {
  if (typeof role === 'string') {
    return {
      name: role,
      color: undefined
    };
  }
  return {
    name: role?.name || '',
    color: role?.color
  };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admin: 0,
    salon: 0,
    user: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Change roleFilter type to string for dynamic roles
  // Remove: const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  // Add roles state
  const [roles, setRoles] = useState<
    { id: string; name: string; description?: string; color?: string }[]
  >([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    id: string;
    name: string;
    description?: string;
    color?: string;
  } | null>(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
    // eslint-disable-next-line
  }, [selectedRole, statusFilter, searchTerm, page, limit]);

  const loadRoles = async () => {
    if (rolesLoaded) return; // Only load roles once
    
    try {
      console.log('Loading roles separately...');
      const rolesData = await fetchRoles();
      console.log('Roles loaded:', rolesData);
      setRoles(rolesData || []);
      setRolesLoaded(true);
    } catch (error) {
      console.error("Error loading roles:", error);
      toast({
        title: "Warning",
        description: "Roles could not be loaded. Role filtering may not work properly.",
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users with params:', { selectedRole, statusFilter, searchTerm, page, limit });
      
      const params: any = { page, limit };

      if (selectedRole?.id) {
        params.role_id = selectedRole.id;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      console.log('Fetching users with params:', params);
      
      // Try the API call with robust error handling
      try {
        const data = await fetchUsers(params);
        console.log('Users API response:', data);
        
        setUsers(Array.isArray(data) ? data : (data.users || []));
        setStats(data.stats || {
          total: 0, admin: 0, salon: 0, user: 0, 
          active: 0, pending: 0, suspended: 0
        });
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || (data.users ? data.users.length : 0));
        
        // Try to get roles from users response, but don't fail if not available
        if (data.roles && !rolesLoaded) {
          console.log('Setting roles from users response:', data.roles);
          setRoles(data.roles);
          setRolesLoaded(true);
        }
      } catch (fetchError: any) {
        console.error("API fetch error:", fetchError);
        
        // If this is the specific "roles is not defined" error, provide a helpful message
        if (fetchError.message && fetchError.message.includes("roles is not defined")) {
          toast({
            title: "Database Configuration Issue",
            description: "The roles table appears to be missing or not properly configured. Please check the backend setup.",
            variant: "destructive",
          });
        } else {
          throw fetchError; // Re-throw other errors
        }
      }
      
    } catch (error) {
      console.error("Error loading users:", error);
      
      // Provide more specific error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Error",
        description: `Failed to load users: ${errorMessage}. Please try again or check the console for details.`,
        variant: "destructive",
      });
      
      // Set empty data on error to prevent crashes
      setUsers([]);
      setStats({
        total: 0, admin: 0, salon: 0, user: 0, 
        active: 0, pending: 0, suspended: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await updateUserStatus(userId, newStatus);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      const statusMessages = {
        active: "User has been reactivated",
        suspended: "User has been suspended",
        pending: "User status updated to pending",
      };

      toast({
        title: "Status updated",
        description: statusMessages[newStatus],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));

      toast({
        title: "User deleted",
        description: "The user has been permanently removed from the platform.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const openSuspendDialog = (user: User) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const openReactivateDialog = (user: User) => {
    setSelectedUser(user);
    setReactivateDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      handleDelete(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmSuspend = () => {
    if (selectedUser) {
      handleStatusChange(selectedUser.id, "suspended");
      setSuspendDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmReactivate = () => {
    if (selectedUser) {
      handleStatusChange(selectedUser.id, "active");
      setReactivateDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "salon":
        return "Salon Owner";
      case "user":
        return "Customer";
      default:
        return role;
    }
  };

  const renderUserSpecificInfo = (user: User) => {
    switch (user.role) {
      case "admin":
      case "super_admin":
        return (
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">
              {user.permissions?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Permissions</p>
          </div>
        );
      case "salon":
        return (
          <>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {user.totalSalons || 0}
              </p>
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {user.totalBookings || 0}
              </p>
              <p className="text-xs text-gray-500">Total Bookings</p>
            </div>
          </>
        );
      case "user":
        return (
          <>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                ${user.totalSpent?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {user.totalBookings || 0}
              </p>
              <p className="text-xs text-gray-500">Bookings</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderSalonOwnerDetails = (user: User) => {
    if (user.role !== "salon" || !user.salons || user.salons.length === 0) {
      return null;
    }

    return (
      <div className="mt-2">
        <div className="flex flex-wrap gap-1">
          {user.salons.slice(0, 2).map((salon) => (
            <Badge key={salon.id} variant="outline" className="text-xs">
              {salon.name}
            </Badge>
          ))}
          {user.salons.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{user.salons.length - 2} more
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const fetchRoles = async () => {
    if (rolesLoaded) return;
    try {
      const data = await apiFetch("/roles/list");
      setRoles(data);
      setRolesLoaded(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage all platform users: admins, salon owners, and customers
          </p>
        </div>
        <Link to="/dashboard/users/new">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
        {/* Dynamic role cards */}
        {roles.map((role) => (
          <Card key={role.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p
                  className="text-2xl font-bold"
                  style={{ color: role.color || "#7c3aed" }}
                >
                  {stats[role.id] || 0}
                </p>
                <p className="text-xs text-gray-500">{role.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Status cards */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {stats.suspended}
              </p>
              <p className="text-xs text-gray-500">Suspended</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Role Filter Dropdown */}
              <Select
                value={selectedRole?.id || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedRole(null);
                  } else {
                    const roleObj = roles.find((role) => role.id === value);
                    console.log(roleObj);
                    setSelectedRole(roleObj || null);
                  }
                }}
                onOpenChange={(open) => {
                  if (open) fetchRoles();
                }}
              >
                <SelectTrigger className="w-40">
                  {selectedRole ? (
                    <span
                      style={{
                        background: selectedRole.color,
                        color: "#fff",
                        borderRadius: 4,
                        padding: "2px 8px",
                        display: "inline-block",
                      }}
                    >
                      {selectedRole.name}
                    </span>
                  ) : (
                    <span>All Roles</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <span
                        style={{
                          background: role.color,
                          color: "#fff",
                          borderRadius: 4,
                          padding: "2px 8px",
                          marginRight: 8,
                          display: "inline-block",
                        }}
                      >
                        {role.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filters */}
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "suspended" ? "default" : "outline"}
                onClick={() => setStatusFilter("suspended")}
                size="sm"
              >
                Suspended
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => {
              // Get role info safely
              const roleInfo = getRoleInfo(user.role);
              let RoleIcon = roleIcons[roleInfo.name.toLowerCase().replace(' ', '_')];
              if (!RoleIcon) {
                console.warn("Missing icon for role:", roleInfo.name, "- using fallback");
                RoleIcon = Users; // fallback icon
              }
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            user.avatar
                              ? `${
                                  import.meta.env.VITE_BACKEND_URL ||
                                  "http://localhost:5000"
                                }/images/avatar/${user.avatar}`
                              : undefined
                          }
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                        <RoleIcon className="h-3 w-3 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Joined {formatDateSafely(user.join_date, "Unknown")}
                        </span>
                        {user.last_login && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              Last seen{" "}
                              {formatDateSafely(user.last_login, "Unknown")}
                            </span>
                          </>
                        )}
                      </div>
                      {renderSalonOwnerDetails(user)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {renderUserSpecificInfo(user)}

                    <div className="flex flex-col gap-1">
                      <Badge
                        style={
                          getRoleInfo(user.role).color
                            ? { background: getRoleInfo(user.role).color, color: "#fff" }
                            : {}
                        }
                      >
                        {getRoleInfo(user.role).name}
                      </Badge>
                      <Badge className={statusColors[user.status]}>
                        {user.status}
                      </Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/dashboard/users/${user.id}`}
                            className="flex items-center w-full"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/dashboard/users/${user.id}/edit`}
                            className="flex items-center w-full"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {user.role === "salon" && (
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/dashboard/salons?ownerId=${user.id}`}
                              className="flex items-center w-full"
                            >
                              <Building2 className="mr-2 h-4 w-4" />
                              View Salons ({user.salons?.length || 0})
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {user.status === "active" && (
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => openSuspendDialog(user)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {user.status === "suspended" && (
                          <DropdownMenuItem
                            className="text-green-600 cursor-pointer"
                            onClick={() => openReactivateDialog(user)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages} ({total} users)
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
            >
              Next
            </Button>
            <select
              className="ml-4 border rounded px-2 py-1"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-2 text-sm text-gray-500">per page</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedUser?.name}"? This
              action cannot be undone and will permanently remove the user from
              the platform.
              {selectedUser?.role === "salon" &&
                selectedUser.totalSalons &&
                selectedUser.totalSalons > 0 && (
                  <span className="block mt-2 text-red-600 font-medium">
                    Warning: This user owns {selectedUser.totalSalons} salon(s).
                    Deleting this user will also affect their salon(s).
                  </span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend "{selectedUser?.name}"? This will
              temporarily disable their access to the platform.
              {selectedUser?.role === "salon" &&
                selectedUser.totalSalons &&
                selectedUser.totalSalons > 0 && (
                  <span className="block mt-2 text-yellow-600 font-medium">
                    Note: This user owns {selectedUser.totalSalons} salon(s).
                    Suspending this user may affect their salon operations.
                  </span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className="bg-red-600 hover:bg-red-700"
            >
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog
        open={reactivateDialogOpen}
        onOpenChange={setReactivateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate "{selectedUser?.name}"? This
              will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReactivate}
              className="bg-green-600 hover:bg-green-700"
            >
              Reactivate User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
