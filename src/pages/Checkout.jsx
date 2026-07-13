import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAppearance } from '../context/AppearanceContext';
import { orderService } from '../services/orderService';
import { storefrontService } from '../services/storefront';
import { customerAuthService } from '../services/customerAuth';
import {
  paymentService,
  loadRazorpayScript,
  openRazorpayCheckout,
  loadStripeScript,
  submitRedirectForm,
} from '../services/paymentService';
import { getImageUrl } from '../lib/api';
import { getResellerRef } from '../lib/reseller';
import { Truck, CreditCard, CheckCircle2, Lock, Smartphone, Wallet, Globe, Loader2 } from 'lucide-react';
import { cn, getErrorMessage } from '../lib/utils';
import { useToast } from '../context/ToastContext';
const LocationPicker = React.lazy(() => import('../components/LocationPicker'));

// ─── Gateway icons map ────────────────────────────────────────────────────────
const GATEWAY_ICONS = {
  cod:      Smartphone,
  razorpay: CreditCard,
  stripe:   Globe,
  phonepe:  Wallet,
  paytm:    Wallet,
  cashfree: CreditCard,
  payu:     CreditCard,
};

const GATEWAY_LABELS = {
  cod:      'Cash on Delivery',
  razorpay: 'Razorpay',
  stripe:   'Card / Stripe',
  phonepe:  'PhonePe',
  paytm:    'Paytm',
  cashfree: 'Cashfree',
  payu:     'PayU',
};

// ─── Stripe card form ─────────────────────────────────────────────────────────
const StripeCardForm = ({ clientSecret, publishableKey, onSuccess, onError }) => {
  const elementsRef = useRef(null);
  const cardRef     = useRef(null);
  const stripeRef   = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError]   = useState('');

  useEffect(() => {
    if (!clientSecret || !publishableKey) return;
    loadStripeScript().then((loaded) => {
      if (!loaded) return onError('Stripe failed to load');
      stripeRef.current   = window.Stripe(publishableKey);
      elementsRef.current = stripeRef.current.elements();
      cardRef.current     = elementsRef.current.create('card', {
        style: { base: { fontSize: '14px', color: '#1a1a1a' } },
      });
      cardRef.current.mount('#stripe-card-element');
      cardRef.current.on('change', (e) => setCardError(e.error?.message || ''));
    });
    return () => cardRef.current?.destroy();
  }, [clientSecret, publishableKey]);

  const handlePay = async () => {
    if (!stripeRef.current || !cardRef.current) return;
    setProcessing(true);
    setCardError('');
    try {
      const { error, paymentIntent } = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: { card: cardRef.current },
      });
      if (error) throw new Error(error.message);
      onSuccess({ paymentIntentId: paymentIntent.id });
    } catch (e) {
      setCardError(e.message);
      onError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        id="stripe-card-element"
        className="w-full bg-surface border border-border-minimal rounded-sm py-4 px-6 min-h-12.5"
      />
      {cardError && <p className="text-sale text-[12px] font-normal">{cardError}</p>}
      <button
        onClick={handlePay}
        disabled={processing}
        className="btn-minimal w-full py-4 disabled:opacity-50"
      >
        {processing ? 'Processing…' : 'Pay Now'}
      </button>
    </div>
  );
};

