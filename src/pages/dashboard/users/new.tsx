import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Users,
  Building2,
  Shield,
  Crown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createUser } from "@/api/users";
import { fetchRoles } from "@/api/roles";
import { Role } from "@/types/user";
import { apiFetch } from "@/lib/api";
import { useEffect } from "react";

const baseUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["admin", "super_admin", "salon", "customer"]),
});

const adminUserSchema = baseUserSchema.extend({
  permissions: z
    .array(z.string())
    .min(1, "At least one permission is required"),
});

const salonUserSchema = baseUserSchema.extend({
  salonName: z.string().min(2, "Salon name is required"),
  salonAddress: z.string().min(10, "Salon address is required"),
  businessLicense: z.string().min(5, "Business license is required"),
  subscription: z.enum(["Basic", "Standard", "Premium"]),
});

const userSchema = z
  .discriminatedUnion("role", [
    adminUserSchema.extend({ role: z.literal("admin") }),
    adminUserSchema.extend({ role: z.literal("super_admin") }),
    salonUserSchema.extend({ role: z.literal("salon") }),
    baseUserSchema.extend({ role: z.literal("customer") }),
  ])
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UserForm = z.infer<typeof userSchema>;

const availablePermissions = [
  "manage_salons",
  "manage_users",
  "view_analytics",
  "manage_subscriptions",
  "manage_payments",
  "manage_reports",
  "manage_notifications",
  "manage_settings",
  "full_access",
];

const permissionDescriptions: Record<string, string> = {
  manage_salons: "Create, edit, and manage salon accounts",
  manage_users: "Manage user accounts and permissions",
  view_analytics: "Access platform analytics and reports",
  manage_subscriptions: "Handle subscription plans and billing",
  manage_payments: "Process and manage payments",
  manage_reports: "Generate and view system reports",
  manage_notifications: "Send and manage notifications",
  manage_settings: "Configure platform settings",
  full_access: "Complete administrative access",
};

