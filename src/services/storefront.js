import { api } from '../lib/api';

function buildQS(params) {
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!filtered.length) return '';
  return '?' + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString();
}

export const storefrontService = {
  getProducts: (params = {}) =>
    api.get(`/storefront/products${buildQS(params)}`),

  getProduct: (slug) =>
    api.get(`/storefront/products/${slug}`),

  getCategories: () =>
    api.get('/storefront/categories'),

  getBrands: () =>
    api.get('/storefront/brands'),

  getActiveFlashSale: () =>
    api.get('/storefront/flash-sales/active'),

  // Forwards ?preview=1 from the current page URL so an admin previewing a
  // saved-but-unpublished draft (via Appearance → Preview) sees the staged
  // content instead of what's actually live for real customers.
  getAppearance: () => {
    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
    return api.get(`/storefront/appearance${isPreview ? '?preview=1' : ''}`);
  },

  getPaymentGateways: () =>
    api.get('/storefront/payment-gateways'),

  getActiveOffers: () =>
    api.get('/storefront/offers'),

  getSponsoredSlots: () =>
    api.get('/storefront/sponsored-slots'),

  getOffer: (id) =>
    api.get(`/storefront/offers/${id}`),

  calculateOfferDiscount: (items) =>
    api.post('/storefront/offers/calculate', { items }),

  validateCoupon: (code, orderTotal) =>
    api.post('/storefront/coupons/validate', { code, orderTotal, platform: 'Web' }),

  getVendor: (slug, params = {}) =>
    api.get(`/storefront/vendors/${slug}${buildQS(params)}`),

  getProductReviews: (productId, params = {}) =>
    api.get(`/storefront/products/${productId}/reviews${buildQS(params)}`),

  submitReview: (productId, data) =>
    api.post(`/storefront/products/${productId}/reviews`, data),
};
