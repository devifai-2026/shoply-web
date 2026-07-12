import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAppearance } from '../../context/AppearanceContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
  const { success: toastSuccess } = useToast();

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
    if (product) {
      addToCart(product, 1, product.colors?.[0], selectedSize);
      toastSuccess('Added to bag.');
    }
  };

  return (
    <Link
      to={productUrl}
      className="group flex flex-col bg-surface border border-border-minimal h-full transition-colors hover:border-ink"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-surface">
        <span className="absolute top-2 left-2 z-10 bg-surface border border-border-minimal text-ink text-[10px] font-normal px-2 py-0.5 uppercase tracking-[0.011em] leading-none">
          New
        </span>
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 bg-surface border border-border-minimal opacity-0 group-hover:opacity-100 transition-opacity hover:border-ink"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('w-3.5 h-3.5 text-ink', wishlisted && 'fill-sale text-sale')} />
        </button>
        {image ? (
          <img
            src={image}
            alt={productName}
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center text-subtle text-xs uppercase tracking-[0.011em]">
            No image
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-2.5 flex flex-col gap-1.5 grow">
        <span className="text-[10px] text-subtle uppercase tracking-[0.011em] font-normal">{brand}</span>
        <p className="text-xs font-normal text-ink line-clamp-1">{productName}</p>

        {/* Size selector */}
        {sizes.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {sizes.slice(0, 5).map(size => (
              <button
                key={size}
                type="button"
                onClick={(e) => handleSizeSelect(e, size)}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-normal border transition-colors',
                  selectedSize === size
                    ? 'border-ink bg-ink text-white'
                    : 'border-border-minimal text-subtle hover:border-ink hover:text-ink',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Price — single, no strikethrough */}
        <p className="text-sm font-medium text-ink">{formatPrice(price)}</p>

        {sizeError && (
          <p className="text-[10px] text-sale">Please select a size</p>
        )}

        {/* Quick add — outlined style */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className="mt-auto w-full py-2 border border-ink text-ink text-[10px] font-normal uppercase tracking-[0.011em] hover:bg-ink hover:text-white transition-colors"
        >
          + Quick add
        </button>
      </div>
    </Link>
  );
}
