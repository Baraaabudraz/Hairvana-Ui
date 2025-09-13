import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus } from 'lucide-react';
import { createSubscriptionPlan } from '@/api/subscriptions';

const NewPlanPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    yearly_price: '',
    billing_period: 'monthly',
    features: '',
    limits: {
      max_salons: '',
      max_bookings: '',
      max_staff: ''
    },
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    setError('');
    try {
      await createSubscriptionPlan({
        ...form,
        price: parseFloat(form.price),
        yearly_price: parseFloat(form.yearly_price),
        features: form.features.split(',').map(f => f.trim()),
        limits: {
          max_salons: form.limits.max_salons ? parseInt(form.limits.max_salons) : 'unlimited',
          max_bookings: form.limits.max_bookings ? parseInt(form.limits.max_bookings) : 'unlimited',
          max_staff: form.limits.max_staff ? parseInt(form.limits.max_staff) : 'unlimited',
        },
      });
      navigate('/dashboard/plans');
    } catch (err: any) {
      setError(err.message || 'Error creating plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Plan</h1>
          <p className="text-gray-600">Create a new subscription plan for your platform</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>Enter the details for the new plan</CardDescription>
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
                    <Label htmlFor="limits.max_salons">Max Salons</Label>
                    <Input id="limits.max_salons" name="limits.max_salons" type="number" min="0" value={form.limits.max_salons} onChange={handleChange} placeholder="e.g. 5" />
                  </div>
                  <div>
                    <Label htmlFor="limits.max_bookings">Max Bookings</Label>
                    <Input id="limits.max_bookings" name="limits.max_bookings" type="number" min="0" value={form.limits.max_bookings} onChange={handleChange} placeholder="e.g. 100" />
                  </div>
                  <div>
                    <Label htmlFor="limits.max_staff">Max Staff</Label>
                    <Input id="limits.max_staff" name="limits.max_staff" type="number" min="0" value={form.limits.max_staff} onChange={handleChange} placeholder="e.g. 5" />
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
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Creating...</span>
                ) : (
                  <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Create Plan</span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewPlanPage; 