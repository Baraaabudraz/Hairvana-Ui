import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createSalon } from '@/api/salons';
import { fetchUsersByRole, fetchUsers } from '@/api/users';
import type { User } from '@/types/user';

const salonSchema = z.object({
  name: z.string().min(2, 'Salon name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  street_address: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(5, 'ZIP code must be at least 5 characters'),
  country: z.string().min(2, 'Country is required').default('US'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  owner_id: z.string().min(1, 'Please select an owner'),
  businessLicense: z.string().min(5, 'Business license number is required'),
  taxId: z.string().min(9, 'Tax ID is required'),
});

type SalonForm = z.infer<typeof salonSchema>;

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const serviceCategories = [
  'Haircut', 'Hair Color', 'Hair Styling', 'Hair Treatment', 'Beard Trim', 
  'Eyebrow Threading', 'Facial', 'Manicure', 'Pedicure', 'Massage'
];

export default function NewSalonPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [owners, setOwners] = useState<User[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '19:00', closed: false },
    saturday: { open: '08:00', close: '19:00', closed: false },
    sunday: { open: '10:00', close: '18:00', closed: false },
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  // Add state for avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SalonForm>({
    resolver: zodResolver(salonSchema),
    defaultValues: {
      country: 'US',
    },
  });

  // Fetch potential salon owners
  useEffect(() => {
    const loadOwners = async () => {
      try {
        setLoadingOwners(true);
        
        console.log('Loading salon owners...');
        
        // Try different possible role names for salon owners
        const possibleRoleNames = ['salon', 'Salon', 'salon_owner', 'Salon Owner', 'salonowner'];
        let response = null;
        let usedRoleName = '';
        
        for (const roleName of possibleRoleNames) {
          try {
            console.log(`Trying role name: "${roleName}"`);
            response = await fetchUsersByRole(roleName);
            usedRoleName = roleName;
            console.log(`Successfully found users with role "${roleName}":`, response);
            break;
          } catch (roleError) {
            console.log(`Role "${roleName}" not found or failed:`, roleError);
            continue;
          }
        }
        
        if (!response) {
          // If no specific salon role found, try fetching all users and filter later
          console.log('No salon role found, fetching all users...');
          const allUsersResponse = await fetchUsers();
          console.log('All users response:', allUsersResponse);
          
          // Filter users that might be salon owners (you can adjust this logic)
          const potentialOwners = allUsersResponse.users?.filter((user: any) => 
            user.role?.name?.toLowerCase().includes('salon') ||
            user.role?.name?.toLowerCase().includes('owner')
          ) || [];
          
          setOwners(potentialOwners);
          
          if (potentialOwners.length === 0) {
            toast({
              title: 'No salon owners found',
              description: 'No users with salon owner roles were found. You may need to create salon owner accounts first.',
              variant: 'destructive',
            });
          }
        } else {
          setOwners(response.users || response || []);
          console.log(`Set ${(response.users || response || []).length} owners from role "${usedRoleName}"`);
        }
        
      } catch (error) {
        console.error('Error loading owners:', error);
        toast({
          title: 'Error',
          description: `Failed to load salon owners: ${error instanceof Error ? error.message : 'Please try again.'}`,
          variant: 'destructive',
        });
      } finally {
        setLoadingOwners(false);
      }
    };

    loadOwners();
  }, [toast]);

  // Update form value when owner is selected
  useEffect(() => {
    setValue('owner_id', selectedOwnerId);
  }, [selectedOwnerId, setValue]);

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const addCustomService = () => {
    if (customService.trim() && !selectedServices.includes(customService.trim())) {
      setSelectedServices(prev => [...prev, customService.trim()]);
      setCustomService('');
    }
  };

  const removeService = (service: string) => {
    setSelectedServices(prev => prev.filter(s => s !== service));
  };

  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const toggleDayClosed = (day: string) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed }
    }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files).slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const convertTo12Hour = (time24h: string) => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${period}`;
  };

  const onSubmit = async (data: SalonForm) => {
    setIsSubmitting(true);
    try {
      // Get the selected owner details
      const selectedOwner = owners.find(owner => owner.id === data.owner_id);
      if (!selectedOwner) {
        throw new Error('Selected owner not found');
      }

      // Format hours for API
      const formattedHours: Record<string, string> = {};
      Object.entries(hours).forEach(([day, timeData]) => {
        if (timeData.closed) {
          formattedHours[day] = 'Closed';
        } else {
          formattedHours[day] = `${convertTo12Hour(timeData.open)} - ${convertTo12Hour(timeData.close)}`;
        }
      });

      // Format address
      const fullAddress = `${data.street_address}, ${data.city}, ${data.state} ${data.zip_code}`;

      // Build FormData for all fields and images
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('street_address', data.street_address);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('zip_code', data.zip_code);
      formData.append('country', data.country);
      formData.append('website', data.website || '');
      formData.append('description', data.description);
      formData.append('owner_id', data.owner_id);
      formData.append('owner_name', selectedOwner.name);
      formData.append('owner_email', selectedOwner.email);
      formData.append('business_license', data.businessLicense);
      formData.append('tax_id', data.taxId);
      formData.append('status', 'pending');
      // Append services
      selectedServices.forEach(service => formData.append('services', service));
      // Append hours as JSON string
      formData.append('hours', JSON.stringify(formattedHours));
      // Append images
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      selectedFiles.forEach(file => {
        formData.append('gallery', file);
      });
      // Send request
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/backend/api/salons`, {
        method: 'POST',
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      toast({
        title: 'Salon created successfully',
        description: 'The salon has been submitted for review and approval.',
      });
      navigate('/dashboard/salons');
    } catch (error) {
      toast({
        title: 'Error creating salon',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/salons">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Salon</h1>
          <p className="text-gray-600">Register a new salon on the platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details about the salon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {avatarPreview && (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
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
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setAvatarFile(e.target.files[0]);
                    setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Salon Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter salon name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="salon@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://www.salon.com"
                  {...register('website')}
                />
                {errors.website && (
                  <p className="text-sm text-red-500">{errors.website.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Describe your salon, services, and what makes it special..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
            <CardDescription>
              Provide the salon's physical address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street_address">Street Address *</Label>
              <Input
                id="street_address"
                placeholder="123 Main Street"
                {...register('street_address')}
              />
              {errors.street_address && (
                <p className="text-sm text-red-500">{errors.street_address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  {...register('state')}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code *</Label>
                <Input
                  id="zip_code"
                  placeholder="10001"
                  {...register('zip_code')}
                />
                {errors.zip_code && (
                  <p className="text-sm text-red-500">{errors.zip_code.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                placeholder="US"
                {...register('country')}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>
              Details about the salon owner or manager
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner_id">Owner *</Label>
              <Select
                value={selectedOwnerId}
                onValueChange={setSelectedOwnerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an owner" />
                </SelectTrigger>
                <SelectContent>
                  {loadingOwners ? (
                    <SelectItem value="loading" disabled>Loading owners...</SelectItem>
                  ) : owners.length === 0 ? (
                    <SelectItem value="no-owners" disabled>No owners available</SelectItem>
                  ) : (
                    owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.owner_id && (
                <p className="text-sm text-red-500">{errors.owner_id.message}</p>
              )}
            </div>

            {/* Display selected owner details */}
            {selectedOwnerId && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Selected Owner Details</h4>
                {(() => {
                  const selectedOwner = owners.find(owner => owner.id === selectedOwnerId);
                  if (!selectedOwner) return null;
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {selectedOwner.name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedOwner.email}
                      </div>
                      {selectedOwner.phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {selectedOwner.phone}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Role:</span> {selectedOwner.role?.name || 'N/A'}
                      </div>
                      {selectedOwner.status && (
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                            selectedOwner.status === 'active' ? 'bg-green-100 text-green-800' :
                            selectedOwner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedOwner.status}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="businessLicense">Business License *</Label>
              <Input
                id="businessLicense"
                placeholder="BL123456789"
                {...register('businessLicense')}
              />
              {errors.businessLicense && (
                <p className="text-sm text-red-500">{errors.businessLicense.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID *</Label>
              <Input
                id="taxId"
                placeholder="12-3456789"
                {...register('taxId')}
              />
              {errors.taxId && (
                <p className="text-sm text-red-500">{errors.taxId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
            <CardDescription>
              Select the services your salon provides
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {serviceCategories.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => handleServiceToggle(service)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedServices.includes(service)
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add custom service"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
              />
              <Button type="button" onClick={addCustomService} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {selectedServices.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Services:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((service) => (
                    <Badge key={service} variant="secondary" className="flex items-center gap-1">
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
            <CardDescription>
              Set the salon's operating hours for each day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24">
                  <Label className="capitalize">{day}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hours[day].closed}
                    onChange={() => toggleDayClosed(day)}
                    className="rounded"
                  />
                  <Label className="text-sm">Closed</Label>
                </div>
                {!hours[day].closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours[day].open}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={hours[day].close}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Salon Images</CardTitle>
            <CardDescription>
              Upload photos of your salon (maximum 5 images)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="images" className="cursor-pointer">
                  <span className="text-purple-600 hover:text-purple-500">Upload images</span>
                  <span className="text-gray-500"> or drag and drop</span>
                </Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
            </div>

            {selectedFiles.map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt={idx === 0 ? 'Avatar Preview' : 'Gallery Preview'}
                style={{ width: 100, height: 100, objectFit: 'cover', border: idx === 0 ? '2px solid #6366f1' : undefined }}
              />
            ))}

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {uploadedImages.map((image, index) => {
                  let src = image;
                  if (src && !src.startsWith('http')) {
                    src = src.startsWith('/uploads/salons/') ? src : `/uploads/salons/${src.replace(/^\/+/, '')}`;
                  }
                  return (
                    <div key={index} className="relative">
                      <img
                        src={src}
                        alt={index === 0 ? 'Avatar' : `Gallery image ${index}`}
                        className="w-full h-24 object-cover rounded-lg"
                        style={{ border: index === 0 ? '2px solid #6366f1' : undefined }}
                      />
                      <span className={index === 0 ? 'absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded' : 'hidden'}>Avatar</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to="/dashboard/salons">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Salon'}
          </Button>
        </div>
      </form>
    </div>
  );
}