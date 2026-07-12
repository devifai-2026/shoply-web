import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { customerAuthService } from '../../services/customerAuth';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../lib/utils';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPwd, setShowPwd]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [done, setDone]                 = useState(false);
  const { error: toastError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const data = await customerAuthService.resetPassword(token, password);
      if (data.token) {
        localStorage.setItem('customer_token', data.token);
      }
      setDone(true);
    } catch (err) {
      const msg = getErrorMessage(err, 'Something went wrong. Please try again.');
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg min-h-screen py-20 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-surface p-10 lg:p-14 rounded-[4px] border border-border-minimal">

          {done ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-ink mx-auto mb-6" />
              <h1 className="text-3xl font-heading font-normal text-ink mb-3">Password reset!</h1>
              <p className="text-subtle font-normal mb-10">
                Your password has been updated successfully.
              </p>
              <button
                onClick={() => navigate('/account')}
                className="w-full bg-accent text-white py-5 font-normal text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 rounded-[4px]"
              >
                Go to My Account <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-4xl font-heading font-normal text-ink mb-2">New Password</h1>
                <p className="text-subtle font-normal">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="mb-6 bg-surface border border-border-minimal text-ink text-sm font-normal px-4 py-3 rounded-[4px]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-normal uppercase text-subtle tracking-[0.011em] pl-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-bg border border-border-minimal rounded-[4px] py-4 px-12 focus:border-ink outline-none font-normal pr-12"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-ink"
                    >
                      {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-normal uppercase text-subtle tracking-[0.011em] pl-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full bg-bg border border-border-minimal rounded-[4px] py-4 px-12 focus:border-ink outline-none font-normal"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-white py-5 font-normal text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 rounded-[4px] mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting…' : <>Reset Password <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 mt-10 text-sm font-normal text-subtle hover:text-ink transition-colors"
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
