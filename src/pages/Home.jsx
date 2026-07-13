import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { storefrontService } from '../services/storefront';
import { useAppearance } from '../context/AppearanceContext';
import { getImageUrl } from '../lib/api';
import { useCountdown } from '../lib/useCountdown';
import FlashSaleCard from '../components/product/FlashSaleCard';
import BestSellersCard from '../components/product/BestSellersCard';
import NewArrivalCard from '../components/product/NewArrivalCard';
import RecentlyViewedCard from '../components/product/RecentlyViewedCard';
import {
  X, Zap, Mail, ChevronRight, ArrowLeft,
  Truck, Shield, RefreshCw, Headphones, Check, Lock, Star,
  Gift, ShoppingBag, Package, Tag,
} from 'lucide-react';

// Maps Appearance.homepageContent.trustBadges[].icon (a fixed key set
// validated server-side) to a real icon component — never fabricated copy,
// the label/icon pair itself always comes from admin-configured data.
const TRUST_ICON_MAP = {
  truck: Truck, shield: Shield, refresh: RefreshCw, headphones: Headphones,
  check: Check, lock: Lock, gift: Gift, star: Star,
};

// Shared section heading with the short (not full-width) decorative underline.
function SectionHeading({ children, action, center }) {
  return (
    <div className={center ? 'text-center mb-6' : 'flex items-center justify-between mb-6'}>
      <div className={center ? 'inline-block' : ''}>
        <h2 className="text-base font-normal text-ink uppercase tracking-[0.011em]">{children}</h2>
        <span className={center ? 'heading-accent-rule mx-auto' : 'heading-accent-rule'} />
      </div>
      {action}
    </div>
  );
}

const ViewAllLink = ({ to }) => (
  <Link to={to} className="text-xs font-normal text-ink uppercase tracking-[0.011em] flex items-center gap-1 hover:text-subtle transition-colors">
    View All <ChevronRight className="w-3 h-3" />
  </Link>
);

