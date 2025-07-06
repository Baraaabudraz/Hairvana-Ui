import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

const EditPlanPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    yearly_price: '',
    billing_period: 'monthly',
    features: '',
    limits: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/subscriptions/plans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch plan');
        const data = await res.json();
        setForm({
          ...data,
          price: data.price?.toString() || '',
          yearly_price: data.yearly_price?.toString() || '',
          features: Array.isArray(data.features) ? data.features.join(', ') : '',
          limits: data.limits ? JSON.stringify(data.limits) : '',
        });
      } catch (err: any) {
        setError(err.message || 'Error fetching plan');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPlan();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/subscriptions/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          yearly_price: parseFloat(form.yearly_price),
          features: form.features.split(',').map(f => f.trim()),
          limits: form.limits ? JSON.parse(form.limits) : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update plan');
      setSuccess('Plan updated successfully!');
      setTimeout(() => navigate('/dashboard/plans'), 1000);
    } catch (err: any) {
      setError(err.message || 'Error updating plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Plan</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Monthly Price</label>
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Yearly Price</label>
            <input name="yearly_price" type="number" step="0.01" value={form.yearly_price} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Billing Period</label>
          <select name="billing_period" value={form.billing_period} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Features (comma separated)</label>
          <input name="features" value={form.features} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Limits (JSON)</label>
          <input name="limits" value={form.limits} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder='{"max_users": 10}' />
        </div>
        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditPlanPage; 