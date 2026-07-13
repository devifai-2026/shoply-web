import React, { useState, useEffect, useCallback } from 'react';
import { customerAuthService } from '../../services/customerAuth';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../lib/utils';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Wallet() {
  const { error: toastError } = useToast();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerAuthService.getWallet();
      setWallet(res.data || res);
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to load wallet.'));
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-6 h-6 border-2 border-subtle/30 border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  const transactions = wallet?.transactions || [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-normal text-ink">Wallet</h1>
        <p className="text-[13px] text-subtle mt-1">Refund credits, usable at checkout on your next order.</p>
      </div>

      <div className="border border-border-minimal bg-white p-8 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center shrink-0">
          <WalletIcon className="w-6 h-6 text-ink" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-subtle mb-1">Available Balance</p>
          <p className="text-3xl font-heading font-normal text-ink">{formatPrice(wallet?.balance)}</p>
        </div>
      </div>

      <div className="border border-border-minimal bg-white">
        <div className="px-6 py-4 border-b border-border-minimal">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-ink">Transaction History</h3>
        </div>
        {transactions.length === 0 ? (
          <p className="px-6 py-12 text-center text-subtle text-[13px]">No wallet activity yet.</p>
        ) : (
          <div className="divide-y divide-border-minimal">
            {transactions.map(t => (
              <div key={t._id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.type === 'credit' ? 'bg-success/10 text-success' : 'bg-sale/10 text-sale'}`}>
                    {t.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-ink">{t.reason}</p>
                    <p className="text-[11px] text-subtle">{formatDate(t.createdAt)}</p>
                  </div>
                </div>
                <p className={`text-[14px] font-bold ${t.type === 'credit' ? 'text-success' : 'text-sale'}`}>
                  {t.type === 'credit' ? '+' : '-'}{formatPrice(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
