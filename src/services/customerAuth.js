import { api } from '../lib/api';

export const customerAuthService = {
  register: (data) =>
    api.post('/customer/register', data),

  login: (email, password) =>
    api.post('/customer/login', { email, password }),

  me: () =>
    api.get('/customer/me'),

  updateProfile: (data) =>
    api.put('/customer/profile', data),

  changePassword: (currentPassword, newPassword) =>
    api.put('/customer/change-password', { currentPassword, newPassword }),

  forgotPassword: (email) =>
    api.post('/customer/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post(`/customer/reset-password/${token}`, { password }),

  sendOtp: (phone) =>
    api.post('/customer/otp/send', { phone }),

  verifyOtp: (phone, verificationId, code, name) =>
    api.post('/customer/otp/verify', { phone, verificationId, code, ...(name ? { name } : {}) }),

  // Addresses
  getAddresses: () =>
    api.get('/customer/addresses'),

  addAddress: (data) =>
    api.post('/customer/addresses', data),

  updateAddress: (id, data) =>
    api.put(`/customer/addresses/${id}`, data),

  deleteAddress: (id) =>
    api.delete(`/customer/addresses/${id}`),

  setDefaultAddress: (id) =>
    api.patch(`/customer/addresses/${id}/default`),
};