// ─── Checkout ─────────────────────────────────────────────────────────────────

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user }                    = useAuth();
  const { formatPrice, taxSettings } = useAppearance();
  const navigate                    = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();

  const [step, setStep]               = useState(1);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [couponCode, setCouponCode]   = useState('');
  const [couponData, setCouponData]   = useState(null);
  const [couponError, setCouponError] = useState('');
  const [offerData, setOfferData]     = useState(null); // { appliedOffers, totalDiscount }
  const [gateways, setGateways]       = useState([]);
  const [selectedGw, setSelectedGw]   = useState('');

  // Wallet — refund credits only, applied as a deduction at checkout.
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet]         = useState(false);

  // Stripe inline payment flow state
  const [stripeData, setStripeData]   = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // Tracks the DB order created in the current checkout session.
  // Stored in a ref so retries (failed payment → re-click) reuse the same
  // order instead of creating a duplicate.
  const createdOrderRef = useRef(null);

  // Shipping rate state
  const [shippingRate, setShippingRate]       = useState(null);  // null = not calculated yet
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingInfo, setShippingInfo]       = useState(null);  // { zone, estimatedDays }
  const shippingTimerRef = useRef(null);
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false);
  const [pincodeLoading, setPincodeLoading]       = useState(false);

  // Per-cart-item add-on selections, keyed by the same id used in cartItems.
  // { [itemId]: { giftWrap: bool, bundle: bool } }
  const [addOns, setAddOns] = useState({});
  const toggleGiftWrap = (itemId) =>
    setAddOns(prev => ({ ...prev, [itemId]: { ...prev[itemId], giftWrap: !prev[itemId]?.giftWrap } }));
  const toggleBundle = (itemId) =>
    setAddOns(prev => ({ ...prev, [itemId]: { ...prev[itemId], bundle: !prev[itemId]?.bundle } }));

  const [formData, setFormData] = useState({
    email:     user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName:  user?.name?.split(' ').slice(1).join(' ') || '',
    phone:     user?.phone || '',
    address:   '',
    city:      '',
    state:     '',
    zip:       '',
  });

  const field = (key) => (e) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  // Redirect to cart when there is nothing to check out
  useEffect(() => {
    if (cartItems.length === 0 && step === 1) navigate('/cart');
  }, [cartItems.length, step, navigate]);

  // Invalidate the cached order whenever anything that affects it changes —
  // shipping address fields, selected coupon, or cart contents. Otherwise a
  // retry after editing would reuse a stale order.
  useEffect(() => {
    createdOrderRef.current = null;
  }, [
    formData.firstName,
    formData.lastName,
    formData.phone,
    formData.address,
    formData.city,
    formData.state,
    formData.zip,
    couponData,
    cartItems,
  ]);

  // Load active payment gateways on mount
  useEffect(() => {
    paymentService.getActiveGateways()
      .then(res => {
        const list = res.data || [];
        setGateways(list);
        if (list.length > 0) setSelectedGw(list[0].slug);
      })
      .catch(() => {});
  }, []);

  // Load wallet balance so "Use Wallet Balance" can show a real number —
  // background data load, fails silently (no toast) same as other
  // page-load fetches on this page.
  useEffect(() => {
    customerAuthService.getWallet()
      .then(res => setWalletBalance((res.data || res)?.balance || 0))
      .catch(() => {});
  }, []);

  // Auto-calculate applicable offer discounts whenever cart changes
  useEffect(() => {
    if (!cartItems.length) { setOfferData(null); return; }
    const items = cartItems.map(item => ({
      productId:  item.id || item._id,
      categoryId: item.category?._id || item.category || null,
      price:      item.discountPrice || item.price,
      quantity:   item.quantity,
    }));
    storefrontService.calculateOfferDiscount(items)
      .then(res => {
        const d = res.data;
        if (d?.totalDiscount > 0) setOfferData(d);
        else setOfferData(null);
      })
      .catch(() => setOfferData(null));
  }, [cartItems]);

  const applyStyledCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    try {
      const res = await storefrontService.validateCoupon(couponCode.trim(), cartTotal - offerDiscount);
      setCouponData(res.data);
      toastSuccess('Coupon applied.');
    } catch (e) {
      const msg = getErrorMessage(e, 'Invalid coupon.');
      setCouponError(msg);
      setCouponData(null);
    }
  };

  // Calculate shipping rate when pincode is at least 6 chars. Passes cart
  // items so vendor-specific shipping overrides are quoted here — matching
  // what order creation will actually charge — instead of only ever quoting
  // the global zone-table rate.
  const calculateShipping = useCallback(async (pincode, total, items) => {
    if (!pincode || pincode.length < 5) {
      setShippingRate(null);
      setShippingInfo(null);
      return;
    }
    setShippingLoading(true);
    try {
      const res = await orderService.calculateShipping({ pincode, total, items });
      const d = res.data;
      setShippingRate(d.rate ?? 0);
      setShippingInfo({ zone: d.zone, estimatedDays: d.estimatedDays, message: d.message });
    } catch {
      setShippingRate(0);
      setShippingInfo(null);
    } finally {
      setShippingLoading(false);
    }
  }, []);

  // Debounce shipping calculation when pincode or cart contents change
  useEffect(() => {
    const pincode = formData.zip;
    const items = cartItems.map(item => ({ productId: item.id || item._id, quantity: item.quantity }));
    if (shippingTimerRef.current) clearTimeout(shippingTimerRef.current);
    shippingTimerRef.current = setTimeout(() => {
      calculateShipping(pincode, cartTotal, items);
    }, 600);
    return () => clearTimeout(shippingTimerRef.current);
  }, [formData.zip, cartTotal, cartItems, calculateShipping]);

  // Auto-fill city/state from pincode when user types manually
  useEffect(() => {
    const zip = formData.zip.trim();
    if (zip.length !== 6) {
      setPincodeAutoFilled(false);
      return;
    }
    let cancelled = false;
    setPincodeLoading(true);
    setPincodeAutoFilled(false);
    fetch(`https://api.postalpincode.in/pincode/${zip}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setFormData(prev => ({ ...prev, city: po.District, state: po.State }));
          setPincodeAutoFilled(true);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPincodeLoading(false); });
    return () => { cancelled = true; };
  }, [formData.zip]);

  const shipping       = shippingRate ?? 0;
  const offerDiscount  = offerData?.totalDiscount ?? 0;
  const couponDiscount = couponData?.discount ?? 0;
  const baseTotal      = cartTotal - offerDiscount - couponDiscount;

  // Per-line GST — each item uses its own product.gstRate when set, falling
  // back to the store-wide default, matching pricing.service.computeLineGst
  // on the server so the estimate shown here doesn't drift from what the
  // order actually gets charged/invoiced.
  const taxAmount = taxSettings?.taxIncluded ? 0 : cartItems.reduce((sum, item) => {
    const rate = typeof item.gstRate === 'number' ? item.gstRate : (taxSettings?.gstRate ?? 0);
    return sum + Math.round(item.price * item.quantity * (rate / 100));
  }, 0);

  const giftWrapTotal = cartItems.reduce((sum, item) => {
    const itemId = item.id || item._id;
    return addOns[itemId]?.giftWrap && item.giftWrap?.enabled
      ? sum + item.giftWrap.price * item.quantity
      : sum;
  }, 0);

  const bundleSavings = cartItems.reduce((sum, item) => {
    const itemId = item.id || item._id;
    if (!addOns[itemId]?.bundle || !item.bundleOffer?.enabled || !item.bundleOffer?.withProduct) return sum;
    const companion = item.bundleOffer.withProduct;
    const normalCombined = (item.discountPrice || item.price) + (companion.discountPrice || companion.price);
    return sum + Math.max(0, normalCombined - (item.bundleOffer.bundlePrice ?? normalCombined));
  }, 0);

  const preWalletTotal = Math.max(0, Math.max(0, baseTotal) + taxAmount + shipping + giftWrapTotal - bundleSavings);
  // Capped at both the real balance and the order total — the server
  // re-derives and re-caps this independently at order creation too, this
  // is purely for display so the customer sees the right number here.
  const walletAmountApplied = useWallet ? Math.min(walletBalance, preWalletTotal) : 0;
  const finalTotal = Math.max(0, preWalletTotal - walletAmountApplied);

  const buildShippingAddress = () => ({
    name:    `${formData.firstName} ${formData.lastName}`.trim(),
    phone:   formData.phone,
    line1:   formData.address,
    city:    formData.city,
    state:   formData.state,
    pincode: formData.zip,
    country: 'IN',
    ...(typeof formData.lat === 'number' && typeof formData.lng === 'number'
      ? { lat: formData.lat, lng: formData.lng }
      : {}),
  });

  const buildOrderPayload = () => ({
    items: cartItems.map(item => {
      const itemId = item.id || item._id;
      const selected = addOns[itemId] || {};
      return {
        product:    itemId,
        quantity:   item.quantity,
        attributes: {
          ...(item.selectedColor ? { color: item.selectedColor } : {}),
          ...(item.selectedSize  ? { size:  item.selectedSize }  : {}),
        },
        ...(item.giftWrap?.enabled && selected.giftWrap ? { giftWrap: { selected: true } } : {}),
        ...(item.bundleOffer?.enabled && item.bundleOffer?.withProduct && selected.bundle
          ? { bundleOffer: { selected: true, withProduct: item.bundleOffer.withProduct._id || item.bundleOffer.withProduct } }
          : {}),
      };
    }),
    shippingAddress: buildShippingAddress(),
    paymentMethod:   selectedGw || 'cod',
    couponCode:      couponCode || undefined,
    shippingCost:    shipping,
    discount:        (couponDiscount + offerDiscount) || undefined,
    useWalletAmount: walletAmountApplied > 0 ? walletAmountApplied : undefined,
    resellerCode:    getResellerRef() || undefined,
  });

  // Returns the already-created order for this session, or creates a new one.
  // Prevents duplicate orders when a payment attempt fails and the user retries.
  const ensureOrder = async () => {
    if (createdOrderRef.current) return createdOrderRef.current;
    const res = await orderService.createOrder(buildOrderPayload());
    createdOrderRef.current = res.data;
    return res.data;
  };

  // ── COD: create order directly ─────────────────────────────────────────────
  const handleCOD = async () => {
    setSubmitting(true);
    setError('');
    try {
      const order = await ensureOrder();
      clearCart();
      navigate(`/checkout/confirmation/${order.orderNumber || order._id}`);
    } catch (e) {
      const msg = getErrorMessage(e, 'Failed to place order. Please try again.');
      setError(msg);
      toastError(msg);
      setSubmitting(false);
    }
  };

  // ── Razorpay: create order → open modal → verify ───────────────────────────
  const handleRazorpay = async () => {
    setSubmitting(true);
    setError('');
    try {
      // 1. Create DB order (or reuse if a previous attempt already created it)
      const orderData = await ensureOrder();
      const orderId   = orderData._id;

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load Razorpay. Please try again.');

      // 3. Initiate payment on server → get razorpayOrderId
      const initRes = await paymentService.initiatePayment({
        gateway:      'razorpay',
        orderId,
        currency:     'INR',
        customerInfo: { id: user?._id, email: formData.email, phone: formData.phone },
      });
      const { razorpayOrderId, keyId, amount, currency } = initRes.data;

      // 4. Open Razorpay modal
      const paymentResp = await openRazorpayCheckout({
        keyId,
        razorpayOrderId,
        amount,
        currency,
        name:  `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
      });

      // 5. Verify on server
      await paymentService.verifyPayment({
        gateway:     'razorpay',
        orderId,
        paymentData: {
          razorpayOrderId:   paymentResp.razorpay_order_id,
          razorpayPaymentId: paymentResp.razorpay_payment_id,
          razorpaySignature: paymentResp.razorpay_signature,
        },
      });

      clearCart();
      navigate(`/checkout/confirmation/${orderData.orderNumber || orderId}`);
    } catch (e) {
      const msg = getErrorMessage(e, 'Payment failed. Please try again.');
      setError(msg);
      toastError(msg);
      setSubmitting(false);
    }
  };

  // ── Stripe: create order → get client secret → show card form ─────────────
  const handleStripeInit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const orderData = await ensureOrder();
      const orderId   = orderData._id;

      const initRes = await paymentService.initiatePayment({
        gateway:      'stripe',
        orderId,
        currency:     'INR',
        customerInfo: { id: user?._id, email: formData.email, phone: formData.phone },
      });

      setPendingOrderId(orderId);
      setStripeData(initRes.data);
    } catch (e) {
      const msg = getErrorMessage(e, 'Failed to initialize payment.');
      setError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStripeSuccess = async ({ paymentIntentId }) => {
    setSubmitting(true);
    setError('');
    try {
      const orderRes = await paymentService.verifyPayment({
        gateway:     'stripe',
        orderId:     pendingOrderId,
        paymentData: { paymentIntentId },
      });
      clearCart();
      const order = orderRes.data;
      navigate(`/checkout/confirmation/${order.orderNumber || order._id}`);
    } catch (e) {
      const msg = getErrorMessage(e, 'Payment verification failed.');
      setError(msg);
      toastError(msg);
      setSubmitting(false);
    }
  };

  // ── Cashfree: create order → redirect via Cashfree JS SDK ────────────────
  const handleCashfree = async () => {
    setSubmitting(true);
    setError('');
    try {
      const orderData = await ensureOrder();
      const orderId   = orderData._id;

      const initRes = await paymentService.initiatePayment({
        gateway:      'cashfree',
        orderId,
        customerInfo: { id: user?._id, email: formData.email, phone: formData.phone },
      });
      const { paymentSessionId, env } = initRes.data;

      // Load Cashfree JS SDK dynamically
      const sdkUrl = env === 'sandbox'
        ? 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js'
        : 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.prod.js';

      if (!window.Cashfree) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = sdkUrl;
          s.onload  = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }

      window.Cashfree.checkout({
        paymentSessionId,
        returnUrl: `${window.location.origin}/checkout/confirmation/${orderData.orderNumber || orderId}`,
      });
    } catch (e) {
      const msg = getErrorMessage(e, 'Payment failed. Please try again.');
      setError(msg);
      toastError(msg);
      setSubmitting(false);
    }
  };

  // ── PhonePe / PayU / Paytm: redirect-based POST form ─────────────────────
  const handleRedirectGateway = async (gateway) => {
    setSubmitting(true);
    setError('');
    try {
      const orderData = await ensureOrder();
      const orderId   = orderData._id;

      const initRes = await paymentService.initiatePayment({
        gateway,
        orderId,
        customerInfo: {
          id:    user?._id,
          name:  `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
        },
      });

      if (gateway === 'phonepe') {
        // Store transactionId so the confirmation page can verify payment on return
        if (initRes.data.transactionId) {
          localStorage.setItem(`phonepe_txn_${orderId}`, initRes.data.transactionId);
        }
        window.location.href = initRes.data.redirectUrl;
      } else {
        // paytm / payu: POST form redirect
        submitRedirectForm(initRes.data.formUrl, initRes.data.params);
      }
    } catch (e) {
      const msg = getErrorMessage(e, 'Payment initiation failed.');
      setError(msg);
      toastError(msg);
      setSubmitting(false);
    }
  };

  // ── Dispatch to the right handler on confirm ───────────────────────────────
  const handleConfirm = async () => {
    switch (selectedGw) {
      case 'cod':      return handleCOD();
      case 'razorpay': return handleRazorpay();
      case 'stripe':   return handleStripeInit();
      case 'cashfree': return handleCashfree();
      case 'phonepe':
      case 'paytm':
      case 'payu':     return handleRedirectGateway(selectedGw);
      default:         return handleCOD();
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.address.trim()) { setError('Street address is required.'); return; }
      if (!formData.city.trim())    { setError('City is required.'); return; }
      if (!formData.zip.trim())     { setError('Pin code is required.'); return; }
      if (!formData.phone.trim())   { setError('Phone number is required.'); return; }
      setError('');
    }
    if (step < 3) setStep(step + 1);
    else handleConfirm();
  };

  if (cartItems.length === 0 && step === 1) {
    return null; // redirect handled in the effect above
  }

  return (
    <div className="bg-bg min-h-screen py-20 pb-32">
      <div className="container mx-auto px-10 max-w-6xl">

        {/* Stepper */}
        <div className="flex items-center justify-center gap-10 mb-20">
          {[1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-8 h-8 rounded-full border flex items-center justify-center text-[12px] font-medium transition-all',
                  step >= i ? 'border-accent bg-accent text-white' : 'border-border-minimal text-subtle'
                )}>
                  {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
                </div>
                <span className={cn('hidden sm:inline font-normal text-[11px] uppercase tracking-[0.011em]', step >= i ? 'text-ink' : 'text-subtle')}>
                  {i === 1 ? 'Delivery' : i === 2 ? 'Payment' : 'Review'}
                </span>
              </div>
              {i < 3 && <div className="w-12 h-px bg-border-minimal" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Main Form */}
          <div className="lg:col-span-7 bg-surface p-12 border border-border-minimal">

            {/* ── Step 1: Shipping ── */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-[24px] font-light text-ink mb-10 tracking-tight">Shipping</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Contact info */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Email Address</label>
                    <input type="email" placeholder="name@example.com" className="w-full bg-surface border border-border-minimal rounded-sm py-4 px-6 focus:border-accent outline-none text-[13px] font-medium" value={formData.email} onChange={field('email')} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase text-ink tracking-widest">First Name</label>
                    <input type="text" placeholder="John" className="w-full bg-surface border border-border-minimal rounded-sm py-4 px-6 focus:border-accent outline-none text-[13px] font-medium" value={formData.firstName} onChange={field('firstName')} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Last Name</label>
                    <input type="text" placeholder="Doe" className="w-full bg-surface border border-border-minimal rounded-sm py-4 px-6 focus:border-accent outline-none text-[13px] font-medium" value={formData.lastName} onChange={field('lastName')} />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Phone</label>
                    <input type="tel" placeholder="+91 98765 43210" className="w-full bg-surface border border-border-minimal rounded-sm py-4 px-6 focus:border-accent outline-none text-[13px] font-medium" value={formData.phone} onChange={field('phone')} />
                  </div>

                  {/* Map + smart search */}
                  <div className="md:col-span-2">
                    <p className="text-[11px] font-bold uppercase text-ink tracking-widest mb-4">Delivery Location</p>
                    <React.Suspense fallback={
                      <div className="flex items-center justify-center h-75 border border-border-minimal rounded-sm bg-surface">
                        <Loader2 className="w-5 h-5 animate-spin text-subtle" />
                      </div>
                    }>
                      <LocationPicker
                        onSelect={({ address, city, state, zip, lat, lng }) =>
                          setFormData(prev => ({ ...prev, address, city, state, zip, lat, lng }))
                        }
                      />
                    </React.Suspense>
                  </div>

                  {/* Manual overrides — pre-filled by the picker, still editable */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Street Address</label>
                    <input type="text" placeholder="House/Flat no., Street" className="w-full bg-surface border border-border-minimal rounded-sm py-4 px-6 focus:border-accent outline-none text-[13px] font-medium" value={formData.address} onChange={field('address')} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase text-ink tracking-widest">City</label>
                    <input
                      type="text"
                      placeholder={pincodeLoading ? 'Fetching…' : 'Auto-filled from pincode'}
                      className={cn(
                        'w-full rounded-sm py-4 px-6 outline-none text-[13px] font-medium transition-colors',
                        pincodeAutoFilled && formData.city
                          ? 'bg-green-50 border border-green-400 focus:border-accent'
                          : 'bg-surface border border-border-minimal focus:border-accent'
                      )}
                      value={formData.city}
                      onChange={field('city')}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase text-ink tracking-widest">State / Region</label>
                    <input
                      type="text"
                      placeholder={pincodeLoading ? 'Fetching…' : 'Auto-filled from pincode'}
                      className={cn(
                        'w-full rounded-sm py-4 px-6 outline-none text-[13px] font-medium transition-colors',
                        pincodeAutoFilled && formData.state
                          ? 'bg-green-50 border border-green-400 focus:border-accent'
                          : 'bg-surface border border-border-minimal focus:border-accent'
                      )}
                      value={formData.state}
                      onChange={field('state')}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase text-ink tracking-widest">Pin Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="6-digit pincode"
                        className="w-full bg-surface border border-border-minimal rounded-sm py-4 px-6 focus:border-accent outline-none text-[13px] font-medium pr-10"
                        value={formData.zip}
                        onChange={field('zip')}
                        maxLength={6}
                      />
                      {pincodeLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-subtle" />
                      )}
                      {!pincodeLoading && pincodeAutoFilled && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {pincodeAutoFilled && (
                      <p className="text-[11px] text-success font-semibold">City &amp; State auto-filled</p>
                    )}
                    {shippingLoading && (
                      <p className="text-[11px] text-subtle font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Calculating shipping…
                      </p>
                    )}
                    {!shippingLoading && shippingRate === 0 && formData.zip.length >= 6 && (
                      <p className="text-[11px] text-success font-semibold">✓ Free shipping to this area</p>
                    )}
                    {!shippingLoading && shippingRate > 0 && (
                      <p className="text-[11px] text-ink font-semibold">
                        Shipping: {formatPrice(shippingRate)}{shippingInfo?.estimatedDays ? ` · Est. ${shippingInfo.estimatedDays}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Payment ── */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-[24px] font-light text-ink mb-10 tracking-tight">Payment</h2>

                {gateways.length === 0 ? (
                  <p className="text-subtle text-[13px]">No payment methods available. Please contact support.</p>
                ) : (
                  <div className="space-y-3">
                    {gateways.map(gw => {
                      const Icon     = GATEWAY_ICONS[gw.slug] || CreditCard;
                      const isActive = selectedGw === gw.slug;
                      return (
                        <button
                          key={gw.slug}
                          onClick={() => setSelectedGw(gw.slug)}
                          className={cn(
                            'w-full p-5 border rounded-sm flex items-center justify-between transition-all text-left',
                            isActive
                              ? 'border-accent bg-surface'
                              : 'border-border-minimal hover:border-ink/30 bg-white'
                          )}
                        >
                          <div className="flex items-center gap-5">
                            <Icon className="text-ink w-5 h-5 shrink-0" />
                            <div>
                              <p className="font-bold text-[13px] uppercase tracking-wider text-ink">
                                {GATEWAY_LABELS[gw.slug] || gw.name}
                              </p>
                              <p className="text-[11px] text-subtle font-medium">{gw.description}</p>
                            </div>
                          </div>
                          {isActive && <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Stripe inline card form shown immediately on selection */}
                {selectedGw === 'stripe' && stripeData && (
                  <div className="mt-8 space-y-3">
                    <p className="text-[11px] font-bold uppercase text-ink tracking-widest mb-4">Card Details</p>
                    <StripeCardForm
                      clientSecret={stripeData.clientSecret}
                      publishableKey={stripeData.publishableKey}
                      onSuccess={handleStripeSuccess}
                      onError={(msg) => toastError(getErrorMessage({ message: msg }, 'Payment failed. Please try again.'))}
                    />
                  </div>
                )}

                {selectedGw === 'cod' && (
                  <p className="mt-6 text-[12px] text-subtle font-medium">
                    Pay in cash when your order is delivered to your doorstep.
                  </p>
                )}
              </div>
            )}

            {/* ── Step 3: Review ── */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-[24px] font-light text-ink mb-10 tracking-tight">Review</h2>
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-10">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase text-subtle tracking-widest mb-3">Ship to</h4>
                      <p className="text-[13px] font-bold text-ink uppercase mb-1">{formData.firstName} {formData.lastName}</p>
                      <p className="text-[13px] text-subtle font-medium leading-relaxed">{formData.address}, {formData.city}, {formData.zip}</p>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold uppercase text-subtle tracking-widest mb-3">Pay with</h4>
                      <p className="text-[13px] font-bold text-ink uppercase mb-1">
                        {GATEWAY_LABELS[selectedGw] || selectedGw || 'Not selected'}
                      </p>
                      <p className="text-[13px] text-subtle font-medium">
                        {selectedGw === 'cod' ? 'Pay on delivery' : 'Online payment'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface p-6 border border-border-minimal flex items-center gap-5">
                    <Truck className="w-5 h-5 text-ink" />
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-wider text-ink">
                        {shippingRate === 0 ? 'Free Shipping' : shippingRate > 0 ? `Shipping: ${formatPrice(shippingRate)}` : 'Shipping'}
                      </p>
                      <p className="text-[11px] text-subtle font-medium mt-1">
                        {shippingInfo?.estimatedDays
                          ? `Estimated delivery: ${shippingInfo.estimatedDays}`
                          : 'Estimated delivery: 3–7 business days'}
                        {shippingInfo?.zone ? ` · ${shippingInfo.zone}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Field-validation errors (Step 1) stay inline near the form; payment/order
                failures are surfaced via toast instead, to avoid a duplicate inline box. */}
            {error && step === 1 && <p className="mt-6 text-sale text-[13px] font-medium">{error}</p>}

            <div className="mt-16 flex justify-between border-t border-border-minimal pt-10">
              {step > 1 ? (
                <button onClick={() => { setStep(step - 1); setError(''); }} className="text-[11px] font-bold uppercase tracking-widest text-subtle hover:text-ink transition-colors">
                  Go Back
                </button>
              ) : <div />}
              <button
                onClick={handleNext}
                disabled={submitting || (step === 2 && selectedGw === 'stripe' && !!stripeData)}
                className="btn-minimal px-16 py-4 disabled:opacity-50"
              >
                {submitting
                  ? 'Please wait…'
                  : step === 3
                    ? (selectedGw === 'cod' ? 'Place Order' : 'Confirm & Pay')
                    : 'Proceed'}
              </button>
            </div>
          </div>

          {/* Sidebar Summary */}
          <aside className="lg:col-span-5 space-y-10">
            <div className="bg-surface p-12 border border-border-minimal">
              <h3 className="text-[11px] font-bold text-ink mb-10 uppercase tracking-[0.2em]">Summary</h3>
              <div className="space-y-6 mb-10 max-h-96 overflow-y-auto pr-4">
                {cartItems.map((item, idx) => {
                  const itemId = item.id || item._id;
                  const selected = addOns[itemId] || {};
                  return (
                    <div key={idx} className="pb-6 border-b border-border-minimal last:border-0 last:pb-0">
                      <div className="flex gap-5">
                        <div className="w-16 h-16 bg-white border border-border-minimal shrink-0 overflow-hidden">
                          <img src={getImageUrl(item.images?.[0] || '')} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={item.name} />
                        </div>
                        <div className="grow flex flex-col justify-center">
                          <p className="font-bold text-[12px] text-ink uppercase tracking-tight mb-1 line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-subtle font-bold uppercase tracking-wider">{item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                      </div>

                      {item.giftWrap?.enabled && (
                        <label className="flex items-center gap-2 mt-3 pl-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selected.giftWrap}
                            onChange={() => toggleGiftWrap(itemId)}
                            className="w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-medium text-ink">
                            Add gift wrapping (+{formatPrice(item.giftWrap.price)})
                          </span>
                        </label>
                      )}

                      {item.bundleOffer?.enabled && item.bundleOffer?.withProduct && (
                        <label className="flex items-start gap-2 mt-3 pl-2 cursor-pointer bg-accent/5 border border-accent/20 rounded-sm p-3">
                          <input
                            type="checkbox"
                            checked={!!selected.bundle}
                            onChange={() => toggleBundle(itemId)}
                            className="w-3.5 h-3.5 mt-0.5"
                          />
                          <span className="text-[11px] font-medium text-ink">
                            Bundle with <strong>{item.bundleOffer.withProduct.name}</strong> for{' '}
                            {formatPrice(item.bundleOffer.bundlePrice)} total
                            {' '}<span className="text-success font-bold">
                              (save {formatPrice(Math.max(0,
                                (item.price + (item.bundleOffer.withProduct.discountPrice || item.bundleOffer.withProduct.price)) - item.bundleOffer.bundlePrice
                              ))})
                            </span>
                          </span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Applied Offers */}
              {offerData && offerData.appliedOffers.length > 0 && (
                <div className="mb-6 space-y-2">
                  {offerData.appliedOffers.map(o => (
                    <div key={o.offerId} className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-2.5 rounded-sm">
                      <div>
                        <p className="text-[11px] font-black text-green-700 uppercase tracking-widest">{o.badge || 'OFFER'}</p>
                        <p className="text-[11px] text-success font-medium">{o.description}</p>
                      </div>
                      <span className="text-[12px] font-bold text-green-700">-{formatPrice(o.discount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="grow bg-white border border-border-minimal px-4 py-3 text-[12px] outline-none focus:border-accent"
                  />
                  <button onClick={applyStyledCoupon} className="border border-ink px-5 py-3 text-[11px] font-bold uppercase tracking-wider hover:bg-ink hover:text-white transition-all">
                    Apply
                  </button>
                </div>
                {couponData   && <p className="text-success text-[11px] font-bold mt-2">Coupon: -{formatPrice(couponDiscount)}</p>}
                {couponError  && <p className="text-red-500 text-[11px] font-bold mt-2">{couponError}</p>}
              </div>

              <div className="space-y-4 pt-8 border-t border-border-minimal">
                <div className="flex justify-between text-[13px] font-medium text-subtle">
                  <span>Subtotal</span><span className="text-ink">{formatPrice(cartTotal)}</span>
                </div>
                {offerDiscount > 0 && (
                  <div className="flex justify-between text-[13px] font-medium text-success">
                    <span>Offer Savings</span><span>-{formatPrice(offerDiscount)}</span>
                  </div>
                )}
                {couponData && couponDiscount > 0 && (
                  <div className="flex justify-between text-[13px] font-medium text-success">
                    <span>Coupon Discount</span><span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {!taxSettings?.taxIncluded && taxAmount > 0 && (
                  <div className="flex justify-between text-[13px] font-medium text-subtle">
                    <span>GST</span>
                    <span className="text-ink">{formatPrice(taxAmount)}</span>
                  </div>
                )}
                {taxSettings?.taxIncluded && taxSettings?.gstRate > 0 && (
                  <div className="text-[11px] text-subtle font-medium">
                    Incl. GST
                  </div>
                )}
                {giftWrapTotal > 0 && (
                  <div className="flex justify-between text-[13px] font-medium text-subtle">
                    <span>Gift Wrapping</span>
                    <span className="text-ink">{formatPrice(giftWrapTotal)}</span>
                  </div>
                )}
                {bundleSavings > 0 && (
                  <div className="flex justify-between text-[13px] font-medium text-success">
                    <span>Bundle Savings</span>
                    <span>-{formatPrice(bundleSavings)}</span>
                  </div>
                )}
                {walletBalance > 0 && (
                  <div className="border-y border-border-minimal -mx-6 px-6 py-3 my-1">
                    <label className="flex items-center justify-between gap-3 cursor-pointer">
                      <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                        <input
                          type="checkbox"
                          checked={useWallet}
                          onChange={e => setUseWallet(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Use Wallet Balance
                      </span>
                      <span className="text-[12px] text-subtle">{formatPrice(walletBalance)} available</span>
                    </label>
                    {useWallet && walletAmountApplied > 0 && (
                      <div className="flex justify-between text-[13px] font-medium text-success mt-2">
                        <span>Wallet Applied</span>
                        <span>-{formatPrice(walletAmountApplied)}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-[13px] font-medium text-subtle items-center">
                  <span>Shipping</span>
                  {shippingLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-subtle" />
                  ) : shippingRate === null ? (
                    <span className="text-subtle text-[11px]">Enter pincode</span>
                  ) : shippingRate === 0 ? (
                    <span className="text-ink font-semibold">FREE</span>
                  ) : (
                    <span className="text-ink font-semibold">{formatPrice(shippingRate)}</span>
                  )}
                </div>
                {shippingInfo && (
                  <div className="text-[10px] text-subtle font-medium text-right -mt-2">
                    {shippingInfo.estimatedDays && `Est. ${shippingInfo.estimatedDays}`}
                    {shippingInfo.zone && ` · ${shippingInfo.zone}`}
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-6 mt-4 border-t border-border-minimal">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-ink">Total Payable</span>
                  <span className="text-3xl font-semibold text-ink">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="bg-ink p-10 text-white flex items-center gap-8">
              <div className="w-12 h-12 bg-white/10 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-[12px] uppercase tracking-widest mb-1">Encrypted Security</p>
                <p className="text-[11px] text-white/40 font-medium leading-relaxed">Identity and payment information are protected by industry standard encryption protocols.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
