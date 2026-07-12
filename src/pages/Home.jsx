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
  Truck, Shield, RefreshCw, Headphones, Star,
  Smartphone, Play, Gift, ShoppingBag, Package, Tag,
} from 'lucide-react';

const TRUST_ITEMS = [
  { Icon: Truck,      label: 'Free Delivery' },
  { Icon: Shield,     label: 'Secure Payment' },
  { Icon: RefreshCw,  label: 'Easy Returns' },
  { Icon: Headphones, label: '24/7 Support' },
];


const TESTIMONIALS = [
  { name: 'Priya Sharma', rating: 5, text: 'Absolutely love the quality! Fast delivery and great packaging. Will definitely order again.', avatar: 'P' },
  { name: 'Rahul Verma',  rating: 5, text: 'Best online shopping experience. Wide variety, genuine products, and super-fast shipping.', avatar: 'R' },
  { name: 'Anita Roy',    rating: 4, text: 'Smooth checkout process and a very helpful customer support team. Highly recommended!', avatar: 'A' },
];

const ACTIVITIES = [
  { label: 'Hiking',    seed: 'activity-hiking',    link: '/search?q=hiking' },
  { label: 'Climbing',  seed: 'activity-climbing',  link: '/search?q=climbing' },
  { label: 'Camping',   seed: 'activity-camping',   link: '/search?q=camping' },
];

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
  const promoText     = homepageContent.promoStrip || 'Free shipping on orders over ₹999 · Easy returns · New arrivals every week';
  const promoBanners  = homepageContent.promoBanners?.length ? homepageContent.promoBanners : [
    { subtitle: 'New Season',       title: 'Gear Up for the Crag',  cta: 'Shop Now', link: '/products' },
    { subtitle: 'Performance Tech', title: 'Alpine Ready Apparel',   cta: 'Explore',  link: '/products' },
  ];
  const saleEndTime   = flashSale?.endTime || new Date(Date.now() + 86_400_000).toISOString();
  const countdown     = useCountdown(saleEndTime);

  return (
    <div className="bg-bg min-h-screen">

      {/* ══════════════════════════════════════════════════════════
          1. ANNOUNCEMENT BAR
      ══════════════════════════════════════════════════════════ */}
      {announcementOn && (
        <div className="relative bg-ink text-bg py-2.5 text-center">
          <p className="text-xs font-semibold tracking-wide px-10">{promoText}</p>
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
          4. HERO BANNER CAROUSEL  (category slides + 2 static)
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
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-bg/60 mb-3">New Arrival</span>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-bg leading-tight mb-4 max-w-2xl">{cat.name}</h2>
                    <p className="text-sm text-bg/65 mb-8 max-w-sm hidden sm:block">{cat.description || 'Explore the latest collection'}</p>
                    <Link
                      to={cat.slug ? `/c/${cat.slug}` : '/products'}
                      className="inline-flex items-center gap-2 bg-accent text-bg px-8 py-3 text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
                    >
                      Shop Now <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {/* Static Slide 2 — Flash Sale */}
            <SwiperSlide key="hero-flash">
              <div className="relative w-full h-full flex items-center" style={{ background: '#0a0a0a' }}>
                <img
                  src="https://picsum.photos/seed/flash-hero/1920/700"
                  alt="Flash Sale"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 container mx-auto px-6 md:px-16">
                  <span className="block text-xs font-bold uppercase tracking-widest text-red-400 mb-3">⚡ Limited Time Only</span>
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-bg leading-none mb-2">Flash Sale</h2>
                  <p className="text-4xl md:text-6xl font-extrabold text-red-500 mb-6">Upto 50% Off</p>
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
                            <div className="w-14 h-12 md:w-16 md:h-14 bg-red-600 text-bg text-xl md:text-2xl font-bold font-mono flex items-center justify-center">
                              {String(v).padStart(2, '0')}
                            </div>
                            <span className="text-[9px] text-bg/50 uppercase tracking-wider">{u}</span>
                          </div>
                          {i < 2 && <span className="text-2xl font-bold text-bg/60 mb-6">:</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  <Link
                    to="/flash-sale"
                    className="inline-flex items-center gap-2 bg-red-600 text-bg px-8 py-3 text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
                  >
                    Shop Flash Sale <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>

            {/* Static Slide 3 — Brand Campaign: Mammut */}
            <SwiperSlide key="hero-brand">
              <div className="relative w-full h-full bg-surface flex items-center">
                <img
                  src="https://picsum.photos/seed/mammut-brand/1920/700"
                  alt="Mammut Collection"
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-r from-ink/80 via-ink/40 to-transparent" />
                <div className="relative z-10 container mx-auto px-6 md:px-16">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-bg/50 mb-4">New Brand Arrivals</span>
                  <p className="text-sm font-bold uppercase tracking-widest text-bg/70 mb-2">Mammut</p>
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-bg leading-tight mb-2 italic">
                    Built For<br />The Mountain.
                  </h2>
                  <p className="text-sm text-bg/60 mb-8 max-w-sm hidden sm:block">
                    Swiss precision since 1862. Alpine gear engineered for the world's most demanding environments.
                  </p>
                  <Link
                    to="/search?q=mammut"
                    className="inline-flex items-center gap-2 border border-bg text-bg px-8 py-3 text-xs font-bold uppercase tracking-wide hover:bg-bg hover:text-ink transition-colors"
                  >
                    Explore Collection <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          <button className="hero-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-bg/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-bg transition-colors">
            <ArrowLeft className="w-4 h-4 text-ink" />
          </button>
          <button className="hero-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-bg/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-bg transition-colors">
            <ChevronRight className="w-4 h-4 text-ink" />
          </button>
          <div className="hero-dots absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2" />
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          5. TRUST BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="border-y border-border-minimal bg-surface/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border-minimal">
            {TRUST_ITEMS.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-2 py-5 px-4">
                <Icon className="w-5 h-5 text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. CATEGORY ICON GRID
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('categoriesGrid') && categories.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-ink uppercase tracking-wide">Shop by Category</h2>
              <Link to="/products" className="text-xs font-semibold text-accent uppercase tracking-wide flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
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
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-border-minimal group-hover:border-accent transition-colors bg-surface">
                        <img
                          src={cat.image ? getImageUrl(cat.image) : `https://picsum.photos/seed/cat${cat.slug}/200/200`}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink text-center leading-tight">
                        {cat.name}
                      </span>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="cat-prev absolute left-0 top-10 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal shadow flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/cat:opacity-100">
                <ArrowLeft className="w-3.5 h-3.5 text-ink" />
              </button>
              <button className="cat-next absolute right-0 top-10 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal shadow flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/cat:opacity-100">
                <ChevronRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          7. FLASH SALE BAR + PRODUCT ROW  (FlashSaleCard)
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('flashSale') && flashSale && flashProducts.length > 0 && (
        <section className="py-8 bg-surface/30 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-red-600">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-600" />
                <span className="text-sm font-extrabold text-ink uppercase tracking-wide">{flashSale.title || 'Flash Sale'}</span>
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
                        <div className="w-9 h-8 bg-red-600 text-bg text-sm font-bold font-mono flex items-center justify-center">
                          {String(v).padStart(2, '0')}
                        </div>
                        <span className="text-[8px] text-subtle uppercase tracking-wider mt-0.5">{u}</span>
                      </div>
                      {i < 2 && <span className="text-base font-bold text-ink mb-4">:</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
              <Link to="/flash-sale" className="text-xs font-semibold text-red-600 uppercase tracking-wide flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
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
                  return (
                    <SwiperSlide key={pid}>
                      <FlashSaleCard
                        productName={product.name}
                        image={getImageUrl(product.images?.[0] || '')}
                        discountedPrice={salePrice}
                        originalPrice={origPrice}
                        discountPercent={discountPct}
                        soldPercent={(salePrice % 40) + 45}
                        productUrl={`/products/${product.slug || pid}`}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <button className="flash-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal shadow flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/flash:opacity-100">
                <ArrowLeft className="w-3.5 h-3.5 text-ink" />
              </button>
              <button className="flash-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal shadow flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/flash:opacity-100">
                <ChevronRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SPECIAL OFFERS BANNER
      ══════════════════════════════════════════════════════════ */}
      {activeOffers.length > 0 && (
        <section className="py-10 border-b border-border-minimal bg-surface/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-accent" />
                <h2 className="text-base font-bold text-ink uppercase tracking-wide">Special Offers</h2>
              </div>
              <Link to="/offers" className="text-xs font-semibold text-accent uppercase tracking-wide flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOffers.slice(0, 3).map(offer => {
                const ICON_MAP = { buy_x_get_y: ShoppingBag, bundle: Package, under_price: Tag };
                const COLOR_MAP = {
                  buy_x_get_y: 'border-purple-200 bg-purple-50',
                  bundle:      'border-blue-200 bg-blue-50',
                  under_price: 'border-green-200 bg-green-50',
                };
                const BADGE_MAP = { buy_x_get_y: 'bg-purple-600', bundle: 'bg-blue-600', under_price: 'bg-green-600' };
                const Icon = ICON_MAP[offer.type] || Gift;
                const to = offer.type === 'under_price'
                  ? `/products?maxPrice=${offer.maxPrice}`
                  : `/products?offerId=${offer._id}`;
                return (
                  <Link
                    key={offer._id}
                    to={to}
                    className={`border rounded-sm p-6 flex items-start gap-4 hover:shadow-sm transition-all ${COLOR_MAP[offer.type] || 'border-border-minimal bg-surface'}`}
                  >
                    <div className={`w-10 h-10 ${BADGE_MAP[offer.type] || 'bg-ink'} flex items-center justify-center rounded-sm shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-ink/50 mb-0.5">
                        {offer.type === 'buy_x_get_y' ? 'Buy X Get Y' : offer.type === 'bundle' ? 'Bundle Deal' : 'Under Price'}
                      </p>
                      <h3 className="text-[15px] font-bold text-ink leading-tight truncate">{offer.title}</h3>
                      {offer.badge && (
                        <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 ${BADGE_MAP[offer.type] || 'bg-ink'} text-white uppercase tracking-widest rounded-full`}>
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
          SHOP BY ACTIVITY  (3 image cards)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-10 border-b border-border-minimal">
        <div className="container mx-auto px-4">
          <h2 className="text-base font-bold text-ink uppercase tracking-wide mb-6">Shop By Activity</h2>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {ACTIVITIES.map(({ label, seed, link }) => (
              <Link key={label} to={link} className="relative h-44 md:h-64 overflow-hidden group bg-surface">
                <img
                  src={`https://picsum.photos/seed/${seed}/600/400`}
                  alt={label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-lg md:text-xl font-extrabold text-bg leading-none mb-1">{label}</h3>
                  <span className="text-[10px] text-bg/70 uppercase tracking-wide flex items-center gap-0.5">
                    Shop Now <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. PROMOTIONAL BANNERS (dynamic 2–5)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-0">
        {/* First banner — full width */}
        <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden">
          <img
            src={promoBanners[0]?.image ? getImageUrl(promoBanners[0].image) : 'https://picsum.photos/seed/promo-wide/1920/600'}
            alt={promoBanners[0]?.title || 'Promotion'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-ink/45" />
          <div className="absolute bottom-7 left-6 md:left-14">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-bg/60 mb-2">
              {promoBanners[0]?.subtitle || 'Special Offer'}
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-bg mb-4 leading-tight">
              {promoBanners[0]?.title || 'Gear Up For The Crag'}
            </h3>
            <Link
              to={promoBanners[0]?.link || '/products'}
              className="inline-flex items-center gap-2 bg-bg text-ink px-6 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-accent hover:text-bg transition-colors"
            >
              {promoBanners[0]?.cta || 'Shop Now'} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        {/* Remaining banners — responsive grid */}
        {promoBanners.length > 1 && (
          <div className={`grid grid-cols-1 ${promoBanners.length === 2 ? 'md:grid-cols-1' : promoBanners.length === 3 ? 'md:grid-cols-2' : 'md:grid-cols-2'}`}>
            {promoBanners.slice(1).map((banner, i) => (
              <div key={i} className="relative h-56 md:h-72 overflow-hidden group bg-surface">
                <img
                  src={banner.image ? getImageUrl(banner.image) : `https://picsum.photos/seed/promo-${i + 2}/800/600`}
                  alt={banner.title || `Banner ${i + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink/65 via-ink/10 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-bg/60 mb-1">
                    {banner.subtitle || 'New Season'}
                  </span>
                  <h3 className="text-xl font-bold text-bg mb-3 leading-tight">
                    {banner.title || 'Shop Collection'}
                  </h3>
                  <Link
                    to={banner.link || '/products'}
                    className="inline-flex items-center gap-1 bg-bg text-ink px-5 py-2 text-xs font-bold uppercase tracking-wide hover:bg-accent hover:text-bg transition-colors"
                  >
                    {banner.cta || 'Shop Now'} <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          9. PRODUCT GRID — BEST SELLERS  (standard ProductCard)
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('featuredProducts') && bestSellers.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-ink uppercase tracking-wide">Best Sellers</h2>
              <Link to="/products?sort=trending" className="text-xs font-semibold text-accent uppercase tracking-wide flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
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
                    rating={product.rating || 4.2}
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
          11. PRODUCT GRID — NEW ARRIVALS  (NewArrivalCard + tabs)
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('newArrivals') && newArrivals.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink uppercase tracking-wide">New Arrivals</h2>
              <Link to="/products?sort=newest" className="text-xs font-semibold text-accent uppercase tracking-wide flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
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
          12. BRAND LOGO STRIP
      ══════════════════════════════════════════════════════════ */}
      {brands.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <h2 className="text-base font-bold text-ink uppercase tracking-wide text-center mb-6">Top Brands</h2>
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
                      className="h-16 md:h-20 border border-border-minimal flex items-center justify-center hover:border-ink hover:shadow-sm transition-all bg-surface"
                    >
                      {brand.logo ? (
                        <img src={getImageUrl(brand.logo)} alt={brand.name} className="max-w-full max-h-full object-contain p-3" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xs font-bold uppercase tracking-wide text-ink text-center px-2 leading-tight">{brand.name}</span>
                      )}
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="brand-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal shadow flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/brand:opacity-100">
                <ArrowLeft className="w-3.5 h-3.5 text-ink" />
              </button>
              <button className="brand-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal shadow flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/brand:opacity-100">
                <ChevronRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          BRAND CAMPAIGN BANNER — "Shop The Mammut Collection"
      ══════════════════════════════════════════════════════════ */}
      <section className="relative h-60 md:h-80 overflow-hidden border-b border-border-minimal">
        <img
          src="https://picsum.photos/seed/brand-mammut-campaign/1920/600"
          alt="Mammut Collection"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-bg/50 mb-3">Featured Brand</span>
          <p className="text-sm font-bold uppercase tracking-widest text-bg/70 mb-1">Mammut</p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-bg mb-2 leading-tight">
            Shop The Mammut Collection
          </h2>
          <p className="text-xs text-bg/50 mb-6 max-w-sm">
            Swiss precision since 1862 — alpine gear engineered for the world's most demanding environments.
          </p>
          <Link
            to="/search?q=mammut"
            className="inline-flex items-center gap-2 bg-bg text-ink px-8 py-3 text-xs font-bold uppercase tracking-wide hover:bg-accent hover:text-bg transition-colors"
          >
            Explore Collection <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          13. RECENTLY VIEWED  (RecentlyViewedCard — image+name+price only)
      ══════════════════════════════════════════════════════════ */}
      {recentlyViewed.length > 0 && (
        <section className="py-10 border-b border-border-minimal">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-ink uppercase tracking-wide">Recently Viewed</h2>
              <span className="text-xs font-semibold text-subtle uppercase tracking-wide">Your Interactions</span>
            </div>
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
              <button className="rv-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal shadow flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/rv:opacity-100">
                <ArrowLeft className="w-3.5 h-3.5 text-ink" />
              </button>
              <button className="rv-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border-minimal shadow flex items-center justify-center hover:bg-surface transition-all opacity-0 group-hover/rv:opacity-100">
                <ChevronRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          14. TESTIMONIALS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-12 border-b border-border-minimal bg-surface/30">
        <div className="container mx-auto px-4">
          <h2 className="text-base font-bold text-ink uppercase tracking-wide text-center mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ name, rating, text, avatar }) => (
              <div key={name} className="bg-bg border border-border-minimal p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-ink text-bg flex items-center justify-center text-lg font-bold mb-3">{avatar}</div>
                <p className="text-sm font-semibold text-ink mb-1">{name}</p>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-accent fill-current' : 'text-border-minimal'}`} />
                  ))}
                </div>
                <p className="text-xs text-subtle leading-relaxed">"{text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          15. APP DOWNLOAD BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="py-12 border-b border-border-minimal">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink mb-3 leading-tight">Shop Faster on the App</h2>
              <p className="text-sm text-subtle mb-7 max-w-sm leading-relaxed">
                Exclusive app-only deals, faster checkout, and real-time order tracking — all in one place.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button className="flex items-center gap-3 border border-ink px-5 py-3 hover:bg-ink hover:text-bg transition-colors group">
                  <Play className="w-4 h-4 text-ink group-hover:text-bg shrink-0" />
                  <div className="text-left">
                    <div className="text-[9px] font-medium uppercase tracking-wide text-ink group-hover:text-bg">Get it on</div>
                    <div className="text-xs font-bold text-ink group-hover:text-bg">Google Play</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 border border-ink px-5 py-3 hover:bg-ink hover:text-bg transition-colors group">
                  <Smartphone className="w-4 h-4 text-ink group-hover:text-bg shrink-0" />
                  <div className="text-left">
                    <div className="text-[9px] font-medium uppercase tracking-wide text-ink group-hover:text-bg">Download on the</div>
                    <div className="text-xs font-bold text-ink group-hover:text-bg">App Store</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="w-40 h-72 md:w-48 md:h-80 rounded-3xl border-4 border-border-minimal overflow-hidden bg-surface shadow-lg">
                <img src="https://picsum.photos/seed/app-mockup/300/600" alt="App preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          16. NEWSLETTER
      ══════════════════════════════════════════════════════════ */}
      {isSectionEnabled('newsletter') && (
        <section className="py-16 bg-ink text-bg">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="w-11 h-11 border border-bg/20 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-4 h-4 text-bg/60" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2">Stay in the Loop</h2>
            <p className="text-sm text-bg/50 mb-8 leading-relaxed">Get exclusive deals, new arrivals, and special offers straight to your inbox.</p>
            <form className="flex border border-bg/20 mb-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-transparent text-bg px-5 py-3.5 grow outline-none text-sm placeholder:text-bg/30 border-r border-bg/20 min-w-0"
                required
              />
              <button type="submit" className="bg-bg text-ink px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap shrink-0">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-bg/30 uppercase tracking-widest">No spam. Unsubscribe anytime.</p>
          </div>
        </section>
      )}

    </div>
  );
}
