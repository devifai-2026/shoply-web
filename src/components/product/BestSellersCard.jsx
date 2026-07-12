import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAppearance } from '../../context/AppearanceContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/utils';

export default function BestSellersCard({
  brand,
  productName,
  image,
  rating = 0,
  reviewCount = 0,
  discountedPrice,
  originalPrice,
  discountPercent,
  isWishlisted: initialWishlisted = false,
  product,
  productUrl,
}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useAppearance();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { success: toastSuccess } = useToast();

  const productId = product?._id || product?.id;
  const wishlisted = productId ? isInWishlist(productId) : initialWishlisted;
  const filledStars = Math.round(rating);

  const handleWishlist = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (product) await toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (product) {
      addToCart(product, 1, product.colors?.[0], product.sizes?.[0]);
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
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-surface border border-border-minimal text-ink text-[10px] font-medium px-1.5 py-0.5 leading-none">
            -{discountPercent}%
          </span>
        )}
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
      <div className="p-2.5 flex flex-col gap-1 grow">
        <span className="text-[10px] text-subtle uppercase tracking-[0.011em] font-normal">{brand}</span>
        <p className="text-xs font-normal text-ink line-clamp-2">{productName}</p>

        {/* Star rating — only rendered when the product has a real rating */}
        {rating > 0 ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-rating leading-none tracking-tight">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < filledStars ? '★' : '☆'}</span>
              ))}
            </span>
            {reviewCount > 0 && (
              <span className="text-[10px] text-subtle">({reviewCount})</span>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-subtle">No ratings yet</span>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-ink">{formatPrice(discountedPrice)}</span>
          {originalPrice > discountedPrice && (
            <span className="text-[11px] text-subtle line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-auto w-full py-2 bg-accent text-white text-[10px] font-normal uppercase tracking-[0.011em] hover:opacity-90 transition-opacity"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
