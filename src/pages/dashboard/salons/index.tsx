'use client';

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';
import { fetchSalons, deleteSalon, updateSalonStatus } from '@/api/salons';

type SalonStatus = 'active' | 'pending' | 'suspended';
type SubscriptionType = 'Basic' | 'Standard' | 'Premium';

interface Salon {
  id: number;
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
  location?: string; // Keep for backward compatibility
  status: SalonStatus;
  subscription: SubscriptionType;
  joinDate: string;
  revenue: string;
  bookings: number;
  rating: number;
  avatar: string;
  images?: string[]; // Added images property
}

const statusColors: Record<SalonStatus, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
};

const subscriptionColors: Record<SubscriptionType, string> = {
  Basic: 'bg-gray-100 text-gray-800',
  Standard: 'bg-blue-100 text-blue-800',
  Premium: 'bg-purple-100 text-purple-800',
};

// Utility to handle images as array or string
function parseImages(images: string | string[] | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  return images
    .replace(/^{|}$/g, '')
    .split(',')
    .map(img => img.trim())
    .filter(Boolean);
}

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SalonStatus>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const ownerId = params.get('ownerId');

  useEffect(() => {
    loadSalons();
    // eslint-disable-next-line
  }, [statusFilter, searchTerm, page, limit]);

  const loadSalons = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (ownerId) {
        params.ownerId = ownerId;
      }
      
      const data = await fetchSalons(params);
      setSalons(data.salons);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading salons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load salons. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (salonId: number, newStatus: SalonStatus) => {
    try {
      await updateSalonStatus(salonId.toString(), newStatus);

      setSalons(prev => prev.map(salon => 
        salon.id === salonId ? { ...salon, status: newStatus } : salon
      ));

      const statusMessages = {
        active: 'Salon has been reactivated',
        suspended: 'Salon has been suspended',
        pending: 'Salon status updated to pending',
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

  const handleDelete = async (salonId: number) => {
    try {
      await deleteSalon(salonId.toString());
      setSalons(prev => prev.filter(salon => salon.id !== salonId));

      toast({
        title: 'Salon deleted',
        description: 'The salon has been permanently removed from the platform.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete salon. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (salon: Salon) => {
    setSelectedSalon(salon);
    setDeleteDialogOpen(true);
  };

  const openSuspendDialog = (salon: Salon) => {
    setSelectedSalon(salon);
    setSuspendDialogOpen(true);
  };

  const openReactivateDialog = (salon: Salon) => {
    setSelectedSalon(salon);
    setReactivateDialogOpen(true);
  };

  const openApproveDialog = (salon: Salon) => {
    setSelectedSalon(salon);
    setApproveDialogOpen(true);
  };

  const openRejectDialog = (salon: Salon) => {
    setSelectedSalon(salon);
    setRejectDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSalon) {
      handleDelete(selectedSalon.id);
      setDeleteDialogOpen(false);
      setSelectedSalon(null);
    }
  };

  const confirmSuspend = () => {
    if (selectedSalon) {
      handleStatusChange(selectedSalon.id, 'suspended');
      setSuspendDialogOpen(false);
      setSelectedSalon(null);
    }
  };

  const confirmReactivate = () => {
    if (selectedSalon) {
      handleStatusChange(selectedSalon.id, 'active');
      setReactivateDialogOpen(false);
      setSelectedSalon(null);
    }
  };

  const confirmApprove = () => {
    if (selectedSalon) {
      handleStatusChange(selectedSalon.id, 'active');
      setApproveDialogOpen(false);
      setSelectedSalon(null);
    }
  };

  const confirmReject = () => {
    if (selectedSalon) {
      handleStatusChange(selectedSalon.id, 'suspended');
      setRejectDialogOpen(false);
      setSelectedSalon(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Salon Management</h1>
          <p className="text-gray-600">Manage registered salons and their subscriptions</p>
        </div>
        <Link to="/dashboard/salons/new">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Salon
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search salons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'suspended' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('suspended')}
                size="sm"
              >
                Suspended
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salons.map((salon) => {
              return (
                <div key={salon.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {/* Salon Image */}
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage
                        src={salon.avatar}
                        alt={salon.name}
                      />
                      <AvatarFallback>{salon.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{salon.name}</h3>
                      <p className="text-sm text-gray-600">
                        {salon.address ? `${salon.address.city}, ${salon.address.state}` : salon.location}
                      </p>
                      <p className="text-xs text-gray-500">{salon.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">{salon.revenue}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">{salon.bookings}</p>
                      <p className="text-xs text-gray-500">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {salon.rating > 0 ? `★ ${salon.rating}` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={statusColors[salon.status]}>
                        {salon.status}
                      </Badge>
                      <Badge className={subscriptionColors[salon.subscription]}>
                        {salon.subscription}
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
                          <Link to={`/dashboard/salons/${salon.id}`} className="flex items-center w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/salons/${salon.id}/edit`} className="flex items-center w-full">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {salon.status === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              className="text-green-600 cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault();
                                openApproveDialog(salon);
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault();
                                openRejectDialog(salon);
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {salon.status === 'active' && (
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer"
                            onSelect={(e) => {
                              e.preventDefault();
                              openSuspendDialog(salon);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {salon.status === 'suspended' && (
                          <DropdownMenuItem 
                            className="text-green-600 cursor-pointer"
                            onSelect={(e) => {
                              e.preventDefault();
                              openReactivateDialog(salon);
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-red-600 cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault();
                            openDeleteDialog(salon);
                          }}
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
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline">Previous</Button>
            <span>Page {page} of {totalPages} ({total} salons)</span>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline">Next</Button>
            <select
              className="ml-4 border rounded px-2 py-1"
              value={limit}
              onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
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
            <AlertDialogTitle>Delete Salon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSalon?.name}"? This action cannot be undone and will permanently remove the salon from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Salon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Salon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend "{selectedSalon?.name}"? This will temporarily disable their access to the platform and hide them from customer searches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSuspend}
              className="bg-red-600 hover:bg-red-700"
            >
              Suspend Salon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Salon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate "{selectedSalon?.name}"? This will restore their access to the platform and make them visible to customers again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReactivate}
              className="bg-green-600 hover:bg-green-700"
            >
              Reactivate Salon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Salon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve "{selectedSalon?.name}"? This will activate their account and allow them to start accepting bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Salon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Salon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject "{selectedSalon?.name}"? This will suspend their account and prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Salon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}