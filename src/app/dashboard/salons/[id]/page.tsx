'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star, 
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Building2,
  User,
  CreditCard,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface Salon {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  status: 'active' | 'pending' | 'suspended';
  subscription: 'Basic' | 'Standard' | 'Premium';
  joinDate: string;
  revenue: string;
  bookings: number;
  rating: number;
  services: string[];
  hours: Record<string, string>;
  website?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  businessLicense?: string;
  taxId?: string;
  images?: string[];
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
};

const subscriptionColors = {
  Basic: 'bg-gray-100 text-gray-800',
  Standard: 'bg-blue-100 text-blue-800',
  Premium: 'bg-purple-100 text-purple-800',
};

export default function SalonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

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
          address: '123 Rodeo Drive, Beverly Hills, CA 90210',
          location: 'Beverly Hills, CA',
          status: 'active',
          subscription: 'Premium',
          joinDate: '2024-01-15',
          revenue: '$12,450',
          bookings: 156,
          rating: 4.9,
          website: 'https://www.luxehair.com',
          description: 'Luxe Hair Studio is a premier destination for hair care and styling in Beverly Hills. We offer a full range of services from cuts and color to treatments and styling, all delivered by our team of expert stylists in a luxurious, relaxing environment.',
          services: ['Haircut', 'Hair Color', 'Hair Styling', 'Hair Treatment', 'Beard Trim', 'Eyebrow Threading'],
          hours: {
            monday: '9:00 AM - 8:00 PM',
            tuesday: '9:00 AM - 8:00 PM',
            wednesday: '9:00 AM - 8:00 PM',
            thursday: '9:00 AM - 8:00 PM',
            friday: '9:00 AM - 9:00 PM',
            saturday: '8:00 AM - 9:00 PM',
            sunday: '10:00 AM - 6:00 PM',
          },
          ownerName: 'Sarah Johnson',
          ownerEmail: 'sarah@luxehair.com',
          ownerPhone: '+1 (555) 123-4568',
          businessLicense: 'BL123456789',
          taxId: '12-3456789',
          images: [
            'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
            'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
            'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
            'https://images.pexels.com/photos/3992660/pexels-photo-3992660.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
          ],
        };
        
        setSalon(mockSalon);
      } catch (error) {
        console.error('Error fetching salon:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Salon not found</h2>
          <p className="text-gray-600 mt-2">The salon you're looking for doesn't exist.</p>
          <Link href="/dashboard/salons">
            <Button className="mt-4">Back to Salons</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/salons">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{salon.name}</h1>
            <p className="text-gray-600">Salon Details & Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/salons/${salon.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status and Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={salon.images?.[0]} alt={salon.name} />
                <AvatarFallback className="text-lg">
                  {salon.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{salon.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusColors[salon.status]}>
                    {salon.status}
                  </Badge>
                  <Badge className={subscriptionColors[salon.subscription]}>
                    {salon.subscription}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {salon.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {salon.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {salon.joinDate}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {salon.status === 'pending' && (
                <>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              {salon.status === 'active' && (
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <XCircle className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
              )}
              {salon.status === 'suspended' && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{salon.revenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{salon.bookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{salon.rating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{salon.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-600">{salon.phone}</p>
              </div>
            </div>
            {salon.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <a 
                    href={salon.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    {salon.website}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-gray-600">{salon.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {salon.ownerName && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Owner Name</p>
                  <p className="text-sm text-gray-600">{salon.ownerName}</p>
                </div>
              </div>
            )}
            {salon.ownerEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Owner Email</p>
                  <p className="text-sm text-gray-600">{salon.ownerEmail}</p>
                </div>
              </div>
            )}
            {salon.ownerPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Owner Phone</p>
                  <p className="text-sm text-gray-600">{salon.ownerPhone}</p>
                </div>
              </div>
            )}
            {salon.businessLicense && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Business License</p>
                  <p className="text-sm text-gray-600">{salon.businessLicense}</p>
                </div>
              </div>
            )}
            {salon.taxId && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Tax ID</p>
                  <p className="text-sm text-gray-600">{salon.taxId}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {salon.description && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{salon.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Services */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Services Offered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {salon.services.map((service) => (
              <Badge key={service} variant="secondary">
                {service}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(salon.hours).map(([day, hours]) => (
              <div key={day} className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize text-gray-900">{day}</span>
                <span className="text-sm text-gray-600">{hours}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      {salon.images && salon.images.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Salon Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {salon.images.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${salon.name} image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}