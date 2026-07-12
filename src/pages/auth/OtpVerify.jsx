import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

const OTP_LENGTH = 4;

export default function OtpVerify() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { sendOtp, verifyOtp } = useAuth();

  const { phone, verificationId: initVerifId, nextPath = '/account' } = location.state || {};

  const [otp, setOtp]                       = useState(Array(OTP_LENGTH).fill(''));
  const [currentVerifId, setCurrentVerifId] = useState(initVerifId || '');
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [resending, setResending]           = useState(false);
  const [countdown, setCountdown]           = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!phone || !initVerifId) navigate('/phone-login', { replace: true });
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (val, idx) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[idx]   = digit;
    setOtp(next);
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next   = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }
    setLoading(true);
    try {
      const { isNew } = await verifyOtp(phone, currentVerifId, code);
      if (isNew) {
        navigate('/profile-setup', { replace: true, state: { nextPath } });
      } else {
        navigate(nextPath, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const newVerifId = await sendOtp(phone);
      setCurrentVerifId(newVerifId);
      setOtp(Array(OTP_LENGTH).fill(''));
      setCountdown(30);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
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
          <div className="text-center mb-12">
            <h1 className="text-[28px] font-light text-ink mb-3 tracking-tight">Verify OTP</h1>
            <p className="text-subtle text-[13px] font-medium leading-relaxed">
              Enter the {OTP_LENGTH}-digit code sent to{' '}
              <span className="font-bold text-ink">+91 {phone}</span>
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={idx === 0}
                  onChange={e => handleChange(e.target.value, idx)}
                  onKeyDown={e => handleKeyDown(e, idx)}
                  className={`w-16 h-16 text-center text-[24px] font-bold border outline-none transition-colors
                    ${digit ? 'border-accent bg-white text-ink' : 'border-border-minimal bg-bg text-ink'}
                    focus:border-accent`}
                  style={{ borderRadius: 'var(--btn-radius, 0px)' }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < OTP_LENGTH}
              className="w-full bg-accent text-white py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ borderRadius: 'var(--btn-radius, 0px)' }}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[13px] text-subtle font-medium">
              Didn't receive it?{' '}
              {countdown > 0 ? (
                <span className="text-subtle">Resend in {countdown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-ink font-bold hover:underline underline-offset-4 decoration-accent disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/phone-login" className="text-[12px] text-subtle hover:text-ink underline underline-offset-4 decoration-border-minimal">
              ← Change number
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
