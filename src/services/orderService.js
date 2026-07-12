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

  calculateShipping: ({ pincode, total, weight = 0 }) =>
    api.post('/storefront/shipping/calculate-rate', { pincode, total, weight }),

  trackByAwb: (awb) =>
    api.get(`/shipping/track/awb/${encodeURIComponent(awb)}`),
};
