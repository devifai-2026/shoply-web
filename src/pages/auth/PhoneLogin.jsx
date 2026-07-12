import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

export default function PhoneLogin() {
  const [phone, setPhone]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { sendOtp }    = useAuth();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath       = searchParams.get('next') || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleaned = phone.trim().replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const verificationId = await sendOtp(cleaned);
      navigate('/otp-verify', { state: { phone: cleaned, verificationId, nextPath } });
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg min-h-screen py-24">
      <div className="container mx-auto px-10 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface p-12 lg:p-16 border border-border-minimal"
        >
          <div className="text-center mb-16">
            <h1 className="text-[28px] font-light text-ink mb-3 tracking-tight">Mobile Login</h1>
            <p className="text-subtle text-[13px] font-medium leading-relaxed">
              Enter your mobile number to receive a one-time password.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest block">
                Mobile Number
              </label>
              <div className="flex">
                <span className="flex items-center px-4 bg-bg border border-r-0 border-border-minimal text-[13px] font-bold text-ink select-none">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  maxLength={10}
                  className="flex-1 bg-white border border-border-minimal rounded-r-sm py-4 px-5 focus:border-accent outline-none text-[13px] font-medium text-ink transition-colors"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity mt-6 disabled:opacity-50"
              style={{ borderRadius: 'var(--btn-radius, 0px)' }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border-minimal text-center space-y-3">
            <p className="text-[13px] text-subtle font-medium">
              Prefer email?{' '}
              <Link to="/login" className="text-ink font-bold hover:underline underline-offset-4 decoration-accent">
                Sign in with email
              </Link>
            </p>
            <p className="text-[13px] text-subtle font-medium">
              New here?{' '}
              <Link to="/register" className="text-ink font-bold hover:underline underline-offset-4 decoration-accent">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
