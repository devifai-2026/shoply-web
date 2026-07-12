import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <h1 className="text-[28px] font-light text-ink mb-3 tracking-tight">Create Identity</h1>
            <p className="text-subtle text-[13px] font-medium leading-relaxed">Join for exclusive access to curated releases and a seamless experience.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest block">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-white border border-border-minimal rounded-[4px] py-4 px-5 focus:border-accent outline-none text-[13px] font-medium text-ink transition-colors"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest block">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-white border border-border-minimal rounded-[4px] py-4 px-5 focus:border-accent outline-none text-[13px] font-medium text-ink transition-colors"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase text-ink tracking-widest block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-white border border-border-minimal rounded-[4px] py-4 px-5 focus:border-accent outline-none text-[13px] font-medium text-ink transition-colors"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity mt-6 disabled:opacity-50"
              style={{ borderRadius: 'var(--btn-radius, 0px)' }}
            >
              {loading ? 'Creating Account...' : 'Establish Account'}
            </button>
          </form>

          <p className="text-center mt-12 text-[13px] text-subtle font-medium">
            Member already?{' '}
            <Link to="/login" className="text-ink font-bold hover:underline underline-offset-4 decoration-accent transition-all">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
