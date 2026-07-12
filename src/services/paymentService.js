import { api } from '../lib/api';

export const paymentService = {
  getActiveGateways: () =>
    api.get('/storefront/payment-gateways'),

  initiatePayment: (payload) =>
    api.post('/customer/payments/initiate', payload),

  verifyPayment: (payload) =>
    api.post('/customer/payments/verify', payload),
};

// ─── Razorpay ─────────────────────────────────────────────────────────────────

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export const openRazorpayCheckout = ({ keyId, razorpayOrderId, amount, currency, name, email, phone, description, onSuccess, onFailure }) =>
  new Promise((resolve, reject) => {
    const options = {
      key:          keyId,
      amount,
      currency,
      name:         description || 'Order Payment',
      order_id:     razorpayOrderId,
      prefill:      { name, email, contact: phone },
      theme:        { color: '#000000' },
      handler: (response) => {
        onSuccess?.(response);
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          onFailure?.('Payment cancelled');
          reject(new Error('Payment cancelled'));
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      onFailure?.(resp.error?.description || 'Payment failed');
      reject(new Error(resp.error?.description || 'Payment failed'));
    });
    rzp.open();
  });

// ─── Stripe ───────────────────────────────────────────────────────────────────

export const loadStripeScript = () =>
  new Promise((resolve) => {
    if (window.Stripe) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ─── Redirect-based gateways (PhonePe, PayU, Paytm) ──────────────────────────

export const submitRedirectForm = (formUrl, params) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formUrl;
  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = key;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};
