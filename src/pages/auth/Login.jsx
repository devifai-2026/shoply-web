import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../lib/utils';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const { error: toastError } = useToast();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath       = searchParams.get('next') || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(nextPath, { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err, 'Invalid email or password.');
      setError(msg);
      toastError(msg);
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
            <h1 className="font-heading text-[28px] font-normal text-ink mb-3">Access Account</h1>
            <span className="block w-16 h-[3px] bg-[var(--color-accent-decorative)] mt-2 mb-4 mx-auto" />
            <p className="text-subtle text-[13px] font-normal leading-relaxed">Enter your credentials to manage your curated collection.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-surface border border-ink text-ink text-[13px] font-normal text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-normal uppercase text-ink tracking-[0.011em] block">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-surface border border-border-minimal rounded-[4px] py-4 px-5 focus:border-accent outline-none text-[13px] font-normal text-ink transition-colors"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-normal uppercase text-ink tracking-[0.011em]">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-normal text-subtle hover:text-ink underline underline-offset-4 decoration-border-minimal">Forgot?</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface border border-border-minimal rounded-[4px] py-4 px-5 focus:border-accent outline-none text-[13px] font-normal text-ink transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-4 text-[12px] font-normal uppercase tracking-[0.2em] rounded-[4px] hover:opacity-90 transition-opacity mt-6 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 relative flex items-center gap-4">
            <div className="flex-1 h-px bg-border-minimal" />
            <span className="text-[11px] font-normal text-subtle uppercase tracking-[0.011em] shrink-0">or</span>
            <div className="flex-1 h-px bg-border-minimal" />
          </div>

          <Link
            to="/phone-login"
            className="mt-6 flex items-center justify-center gap-2 w-full border border-border-minimal rounded-[4px] py-4 text-[12px] font-normal uppercase tracking-[0.15em] text-ink hover:border-accent hover:text-accent transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>
            </svg>
            Login with Mobile OTP
          </Link>

          <p className="text-center mt-8 text-[13px] text-subtle font-normal">
            New here?{' '}
            <Link to="/register" className="text-ink font-medium hover:underline underline-offset-4 decoration-accent transition-all">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
