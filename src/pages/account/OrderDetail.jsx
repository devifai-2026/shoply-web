import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Package, CheckCircle2, Truck, Clock, XCircle,
  RotateCcw, FileText, MapPin, CreditCard, X, AlertTriangle,
  Download, ChevronRight, Copy, Check, ExternalLink,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAppearance } from '../../context/AppearanceContext';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../lib/api';
import { cn, getErrorMessage } from '../../lib/utils';

const FLOW_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_META = {
  pending:    { label: 'Pending',    Icon: Clock },
  processing: { label: 'Processing', Icon: Package },
  shipped:    { label: 'Shipped',    Icon: Truck },
  delivered:  { label: 'Delivered',  Icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  Icon: XCircle },
  refunded:   { label: 'Refunded',   Icon: RotateCcw },
};

const PAYMENT_LABELS = {
  cod:       'Cash on Delivery',
  razorpay:  'Razorpay',
  stripe:    'Stripe',
  phonepe:   'PhonePe',
  paytm:     'Paytm',
  cashfree:  'Cashfree',
  payu:      'PayU',
};

// Escapes a value for safe interpolation into invoice HTML.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildInvoiceHtml(order, formatPrice, storeName) {
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const addr = order.shippingAddress || {};
  const addrParts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);

  const rows = order.items.map(item => `
    <tr>
      <td style="padding:14px 10px;border-bottom:1px solid #ebebeb;font-size:13px;">${escapeHtml(item.name)}${item.sku ? `<br/><span style="color:#999;font-size:11px;">${escapeHtml(item.sku)}</span>` : ''}</td>
      <td style="padding:14px 10px;border-bottom:1px solid #ebebeb;text-align:center;font-size:13px;">${item.quantity}</td>
      <td style="padding:14px 10px;border-bottom:1px solid #ebebeb;text-align:right;font-size:13px;">${formatPrice(item.price)}</td>
      <td style="padding:14px 10px;border-bottom:1px solid #ebebeb;text-align:right;font-size:13px;font-weight:600;">${formatPrice(item.price * item.quantity)}</td>
    </tr>`).join('');

  const totalsRows = [
    { label: 'Subtotal', value: formatPrice(order.subtotal) },
    order.shippingCost > 0 && { label: 'Shipping', value: formatPrice(order.shippingCost) },
    order.tax > 0         && { label: 'Tax',       value: formatPrice(order.tax) },
    order.discount > 0    && { label: 'Discount',  value: `−${formatPrice(order.discount)}`, red: true },
  ].filter(Boolean).map(r => `
    <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #ebebeb;">
      <span style="color:#888;font-size:12px;">${r.label}</span>
      <span style="font-weight:600;font-size:13px;${r.red ? 'color:#dc2626;' : ''}">${r.value}</span>
    </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice — ${escapeHtml(order.orderNumber)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111;background:#fff;padding:56px;font-size:13px;line-height:1.6}
    .lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:#aaa;margin-bottom:5px}
    .val{font-size:13px;font-weight:600;color:#111}
    table{width:100%;border-collapse:collapse;margin-top:32px}
    th{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#aaa;padding:10px;border-bottom:2px solid #111;text-align:left}
    th:not(:first-child){text-align:right}
    th:nth-child(2){text-align:center}
    @media print{body{padding:40px}}
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px">
    <div>
      <h1 style="font-size:28px;font-weight:300;letter-spacing:-.03em">${escapeHtml(storeName)}</h1>
      <p style="color:#aaa;margin-top:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.15em">Tax Invoice</p>
    </div>
    <div style="text-align:right">
      <div class="lbl">Invoice No.</div>
      <div class="val">${escapeHtml(order.invoiceNumber || order.orderNumber)}</div>
      <div class="lbl" style="margin-top:14px">Date</div>
      <div class="val">${date}</div>
    </div>
  </div>

  <hr style="border:none;border-top:2px solid #111;margin-bottom:40px"/>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:48px">
    <div>
      <div class="lbl">Bill To</div>
      <p style="font-size:16px;font-weight:600;margin-bottom:6px">${escapeHtml(addr.name || '')}</p>
      <p style="color:#666;font-size:12px;line-height:1.8">${escapeHtml(addrParts.join(', '))}</p>
      ${addr.phone ? `<p style="color:#666;font-size:12px;margin-top:6px">${escapeHtml(addr.phone)}</p>` : ''}
    </div>
    <div>
      <div class="lbl">Order Reference</div>
      <div class="val" style="margin-bottom:16px">${escapeHtml(order.orderNumber)}</div>
      <div class="lbl">Payment</div>
      <div class="val" style="margin-bottom:16px">${escapeHtml(PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod?.toUpperCase() || 'COD')}</div>
      <div class="lbl">Status</div>
      <div class="val">${escapeHtml(order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Unpaid')}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div style="margin-top:32px;display:flex;justify-content:flex-end">
    <div style="width:300px">
      ${totalsRows}
      <div style="display:flex;justify-content:space-between;padding:14px 0;border-top:2px solid #111;margin-top:4px">
        <span style="font-weight:700;font-size:14px">Total</span>
        <span style="font-weight:700;font-size:20px">${formatPrice(order.total)}</span>
      </div>
    </div>
  </div>

  <div style="margin-top:64px;padding-top:24px;border-top:1px solid #ebebeb;color:#aaa;font-size:11px;text-align:center;line-height:2">
    <p>Thank you for your purchase. For inquiries, please contact our support team.</p>
    <p style="margin-top:4px">This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>`;
}

