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

// ── 1. Minimal ───────────────────────────────────────────────────────────────
function MinimalCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group minimal-card flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-surface mb-3">
        <button onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
        >
          <Heart className={cn('w-4 h-4', wishlisted && 'fill-red-500 text-red-500')} />
        </button>
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80" referrerPolicy="no-referrer" />
            : <div className="w-full h-full bg-surface flex items-center justify-center text-subtle text-xs uppercase tracking-widest">No image</div>
          }
        </Link>
        <button onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-accent text-white py-3 text-[11px] font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          style={{ borderRadius: 'var(--btn-radius, 0px)' }}
        >{cartLabel}</button>
      </div>
      <div className="flex flex-col flex-grow">
        <span className="text-[11px] font-medium text-subtle uppercase tracking-[0.05em] mb-1">{product.brand}</span>
        {product.author && <span className="text-[11px] text-subtle italic mb-1">By {product.author}</span>}
        <Link to={detailUrl} className="text-ink font-medium text-sm hover:text-subtle transition-colors mb-1 line-clamp-1">{product.name}</Link>
        <div className="mt-auto flex items-baseline gap-2">
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
    </motion.div>
  );
}

// ── 2. Classic ───────────────────────────────────────────────────────────────
function ClassicCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, discountPct, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.14)] transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            -{discountPct}%
          </span>
        )}
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:text-red-500 transition-colors"
        >
          <Heart className={cn('w-4 h-4', wishlisted && 'fill-red-500 text-red-500')} />
        </button>
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs uppercase tracking-widest">No image</div>
          }
        </Link>
      </div>
      <div className="p-4 flex flex-col flex-grow gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{product.brand}</span>
        {product.author && <span className="text-[11px] text-gray-400 italic">By {product.author}</span>}
        <Link to={detailUrl} className="text-gray-900 font-semibold text-sm leading-snug hover:text-gray-600 transition-colors line-clamp-2">{product.name}</Link>
        <div className="flex gap-0.5 text-amber-400 text-[11px]">
          ★★★★<span className="text-gray-300">★</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-1.5">
            {origPrice && origPrice > salePrice ? (
              <>
                <span className="font-bold text-[#c53030]">{formatPrice(salePrice)}</span>
                <span className="text-xs text-gray-400 line-through">{formatPrice(origPrice)}</span>
              </>
            ) : (
              <span className="font-bold text-gray-900">{formatPrice(salePrice)}</span>
            )}
          </div>
          <button onClick={handleAddToCart}
            className="bg-accent text-white text-[11px] font-bold px-3 py-1.5 hover:opacity-90 transition-opacity"
            style={{ borderRadius: 'var(--btn-radius, 8px)' }}
          >Add +</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── 3. Bold ──────────────────────────────────────────────────────────────────
function BoldCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, discountPct, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-[#0f172a] rounded-xl overflow-hidden flex flex-col h-full hover:ring-2 hover:ring-accent/50 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden">
        {discountPct > 0 && (
          <span className="absolute top-2 left-2 z-10 text-white text-[9px] font-black px-2 py-0.5 rounded"
            style={{ background: 'var(--color-accent)' }}
          >-{discountPct}%</span>
        )}
        <button onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
        >
          <Heart className={cn('w-4 h-4 text-white', wishlisted && 'fill-red-400 text-red-400')} />
        </button>
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
            : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs uppercase tracking-widest">No image</div>
          }
        </Link>
      </div>
      <div className="p-4 flex flex-col flex-grow gap-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-[0.1em] font-bold">{product.brand}</span>
        {product.author && <span className="text-[11px] text-slate-400 italic">By {product.author}</span>}
        <Link to={detailUrl} className="text-white font-bold text-sm leading-tight hover:text-slate-300 transition-colors line-clamp-2">{product.name}</Link>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex flex-col">
            <span className="font-black text-base" style={{ color: 'var(--color-accent)' }}>{formatPrice(salePrice)}</span>
            {origPrice && origPrice > salePrice && (
              <span className="text-[11px] text-slate-500 line-through">{formatPrice(origPrice)}</span>
            )}
          </div>
          <button onClick={handleAddToCart}
            className="text-white text-[11px] font-bold px-4 py-2 transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-accent)', borderRadius: 'var(--btn-radius, 8px)' }}
          >Add to Cart</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── 4. Elegant ───────────────────────────────────────────────────────────────
function ElegantCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-[#fdf8f4] border border-[#e8ddd4] overflow-hidden flex flex-col h-full hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-500"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f5ede6]">
        <button onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
        >
          <Heart className={cn('w-3.5 h-3.5', wishlisted && 'fill-red-400 text-red-400')} />
        </button>
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" referrerPolicy="no-referrer" />
            : <div className="w-full h-full flex items-center justify-center text-[#c4a882] text-xs uppercase tracking-widest">No image</div>
          }
        </Link>
      </div>
      <div className="p-4 flex flex-col flex-grow gap-1">
        <span className="text-[9px] italic text-[#b09070] uppercase tracking-[0.15em]">{product.brand}</span>
        {product.author && <span className="text-[11px] text-[#b09070] italic">By {product.author}</span>}
        <Link to={detailUrl} className="text-[#3d2b1f] font-medium text-sm leading-snug hover:text-[#6b4c3b] transition-colors line-clamp-2">{product.name}</Link>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {origPrice && origPrice > salePrice ? (
              <>
                <span className="font-semibold text-[#c53030] text-sm">{formatPrice(salePrice)}</span>
                <span className="text-[11px] text-[#b09070] line-through">{formatPrice(origPrice)}</span>
              </>
            ) : (
              <span className="font-semibold text-[#3d2b1f] text-sm">{formatPrice(salePrice)}</span>
            )}
          </div>
          <button onClick={handleAddToCart}
            className="text-[10px] font-semibold border border-[#3d2b1f] text-[#3d2b1f] px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#3d2b1f] hover:text-white"
            style={{ borderRadius: 'var(--btn-radius, 0px)' }}
          >{cartLabel}</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── 5. Magazine ──────────────────────────────────────────────────────────────
function MagazineCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, discountPct, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-row shadow-sm hover:shadow-md transition-shadow duration-300 h-full"
    >
      <div className="relative w-[42%] flex-shrink-0 overflow-hidden">
        {discountPct > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">-{discountPct}%</span>
        )}
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            : <div className="w-full h-full min-h-[140px] bg-gray-100 flex items-center justify-center text-gray-300 text-[10px] uppercase tracking-widest">No image</div>
          }
        </Link>
      </div>
      <div className="flex flex-col justify-between p-3 flex-1 min-w-0">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">{product.brand}</span>
            <button onClick={handleWishlist} className="p-1 hover:text-red-500 transition-colors shrink-0">
              <Heart className={cn('w-3.5 h-3.5', wishlisted && 'fill-red-500 text-red-500')} />
            </button>
          </div>
          {product.author && <span className="text-[11px] text-gray-400 italic">By {product.author}</span>}
          <Link to={detailUrl} className="text-gray-900 font-bold text-[13px] leading-snug hover:text-gray-600 transition-colors line-clamp-3">{product.name}</Link>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5 mb-2">
            {origPrice && origPrice > salePrice ? (
              <>
                <span className="font-bold text-[#c53030] text-sm">{formatPrice(salePrice)}</span>
                <span className="text-[10px] text-gray-400 line-through">{formatPrice(origPrice)}</span>
              </>
            ) : (
              <span className="font-bold text-gray-900 text-sm">{formatPrice(salePrice)}</span>
            )}
          </div>
          <button onClick={handleAddToCart}
            className="w-full bg-accent text-white text-[10px] font-bold py-2 transition-opacity hover:opacity-90"
            style={{ borderRadius: 'var(--btn-radius, 8px)' }}
          >{cartLabel}</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── 6. Vivid ─────────────────────────────────────────────────────────────────
function VividCard({ product, wishlisted, handleWishlist, image, detailUrl, salePrice, origPrice, discountPct, cartLabel, handleAddToCart, handleClick, formatPrice }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="group bg-white rounded-2xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
      style={{ borderTop: '3px solid var(--color-accent)' }}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 z-10 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm"
            style={{ background: 'var(--color-accent)' }}
          >-{discountPct}% OFF</span>
        )}
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
        >
          <Heart className={cn('w-3.5 h-3.5', wishlisted && 'fill-red-500 text-red-500')} />
        </button>
        <Link to={detailUrl} className="w-full h-full block" onClick={handleClick}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase tracking-widest">No image</div>
          }
        </Link>
        <button onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 text-white py-2.5 text-[11px] font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          style={{ background: 'var(--color-accent)' }}
        >{cartLabel}</button>
      </div>
      <div className="p-4 flex flex-col flex-grow gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{product.brand}</span>
        {product.author && <span className="text-[11px] text-gray-400 italic">By {product.author}</span>}
        <Link to={detailUrl} className="text-gray-900 font-bold text-sm leading-snug hover:text-gray-600 transition-colors line-clamp-2">{product.name}</Link>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="font-black text-base" style={{ color: 'var(--color-accent)' }}>{formatPrice(salePrice)}</span>
          {origPrice && origPrice > salePrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(origPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
