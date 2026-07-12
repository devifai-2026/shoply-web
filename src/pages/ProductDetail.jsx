import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storefrontService } from '../services/storefront';
import { getImageUrl } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAppearance } from '../context/AppearanceContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Heart, ChevronRight, ShieldCheck, Truck, RotateCcw, ShoppingBag, Package, Store, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import ProductCard from '../components/product/ProductCard';
import { motion } from 'motion/react';
import { useActiveOffer } from '../lib/useActiveOffer';
import { trackEvent } from '../lib/tracking';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice, gridCols } = useAppearance();
  const lgCols = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[gridCols] || 'lg:grid-cols-4';
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { success: toastSuccess } = useToast();
  const activeOffer = useActiveOffer();
  const [product, setProduct]           = useState(null);
  const [related, setRelated]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeImage, setActiveImage]   = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize]   = useState('');
  const [quantity, setQuantity]           = useState(1);
  const [activeTab, setActiveTab]         = useState('description');

  useEffect(() => {
    if (activeOffer?.type === 'buy_x_get_y') {
      setQuantity(activeOffer.buyQty + activeOffer.getQty);
    }
  }, [activeOffer]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    storefrontService.getProduct(slug)
      .then(r => {
        setProduct(r.data);
        setRelated(r.data.related || []);
        setSelectedColor(r.data.colors?.[0] || '');
        setSelectedSize(r.data.sizes?.[0] || '');
        setActiveImage(0);
        trackEvent('product_view', { productId: r.data._id || r.data.id });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-bg min-h-screen pb-20">
        <div className="container mx-auto px-10 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 animate-pulse">
            <div className="aspect-square bg-surface" />
            <div className="space-y-6">
              <div className="h-4 bg-surface w-1/4 rounded" />
              <div className="h-10 bg-surface w-3/4 rounded" />
              <div className="h-8 bg-surface w-1/3 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-light text-ink">Product not found</h2>
        <Link to="/products" className="btn-minimal inline-block mt-8 px-12">Browse Products</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor || undefined, selectedSize || undefined);
    toastSuccess('Added to bag.');
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    await toggleWishlist(product);
  };

  const productId = product?._id || product?.id;
  const wishlisted = productId ? isInWishlist(productId) : false;

  const images = product.images?.length ? product.images : [];

  return (
    <div className="bg-bg min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-surface border-b border-border-minimal">
        <div className="container mx-auto px-10 py-5 flex items-center gap-2 text-[11px] font-bold text-subtle uppercase tracking-widest">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {product.category && (
            <>
              <Link
                to={`/c/${product.category?.slug ?? product.category}`}
                className="hover:text-ink transition-colors"
              >
                {product.category?.name ?? product.categoryName ?? product.category}
              </Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-ink">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-10 mt-16 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-surface border border-border-minimal overflow-hidden">
              {images[activeImage] ? (
                <img
                  src={getImageUrl(images[activeImage])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-subtle text-xs uppercase tracking-widest">No image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn('aspect-square border transition-all', activeImage === idx ? 'border-accent' : 'border-border-minimal opacity-60 hover:opacity-100')}
                  >
                    <img src={getImageUrl(img)} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-subtle uppercase tracking-[0.1em]">{product.brand}</span>
              <button
                onClick={handleWishlist}
                className="text-ink hover:text-sale transition-all"
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={cn('w-5 h-5', wishlisted && 'fill-sale text-sale')} />
              </button>
            </div>

            <div className="mb-8">
              <h1 className="text-[42px] font-light text-ink leading-[1.1] tracking-tight">{product.name}</h1>
              {product.author && (
                <p className="text-[14px] text-subtle italic mt-2">By {product.author}</p>
              )}
            </div>

            <div className="flex items-baseline gap-4 mb-12 border-b border-border-minimal pb-8">
              {product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <span className="text-3xl font-medium text-sale">{formatPrice(product.price)}</span>
                  <span className="text-xl text-subtle line-through font-normal">{formatPrice(product.originalPrice)}</span>
                </>
              ) : (
                <span className="text-3xl font-medium text-ink">{formatPrice(product.price)}</span>
              )}
              {product.stock <= 0 && (
                <span className="text-[11px] font-normal uppercase tracking-[0.011em] text-sale border border-border-minimal px-3 py-1">Out of Stock</span>
              )}
            </div>

            {/* Sold by vendor */}
            {product.vendor && (
              <div className="flex items-center gap-3 -mt-6 mb-10">
                <Store className="w-4 h-4 text-subtle" />
                <span className="text-[12px] font-medium text-subtle">
                  Sold by{' '}
                  <Link
                    to={`/vendor/${product.vendor.slug}`}
                    className="font-bold text-ink uppercase tracking-wider hover:text-accent transition-colors underline underline-offset-4"
                  >
                    {product.vendor.storeName}
                  </Link>
                </span>
                {product.vendor.rating > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-subtle">
                    <Star className="w-3 h-3 fill-rating text-rating" />
                    {Number(product.vendor.rating).toFixed(1)}
                  </span>
                )}
              </div>
            )}

            <div className="space-y-10">
              {product.colors?.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink mb-6">
                    COLOUR: <span className="font-medium text-subtle">{selectedColor}</span>
                  </h3>
                  <div className="flex items-center gap-4">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          'px-8 py-2 text-[12px] font-semibold border transition-all uppercase tracking-wider',
                          selectedColor === color ? 'border-accent bg-accent text-white' : 'border-border-minimal text-subtle hover:border-accent'
                        )}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink mb-6">SIZE</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          'w-12 h-12 flex items-center justify-center border text-[13px] font-semibold transition-all',
                          selectedSize === size ? 'border-accent bg-accent text-white' : 'border-border-minimal text-subtle hover:border-accent'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active offer banner */}
              {activeOffer?.type === 'buy_x_get_y' && (
                <div className="flex items-start gap-3 bg-surface border border-border-minimal p-4">
                  <ShoppingBag className="w-4 h-4 text-ink mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-ink">{activeOffer.title}</p>
                    <p className="text-[12px] text-subtle mt-0.5">
                      Buy {activeOffer.buyQty}, get {activeOffer.getQty} free — quantity set to {activeOffer.buyQty + activeOffer.getQty} automatically.
                    </p>
                  </div>
                </div>
              )}
              {activeOffer?.type === 'bundle' && (
                <div className="flex items-start gap-3 bg-surface border border-border-minimal p-4">
                  <Package className="w-4 h-4 text-ink mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-ink">{activeOffer.title}</p>
                    <p className="text-[12px] text-subtle mt-0.5">
                      Add any {activeOffer.bundleCount} items to your cart — bundle price applied at checkout.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-10">
                <div className="flex items-center border border-border-minimal shrink-0 px-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center font-medium text-lg hover:text-subtle">–</button>
                  <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => (typeof product.stock === 'number' && product.stock > 0 ? Math.min(q + 1, product.stock) : q + 1))}
                    className="w-10 h-10 flex items-center justify-center font-medium text-lg hover:text-subtle"
                  >+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="btn-minimal flex-grow py-4 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {product.stock > 0
                    ? activeOffer?.type === 'buy_x_get_y'
                      ? `Add ${activeOffer.buyQty + activeOffer.getQty} to bag (+${activeOffer.getQty} free)`
                      : 'Add to shopping bag'
                    : 'Out of Stock'}
                </button>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-border-minimal">
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-ink" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-ink">Global Shipping</span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-ink" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-ink">30 Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-32">
          <div className="flex items-center justify-start border-b border-border-minimal gap-12 sm:gap-20 mb-16 overflow-x-auto no-scrollbar">
            {['description', 'specifications'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn('pb-6 text-[11px] font-bold uppercase tracking-[0.2em] relative transition-all', activeTab === tab ? 'text-ink' : 'text-subtle hover:text-ink')}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-accent" />}
              </button>
            ))}
          </div>

          <div className="max-w-3xl">
            {activeTab === 'description' && (
              <div className="text-subtle text-[15px] leading-[1.65] font-medium space-y-6">
                <p>{product.description || 'No description available.'}</p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="space-y-0">
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 py-4 border-b border-border-minimal">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-subtle">{key}</span>
                      <span className="text-[13px] font-medium text-ink">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-subtle text-[13px]">No specifications available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-40">
            <div className="flex justify-between items-baseline border-b border-border-minimal pb-2 mb-10">
              <h2 className="text-[18px] font-semibold text-ink uppercase tracking-wider">You may also like</h2>
              <Link to="/products" className="text-[12px] text-subtle">View All</Link>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-6`}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
