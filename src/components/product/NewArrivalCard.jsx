import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAppearance } from '../../context/AppearanceContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export default function NewArrivalCard({
  brand,
  productName,
  image,
  sizes = [],
  price,
  category,
  isWishlisted: initialWishlisted = false,
  product,
  productUrl,
}) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useAppearance();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const productId = product?._id || product?.id;
  const wishlisted = productId ? isInWishlist(productId) : initialWishlisted;

  const handleWishlist = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (product) await toggleWishlist(product);
  };

  const handleSizeSelect = (e, size) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedSize(size);
    setSizeError(false);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!selectedSize && sizes.length > 0) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    if (product) addToCart(product, 1, product.colors?.[0], selectedSize);
  };

  return (
    <Link
      to={productUrl}
      className="group flex flex-col bg-bg border border-border-minimal h-full hover:scale-[1.02] transition-transform duration-200"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-surface">
        <span className="absolute top-2 left-2 z-10 bg-ink text-bg text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide leading-none">
          New
        </span>
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 bg-bg/80 backdrop-blur-sm"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('w-3.5 h-3.5', wishlisted ? 'fill-red-500 text-red-500' : 'text-subtle hover:text-ink')} />
        </button>
        {image ? (
          <img
            src={image}
            alt={productName}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center text-subtle text-xs">
            No image
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-2.5 flex flex-col gap-1.5 grow">
        <span className="text-[10px] text-subtle">{brand}</span>
        <p className="text-xs font-medium text-ink line-clamp-1">{productName}</p>

        {/* Size selector */}
        {sizes.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {sizes.slice(0, 5).map(size => (
              <button
                key={size}
                type="button"
                onClick={(e) => handleSizeSelect(e, size)}
                className={cn(
                  'w-7 h-7 flex items-center justify-center text-[9px] font-semibold border transition-colors',
                  selectedSize === size
                    ? 'border-ink bg-ink text-bg'
                    : 'border-border-minimal text-subtle hover:border-ink hover:text-ink',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Price — single, no strikethrough */}
        <p className="text-sm font-bold text-ink">{formatPrice(price)}</p>

        {sizeError && (
          <p className="text-[10px] text-red-600">Please select a size</p>
        )}

        {/* Quick add — outlined style */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className="mt-auto w-full py-2 border border-ink text-ink text-[10px] font-bold uppercase tracking-wider hover:bg-ink hover:text-bg transition-colors"
        >
          + Quick add
        </button>
      </div>
    </Link>
  );
}
