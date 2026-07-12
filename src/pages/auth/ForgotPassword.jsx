import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { customerAuthService } from '../../services/customerAuth';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../lib/utils';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);
  const { error: toastError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await customerAuthService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      const msg = getErrorMessage(err, 'Something went wrong. Please try again.');
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg min-h-screen py-24">
      <div className="container mx-auto px-10 max-w-lg">
        <div className="bg-surface p-12 lg:p-16 border border-border-minimal">

          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-ink mx-auto mb-6" />
              <h1 className="text-[28px] font-normal font-heading text-ink mb-3 tracking-tight">Check your inbox</h1>
              <p className="text-subtle text-[13px] font-normal mb-2">
                We sent a password reset link to
              </p>
              <p className="text-ink text-[13px] font-medium mb-6">{email}</p>
              <p className="text-subtle text-[12px] mb-10">
                The link expires in 10 minutes. Check your spam folder if you don't see it.
              </p>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-[13px] font-medium text-subtle hover:text-ink transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h1 className="text-[28px] font-normal font-heading text-ink mb-3 tracking-tight">Recover Password</h1>
                <p className="text-subtle text-[13px] font-normal leading-relaxed">Reset link will be sent to your email.</p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-surface border border-border-minimal text-ink text-[13px] font-normal text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-normal uppercase text-ink tracking-[0.011em] block">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-white border border-border-minimal rounded-[4px] py-4 pl-12 pr-5 focus:border-accent outline-none text-[13px] font-normal text-ink transition-colors"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-white py-4 rounded-[4px] text-[12px] font-normal uppercase tracking-[0.011em] hover:opacity-90 transition-opacity flex items-center justify-center gap-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending…' : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 mt-10 text-[13px] font-medium text-subtle hover:text-ink transition-colors"
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
