'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, X, Plus, Save } from 'lucide-react';
import Link from 'next/link';

const salonSchema = z.object({
  name: z.string().min(2, 'Salon name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
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
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  businessLicense?: string;
  taxId?: string;
  services: string[];
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  images?: string[];
  status: 'active' | 'pending' | 'suspended';
  subscription: 'Basic' | 'Standard' | 'Premium';
}

export default function EditSalonPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

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
        // In a real app, you would fetch from your API
        // For demo purposes, we'll use mock data
        const mockSalon: Salon = {
          id: params.id as string,
          name: 'Luxe Hair Studio',
          email: 'contact@luxehair.com',
          phone: '+1 (555) 123-4567',
          address: '123 Rodeo Drive',
          city: 'Beverly Hills',
          state: 'CA',
          zipCode: '90210',
          website: 'https://www.luxehair.com',
          description: 'Luxe Hair Studio is a premier destination for hair care and styling in Beverly Hills. We offer a full range of services from cuts and color to treatments and styling, all delivered by our team of expert stylists in a luxurious, relaxing environment.',
          ownerName: 'Sarah Johnson',
          ownerEmail: 'sarah@luxehair.com',
          ownerPhone: '+1 (555) 123-4568',
          businessLicense: 'BL123456789',
          taxId: '12-3456789',
          services: ['Haircut', 'Hair Color', 'Hair Styling', 'Hair Treatment', 'Beard Trim', 'Eyebrow Threading'],
          hours: {
            monday: { open: '09:00', close: '20:00', closed: false },
            tuesday: { open: '09:00', close: '20:00', closed: false },
            wednesday: { open: '09:00', close: '20:00', closed: false },
            thursday: { open: '09:00', close: '20:00', closed: false },
            friday: { open: '09:00', close: '21:00', closed: false },
            saturday: { open: '08:00', close: '21:00', closed: false },
            sunday: { open: '10:00', close: '18:00', closed: false },
          },
          images: [
            'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
            'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
            'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
          ],
          status: 'active',
          subscription: 'Premium',
        };

        // Populate form with existing data
        reset({
          name: mockSalon.name,
          email: mockSalon.email,
          phone: mockSalon.phone,
          address: mockSalon.address,
          city: mockSalon.city,
          state: mockSalon.state,
          zipCode: mockSalon.zipCode,
          website: mockSalon.website || '',
          description: mockSalon.description || '',
          ownerName: mockSalon.ownerName || '',
          ownerEmail: mockSalon.ownerEmail || '',
          ownerPhone: mockSalon.ownerPhone || '',
          businessLicense: mockSalon.businessLicense || '',
          taxId: mockSalon.taxId || '',
        });

        setSelectedServices(mockSalon.services);
        setHours(mockSalon.hours);
        setUploadedImages(mockSalon.images || []);
      } catch (error) {
        console.error('Error fetching salon:', error);
        toast({
          title: 'Error loading salon',
          description: 'Could not load salon data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [params.id, reset, toast]);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, you would upload these to a storage service
      // For demo purposes, we'll just add placeholder URLs
      const newImages = Array.from(files).map((file, index) => 
        `https://images.pexels.com/photos/399999${index}/pexels-photo-399999${index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2`
      );
      setUploadedImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SalonForm) => {
    setIsSubmitting(true);
    try {
      const salonData = {
        ...data,
        services: selectedServices,
        hours,
        images: uploadedImages,
      };

      const response = await fetch(`/api/salons/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salonData),
      });

      if (!response.ok) {
        throw new Error('Failed to update salon');
      }

      toast({
        title: 'Salon updated successfully',
        description: 'The salon information has been updated.',
      });

      router.push(`/dashboard/salons/${params.id}`);
    } catch (error) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/salons/${params.id}`}>
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
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
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
                  {...register('zipCode')}
                />
                {errors.zipCode && (
                  <p className="text-sm text-red-500">{errors.zipCode.message}</p>
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
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Salon image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
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
          <Link href={`/dashboard/salons/${params.id}`}>
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