import React, { useState, useEffect, useCallback } from 'react';
import { customerAuthService } from '../../services/customerAuth';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../lib/utils';
import { MapPin, Star, Trash2, Pencil, Plus, Loader2, X } from 'lucide-react';

const LocationPicker = React.lazy(() => import('../../components/LocationPicker'));

const emptyForm = {
  label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  lat: null, lng: null, placeId: null,
};

export default function Addresses() {
  const { error: toastError, success: toastSuccess } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerAuthService.getAddresses();
      setAddresses(res.addresses || res.data?.addresses || []);
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to load addresses.'));
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setForm({
      label: addr.label || 'Home', name: addr.name || '', phone: addr.phone || '',
      line1: addr.line1 || '', line2: addr.line2 || '', city: addr.city || '',
      state: addr.state || '', pincode: addr.pincode || '',
      lat: addr.lat ?? null, lng: addr.lng ?? null, placeId: addr.placeId ?? null,
    });
    setEditingId(addr._id);
    setFormError('');
    setShowForm(true);
  };

  const field = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!/^[6-9]\d{9}$/.test(form.phone || '')) {
      setFormError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!/^[1-9]\d{5}$/.test(form.pincode || '')) {
      setFormError('Enter a valid 6-digit pincode.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await customerAuthService.updateAddress(editingId, form);
        toastSuccess('Address updated.');
      } else {
        await customerAuthService.addAddress(form);
        toastSuccess('Address added.');
      }
      setShowForm(false);
      await load();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to save address.');
      setFormError(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await customerAuthService.deleteAddress(id);
      toastSuccess('Address removed.');
      await load();
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to remove address.'));
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await customerAuthService.setDefaultAddress(id);
      await load();
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to set default address.'));
    }
  };

  return (
    <div className="bg-surface border border-border-minimal p-10 lg:p-16 animate-in fade-in duration-700">
      <div className="flex items-center justify-between pb-6 border-b border-border-minimal mb-12">
        <h2 className="text-[14px] font-normal text-ink uppercase tracking-[0.011em]">Saved Addresses</h2>
        {!showForm && (
          <button onClick={openNew} className="btn-minimal px-6 py-3 flex items-center gap-2 text-[11px]">
            <Plus className="w-3.5 h-3.5" /> Add Address
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-bold uppercase text-ink tracking-widest">
              {editingId ? 'Edit Address' : 'New Address'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-subtle hover:text-ink">
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && <p className="text-red-600 text-[13px] font-medium">{formError}</p>}

          <React.Suspense fallback={<div className="h-20 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-subtle" /></div>}>
            <LocationPicker
              onSelect={({ address, city, state, zip, lat, lng, placeId }) =>
                setForm(prev => ({ ...prev, line1: address, city, state, pincode: zip, lat, lng, placeId }))
              }
            />
          </React.Suspense>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Label</label>
              <select value={form.label} onChange={field('label')} className="w-full bg-surface border border-border-minimal rounded-sm py-3 px-4 outline-none text-[13px] font-medium">
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Full Name</label>
              <input required value={form.name} onChange={field('name')} className="w-full bg-surface border border-border-minimal rounded-sm py-3 px-4 outline-none text-[13px] font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Phone</label>
              <input required value={form.phone} onChange={field('phone')} placeholder="10-digit mobile number" maxLength={10} className="w-full bg-surface border border-border-minimal rounded-sm py-3 px-4 outline-none text-[13px] font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Pincode</label>
              <input required value={form.pincode} onChange={field('pincode')} maxLength={6} className="w-full bg-surface border border-border-minimal rounded-sm py-3 px-4 outline-none text-[13px] font-medium" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Address Line 1</label>
              <input required value={form.line1} onChange={field('line1')} className="w-full bg-surface border border-border-minimal rounded-sm py-3 px-4 outline-none text-[13px] font-medium" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Address Line 2 (optional)</label>
              <input value={form.line2} onChange={field('line2')} className="w-full bg-surface border border-border-minimal rounded-sm py-3 px-4 outline-none text-[13px] font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest">City</label>
              <input required value={form.city} onChange={field('city')} className="w-full bg-surface border border-border-minimal rounded-sm py-3 px-4 outline-none text-[13px] font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest">State</label>
              <input required value={form.state} onChange={field('state')} className="w-full bg-surface border border-border-minimal rounded-sm py-3 px-4 outline-none text-[13px] font-medium" />
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-minimal px-10 py-4 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Address'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-10 py-4 text-[11px] font-bold uppercase tracking-widest text-subtle hover:text-ink">
              Cancel
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-subtle" /></div>
      ) : addresses.length === 0 ? (
        <p className="text-subtle text-[13px] font-medium py-10 text-center">No saved addresses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr._id} className="border border-border-minimal rounded-sm p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-accent/10 text-accent px-2 py-1 rounded-sm flex items-center gap-1">
                    <Star className="w-3 h-3" /> Default
                  </span>
                )}
              </div>
              <p className="text-[13px] font-semibold text-ink">{addr.name}</p>
              <p className="text-[12px] text-subtle">{[addr.line1, addr.line2].filter(Boolean).join(', ')}</p>
              <p className="text-[12px] text-subtle">{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
              <p className="text-[12px] text-subtle">Phone: {addr.phone}</p>
              <div className="flex items-center gap-4 pt-2">
                <button onClick={() => openEdit(addr)} className="text-[11px] font-bold uppercase tracking-widest text-ink hover:text-accent flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(addr._id)} className="text-[11px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr._id)} className="text-[11px] font-bold uppercase tracking-widest text-subtle hover:text-ink ml-auto">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
