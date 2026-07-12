import React, { useState } from 'react';
import { customerAuthService } from '../../services/customerAuth';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords]     = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [saved, setSaved]                     = useState(false);
  const [error, setError]                     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!currentPassword) { setError('Current password is required.'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('New passwords do not match.'); return; }

    setSaving(true);
    try {
      await customerAuthService.changePassword(currentPassword, newPassword);
      setSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const inputType = showPasswords ? 'text' : 'password';

  return (
    <div className="bg-white border border-border-minimal p-10 lg:p-16 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-12 pb-6 border-b border-border-minimal">
        <Lock className="w-4 h-4 text-ink stroke-[1.5]" />
        <h2 className="text-[14px] font-bold text-ink uppercase tracking-[0.2em]">Security</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 max-w-xl">
        {error && <p className="text-red-500 text-[13px] font-medium">{error}</p>}
        {saved && <p className="text-green-600 text-[13px] font-medium">Password changed successfully.</p>}

        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase text-ink tracking-widest pl-1">Current Password</label>
          <input
            type={inputType}
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full bg-surface border border-border-minimal rounded-[4px] py-4 px-6 focus:border-accent outline-none font-semibold text-ink text-[13px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase text-ink tracking-widest pl-1">New Password</label>
            <input
              type={inputType}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-surface border border-border-minimal rounded-[4px] py-4 px-6 focus:border-accent outline-none font-semibold text-ink text-[13px]"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase text-ink tracking-widest pl-1">Confirm New Password</label>
            <input
              type={inputType}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-surface border border-border-minimal rounded-[4px] py-4 px-6 focus:border-accent outline-none font-semibold text-ink text-[13px]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswords(v => !v)}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-subtle hover:text-ink transition-colors"
        >
          {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPasswords ? 'Hide passwords' : 'Show passwords'}
        </button>

        <button type="submit" disabled={saving} className="btn-minimal px-12 py-5 disabled:opacity-50">
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
