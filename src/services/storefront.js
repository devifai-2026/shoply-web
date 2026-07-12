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

  getAppearance: () =>
    api.get('/storefront/appearance'),

  getActiveOffers: () =>
    api.get('/storefront/offers'),

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
