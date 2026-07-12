import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

export default function ProfileSetup() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, updateProfile } = useAuth();

  const nextPath = location.state?.nextPath || '/account';

  const [name, setName]     = useState(user?.name || '');
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const updates = {};
      if (name.trim())  updates.name  = name.trim();
      if (email.trim()) updates.email = email.trim().toLowerCase();
      if (Object.keys(updates).length > 0) await updateProfile(updates);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => navigate(nextPath, { replace: true });

  return (
    <div className="bg-bg min-h-screen py-24">
      <div className="container mx-auto px-10 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface p-12 lg:p-16 border border-border-minimal"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1 className="font-heading text-[26px] font-normal text-ink mb-2">Complete your profile</h1>
            <p className="text-subtle text-[13px] font-normal leading-relaxed">
              Add your name and email to personalise your experience.
              <br />
              <span className="text-[12px]">You can always update these later.</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-bg border border-border-minimal text-ink text-[13px] font-normal text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-normal uppercase text-ink tracking-[0.011em] block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full bg-surface border border-border-minimal py-4 px-5 focus:border-accent outline-none text-[13px] font-normal text-ink transition-colors rounded-[4px]"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-normal uppercase text-ink tracking-[0.011em] block">
                  Email Address
                </label>
                <span className="text-[10px] font-normal text-subtle">Optional</span>
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-surface border border-border-minimal py-4 px-5 focus:border-accent outline-none text-[13px] font-normal text-ink transition-colors rounded-[4px]"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-accent text-white py-4 text-[12px] font-normal uppercase tracking-[0.011em] hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 rounded-[4px]"
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>

          <button
            onClick={handleSkip}
            className="w-full mt-4 py-3 text-[12px] font-normal text-subtle hover:text-ink transition-colors text-center"
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    </div>
  );
}
