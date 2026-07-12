import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAppearance } from '../../context/AppearanceContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { getImageUrl } from '../../lib/api';
import { trackEvent } from '../../lib/tracking';

export default function ProductCard({ product, activeOffer }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { formatPrice, productCardStyle } = useAppearance();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productId  = product._id || product.id;
  const wishlisted = isInWishlist(productId);
  const slug       = product.slug || product.id || product._id;
  const image      = getImageUrl(product.images?.[0] || '');
  const salePrice  = product.price;
  const origPrice  = product.originalPrice;
  const discountPct = origPrice && origPrice > salePrice
    ? Math.round((1 - salePrice / origPrice) * 100)
    : 0;
  const firstColor = product.colors?.[0];
  const firstSize  = product.sizes?.[0];
  const offerId    = searchParams.get('offerId');
  const detailUrl  = offerId ? `/products/${slug}?offerId=${offerId}` : `/products/${slug}`;
  const cartQty    = activeOffer?.type === 'buy_x_get_y'
    ? (activeOffer.buyQty + activeOffer.getQty) : 1;
  const cartLabel  = activeOffer?.type === 'buy_x_get_y'
    ? `Add to Cart (+${activeOffer.getQty} Free)` : 'Add to Cart';

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    await toggleWishlist(product);
  };

  const handleAddToCart = () => addToCart(product, cartQty, firstColor, firstSize);
  const handleClick = () => trackEvent('product_click', { productId });

  const shared = {
    product, wishlisted, handleWishlist,
    image, detailUrl, salePrice, origPrice, discountPct,
    cartLabel, handleAddToCart, handleClick, formatPrice,
  };

  switch (productCardStyle) {
    case 'classic':  return <ClassicCard  {...shared} />;
    case 'bold':     return <BoldCard     {...shared} />;
    case 'elegant':  return <ElegantCard  {...shared} />;
    case 'magazine': return <MagazineCard {...shared} />;
    case 'vivid':    return <VividCard    {...shared} />;
    default:         return <MinimalCard  {...shared} />;
  }
}

// Shared wishlist button — flat, bordered, no blur, no shadow.
function WishlistButton({ onClick, wishlisted, className }) {
  return (
    <button onClick={onClick}
      className={cn(
        'absolute z-10 flex items-center justify-center bg-surface border border-border-minimal opacity-0 group-hover:opacity-100 transition-opacity hover:border-ink',
        className
      )}
    >
      <Heart className={cn('w-4 h-4 text-ink', wishlisted && 'fill-sale text-sale')} />
    </button>
  );
}

function DiscountBadge({ pct, className }) {
  if (!pct) return null;
  return (
    <span className={cn('absolute z-10 bg-surface border border-border-minimal text-ink text-[10px] font-medium px-2 py-0.5', className)}>
      -{pct}%
    </span>
  );
}

function Price({ salePrice, origPrice, formatPrice, size = 'text-sm' }) {
  return origPrice && origPrice > salePrice ? (
    <>
      <span className={cn('font-medium text-sale', size)}>{formatPrice(salePrice)}</span>
      <span className="text-[12px] text-subtle line-through">{formatPrice(origPrice)}</span>
    </>
  ) : (
    <span className={cn('font-medium text-ink', size)}>{formatPrice(salePrice)}</span>
  );
}

// ── 1. Minimal — edge-to-edge photo, hover-reveal actions ──────────────────────
function MinimalCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group border border-transparent p-3 transition-colors hover:border-border-minimal bg-surface flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-surface mb-3">
        <WishlistButton onClick={handleWishlist} wishlisted={wishlisted} className="top-2 right-2 p-1.5" />
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80" referrerPolicy="no-referrer" />
            : <div className="w-full h-full bg-surface flex items-center justify-center text-subtle text-xs uppercase tracking-[0.011em]">No image</div>
          }
        </Link>
        <button onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-accent text-white py-3 text-[11px] font-normal uppercase tracking-[0.011em] translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >{cartLabel}</button>
      </div>
      <div className="flex flex-col flex-grow">
        <span className="text-[11px] font-normal text-subtle uppercase tracking-[0.011em] mb-1">{product.brand}</span>
        {product.author && <span className="text-[11px] text-subtle italic mb-1">By {product.author}</span>}
        <Link to={detailUrl} className="text-ink font-normal text-sm hover:text-subtle transition-colors mb-1 line-clamp-1">{product.name}</Link>
        <div className="mt-auto flex items-baseline gap-2">
          <Price salePrice={salePrice} origPrice={origPrice} formatPrice={formatPrice} />
        </div>
      </div>
    </motion.div>
  );
}