export default function Home() {
  const [categories, setCategories]         = useState([]);
  const [brands, setBrands]                 = useState([]);
  const [flashSale, setFlashSale]           = useState(null);
  const [activeOffers, setActiveOffers]     = useState([]);
  const [bestSellers, setBestSellers]       = useState([]);
  const [newArrivals, setNewArrivals]       = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [announcementOn, setAnnouncementOn] = useState(true);

  const { isSectionEnabled, homepageContent, gridCols } = useAppearance();
  const categoryTiles = homepageContent.categoryTiles || [];
  const trustBadges   = homepageContent.trustBadges || [];
  const lgCols = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[gridCols] || 'lg:grid-cols-4';

  useEffect(() => {
    storefrontService.getCategories().then(r => setCategories(r.data)).catch(() => {});
    storefrontService.getBrands().then(r => setBrands(r.data)).catch(() => {});
    storefrontService.getActiveFlashSale().then(r => setFlashSale(r.data)).catch(() => {});
    storefrontService.getActiveOffers().then(r => setActiveOffers(r.data || [])).catch(() => {});
    storefrontService.getProducts({ sort: 'trending', limit: 8 }).then(r => setBestSellers(r.data)).catch(() => {});
    storefrontService.getProducts({ sort: 'newest', limit: 8 }).then(r => {
      setNewArrivals(r.data);
      setRecentlyViewed(r.data.slice(0, 6));
    }).catch(() => {});
  }, []);

  const flashProducts = flashSale?.products?.slice(0, 8) || [];
  const promoText     = homepageContent.promoStrip || '';
  const promoBanners  = homepageContent.promoBanners || [];
  const saleEndTime   = flashSale?.endTime || new Date(Date.now() + 86_400_000).toISOString();
  const countdown     = useCountdown(saleEndTime);

  return (
    <div className="bg-bg min-h-screen">

      {/* ══════════════════════════════════════════════════════════
          1. ANNOUNCEMENT BAR
      ══════════════════════════════════════════════════════════ */}
      {announcementOn && promoText && (
        <div className="relative bg-ink text-bg py-2.5 text-center">
          <p className="text-xs font-normal tracking-[0.009em] px-10">{promoText}</p>
          <button
            onClick={() => setAnnouncementOn(false)}
            aria-label="Dismiss"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          HERO BANNER CAROUSEL  (category slides + 2 static)
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('heroBanner') && (
        <section className="relative group overflow-hidden">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: true }}
            pagination={{ clickable: true, el: '.hero-dots' }}
            navigation={{ nextEl: '.hero-next', prevEl: '.hero-prev' }}
            loop
            className="h-80 sm:h-105 md:h-130 lg:h-150"
          >
            {/* Dynamic category slides */}
            {(categories.length > 0 ? categories.slice(0, 3) : [{ _id: 'ph', name: 'New Season', slug: '' }]).map((cat, idx) => (
              <SwiperSlide key={cat._id}>
                <div className="relative w-full h-full bg-surface flex items-center">
                  <img
                    src={cat.image ? getImageUrl(cat.image) : `https://picsum.photos/seed/hero${idx + 1}/1920/700`}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-ink/75 via-ink/30 to-transparent" />
                  <div className="relative z-10 container mx-auto px-6 md:px-16">
                    <span className="block text-[10px] font-normal uppercase tracking-[0.011em] text-bg/60 mb-3">New Arrival</span>
                    <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-normal text-bg leading-[1.23] mb-2 max-w-2xl">{cat.name}</h2>
                    <span className="block w-16 h-[3px] bg-[var(--color-accent-decorative)] mb-6" />
                    <p className="text-sm text-bg/65 mb-8 max-w-sm hidden sm:block">{cat.description || 'Explore the latest collection'}</p>
                    <Link
                      to={cat.slug ? `/c/${cat.slug}` : '/products'}
                      className="inline-flex items-center gap-2 bg-bg text-ink px-8 py-3 text-xs font-normal uppercase tracking-[0.009em] hover:opacity-90 transition-opacity"
                    >
                      Shop Now <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {/* Static Slide 2 — Flash Sale */}
            <SwiperSlide key="hero-flash">
              <div className="relative w-full h-full flex items-center bg-ink">
                <img
                  src="https://picsum.photos/seed/flash-hero/1920/700"
                  alt="Flash Sale"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 container mx-auto px-6 md:px-16">
                  <span className="block text-xs font-normal uppercase tracking-[0.011em] text-sale mb-3">⚡ Limited Time Only</span>
                  <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-normal text-bg leading-[1.23] mb-2">Flash Sale</h2>
                  <p className="text-4xl md:text-6xl font-normal text-sale mb-6">Upto 50% Off</p>
                  {/* Countdown timer overlay */}
                  {countdown && (
                    <div className="flex items-end gap-2 mb-8">
                      {[
                        { v: countdown.hours,   u: 'HRS' },
                        { v: countdown.minutes, u: 'MIN' },
                        { v: countdown.seconds, u: 'SEC' },
                      ].map(({ v, u }, i) => (
                        <React.Fragment key={u}>
                          <div className="text-center">
                            <div className="w-14 h-12 md:w-16 md:h-14 bg-bg text-ink text-xl md:text-2xl font-normal font-mono flex items-center justify-center border border-bg/20">
                              {String(v).padStart(2, '0')}
                            </div>
                            <span className="text-[9px] text-bg/50 uppercase tracking-[0.011em]">{u}</span>
                          </div>
                          {i < 2 && <span className="text-2xl font-normal text-bg/60 mb-6">:</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  <Link
                    to="/flash-sale"
                    className="inline-flex items-center gap-2 bg-bg text-ink px-8 py-3 text-xs font-normal uppercase tracking-[0.009em] hover:opacity-90 transition-opacity"
                  >
                    Shop Flash Sale <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>

          </Swiper>

          <button className="hero-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-bg/90 border border-border-minimal flex items-center justify-center hover:bg-bg transition-colors">
            <ArrowLeft className="w-4 h-4 text-ink" />
          </button>
          <button className="hero-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-bg/90 border border-border-minimal flex items-center justify-center hover:bg-bg transition-colors">
            <ChevronRight className="w-4 h-4 text-ink" />
          </button>
          <div className="hero-dots absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2" />
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          TRUST BAR — admin-configured (Appearance → Homepage → Trust Bar),
          hidden entirely when the tenant hasn't set any badges up.
      ══════════════════════════════════════════════════════════ */}
      {trustBadges.length > 0 && (
        <section className="border-y border-border-minimal bg-surface/40">
          <div className="container mx-auto px-4">
            <div
              className="grid divide-x divide-border-minimal"
              style={{ gridTemplateColumns: `repeat(${Math.min(trustBadges.length, 4)}, minmax(0, 1fr))` }}
            >
              {trustBadges.map((badge, i) => {
                const Icon = TRUST_ICON_MAP[badge.icon] || Truck;
                return (
                  <div key={i} className="flex flex-col items-center justify-center gap-2 py-5 px-4">
                    <Icon className="w-5 h-5 text-ink" />
                    <span className="text-[10px] font-normal uppercase tracking-[0.011em] text-ink text-center">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          CATEGORY ICON GRID
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('categoriesGrid') && categories.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <SectionHeading action={<ViewAllLink to="/products" />}>Shop by Category</SectionHeading>
            <div className="relative group/cat">
              <Swiper
                modules={[Navigation]}
                navigation={{ nextEl: '.cat-next', prevEl: '.cat-prev' }}
                spaceBetween={16}
                breakpoints={{ 0: { slidesPerView: 4 }, 640: { slidesPerView: 6 }, 1024: { slidesPerView: 8 } }}
                preventClicks={false}
                preventClicksPropagation={false}
                touchStartPreventDefault={false}
              >
                {categories.map(cat => (
                  <SwiperSlide key={cat._id}>
                    <Link to={`/c/${cat.slug}`} className="flex flex-col items-center gap-2 group">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-border-minimal group-hover:border-ink transition-colors bg-surface">
                        <img
                          src={cat.image ? getImageUrl(cat.image) : `https://picsum.photos/seed/cat${cat.slug}/200/200`}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[10px] font-normal uppercase tracking-[0.011em] text-ink text-center leading-tight">
                        {cat.name}
                      </span>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="cat-prev absolute left-0 top-10 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/cat:opacity-100">
                <ArrowLeft className="w-3.5 h-3.5 text-ink" />
              </button>
              <button className="cat-next absolute right-0 top-10 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/cat:opacity-100">
                <ChevronRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          FLASH SALE BAR + PRODUCT ROW  (FlashSaleCard)
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('flashSale') && flashSale && flashProducts.length > 0 && (
        <section className="py-8 bg-surface/30 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-ink">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-ink" />
                <span className="text-sm font-normal text-ink uppercase tracking-[0.011em]">{flashSale.title || 'Flash Sale'}</span>
              </div>
              {countdown && (
                <div className="flex items-center gap-1">
                  {[
                    { v: countdown.hours,   u: 'HH' },
                    { v: countdown.minutes, u: 'MM' },
                    { v: countdown.seconds, u: 'SS' },
                  ].map(({ v, u }, i) => (
                    <React.Fragment key={u}>
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-8 bg-ink text-bg text-sm font-normal font-mono flex items-center justify-center">
                          {String(v).padStart(2, '0')}
                        </div>
                        <span className="text-[8px] text-subtle uppercase tracking-[0.011em] mt-0.5">{u}</span>
                      </div>
                      {i < 2 && <span className="text-base font-normal text-ink mb-4">:</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
              <ViewAllLink to="/flash-sale" />
            </div>
            <div className="relative group/flash">
              <Swiper
                modules={[Navigation]}
                navigation={{ nextEl: '.flash-next', prevEl: '.flash-prev' }}
                spaceBetween={12}
                breakpoints={{ 0: { slidesPerView: 2 }, 640: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 } }}
              >
                {flashProducts.map(product => {
                  const pid = product._id || product.id;
                  const salePrice = product.price;
                  const origPrice = product.originalPrice;
                  const discountPct = origPrice && origPrice > salePrice
                    ? Math.round(((origPrice - salePrice) / origPrice) * 100)
                    : 0;
                  // Real "sold %" from actual soldCount vs. total ever stocked
                  // (soldCount + remaining stock) — omitted entirely when the
                  // product has no sales/stock data to derive it from.
                  const soldCount = product.soldCount || 0;
                  const totalUnits = soldCount + (product.stock || 0);
                  const soldPercent = totalUnits > 0 ? Math.round((soldCount / totalUnits) * 100) : null;
                  return (
                    <SwiperSlide key={pid}>
                      <FlashSaleCard
                        productName={product.name}
                        image={getImageUrl(product.images?.[0] || '')}
                        discountedPrice={salePrice}
                        originalPrice={origPrice}
                        discountPercent={discountPct}
                        soldPercent={soldPercent}
                        productUrl={`/products/${product.slug || pid}`}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <button className="flash-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/flash:opacity-100">
                <ArrowLeft className="w-3.5 h-3.5 text-ink" />
              </button>
              <button className="flash-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/flash:opacity-100">
                <ChevronRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SPECIAL OFFERS BANNER — neutral treatment, icon-differentiated
          not color-differentiated (chromatic per-type badges conflict
          with the single-CTA-color rule).
      ══════════════════════════════════════════════════════════ */}
      {activeOffers.length > 0 && (
        <section className="py-10 border-b border-border-minimal bg-surface/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-ink" />
                  <h2 className="text-base font-normal text-ink uppercase tracking-[0.011em]">Special Offers</h2>
                </div>
                <span className="heading-accent-rule" />
              </div>
              <ViewAllLink to="/offers" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOffers.slice(0, 3).map(offer => {
                const ICON_MAP = { buy_x_get_y: ShoppingBag, bundle: Package, under_price: Tag };
                const Icon = ICON_MAP[offer.type] || Gift;
                const to = offer.type === 'under_price'
                  ? `/products?maxPrice=${offer.maxPrice}`
                  : `/products?offerId=${offer._id}`;
                return (
                  <Link
                    key={offer._id}
                    to={to}
                    className="border border-border-minimal bg-surface p-6 flex items-start gap-4 hover:border-ink transition-colors"
                  >
                    <div className="w-10 h-10 bg-ink flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-normal uppercase tracking-[0.011em] text-subtle mb-0.5">
                        {offer.type === 'buy_x_get_y' ? 'Buy X Get Y' : offer.type === 'bundle' ? 'Bundle Deal' : 'Under Price'}
                      </p>
                      <h3 className="text-[15px] font-normal text-ink leading-tight truncate">{offer.title}</h3>
                      {offer.badge && (
                        <span className="inline-block mt-2 text-[10px] font-normal px-2 py-0.5 bg-ink text-white uppercase tracking-[0.011em]">
                          {offer.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SHOP BY CATEGORY TILES — admin-configured (Appearance panel),
          hidden entirely when the tenant hasn't set any up.
      ══════════════════════════════════════════════════════════ */}
      {categoryTiles.length > 0 && (
      <section className="py-10 border-b border-border-minimal">
        <div className="container mx-auto px-4">
          <SectionHeading>Shop by Category</SectionHeading>
          <div className={`grid gap-3 md:gap-4`} style={{ gridTemplateColumns: `repeat(${Math.min(categoryTiles.length, 3)}, minmax(0, 1fr))` }}>
            {categoryTiles.map((tile, i) => (
              <Link key={i} to={tile.link || '/products'} className="relative h-44 md:h-64 overflow-hidden group bg-surface border border-border-minimal">
                {tile.image ? (
                  <img
                    src={getImageUrl(tile.image)}
                    alt={tile.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-surface" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-heading text-lg md:text-xl font-normal text-bg leading-none mb-1">{tile.label}</h3>
                  <span className="text-[10px] text-bg/70 uppercase tracking-[0.011em] flex items-center gap-0.5">
                    Shop Now <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          PROMOTIONAL BANNERS (dynamic 2–5) — admin-configured only;
          hidden entirely when the tenant hasn't set any up.
      ══════════════════════════════════════════════════════════ */}
      {promoBanners.length > 0 && (
      <section className="py-0">
        {/* First banner — full width */}
        <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden bg-surface">
          {promoBanners[0].image && (
            <img
              src={getImageUrl(promoBanners[0].image)}
              alt={promoBanners[0].title || 'Promotion'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-ink/45" />
          <div className="absolute bottom-7 left-6 md:left-14">
            {promoBanners[0].subtitle && (
              <span className="block text-[10px] font-normal uppercase tracking-[0.011em] text-bg/60 mb-2">
                {promoBanners[0].subtitle}
              </span>
            )}
            <h3 className="font-heading text-2xl md:text-4xl font-normal text-bg mb-2 leading-[1.27]">
              {promoBanners[0].title}
            </h3>
            <span className="block w-16 h-[3px] bg-[var(--color-accent-decorative)] mb-4" />
            <Link
              to={promoBanners[0].link || '/products'}
              className="inline-flex items-center gap-2 bg-bg text-ink px-6 py-2.5 text-xs font-normal uppercase tracking-[0.009em] hover:bg-accent hover:text-bg transition-colors"
            >
              {promoBanners[0].cta || 'Shop Now'} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        {/* Remaining banners — responsive grid */}
        {promoBanners.length > 1 && (
          <div className={`grid grid-cols-1 ${promoBanners.length === 2 ? 'md:grid-cols-1' : promoBanners.length === 3 ? 'md:grid-cols-2' : 'md:grid-cols-2'}`}>
            {promoBanners.slice(1).map((banner, i) => (
              <div key={i} className="relative h-56 md:h-72 overflow-hidden group bg-surface">
                {banner.image && (
                  <img
                    src={getImageUrl(banner.image)}
                    alt={banner.title || `Banner ${i + 2}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-ink/65 via-ink/10 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  {banner.subtitle && (
                    <span className="block text-[10px] font-normal uppercase tracking-[0.011em] text-bg/60 mb-1">
                      {banner.subtitle}
                    </span>
                  )}
                  <h3 className="font-heading text-xl font-normal text-bg mb-3 leading-[1.27]">
                    {banner.title || 'Shop Collection'}
                  </h3>
                  <Link
                    to={banner.link || '/products'}
                    className="inline-flex items-center gap-1 bg-bg text-ink px-5 py-2 text-xs font-normal uppercase tracking-[0.009em] hover:bg-accent hover:text-bg transition-colors"
                  >
                    {banner.cta || 'Shop Now'} <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          PRODUCT GRID — BEST SELLERS  (standard ProductCard)
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('featuredProducts') && bestSellers.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <SectionHeading action={<ViewAllLink to="/products?sort=trending" />}>Best Sellers</SectionHeading>
            <div className={`grid grid-cols-2 sm:grid-cols-3 ${lgCols} gap-3 md:gap-4`}>
              {bestSellers.map(product => {
                const pid = product._id || product.id;
                const salePrice = product.price;
                const origPrice = product.originalPrice;
                const discountPct = origPrice && origPrice > salePrice
                  ? Math.round(((origPrice - salePrice) / origPrice) * 100)
                  : 0;
                return (
                  <BestSellersCard
                    key={pid}
                    brand={product.brand}
                    productName={product.name}
                    image={getImageUrl(product.images?.[0] || '')}
                    rating={product.rating || 0}
                    reviewCount={product.reviewCount || 0}
                    discountedPrice={salePrice}
                    originalPrice={origPrice}
                    discountPercent={discountPct}
                    product={product}
                    productUrl={`/products/${product.slug || pid}`}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}


      {/* ══════════════════════════════════════════════════════════
          PRODUCT GRID — NEW ARRIVALS  (NewArrivalCard + tabs)
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('newArrivals') && newArrivals.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <SectionHeading action={<ViewAllLink to="/products?sort=newest" />}>New Arrivals</SectionHeading>
            <div className={`grid grid-cols-2 sm:grid-cols-3 ${lgCols} gap-3 md:gap-4`}>
              {newArrivals.map(product => {
                const pid = product._id || product.id;
                return (
                  <NewArrivalCard
                    key={pid}
                    brand={product.brand}
                    productName={product.name}
                    image={getImageUrl(product.images?.[0] || '')}
                    sizes={product.sizes || []}
                    price={product.price}
                    category={typeof product.category === 'object' ? product.category?.name : product.category}
                    product={product}
                    productUrl={`/products/${product.slug || pid}`}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          BRAND LOGO STRIP
      ══════════════════════════════════════════════════════════ */}
      {brands.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <SectionHeading center>Top Brands</SectionHeading>
            <div className="relative group/brand">
              <Swiper
                modules={[Navigation]}
                navigation={{ nextEl: '.brand-next', prevEl: '.brand-prev' }}
                spaceBetween={12}
                breakpoints={{ 0: { slidesPerView: 3 }, 640: { slidesPerView: 5 }, 1024: { slidesPerView: 7 } }}
              >
                {brands.map((brand, i) => (
                  <SwiperSlide key={brand._id || i}>
                    <Link
                      to={`/search?q=${brand.name}`}
                      className="h-16 md:h-20 border border-border-minimal flex items-center justify-center hover:border-ink transition-colors bg-surface"
                    >
                      {brand.logo ? (
                        <img src={getImageUrl(brand.logo)} alt={brand.name} className="max-w-full max-h-full object-contain p-3" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xs font-normal uppercase tracking-[0.011em] text-ink text-center px-2 leading-tight">{brand.name}</span>
                      )}
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="brand-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/brand:opacity-100">
                <ArrowLeft className="w-3.5 h-3.5 text-ink" />
              </button>
              <button className="brand-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/brand:opacity-100">
                <ChevronRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          RECENTLY VIEWED  (RecentlyViewedCard — image+name+price only)
      ══════════════════════════════════════════════════════════ */}
      {recentlyViewed.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <SectionHeading action={<span className="text-xs font-normal text-subtle uppercase tracking-[0.011em]">Your Interactions</span>}>Recently Viewed</SectionHeading>
            <div className="relative group/rv">
              <Swiper
                modules={[Navigation]}
                navigation={{ nextEl: '.rv-next', prevEl: '.rv-prev' }}
                spaceBetween={12}
                breakpoints={{ 0: { slidesPerView: 2 }, 640: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 } }}
              >
                {recentlyViewed.slice(0, 6).map(product => {
                  const pid = product._id || product.id;
                  return (
                    <SwiperSlide key={pid}>
                      <RecentlyViewedCard
                        productName={product.name}
                        image={getImageUrl(product.images?.[0] || '')}
                        price={product.price}
                        productUrl={`/products/${product.slug || pid}`}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <button className="rv-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/rv:opacity-100">
                <ArrowLeft className="w-3.5 h-3.5 text-ink" />
              </button>
              <button className="rv-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/rv:opacity-100">
                <ChevronRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('newsletter') && (
        <section className="py-16 bg-ink text-bg">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="w-11 h-11 border border-bg/20 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-4 h-4 text-bg/60" />
            </div>
            <h2 className="font-heading text-2xl font-normal mb-2">Stay in the Loop</h2>
            <p className="text-sm text-bg/50 mb-8 leading-relaxed">Get exclusive deals, new arrivals, and special offers straight to your inbox.</p>
            <form className="flex border border-bg/20 mb-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-transparent text-bg px-5 py-3.5 grow outline-none text-sm placeholder:text-bg/30 border-r border-bg/20 min-w-0"
                required
              />
              <button type="submit" className="bg-bg text-ink px-6 py-3.5 text-[10px] font-normal uppercase tracking-[0.011em] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-bg/30 uppercase tracking-[0.011em]">No spam. Unsubscribe anytime.</p>
          </div>
        </section>
      )}

    </div>
  );
}
