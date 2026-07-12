import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerAuthService } from '../../services/customerAuth';
import { Camera } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName]     = useState(user?.name || '');
  const [phone, setPhone]   = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile({ name, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border-minimal p-10 lg:p-16 animate-in fade-in duration-700">
      <h2 className="text-[14px] font-normal text-ink uppercase tracking-[0.011em] mb-12 pb-6 border-b border-border-minimal">Account Identity</h2>

      <div className="flex flex-col lg:flex-row gap-16 items-start">
        <div className="relative shrink-0">
          <div className="w-40 h-40 rounded-full bg-surface border border-border-minimal flex items-center justify-center font-normal text-6xl text-subtle overflow-hidden">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 rounded-full bg-accent text-white hover:bg-subtle transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-grow space-y-10 max-w-xl">
          {error && <p className="text-ink text-[13px] font-medium">{error}</p>}
          {saved && <p className="text-ink text-[13px] font-medium">Profile updated successfully.</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[11px] font-normal uppercase text-ink tracking-[0.011em] pl-1">Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-surface border border-border-minimal rounded-[4px] py-4 px-6 focus:border-accent outline-none font-semibold text-ink text-[13px]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest pl-1">Primary Email</label>
              <input
                type="email"
                defaultValue={user?.email}
                readOnly
                className="w-full bg-surface border border-border-minimal rounded-[4px] py-4 px-6 outline-none font-semibold text-ink text-[13px] opacity-60 cursor-not-allowed"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest pl-1">Contact Reference</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-surface border border-border-minimal rounded-[4px] py-4 px-6 focus:border-accent outline-none font-semibold text-ink text-[13px]"
              />
            </div>
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase text-ink tracking-widest pl-1">Validation State</span>
              <div className="mt-2 text-subtle text-[11px] font-bold uppercase tracking-widest bg-surface px-4 py-2 border border-border-minimal inline-block">
                Authenticated User
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-minimal px-12 py-5 disabled:opacity-50">
            {saving ? 'Saving...' : 'Synchronize Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