export default function NewUserPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(""); // Will be set when roles are loaded
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [uploadedAvatar, setUploadedAvatar] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Store selected file
  const [roles, setRoles] = useState<Role[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "customer",
    },
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const fetchedRoles = await fetchRoles();
        setRoles(fetchedRoles);
        
        // Set default role to "user" or first available role
        if (fetchedRoles.length > 0) {
          const defaultRole = fetchedRoles.find((role: Role) => 
            role.name.toLowerCase().includes("user") || 
            role.name.toLowerCase().includes("customer")
          ) || fetchedRoles[0];
          
          setSelectedRole(defaultRole.name.toLowerCase().replace(" ", "_"));
          setValue("role", defaultRole.name.toLowerCase().replace(" ", "_") as any);
        }
      } catch (error) {
        toast({
          title: "Error fetching roles",
          description: "Could not load user roles. Please try again later.",
          variant: "destructive",
        });
      }
    };
    loadRoles();
  }, [toast, setValue]);

  const watchedRole = watch("role");

  const handleRoleChange = (roleKey: string) => {
    const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === roleKey);
    if (selectedRoleData) {
      setSelectedRole(roleKey);
      setValue("role", roleKey as any);

      // Reset role-specific fields
      setSelectedPermissions([]);
      if (selectedRoleData.name.toLowerCase().includes("super")) {
        setSelectedPermissions(["full_access"]);
        setValue("permissions", ["full_access"] as any);
      } else if (selectedRoleData.name.toLowerCase().includes("admin")) {
        // For regular admin, don't auto-select permissions - let user choose
        setValue("permissions", [] as any);
      } else {
        // For non-admin roles, clear permissions
        setValue("permissions", undefined as any);
      }
    }
  };

  const handlePermissionToggle = (permission: string) => {
    let newPermissions: string[];
    
    if (permission === "full_access") {
      newPermissions = ["full_access"];
    } else {
      const filtered = selectedPermissions.filter((p) => p !== "full_access");
      newPermissions = selectedPermissions.includes(permission)
        ? filtered.filter((p) => p !== permission)
        : [...filtered, permission];
    }
    
    setSelectedPermissions(newPermissions);
    // Update form value for validation
    setValue("permissions", newPermissions as any);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedAvatar(URL.createObjectURL(file));
      setAvatarFile(file); // Store file for upload
    }
  };

  const onSubmit = async (data: UserForm) => {
    setIsSubmitting(true);
    try {
      console.log("Form submission started", { data, selectedRole, selectedPermissions });
      
      const formData = new FormData();
      
      // Get the selected role data to extract the role_id
      const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === selectedRole);
      if (!selectedRoleData) {
        toast({
          title: "Error",
          description: "Please select a valid role.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Selected role data:", selectedRoleData);

      // For admin/super_admin roles, ensure permissions are set
      if (selectedRoleData.name.toLowerCase().includes("admin")) {
        if (selectedPermissions.length === 0) {
          toast({
            title: "Error", 
            description: "Please select at least one permission for admin users.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Append all user fields except confirmPassword and role
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "confirmPassword" && key !== "role") {
          formData.append(key, value as string);
        }
      });
      
      // Append the role_id (UUID) instead of role string
      formData.append("role_id", selectedRoleData.id);
      
      // Append permissions if admin or super_admin
      if (
        selectedRoleData && 
        selectedRoleData.name.toLowerCase().includes("admin") &&
        selectedPermissions.length > 0
      ) {
        selectedPermissions.forEach((perm) =>
          formData.append("permissions", perm)
        );
      }

      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      // Append avatar file if selected
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      // Default avatar if none selected
      if (!avatarFile) {
        formData.append("avatar", "");
      }
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
        }/backend/api/users`,
        {
          method: "POST",
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: "User created successfully",
        description: `${data.name} has been added to the platform.`,
      });
      navigate("/dashboard/users");
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error creating user",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return Crown;
      case "admin":
        return Shield;
      case "salon":
        return Building2;
      case "user":
        return Users;
      default:
        return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "from-purple-600 to-purple-700";
      case "admin":
        return "from-blue-600 to-blue-700";
      case "salon":
        return "from-green-600 to-green-700";
      case "user":
        return "from-gray-600 to-gray-700";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  const salonErrors = errors as FieldErrors<any>; // Replace 'any' with your actual SalonUserForm type if available

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
          <p className="text-gray-600">
            Create a new user account for the platform
          </p>
        </div>
      </div>

              <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("Form validation errors:", errors);
          toast({
            title: "Form validation failed",
            description: "Please check all required fields and try again.",
            variant: "destructive",
          });
        })} className="space-y-6">
        {/* Role Selection */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>User Role</CardTitle>
            <CardDescription>
              Select the type of user account to create
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {roles.map((role) => {
                const roleKey = role.name.toLowerCase().replace(" ", "_");
                const Icon = getRoleIcon(roleKey);
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(roleKey)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-200 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getRoleColor(roleKey)}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{role.description || `${role.name} user with appropriate access level`}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the user's personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {uploadedAvatar &&
                    (uploadedAvatar.startsWith("blob:") ? (
                      <img
                        src={uploadedAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`${
                          import.meta.env.VITE_BACKEND_URL ||
                          "http://localhost:5000"
                        }/images/avatar/${uploadedAvatar}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ))}
                </div>
                {uploadedAvatar && (
                  <button
                    type="button"
                    onClick={() => setUploadedAvatar("")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                    <Upload className="h-4 w-4" />
                    Upload Avatar
                  </div>
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Permissions */}
        {(() => {
          const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === selectedRole);
          return selectedRoleData && (selectedRoleData.name.toLowerCase().includes("admin"));
        })() && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Admin Permissions</CardTitle>
              <CardDescription>
                {(() => {
                  const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === selectedRole);
                  return selectedRoleData && selectedRoleData.name.toLowerCase().includes("super")
                    ? "Super admins have full access to all platform features"
                    : "Select the permissions for this admin user";
                })()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === selectedRole);
                return selectedRoleData && selectedRoleData.name.toLowerCase().includes("super");
              })() ? (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      Full Administrative Access
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    This user will have complete control over all platform
                    features and settings.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availablePermissions
                    .filter((p) => p !== "full_access")
                    .map((permission) => (
                      <div key={permission} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={selectedPermissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="mt-1 rounded"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={permission}
                            className="font-medium cursor-pointer"
                          >
                            {permission
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Label>
                          <p className="text-sm text-gray-600">
                            {permissionDescriptions[permission]}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Salon Information */}
        {(() => {
          const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === selectedRole);
          return selectedRoleData && selectedRoleData.name.toLowerCase().includes("salon");
        })() && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Salon Information</CardTitle>
              <CardDescription>
                Enter details about the salon this user will manage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salonName">Salon Name *</Label>
                  <Input
                    id="salonName"
                    placeholder="Enter salon name"
                    {...register("salonName")}
                  />
                  {(() => {
                    const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === selectedRole);
                    return selectedRoleData && selectedRoleData.name.toLowerCase().includes("salon") && salonErrors.salonName;
                  })() && (
                    <p className="text-sm text-red-500">
                      {typeof salonErrors.salonName?.message === "string" 
                        ? salonErrors.salonName.message 
                        : ""}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessLicense">Business License *</Label>
                  <Input
                    id="businessLicense"
                    placeholder="BL123456789"
                    {...register("businessLicense")}
                  />
                  {(() => {
                    const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === selectedRole);
                    return selectedRoleData && selectedRoleData.name.toLowerCase().includes("salon") && salonErrors.businessLicense;
                  })() && (
                      <p className="text-sm text-red-500">
                        {typeof salonErrors.businessLicense?.message === "string" 
                          ? salonErrors.businessLicense.message 
                          : ""}
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salonAddress">Salon Address *</Label>
                <Input
                  id="salonAddress"
                  placeholder="123 Main Street, City, State, ZIP"
                  {...register("salonAddress")}
                />
                {(() => {
                  const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === selectedRole);
                  return selectedRoleData && selectedRoleData.name.toLowerCase().includes("salon") && salonErrors.salonAddress;
                })() && (
                  <p className="text-sm text-red-500">
                    {typeof salonErrors.salonAddress?.message === "string" 
                      ? salonErrors.salonAddress.message 
                      : ""}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Subscription Plan *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["Basic", "Standard", "Premium"].map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setValue("subscription", plan as any)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        watch("subscription") === plan
                          ? "bg-purple-50 border-purple-200 text-purple-700"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
                {(() => {
                  const selectedRoleData = roles.find(role => role.name.toLowerCase().replace(" ", "_") === selectedRole);
                  return selectedRoleData && selectedRoleData.name.toLowerCase().includes("salon") && salonErrors.subscription;
                })() && (
                  <p className="text-sm text-red-500">
                    {typeof salonErrors.subscription?.message === "string" 
                      ? salonErrors.subscription.message 
                      : ""}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to="/dashboard/users">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
