import React from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAppearance } from '../../context/AppearanceContext';
import { getImageUrl } from '../../lib/api';

export default function Wishlist() {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Move to cart: add the item, then remove it from the wishlist.
  const handleMoveToCart = async (product, firstColor, firstSize) => {
    addToCart(product, 1, firstColor, firstSize);
    await toggleWishlist(product);
  };
  const { formatPrice, gridCols } = useAppearance();
  const lgCols = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[gridCols] || 'lg:grid-cols-4';

  if (loading) {
    return (
      <div className="bg-surface border border-border-minimal animate-pulse">
        <div className="p-10 border-b border-border-minimal h-16" />
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${lgCols} gap-6 p-10`}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-bg" />
              <div className="h-4 bg-bg w-3/4 rounded-[4px]" />
              <div className="h-4 bg-bg w-1/2 rounded-[4px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-minimal animate-in fade-in duration-700">
      <div className="flex items-center justify-between p-10 border-b border-border-minimal">
        <h2 className="text-[14px] font-normal text-ink uppercase tracking-[0.011em]">Saved Selections</h2>
        <span className="text-[11px] font-normal text-subtle uppercase tracking-[0.011em]">
          {wishlist.length} {wishlist.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 mx-auto mb-10 text-subtle">
            <Heart className="w-full h-full stroke-[1.2]" />
          </div>
          <h3 className="text-[18px] font-heading font-normal text-ink mb-3">Void Selections</h3>
          <p className="text-subtle text-[13px] mb-12 max-w-xs mx-auto leading-relaxed">
            Consider archiving pieces that resonate with your aesthetic for future acquisition.
          </p>
          <Link to="/products" className="btn-minimal inline-block px-12">Discover Catalog</Link>
        </div>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${lgCols} gap-6 p-10`}>
          {wishlist.map(product => {
            const id         = product._id || product.id;
            const slug       = product.slug || id;
            const image      = getImageUrl(product.images?.[0] || '');
            const salePrice  = product.price;
            const origPrice  = product.originalPrice;
            const firstColor = product.colors?.[0];
            const firstSize  = product.sizes?.[0];

            return (
              <div key={id} className="group flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-surface mb-3">
                  <Link to={`/products/${slug}`} className="block w-full h-full">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-subtle text-xs uppercase tracking-[0.011em]">
                        No image
                      </div>
                    )}
                  </Link>

                  <div className="absolute inset-x-0 bottom-0 flex gap-2 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={() => handleMoveToCart(product, firstColor, firstSize)}
                      disabled={product.stock <= 0}
                      className="flex-1 bg-accent text-white py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="bg-white border border-border-minimal px-3 py-2.5 text-ink hover:text-red-500 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-subtle uppercase tracking-[0.05em] mb-1">
                  {product.brand}
                </span>
                <Link
                  to={`/products/${slug}`}
                  className="text-ink font-medium text-sm hover:text-subtle transition-colors mb-1 line-clamp-1"
                >
                  {product.name}
                </Link>
                <div className="flex items-baseline gap-2 mt-auto">
                  {origPrice && origPrice > salePrice ? (
                    <>
                      <span className="text-sm font-semibold text-[#c53030]">{formatPrice(salePrice)}</span>
                      <span className="text-[12px] text-subtle line-through">{formatPrice(origPrice)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-ink">{formatPrice(salePrice)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
