import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { fetchSalonById, updateSalonStatus, deleteSalon } from '@/api/salons';
import { useToast } from '@/hooks/use-toast';

interface Salon {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  status: 'active' | 'pending' | 'suspended';
  subscription: 'Basic' | 'Standard' | 'Premium';
  join_date: string;
  revenue: number;
  bookings: number;
  rating: number;
  services: string[];
  hours: Record<string, string>;
  website?: string;
  description?: string;
  owner_id: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  owner_avatar?: string;
  owner_role?: string;
  business_license?: string;
  tax_id?: string;
  images?: string[];
  created_at?: string;
  updated_at?: string;
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

// Helper function to format dates
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export default function SalonDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalon = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const data = await fetchSalonById(params.id as string);
          // Ensure arrays are not null
          const salonData = {
            ...data,
            services: data.services || [],
            hours: data.hours || {},
            images: data.images || []
          };
          setSalon(salonData);
        } catch (apiError) {
          console.warn('API fetch failed, using mock data:', apiError);
          
          // Fallback to mock data if API fails
          const mockSalons: Record<string, Salon> = {
            '1': {
              id: '1',
              name: 'Luxe Hair Studio',
              email: 'info@luxehair.com',
              phone: '+1 (555) 123-4567',
              address: '123 Beverly Hills Blvd, Beverly Hills, CA 90210',
              location: 'Beverly Hills, CA',
              status: 'active',
              subscription: 'Premium',
              join_date: '2024-01-15',
              revenue: 12450,
              bookings: 156,
              rating: 4.8,
              services: ['Haircut', 'Hair Color', 'Hair Styling', 'Hair Extensions', 'Hair Treatment'],
              hours: {
                monday: '9:00 AM - 7:00 PM',
                tuesday: '9:00 AM - 7:00 PM',
                wednesday: '9:00 AM - 7:00 PM',
                thursday: '9:00 AM - 7:00 PM',
                friday: '9:00 AM - 7:00 PM',
                saturday: '10:00 AM - 6:00 PM',
                sunday: 'Closed'
              },
              website: 'https://luxehair.com',
              description: 'Premium hair salon offering luxury hair services in Beverly Hills.',
              owner_id: '3',
              owner_name: 'Maria Rodriguez',
              owner_email: 'maria@luxehair.com',
              owner_phone: '+1 (555) 345-6789',
              business_license: 'CA123456789',
              tax_id: '12-3456789',
              images: [
                'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
                'https://images.pexels.com/photos/3993450/pexels-photo-3993450.jpeg?auto=compress&cs=tinysrgb&w=800'
              ]
            },
            '2': {
              id: '2',
              name: 'Style Cuts',
              email: 'info@stylecuts.com',
              phone: '+1 (555) 234-5678',
              address: '456 Market St, San Francisco, CA 94105',
              location: 'San Francisco, CA',
              status: 'active',
              subscription: 'Standard',
              join_date: '2024-01-20',
              revenue: 8900,
              bookings: 98,
              rating: 4.5,
              services: ['Haircut', 'Hair Color', 'Hair Styling', 'Beard Trim'],
              hours: {
                monday: '8:00 AM - 6:00 PM',
                tuesday: '8:00 AM - 6:00 PM',
                wednesday: '8:00 AM - 6:00 PM',
                thursday: '8:00 AM - 6:00 PM',
                friday: '8:00 AM - 6:00 PM',
                saturday: '9:00 AM - 5:00 PM',
                sunday: 'Closed'
              },
              website: 'https://stylecuts.com',
              description: 'Modern hair salon in downtown San Francisco.',
              owner_id: '4',
              owner_name: 'David Chen',
              owner_email: 'david@stylecuts.com',
              owner_phone: '+1 (555) 456-7890',
              business_license: 'CA987654321',
              tax_id: '98-7654321',
              images: [
                'https://images.pexels.com/photos/3993451/pexels-photo-3993451.jpeg?auto=compress&cs=tinysrgb&w=800'
              ]
            },
            '3': {
              id: '3',
              name: 'Beauty Haven',
              email: 'info@beautyhaven.com',
              phone: '+1 (555) 345-6789',
              address: '789 Oak Ave, Los Angeles, CA 90001',
              location: 'Los Angeles, CA',
              status: 'pending',
              subscription: 'Basic',
              join_date: '2024-02-01',
              revenue: 3200,
              bookings: 45,
              rating: 4.2,
              services: ['Haircut', 'Hair Styling', 'Hair Treatment'],
              hours: {
                monday: '10:00 AM - 6:00 PM',
                tuesday: '10:00 AM - 6:00 PM',
                wednesday: '10:00 AM - 6:00 PM',
                thursday: '10:00 AM - 6:00 PM',
                friday: '10:00 AM - 6:00 PM',
                saturday: '10:00 AM - 4:00 PM',
                sunday: 'Closed'
              },
              description: 'Cozy neighborhood salon providing quality hair services.',
              owner_id: '5',
              owner_name: 'Lisa Thompson',
              owner_email: 'lisa@beautyhaven.com',
              owner_phone: '+1 (555) 567-8901',
              business_license: 'CA456789123',
              images: []
            }
          };
          
          const salonData = mockSalons[params.id as string];
          if (salonData) {
            setSalon(salonData);
          } else {
            throw new Error('Salon not found');
          }
        }
      } catch (error) {
        console.error('Error loading salon:', error);
        toast({
          title: 'Error',
          description: 'Failed to load salon details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadSalon();
    }
  }, [params.id, toast]);

  const handleStatusChange = async (newStatus: 'active' | 'pending' | 'suspended') => {
    if (!salon) return;
    
    try {
      await updateSalonStatus(salon.id, newStatus);
      
      setSalon(prev => prev ? { ...prev, status: newStatus } : null);
      
      const statusMessages = {
        active: 'Salon has been activated',
        pending: 'Salon has been set to pending',
        suspended: 'Salon has been suspended',
      };
      
      toast({
        title: 'Status updated',
        description: statusMessages[newStatus],
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update salon status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!salon) return;
    
    try {
      await deleteSalon(salon.id);
      
      toast({
        title: 'Salon deleted',
        description: 'The salon has been permanently removed from the platform.',
      });
      
      navigate('/dashboard/salons');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete salon. Please try again.',
        variant: 'destructive',
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

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Salon not found</h2>
          <p className="text-gray-600 mt-2">The salon you're looking for doesn't exist.</p>
          <Link to="/dashboard/salons">
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
          <Link to="/dashboard/salons">
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
          <Link to={`/dashboard/salons/${salon.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
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
                    Joined {formatDate(salon.join_date)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {salon.status === 'pending' && (
                <>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('active')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleStatusChange('suspended')}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              {salon.status === 'active' && (
                <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleStatusChange('suspended')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
              )}
              {salon.status === 'suspended' && (
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('active')}>
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
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${salon.revenue?.toLocaleString()}</p>
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
            {salon.owner_avatar && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={salon.owner_avatar} alt={salon.owner_name || 'Owner'} />
                  <AvatarFallback>{salon.owner_name?.charAt(0) || 'O'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Owner Avatar</p>
                </div>
              </div>
            )}
            {salon.owner_name && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Owner Name</p>
                  <p className="text-sm text-gray-600">{salon.owner_name}</p>
                </div>
              </div>
            )}
            {salon.owner_email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Owner Email</p>
                  <p className="text-sm text-gray-600">{salon.owner_email}</p>
                </div>
              </div>
            )}
            {salon.owner_phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Owner Phone</p>
                  <p className="text-sm text-gray-600">{salon.owner_phone}</p>
                </div>
              </div>
            )}
            {salon.owner_id && (
              <div className="flex items-center gap-3">
                <Link to={`/dashboard/users/${salon.owner_id}`}>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    View Owner Profile
                  </Button>
                </Link>
              </div>
            )}
            {salon.business_license && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Business License</p>
                  <p className="text-sm text-gray-600">{salon.business_license}</p>
                </div>
              </div>
            )}
            {salon.tax_id && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Tax ID</p>
                  <p className="text-sm text-gray-600">{salon.tax_id}</p>
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
            {(salon.services || []).map((service) => (
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
            {Object.entries(salon.hours || {}).map(([day, hours]) => (
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
              {(salon.images || []).map((image, index) => (
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