import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';

const WishlistContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
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
    } catch (_) {}
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (product) => {
    if (!user) return null;
    const productId = product._id || product.id;
    try {
      const res = await wishlistService.toggleWishlist(productId);
      if (res.added) {
        setWishlist(prev => [...prev, product]);
        setWishlistIds(prev => new Set([...prev, productId]));
      } else {
        setWishlist(prev => prev.filter(p => (p._id || p.id) !== productId));
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
      return res.added;
    } catch (_) { return null; }
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
