import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { customerAuthService } from '../../services/customerAuth';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPwd, setShowPwd]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [done, setDone]                 = useState(false);

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
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-20 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-white p-10 lg:p-14 rounded-[40px] shadow-xl border">

          {done ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Password reset!</h1>
              <p className="text-slate-500 font-medium mb-10">
                Your password has been updated successfully.
              </p>
              <button
                onClick={() => navigate('/account')}
                className="w-full bg-slate-900 text-white py-5 font-black text-lg hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl"
                style={{ borderRadius: 'var(--btn-radius, 0px)' }}
              >
                Go to My Account <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">New Password</h1>
                <p className="text-slate-500 font-medium">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-100 border-none rounded-2xl py-4 px-12 focus:ring-2 focus:ring-slate-900 outline-none font-medium pr-12"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full bg-slate-100 border-none rounded-2xl py-4 px-12 focus:ring-2 focus:ring-slate-900 outline-none font-medium"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-5 font-black text-lg hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ borderRadius: 'var(--btn-radius, 0px)' }}
                >
                  {loading ? 'Resetting…' : <>Reset Password <ArrowRight className="w-5 h-5" /></>}
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
