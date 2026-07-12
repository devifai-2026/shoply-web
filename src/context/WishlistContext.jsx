import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';
import { useToast } from './ToastContext';
import { getErrorMessage } from '../lib/utils';

const WishlistContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const [wishlist, setWishlist]       = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading]         = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await wishlistService.getWishlist();
      setWishlist(res.data);
      setWishlistIds(new Set(res.data.map(p => p._id || p.id)));
    } catch (_) {
      // Background load on mount/login — fail silently, don't spam a toast.
    }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  // `silent` lets callers doing a compound action (e.g. "move to cart", which
  // removes from the wishlist as a side effect) show their own combined toast
  // instead of the generic added/removed one.
  const toggleWishlist = async (product, { silent = false } = {}) => {
    if (!user) return null;
    const productId = product._id || product.id;
    try {
      const res = await wishlistService.toggleWishlist(productId);
      if (res.added) {
        setWishlist(prev => [...prev, product]);
        setWishlistIds(prev => new Set([...prev, productId]));
        if (!silent) toastSuccess('Added to wishlist.');
      } else {
        setWishlist(prev => prev.filter(p => (p._id || p.id) !== productId));
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        if (!silent) toastSuccess('Removed from wishlist.');
      }
      return res.added;
    } catch (err) {
      if (!silent) toastError(getErrorMessage(err, 'Could not update your wishlist. Please try again.'));
      return null;
    }
  };

  const isInWishlist = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (ctx === undefined) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
