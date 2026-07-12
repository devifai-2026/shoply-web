import { api } from '../lib/api';

export const orderService = {
  createOrder: (payload) =>
    api.post('/customer/orders', payload),

  getMyOrders: (params = {}) => {
    const qs = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return api.get(`/customer/orders${qs}`);
  },

  getOrder: (id) =>
    api.get(`/customer/orders/${id}`),

  getOrderInvoice: (id) =>
    api.get(`/customer/orders/${id}/invoice`),

  cancelOrder: (id) =>
    api.patch(`/customer/orders/${id}/cancel`, {}),

  // `items` (optional): [{ productId, quantity }] — when supplied, the quote
  // is split per-vendor (honoring each vendor's custom shipping rate), so it
  // matches what order creation will actually charge instead of only ever
  // quoting the global zone table.
  calculateShipping: ({ pincode, total, weight = 0, items }) =>
    api.post('/storefront/shipping/calculate-rate', { pincode, total, weight, ...(items ? { items } : {}) }),

  getInvoicePdfUrl: (id) => `/customer/orders/${id}/invoice?format=pdf`,

  trackByAwb: (awb) =>
    api.get(`/shipping/track/awb/${encodeURIComponent(awb)}`),
};
