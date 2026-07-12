import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { customerAuthService } from '../../services/customerAuth';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await customerAuthService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-20 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-white p-10 lg:p-14 rounded-[40px] shadow-xl border">

          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Check your inbox</h1>
              <p className="text-slate-500 font-medium mb-2">
                We sent a password reset link to
              </p>
              <p className="text-slate-900 font-bold mb-6">{email}</p>
              <p className="text-slate-400 text-sm mb-10">
                The link expires in 10 minutes. Check your spam folder if you don't see it.
              </p>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Recover Password</h1>
                <p className="text-slate-500 font-medium">Reset link will be sent to your email.</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-100 border-none rounded-2xl py-4 px-12 focus:ring-2 focus:ring-slate-900 outline-none font-medium"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-5 font-black text-lg hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ borderRadius: 'var(--btn-radius, 0px)' }}
                >
                  {loading ? 'Sending…' : <>Send Reset Link <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 mt-10 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
