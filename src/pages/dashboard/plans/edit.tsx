import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchSubscriptionPlanById, updateSubscriptionPlan } from '@/api/subscriptions';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  yearly_price: string;
  billing_period: string;
  features: string[];
  limits: {
    max_users?: number;
    max_bookings?: number;
    max_staff?: number;
    max_locations?: number;
  };
  status: string;
}

const EditPlanPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    yearly_price: '',
    billing_period: 'monthly',
    features: '',
    limits: {
      max_users: '',
      max_bookings: '',
      max_staff: '',
      max_locations: ''
    },
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      try {
        const data = await fetchSubscriptionPlanById(id);
        setPlan(data);
        setForm({
          name: data.name,
          description: data.description || '',
          price: data.price,
          yearly_price: data.yearly_price,
          billing_period: data.billing_period,
          features: Array.isArray(data.features) ? data.features.join(', ') : '',
          limits: {
            max_users: data.limits?.max_users?.toString() || '',
            max_bookings: data.limits?.max_bookings?.toString() || '',
            max_staff: data.limits?.max_staff?.toString() || '',
            max_locations: data.limits?.max_locations?.toString() || '',
          },
          status: data.status,
        });
      } catch (err: any) {
        setError(err.message || 'Error fetching plan');
        toast({ title: 'Error', description: err.message || 'Error fetching plan', variant: 'destructive' });
      } finally {
        setFetching(false);
      }
    };

    fetchPlan();
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('limits.')) {
      const key = name.split('.')[1];
      setForm({ ...form, limits: { ...form.limits, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setLoading(true);
    setError('');
    try {
      await updateSubscriptionPlan(id, {
        ...form,
        price: parseFloat(form.price),
        yearly_price: parseFloat(form.yearly_price),
        features: form.features.split(',').map(f => f.trim()).filter(f => f),
        limits: {
          max_users: form.limits.max_users ? parseInt(form.limits.max_users) : undefined,
          max_bookings: form.limits.max_bookings ? parseInt(form.limits.max_bookings) : undefined,
          max_staff: form.limits.max_staff ? parseInt(form.limits.max_staff) : undefined,
          max_locations: form.limits.max_locations ? parseInt(form.limits.max_locations) : undefined,
        },
      });
      toast({ title: 'Success', description: 'Plan updated successfully' });
      navigate('/dashboard/plans');
    } catch (err: any) {
      setError(err.message || 'Error updating plan');
      toast({ title: 'Error', description: err.message || 'Error updating plan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/plans">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Plan</h1>
            <p className="text-gray-600">Update subscription plan details</p>
          </div>
        </div>
        <div className="py-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Plan</h1>
          <p className="text-gray-600">Update subscription plan details</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>Update the details for this plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Plan name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_period">Billing Period *</Label>
                <select
                  id="billing_period"
                  name="billing_period"
                  value={form.billing_period}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Price *</Label>
                <Input id="price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearly_price">Yearly Price *</Label>
                <Input id="yearly_price" name="yearly_price" type="number" step="0.01" value={form.yearly_price} onChange={handleChange} required placeholder="0.00" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2 min-h-[80px]" placeholder="Describe the plan" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="features">Features (comma separated)</Label>
                <Input id="features" name="features" value={form.features} onChange={handleChange} placeholder="e.g. Unlimited bookings, Priority support" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Limits</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="limits.max_users">Max Users</Label>
                    <Input id="limits.max_users" name="limits.max_users" type="number" min="0" value={form.limits.max_users} onChange={handleChange} placeholder="e.g. 10" />
                  </div>
                  <div>
                    <Label htmlFor="limits.max_bookings">Max Bookings</Label>
                    <Input id="limits.max_bookings" name="limits.max_bookings" type="number" min="0" value={form.limits.max_bookings} onChange={handleChange} placeholder="e.g. 100" />
                  </div>
                  <div>
                    <Label htmlFor="limits.max_staff">Max Staff</Label>
                    <Input id="limits.max_staff" name="limits.max_staff" type="number" min="0" value={form.limits.max_staff} onChange={handleChange} placeholder="e.g. 5" />
                  </div>
                  <div>
                    <Label htmlFor="limits.max_locations">Max Locations</Label>
                    <Input id="limits.max_locations" name="limits.max_locations" type="number" min="0" value={form.limits.max_locations} onChange={handleChange} placeholder="e.g. 3" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Active</Label>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="button"
                    aria-pressed={form.status === 'active'}
                    onClick={() => setForm({ ...form, status: form.status === 'active' ? 'inactive' : 'active' })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${form.status === 'active' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${form.status === 'active' ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                  <span className={form.status === 'active' ? 'text-green-600 font-semibold' : 'text-gray-400 font-semibold'}>
                    {form.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <div className="flex justify-end gap-3">
              <Link to="/dashboard/plans">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Updating...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Update Plan</span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditPlanPage; 