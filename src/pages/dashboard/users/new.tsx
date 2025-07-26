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
import { apiFetch } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const baseUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["admin", "super_admin", "salon", "user"]),
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
    baseUserSchema.extend({ role: z.literal("user") }),
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
  const [selectedRoleId, setSelectedRoleId] = useState<string>("user"); // Changed to string to match SelectItem value
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [uploadedAvatar, setUploadedAvatar] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Store selected file

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "user",
    },
  });

  const watchedRole = watch("role");

  const handleRoleChange = (
    role: "admin" | "super_admin" | "salon" | "user"
  ) => {
    setSelectedRoleId(role); // Update state variable
    setValue("role", role);

    // Reset role-specific fields
    setSelectedPermissions([]);
    if (role === "super_admin") {
      setSelectedPermissions(["full_access"]);
    }
  };

  const handlePermissionToggle = (permission: string) => {
    if (permission === "full_access") {
      setSelectedPermissions(["full_access"]);
    } else {
      setSelectedPermissions((prev) => {
        const filtered = prev.filter((p) => p !== "full_access");
        return prev.includes(permission)
          ? filtered.filter((p) => p !== permission)
          : [...filtered, permission];
      });
    }
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
      const formData = new FormData();
      // Append all user fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "confirmPassword") {
          formData.append(key, value as string);
        }
      });
      // Append permissions if admin or super_admin
      if (
        (data.role === "admin" || data.role === "super_admin") &&
        selectedPermissions.length > 0
      ) {
        selectedPermissions.forEach((perm) =>
          formData.append("permissions", perm)
        );
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
      await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
        }/backend/api/users`,
        {
          method: "POST",
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      toast({
        title: "User created successfully",
        description: `${data.name} has been added to the platform.`,
      });
      navigate("/dashboard/users");
    } catch (error) {
      toast({
        title: "Error creating user",
        description: "Please try again later.",
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Selection */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>User Role</CardTitle>
            <CardDescription>
              Select the type of user account to create
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
        {(selectedRoleId === "admin" || selectedRoleId === "super_admin") && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Admin Permissions</CardTitle>
              <CardDescription>
                {selectedRoleId === "super_admin"
                  ? "Super admins have full access to all platform features"
                  : "Select the permissions for this admin user"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRoleId === "super_admin" ? (
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
        {selectedRoleId === "salon" && (
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
                  {selectedRoleId === "salon" && salonErrors.salonName && (
                    <p className="text-sm text-red-500">
                      {typeof salonErrors.salonName.message === "string"
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
                  {selectedRoleId === "salon" &&
                    salonErrors.businessLicense && (
                      <p className="text-sm text-red-500">
                        {typeof salonErrors.businessLicense.message === "string"
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
                {selectedRoleId === "salon" && salonErrors.salonAddress && (
                  <p className="text-sm text-red-500">
                    {typeof salonErrors.salonAddress.message === "string"
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
                {selectedRoleId === "salon" && salonErrors.subscription && (
                  <p className="text-sm text-red-500">
                    {typeof salonErrors.subscription.message === "string"
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
