import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAppearance } from '../../context/AppearanceContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
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
    if (product) addToCart(product, 1, product.colors?.[0], product.sizes?.[0]);
  };

  return (
    <Link
      to={productUrl}
      className="group flex flex-col bg-bg border border-border-minimal h-full hover:scale-[1.02] transition-transform duration-200"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-surface">
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-red-600 text-bg text-[10px] font-bold px-1.5 py-0.5 leading-none">
            -{discountPercent}%
          </span>
        )}
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
      <div className="p-2.5 flex flex-col gap-1 grow">
        <span className="text-[10px] text-subtle uppercase tracking-wide">{brand}</span>
        <p className="text-xs font-medium text-ink line-clamp-2">{productName}</p>

        {/* Star rating */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-accent leading-none tracking-tight">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < filledStars ? '★' : '☆'}</span>
            ))}
          </span>
          {reviewCount > 0 && (
            <span className="text-[10px] text-subtle">({reviewCount})</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-ink">{formatPrice(discountedPrice)}</span>
          {originalPrice > discountedPrice && (
            <span className="text-[11px] text-subtle line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-auto w-full py-2 bg-ink text-bg text-[10px] font-bold uppercase tracking-wider hover:opacity-85 transition-opacity"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