// ── 2. Classic — bordered card, rating row, footer divider ─────────────────────
function ClassicCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, discountPct, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-surface border border-border-minimal overflow-hidden flex flex-col h-full transition-colors hover:border-ink"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <DiscountBadge pct={discountPct} className="top-3 left-3" />
        <WishlistButton onClick={handleWishlist} wishlisted={wishlisted} className="top-3 right-3 w-8 h-8 opacity-100" />
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            : <div className="w-full h-full bg-surface flex items-center justify-center text-subtle text-xs uppercase tracking-[0.011em]">No image</div>
          }
        </Link>
      </div>
      <div className="p-4 flex flex-col flex-grow gap-2">
        <span className="text-[10px] font-normal uppercase tracking-[0.011em] text-subtle">{product.brand}</span>
        {product.author && <span className="text-[11px] text-subtle italic">By {product.author}</span>}
        <Link to={detailUrl} className="text-ink font-normal text-sm leading-snug hover:text-subtle transition-colors line-clamp-2">{product.name}</Link>
        <div className="flex gap-0.5 text-rating text-[11px]">
          ★★★★<span className="text-border-minimal">★</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-border-minimal">
          <div className="flex items-baseline gap-1.5">
            <Price salePrice={salePrice} origPrice={origPrice} formatPrice={formatPrice} size="text-sm" />
          </div>
          <button onClick={handleAddToCart}
            className="bg-accent text-white text-[11px] font-normal px-3 py-1.5 hover:opacity-90 transition-opacity"
          >Add +</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── 3. Bold — inverted (Ink Black surface), for a strong single-product callout ─
function BoldCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, discountPct, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-ink overflow-hidden flex flex-col h-full border border-ink transition-colors"
    >
      <div className="relative aspect-square overflow-hidden">
        <DiscountBadge pct={discountPct} className="top-2 left-2 bg-surface" />
        <button onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 bg-transparent border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity hover:border-white"
        >
          <Heart className={cn('w-4 h-4 text-white', wishlisted && 'fill-sale text-sale')} />
        </button>
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
            : <div className="w-full h-full bg-ink flex items-center justify-center text-white/50 text-xs uppercase tracking-[0.011em]">No image</div>
          }
        </Link>
      </div>
      <div className="p-4 flex flex-col flex-grow gap-2">
        <span className="text-[10px] text-white/50 uppercase tracking-[0.011em] font-normal">{product.brand}</span>
        {product.author && <span className="text-[11px] text-white/60 italic">By {product.author}</span>}
        <Link to={detailUrl} className="text-white font-normal text-sm leading-tight hover:text-white/70 transition-colors line-clamp-2">{product.name}</Link>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/15">
          <div className="flex flex-col">
            <span className="font-medium text-base text-white">{formatPrice(salePrice)}</span>
            {origPrice && origPrice > salePrice && (
              <span className="text-[11px] text-white/50 line-through">{formatPrice(origPrice)}</span>
            )}
          </div>
          <button onClick={handleAddToCart}
            className="bg-white text-ink text-[11px] font-normal px-4 py-2 transition-opacity hover:opacity-90"
          >Add to Cart</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── 4. Elegant — quiet, tight tracking, understated CTA reveal on hover ────────
function ElegantCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-surface border border-border-minimal overflow-hidden flex flex-col h-full transition-colors hover:border-ink"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        <WishlistButton onClick={handleWishlist} wishlisted={wishlisted} className="top-2 right-2 p-1.5" />
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" referrerPolicy="no-referrer" />
            : <div className="w-full h-full flex items-center justify-center text-subtle text-xs uppercase tracking-[0.011em]">No image</div>
          }
        </Link>
      </div>
      <div className="p-4 flex flex-col flex-grow gap-1">
        <span className="text-[9px] italic text-subtle uppercase tracking-[0.011em]">{product.brand}</span>
        {product.author && <span className="text-[11px] text-subtle italic">By {product.author}</span>}
        <Link to={detailUrl} className="text-ink font-normal text-sm leading-snug hover:text-subtle transition-colors line-clamp-2">{product.name}</Link>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <Price salePrice={salePrice} origPrice={origPrice} formatPrice={formatPrice} size="text-sm" />
          </div>
          <button onClick={handleAddToCart}
            className="text-[10px] font-normal border border-ink text-ink px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-ink hover:text-white"
          >{cartLabel}</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── 5. Magazine — horizontal list-view layout ──────────────────────────────────
function MagazineCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, discountPct, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-surface border border-border-minimal overflow-hidden flex flex-row transition-colors hover:border-ink h-full"
    >
      <div className="relative w-[42%] shrink-0 overflow-hidden">
        <DiscountBadge pct={discountPct} className="top-2 left-2" />
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            : <div className="w-full h-full min-h-[140px] bg-surface flex items-center justify-center text-subtle text-[10px] uppercase tracking-[0.011em]">No image</div>
          }
        </Link>
      </div>
      <div className="flex flex-col justify-between p-3 flex-1 min-w-0">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-normal uppercase tracking-[0.011em] text-subtle">{product.brand}</span>
            <button onClick={handleWishlist} className="p-1 hover:text-sale transition-colors shrink-0">
              <Heart className={cn('w-3.5 h-3.5 text-ink', wishlisted && 'fill-sale text-sale')} />
            </button>
          </div>
          {product.author && <span className="text-[11px] text-subtle italic">By {product.author}</span>}
          <Link to={detailUrl} className="text-ink font-normal text-[13px] leading-snug hover:text-subtle transition-colors line-clamp-3">{product.name}</Link>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <Price salePrice={salePrice} origPrice={origPrice} formatPrice={formatPrice} size="text-sm" />
          </div>
          <button onClick={handleAddToCart}
            className="w-full bg-accent text-white text-[10px] font-normal py-2 transition-opacity hover:opacity-90"
          >{cartLabel}</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── 6. Vivid — always-visible actions, top accent-decorative rule ─────────────
function VividCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, discountPct, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-surface overflow-hidden flex flex-col h-full border border-border-minimal transition-colors hover:border-ink"
      style={{ borderTop: '3px solid var(--color-accent-decorative)' }}
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        <DiscountBadge pct={discountPct} className="top-3 left-3" />
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-7 h-7 bg-surface border border-border-minimal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:border-ink"
        >
          <Heart className={cn('w-3.5 h-3.5 text-ink', wishlisted && 'fill-sale text-sale')} />
        </button>
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            : <div className="w-full h-full flex items-center justify-center text-subtle text-xs uppercase tracking-[0.011em]">No image</div>
          }
        </Link>
        <button onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-accent text-white py-2.5 text-[11px] font-normal uppercase tracking-[0.011em] translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >{cartLabel}</button>
      </div>
      <div className="p-4 flex flex-col flex-grow gap-1.5">
        <span className="text-[10px] font-normal uppercase tracking-[0.011em] text-subtle">{product.brand}</span>
        {product.author && <span className="text-[11px] text-subtle italic">By {product.author}</span>}
        <Link to={detailUrl} className="text-ink font-normal text-sm leading-snug hover:text-subtle transition-colors line-clamp-2">{product.name}</Link>
        <div className="mt-auto flex items-baseline gap-2">
          <Price salePrice={salePrice} origPrice={origPrice} formatPrice={formatPrice} size="text-base" />
        </div>
      </div>
    </motion.div>
  );
}
