import { api } from '../lib/api';

export const wishlistService = {
  getWishlist:         ()          => api.get('/customer/wishlist'),
  toggleWishlist:      (productId) => api.post(`/customer/wishlist/${productId}`),
  removeFromWishlist:  (productId) => api.delete(`/customer/wishlist/${productId}`),
};
