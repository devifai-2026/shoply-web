import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { paymentService } from '../services/paymentService';
import { getErrorMessage } from '../lib/utils';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [verifying, setVerifying]     = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    // Check for a pending PhonePe transaction (txn param added by server in redirectUrl,
    // or stored in localStorage as a fallback before the redirect).
    const txnFromUrl      = searchParams.get('txn');
    const txnFromStorage  = id ? localStorage.getItem(`phonepe_txn_${id}`) : null;
    const transactionId   = txnFromUrl || txnFromStorage;

    if (!transactionId || !id) return;

    setVerifying(true);
    paymentService.verifyPayment({
      gateway:     'phonepe',
      orderId:     id,
      paymentData: { transactionId },
    })
      .then(() => {
        localStorage.removeItem(`phonepe_txn_${id}`);
      })
      .catch((err) => {
        setVerifyError(getErrorMessage(err, 'Payment verification failed. Please contact support.'));
      })
      .finally(() => setVerifying(false));
  }, [id]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-bg min-h-screen py-24 px-10">
      <div className="container mx-auto max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface p-12 lg:p-16 border border-border-minimal"
        >
          {verifying ? (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-10 text-accent animate-spin" />
              <h1 className="text-[24px] font-light text-ink mb-4 tracking-tight">Verifying Payment…</h1>
              <p className="text-subtle text-[13px] font-medium">Please wait while we confirm your payment with PhonePe.</p>
            </>
          ) : verifyError ? (
            <>
              <AlertTriangle className="w-16 h-16 mx-auto mb-10 text-ink" />
              <h1 className="text-[24px] font-light text-ink mb-4 tracking-tight">Payment Pending</h1>
              <p className="text-subtle mb-6 text-[13px] font-medium leading-relaxed">
                Your order has been placed but payment verification is pending. If your payment was deducted, it will be reflected shortly.
              </p>
              <p className="text-ink text-[12px] mb-10">{verifyError}</p>
            </>
          ) : (
            <>
              <div className="text-accent w-16 h-16 mx-auto mb-10">
                <CheckCircle2 className="w-full h-full stroke-[1.5]" />
              </div>
              <h1 className="text-[28px] font-light text-ink mb-4 tracking-tight">Receipt Acknowledged</h1>
              <p className="text-subtle mb-12 text-[13px] font-medium leading-relaxed">
                Your order has been recorded successfully. Our team is currently preparing your selection for dispatch.
              </p>
            </>
          )}

          {!verifying && (
            <>
              <div className="grid grid-cols-2 gap-8 mb-16">
                <div className="py-6 border-y border-border-minimal flex flex-col items-center gap-3">
                  <span className="text-[10px] font-normal uppercase text-subtle tracking-[0.011em] leading-none">Reference</span>
                  <span className="font-medium text-ink text-[13px] leading-none uppercase">{id}</span>
                </div>
                <div className="py-6 border-y border-border-minimal flex flex-col items-center gap-3">
                  <span className="text-[10px] font-normal uppercase text-subtle tracking-[0.011em] leading-none">Estimation</span>
                  <span className="font-medium text-ink text-[13px] leading-none">3–7 Days</span>
                </div>
              </div>

              <div className="space-y-6">
                <Link
                  to="/account/orders"
                  className="btn-minimal block w-full py-4 text-[11px] uppercase"
                >
                  Order Details
                </Link>
                <Link
                  to="/"
                  className="block text-[11px] font-normal text-subtle hover:text-ink transition-all uppercase tracking-[0.011em]"
                >
                  Return to Catalog
                </Link>
              </div>
            </>
          )}
        </motion.div>

        <p className="mt-16 text-subtle text-[12px] font-medium leading-loose">
          A confirmation detail has been dispatched to your primary email.<br />
          For inquiries, please <Link to="/contact" className="text-ink font-medium hover:underline underline-offset-4">Connect with Support</Link>
        </p>
      </div>
    </div>
  );
}