export default function OrderDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { formatPrice, appearance } = useAppearance();
  const { error: toastError, success: toastSuccess } = useToast();

  const [order, setOrder]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling]     = useState(false);
  const [cancelError, setCancelError]   = useState('');
  const [copied, setCopied]             = useState(false);

  const copyAwb = () => {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    orderService.getOrder(id)
      .then(r => setOrder(r.data))
      .catch(e => setError(e.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const r = await orderService.cancelOrder(id);
      setOrder(r.data);
      setCancelConfirm(false);
      toastSuccess('Order cancelled.');
    } catch (e) {
      const msg = getErrorMessage(e, 'Cancellation failed. Please try again.');
      setCancelError(msg);
      toastError(msg);
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    const storeName = appearance?.storeName || appearance?.name || 'Your Store';
    const html = buildInvoiceHtml(order, formatPrice, storeName);
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="bg-surface border border-border-minimal animate-pulse">
        <div className="p-10 border-b border-border-minimal h-20" />
        <div className="p-10 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-bg" />)}
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !order) {
    return (
      <div className="bg-surface border border-border-minimal p-16 text-center">
        <AlertTriangle className="w-10 h-10 text-subtle mx-auto mb-6 stroke-[1.2]" />
        <p className="text-ink font-medium mb-2">{error || 'Order not found'}</p>
        <Link to="/account/orders" className="text-[11px] font-normal uppercase tracking-[0.011em] text-subtle hover:text-ink transition-colors">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const meta        = STATUS_META[order.status] || STATUS_META.pending;
  const StatusIcon  = meta.Icon;
  const isTerminal  = ['cancelled', 'refunded'].includes(order.status);
  const canCancel   = ['pending', 'processing'].includes(order.status);

  /* Current step index in the normal flow */
  const currentStep = isTerminal ? -1 : FLOW_STEPS.indexOf(order.status);

  const addr = order.shippingAddress || {};
  const addrLine = [addr.line1, addr.line2].filter(Boolean).join(', ');
  const addrCity = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-surface border border-border-minimal"
      >
        {/* ── Header ── */}
        <div className="p-10 border-b border-border-minimal flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <Link
              to="/account/orders"
              className="flex items-center gap-2 text-[10px] font-normal uppercase tracking-[0.011em] text-subtle hover:text-ink transition-colors mb-5"
            >
              <ArrowLeft className="w-3 h-3" />
              My Orders
            </Link>
            <h2 className="text-[13px] font-normal text-ink uppercase tracking-[0.011em] mb-2">
              {order.orderNumber}
            </h2>
            <p className="text-[11px] text-subtle font-normal">
              Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              &nbsp;·&nbsp;{order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 text-[10px] font-normal uppercase tracking-[0.011em] text-subtle border border-border-minimal px-5 py-3 hover:border-ink hover:text-ink transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Invoice
            </button>
            {canCancel && (
              <button
                onClick={() => setCancelConfirm(true)}
                className="flex items-center gap-2 text-[10px] font-normal uppercase tracking-[0.011em] text-subtle border border-border-minimal px-5 py-3 hover:border-danger hover:text-danger transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ── Status Badge ── */}
        <div className="px-10 py-6 border-b border-border-minimal flex items-center gap-3">
          <StatusIcon className={cn(
            'w-4 h-4 stroke-[1.5]',
            order.status === 'delivered' ? 'text-success' :
            order.status === 'cancelled' || order.status === 'refunded' ? 'text-danger' :
            'text-ink'
          )} />
          <span className={cn(
            'text-[11px] font-normal uppercase tracking-[0.011em]',
            order.status === 'delivered' ? 'text-success' :
            order.status === 'cancelled' || order.status === 'refunded' ? 'text-danger' :
            'text-ink'
          )}>
            {meta.label}
          </span>
        </div>

        {/* ── Progress Timeline ── */}
        {!isTerminal && (
          <div className="px-10 py-10 border-b border-border-minimal">
            <div className="flex items-start">
              {FLOW_STEPS.map((step, i) => {
                const done    = i <= currentStep;
                const current = i === currentStep;
                const StepIcon = STATUS_META[step].Icon;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={cn(
                        'w-8 h-8 border flex items-center justify-center transition-all',
                        done
                          ? 'border-ink bg-ink text-white'
                          : 'border-border-minimal bg-surface text-subtle'
                      )}>
                        <StepIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                      </div>
                      <span className={cn(
                        'text-[9px] font-normal uppercase tracking-[0.011em] mt-2 text-center',
                        current ? 'text-ink' : done ? 'text-subtle' : 'text-subtle opacity-50'
                      )}>
                        {STATUS_META[step].label}
                      </span>
                      {/* Timeline event note */}
                      {order.timeline?.find(t => t.status === step)?.note && (
                        <span className="text-[9px] text-subtle mt-1 text-center max-w-[72px] leading-tight opacity-70">
                          {order.timeline.find(t => t.status === step).note}
                        </span>
                      )}
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div className={cn(
                        'flex-1 h-px mt-4 mx-2 transition-colors',
                        i < currentStep ? 'bg-ink' : 'bg-border-minimal'
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Shipment Tracking Card ── */}
        {order.trackingNumber && (
          <div className="px-10 py-8 border-b border-border-minimal bg-surface">
            <div className="flex items-center gap-2 mb-5">
              <Truck className="w-3.5 h-3.5 text-subtle stroke-[1.5]" />
              <h3 className="text-[10px] font-normal uppercase tracking-[0.011em] text-subtle">Shipment Tracking</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.011em] text-subtle mb-1">Tracking Number</p>
                <p className="text-[22px] font-medium text-ink tracking-[0.06em] leading-none">{order.trackingNumber}</p>
                {order.courierName && (
                  <p className="text-[11px] text-subtle mt-2 font-normal">via {order.courierName}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={copyAwb}
                  className="flex items-center gap-2 text-[10px] font-normal uppercase tracking-[0.011em] border border-border-minimal px-4 py-2.5 hover:border-ink hover:text-ink transition-colors text-subtle"
                >
                  {copied
                    ? <><Check className="w-3 h-3 text-success" /><span className="text-success">Copied</span></>
                    : <><Copy className="w-3 h-3" />Copy</>
                  }
                </button>
                <Link
                  to={`/track/${order.trackingNumber}`}
                  className="flex items-center gap-2 text-[10px] font-normal uppercase tracking-[0.011em] bg-accent text-white px-5 py-2.5 hover:opacity-80 transition-opacity"
                >
                  <ExternalLink className="w-3 h-3" />
                  Track Order
                </Link>
                <a
                  href={`https://shiprocket.co/tracking/${order.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-normal uppercase tracking-[0.011em] border border-border-minimal px-4 py-2.5 hover:border-ink hover:text-ink transition-colors text-subtle"
                >
                  <ExternalLink className="w-3 h-3" />
                  Shiprocket
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Order Items ── */}
        <div className="border-b border-border-minimal">
          <div className="px-10 py-5 border-b border-border-minimal">
            <h3 className="text-[10px] font-normal uppercase tracking-[0.011em] text-subtle">Order Items</h3>
          </div>
          <div className="divide-y divide-border-minimal">
            {order.items.map(item => (
              <div key={item._id} className="px-10 py-6 flex items-center gap-8">
                <div className="w-16 h-16 bg-surface border border-border-minimal shrink-0 overflow-hidden">
                  {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-subtle stroke-[1.2]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink leading-snug truncate">{item.name}</p>
                  {item.sku && (
                    <p className="text-[10px] text-subtle font-normal uppercase tracking-[0.011em] mt-1">{item.sku}</p>
                  )}
                  {item.attributes && Object.keys(item.attributes).length > 0 && (
                    <p className="text-[10px] text-subtle mt-1">
                      {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] text-subtle mb-1">× {item.quantity}</p>
                  <p className="text-[15px] font-medium text-ink">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-[10px] text-subtle">{formatPrice(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Info Grid: Address + Payment ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-minimal border-b border-border-minimal">
          {/* Shipping Address */}
          <div className="px-10 py-8">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-3.5 h-3.5 text-subtle stroke-[1.5]" />
              <h3 className="text-[10px] font-normal uppercase tracking-[0.011em] text-subtle">Shipping Address</h3>
            </div>
            <p className="text-[13px] font-medium text-ink mb-1">{addr.name}</p>
            {addr.phone && <p className="text-[12px] text-subtle mb-3">{addr.phone}</p>}
            <p className="text-[12px] text-subtle leading-relaxed">
              {addrLine && <>{addrLine}<br /></>}
              {addrCity && <>{addrCity}<br /></>}
              {addr.country}
            </p>
          </div>

          {/* Payment Info */}
          <div className="px-10 py-8">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-3.5 h-3.5 text-subtle stroke-[1.5]" />
              <h3 className="text-[10px] font-normal uppercase tracking-[0.011em] text-subtle">Payment</h3>
            </div>
            <p className="text-[13px] font-medium text-ink mb-1">
              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod?.toUpperCase() || 'COD'}
            </p>
            <span className={cn(
              'inline-block text-[9px] font-normal uppercase tracking-[0.011em] px-2.5 py-1 border mt-2',
              order.paymentStatus === 'paid'     ? 'border-success/30 text-success bg-success/10' :
              order.paymentStatus === 'refunded' ? 'border-border-minimal text-subtle' :
              'border-border-minimal text-subtle'
            )}>
              {order.paymentStatus}
            </span>
            {order.transactionId && (
              <p className="text-[10px] text-subtle mt-3 font-normal">
                Txn: {order.transactionId}
              </p>
            )}
            {order.couponCode && (
              <p className="text-[10px] text-subtle mt-2">
                Coupon: <span className="font-medium text-ink">{order.couponCode}</span>
              </p>
            )}
          </div>
        </div>

        {/* ── Price Summary ── */}
        <div className="px-10 py-8">
          <div className="ml-auto max-w-xs space-y-0">
            <div className="flex justify-between py-3 border-b border-border-minimal">
              <span className="text-[11px] text-subtle font-normal uppercase tracking-[0.011em]">Subtotal</span>
              <span className="text-[13px] font-medium text-ink">{formatPrice(order.subtotal)}</span>
            </div>
            {order.shippingCost > 0 && (
              <div className="flex justify-between py-3 border-b border-border-minimal">
                <span className="text-[11px] text-subtle font-normal uppercase tracking-[0.011em]">Shipping</span>
                <span className="text-[13px] font-medium text-ink">{formatPrice(order.shippingCost)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between py-3 border-b border-border-minimal">
                <span className="text-[11px] text-subtle font-normal uppercase tracking-[0.011em]">Tax</span>
                <span className="text-[13px] font-medium text-ink">{formatPrice(order.tax)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between py-3 border-b border-border-minimal">
                <span className="text-[11px] text-subtle font-normal uppercase tracking-[0.011em]">Discount</span>
                <span className="text-[13px] font-medium text-sale">−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-4 border-t-2 border-ink mt-1">
              <span className="text-[12px] font-normal uppercase tracking-[0.011em] text-ink">Total</span>
              <span className="text-[22px] font-medium text-ink tracking-tight">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* ── Order Notes ── */}
        {order.notes && (
          <div className="px-10 py-6 border-t border-border-minimal bg-surface">
            <p className="text-[10px] font-normal uppercase tracking-[0.011em] text-subtle mb-2">Order Notes</p>
            <p className="text-[12px] text-subtle leading-relaxed">{order.notes}</p>
          </div>
        )}
      </motion.div>

      {/* ── Cancel Confirmation Modal ── */}
      <AnimatePresence>
        {cancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
            onClick={() => !cancelling && setCancelConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border-minimal p-10 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-ink stroke-[1.5] shrink-0" />
                  <h3 className="text-[13px] font-normal text-ink uppercase tracking-[0.011em]">Cancel Order</h3>
                </div>
                <button
                  onClick={() => setCancelConfirm(false)}
                  className="text-subtle hover:text-ink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[12px] text-subtle leading-relaxed mb-2">
                Are you sure you want to cancel order{' '}
                <span className="font-medium text-ink">{order.orderNumber}</span>?
              </p>
              <p className="text-[11px] text-subtle leading-relaxed mb-8">
                This action cannot be undone. If a payment was made, a refund may take 5–7 business days.
              </p>

              {cancelError && (
                <p className="text-[11px] text-danger font-normal mb-6 border border-danger/30 bg-danger/10 px-4 py-3">
                  {cancelError}
                </p>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => { setCancelConfirm(false); setCancelError(''); }}
                  disabled={cancelling}
                  className="flex-1 py-3 text-[10px] font-normal uppercase tracking-[0.011em] border border-border-minimal text-subtle hover:text-ink hover:border-ink transition-colors disabled:opacity-40"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-3 text-[10px] font-normal uppercase tracking-[0.011em] bg-accent text-white hover:opacity-80 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      Cancelling
                    </>
                  ) : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
