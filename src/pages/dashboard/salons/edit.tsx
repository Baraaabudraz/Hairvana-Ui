import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Clock,
  FileText,
  CreditCard,
  Globe,
  MapPin,
  Phone,
  Mail,
  User,
  Save
} from 'lucide-react';
import { fetchSalonById, updateSalon } from '@/api/salons';
import { getSalonImageUrl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
  ownerName: z.string().min(2, 'Owner name is required'),
  ownerEmail: z.string().email('Invalid owner email'),
  ownerPhone: z.string().min(10, 'Owner phone is required'),
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

interface Salon {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    id: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  address_id?: string;
  website?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  businessLicense?: string;
  taxId?: string;
  services: Array<{
    id: string;
    name: string;
    description?: string;
    price?: number;
    duration?: number;
    status?: string;
    image_url?: string;
    is_popular?: boolean;
    special_offers?: string;
    createdAt?: string;
    updatedAt?: string;
    salon_services?: any;
  }> | string[];
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  images?: string[];
  status: 'active' | 'pending' | 'suspended';
  subscription: 'Basic' | 'Standard' | 'Premium';
  avatar?: string; // Added avatar to interface
}

export default function EditSalonPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<(File | string)[]>([]);
  // Add state for avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add state for full salon data
  const [salonData, setSalonData] = useState<Salon | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SalonForm>({
    resolver: zodResolver(salonSchema),
  });

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        setLoading(true);
        console.log('Fetching salon with ID:', params.id);
        const data = await fetchSalonById(params.id as string);
        console.log('Salon data received:', data);
        setSalonData(data);
        
        // Handle address data from the new address object structure
        if (!data) {
          console.log('No data found');
          return;
        }

        let streetAddress = '';
        let city = '';
        let state = '';
        let zipCode = '';
        let country = 'US';

        if (data.address && typeof data.address === 'object') {
          // New address structure - address is an object
          streetAddress = data.address.street_address || '';
          city = data.address.city || '';
          state = data.address.state || '';
          zipCode = data.address.zip_code || '';
          country = data.address.country || 'US';
        }
        
        // Populate form with existing data
        const formData = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          street_address: streetAddress || '',
          city: city || '',
          state: state || '',
          zip_code: zipCode || '',
          country: country || 'US',
          website: data.website || '',
          description: data.description || '',
          ownerName: data.owner_name || '',
          ownerEmail: data.owner_email || '',
          ownerPhone: data.owner_phone || '',
          businessLicense: data.business_license || '',
          taxId: data.tax_id || '',
        };
        
        console.log('Setting form data:', formData);
        reset(formData);

        // Convert hours format
        const formattedHours: Record<string, { open: string; close: string; closed: boolean }> = {};
        Object.entries(data.hours || {}).forEach(([day, timeRange]) => {
          if (typeof timeRange === 'string' && timeRange.toLowerCase() !== 'closed') {
            const [open, close] = timeRange.split(' - ');
            formattedHours[day] = {
              open: convertTo24Hour(open),
              close: convertTo24Hour(close),
              closed: false
            };
          } else {
            formattedHours[day] = {
              open: '',
              close: '',
              closed: true
            };
          }
        });

        // Convert services to array of service names
        const serviceNames = Array.isArray(data.services) 
          ? data.services.map((service: string | { name: string }) => typeof service === 'string' ? service : service.name)
          : [];
        
        setSelectedServices(serviceNames);
        setHours(formattedHours);
        setUploadedImages(data.gallery || []); // Only set once on load
      } catch (error) {
        console.error('Error fetching salon:', error);
        setError('Could not load salon data. Please try again.');
        toast({
          title: 'Error loading salon',
          description: 'Could not load salon data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSalon();
    }
    // eslint-disable-next-line
  }, [params.id, reset, toast]);

  const convertTo24Hour = (time12h: string) => {
    if (!time12h || typeof time12h !== 'string') return '';
    const [time, modifier] = time12h.split(' ');
    if (!time || !modifier) return '';
    let [hours, minutes] = time.split(':');
    if (!hours || !minutes) return '';
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const convertTo12Hour = (time24h: string) => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${period}`;
  };

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
      setUploadedImages(prev => {
        const existingNames = prev.map(img => typeof img === 'string' ? img : img.name);
        const newFiles = Array.from(files).filter(f => !existingNames.includes(f.name));
        return [...prev, ...newFiles];
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveGalleryImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SalonForm) => {
    setIsSubmitting(true);
    try {
      // Create FormData for all fields and images
      const formData = new FormData();
      
      // Add form fields
      Object.keys(data).forEach(key => {
        const value = data[key as keyof SalonForm];
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add services
      selectedServices.forEach(service => {
        formData.append('services[]', service);
      });

      // Add hours as JSON string
      const formattedHours: Record<string, string> = {};
      Object.entries(hours).forEach(([day, timeData]) => {
        if (timeData.closed) {
          formattedHours[day] = 'Closed';
        } else {
          formattedHours[day] = `${convertTo12Hour(timeData.open)} - ${convertTo12Hour(timeData.close)}`;
        }
      });
      formData.append('hours', JSON.stringify(formattedHours));

      // Add existing images
      uploadedImages.forEach(img => {
        if (typeof img === 'string') {
          formData.append('existingImages', img);
        } else {
          formData.append('gallery', img);
        }
      });

      // Add avatar
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // Send request
      await updateSalon(params.id as string, formData);
      
      toast({
        title: 'Salon updated successfully',
        description: 'The salon information has been updated.',
      });
      navigate(`/dashboard/salons/${params.id}`);
    } catch (error) {
      console.error('Error updating salon:', error);
      toast({
        title: 'Error updating salon',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Salon</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!salonData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Salon Not Found</h2>
          <p className="text-gray-600 mb-4">The salon you're looking for doesn't exist.</p>
          <Link to="/dashboard/salons">
            <Button>Back to Salons</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/dashboard/salons/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Salon</h1>
          <p className="text-gray-600">Update salon information and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the basic details about the salon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              Update the salon's physical address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
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
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  placeholder="10001"
                  {...register('zip_code')}
                />
                {errors.zip_code && (
                  <p className="text-sm text-red-500">{errors.zip_code.message}</p>
                )}
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
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>
              Update details about the salon owner or manager
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  placeholder="John Doe"
                  {...register('ownerName')}
                />
                {errors.ownerName && (
                  <p className="text-sm text-red-500">{errors.ownerName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner Email *</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  placeholder="owner@example.com"
                  {...register('ownerEmail')}
                />
                {errors.ownerEmail && (
                  <p className="text-sm text-red-500">{errors.ownerEmail.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Owner Phone *</Label>
                <Input
                  id="ownerPhone"
                  placeholder="+1 (555) 123-4567"
                  {...register('ownerPhone')}
                />
                {errors.ownerPhone && (
                  <p className="text-sm text-red-500">{errors.ownerPhone.message}</p>
                )}
              </div>
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
              Update the services your salon provides
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
              Update the salon's operating hours for each day
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
                    checked={hours[day]?.closed || false}
                    onChange={() => toggleDayClosed(day)}
                    className="rounded"
                  />
                  <Label className="text-sm">Closed</Label>
                </div>
                {!hours[day]?.closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours[day]?.open || '09:00'}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={hours[day]?.close || '18:00'}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Salon Avatar */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Salon Avatar</CardTitle>
            <CardDescription>
              Upload a main image for your salon (avatar)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center mb-8">
              <Avatar className="h-28 w-28 mb-2">
                <AvatarImage
                  src={avatarPreview
                    ? avatarPreview
                    : avatarFile
                      ? URL.createObjectURL(avatarFile)
                      : salonData?.avatar
                        ? getSalonImageUrl(salonData.avatar)
                        : '/default-salon.png'}
                  alt="Salon Avatar"
                />
                <AvatarFallback>AV</AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setAvatarFile(e.target.files[0]);
                    setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" /> Edit Salon Avatar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Salon Images</CardTitle>
            <CardDescription>
              Update photos of your salon (maximum 5 images)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="images" className="cursor-pointer">
                  <span className="text-purple-600 hover:text-purple-500">Upload new images</span>
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

            {uploadedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {uploadedImages.map((file, idx) => (
                  <div key={typeof file === 'string' ? file : file.name} className="relative">
                    <img
                      src={
                        file instanceof File
                          ? URL.createObjectURL(file)
                          : getSalonImageUrl(file)
                      }
                      alt="Preview"
                      style={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to={`/dashboard/salons/${params.id}`}>
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}