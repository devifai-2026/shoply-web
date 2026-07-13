import React, { useState, useEffect, useCallback } from 'react';
import { customerAuthService } from '../../services/customerAuth';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../lib/utils';
import { Share2, Copy, Users, Wallet as WalletIcon, TrendingUp } from 'lucide-react';

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

export default function Reseller() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerAuthService.getReseller();
      setData(res.data || res);
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to load reseller info.'));
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => { load(); }, [load]);

  const handleEnable = async () => {
    setEnabling(true);
    try {
      await customerAuthService.enableReseller();
      toastSuccess('Reseller mode enabled — share your link to start earning.');
      await load();
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to enable reseller mode.'));
    } finally {
      setEnabling(false);
    }
  };

  const shareLink = data?.resellerCode ? `${window.location.origin}/?ref=${data.resellerCode}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    toastSuccess('Share link copied.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-6 h-6 border-2 border-subtle/30 border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-normal text-ink">Reseller</h1>
        <p className="text-[13px] text-subtle mt-1">Share products with your link and earn a margin on every order placed through it.</p>
      </div>

      {!data?.enabled ? (
        <div className="border border-border-minimal bg-white p-8 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center">
            <Share2 className="w-6 h-6 text-ink" />
          </div>
          <div>
            <p className="text-[15px] font-medium text-ink">Turn your network into earnings</p>
            <p className="text-[13px] text-subtle mt-1 max-w-md">Get your own share link. Earnings are credited straight to your wallet.</p>
          </div>
          <button
            onClick={handleEnable}
            disabled={enabling}
            className="px-6 py-2.5 bg-ink text-white text-[13px] font-medium uppercase tracking-wide hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {enabling ? 'Enabling…' : 'Become a Reseller'}
          </button>
        </div>
      ) : (
        <>
          <div className="border border-border-minimal bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-subtle mb-3">Your Share Link</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareLink}
                className="flex-1 border border-border-minimal px-3 py-2.5 text-[13px] text-ink bg-surface"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 px-4 py-2.5 border border-border-minimal text-[13px] font-medium text-ink hover:bg-surface transition-colors flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-border-minimal bg-white p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-ink" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-subtle mb-1">Referred Orders</p>
                <p className="text-xl font-heading text-ink">{data.orderCount}</p>
              </div>
            </div>
            <div className="border border-border-minimal bg-white p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-ink" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-subtle mb-1">Lifetime Earnings</p>
                <p className="text-xl font-heading text-ink">{formatPrice(data.earnings)}</p>
              </div>
            </div>
            <div className="border border-border-minimal bg-white p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center shrink-0">
                <WalletIcon className="w-5 h-5 text-ink" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-subtle mb-1">Wallet Balance</p>
                <p className="text-xl font-heading text-ink">{formatPrice(data.walletBalance)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
