import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, ArrowRight, Gift } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAppearance } from '../../context/AppearanceContext';
import { useWishlist } from '../../context/WishlistContext';
import { storefrontService } from '../../services/storefront';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [mobileOpenCat, setMobileOpenCat] = useState(null);
  const [mobileOpenSub, setMobileOpenSub] = useState(null);
  const [categories, setCategories]       = useState([]);
  const megaMenuTimer                     = useRef(null);

  const { cartCount }    = useCart();
  const { user }         = useAuth();
  const { wishlist }     = useWishlist();
  const { headerConfig, logo, storeName } = useAppearance();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isSticky       = headerConfig.sticky !== false;
  const showCategoryBar = headerConfig.categoryBar !== false;

  // ── Fetch categories from API on mount ────────────────────────────────────
  useEffect(() => {
    storefrontService.getCategories()
      .then(r => setCategories(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Debounced hover so mega menu doesn't flicker
  const handleCatEnter = (catId) => {
    clearTimeout(megaMenuTimer.current);
    setActiveMegaMenu(catId);
  };
  const handleCatLeave = () => {
    megaMenuTimer.current = setTimeout(() => setActiveMegaMenu(null), 120);
  };

  const toggleMobileCat = (catId) => {
    setMobileOpenCat(prev => prev === catId ? null : catId);
    setMobileOpenSub(null);
  };
  const toggleMobileSub = (subId, e) => {
    e.stopPropagation();
    setMobileOpenSub(prev => prev === subId ? null : subId);
  };

  return (
    <nav className={cn('bg-bg border-b border-border-minimal z-50', isSticky ? 'sticky top-0' : 'relative')}>

      {/* ── Promo Strip ──────────────────────────────────────────────────── */}
      <div className="bg-promo text-[#c53030] text-center py-2 text-[11px] font-semibold uppercase tracking-[0.15em] border-b border-border-minimal">
        Free delivery on orders over ৳500 · New arrivals every week · Easy returns
      </div>

      {/* ── Main Header ──────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-[72px] gap-6">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            {logo
              ? <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
              : <span className="text-[20px] font-extrabold tracking-tight text-ink uppercase">{storeName}</span>
            }
          </Link>

          {/* Search — Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex grow max-w-2xl relative">
            <input
              type="text"
              placeholder="Search books, authors, categories…"
              className="w-full bg-surface border border-border-minimal rounded-[4px] py-2.5 px-5 pl-12 focus:border-accent transition-all outline-none text-sm text-ink"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle w-4 h-4" />
          </form>

          {/* Icon row */}
          <div className="flex items-center gap-6">
            <Link to="/account/wishlist" className="text-ink hover:text-subtle transition-colors relative">
              <Heart className="w-[20px] h-[20px]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.25 -right-2 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[10px] min-w-5 text-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to={user ? '/account' : '/login'} className="text-ink hover:text-subtle transition-colors flex items-center gap-2">
              <User className="w-[20px] h-[20px]" />
              {user && <span className="hidden lg:inline text-[13px] font-medium">{user.name}</span>}
            </Link>
            <Link to="/cart" className="text-ink hover:text-subtle transition-colors relative">
              <ShoppingCart className="w-[20px] h-[20px]" />
              {cartCount > 0 && (
                <span className="absolute -top-[5px] -right-[8px] bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[10px] min-w-[20px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="md:hidden text-ink" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Bar — Desktop ────────────────────────────────────────── */}
      {showCategoryBar && (
        <div className="hidden md:block border-t border-border-minimal">
          {/* relative here so mega menu is positioned against this container */}
          <div className="container mx-auto px-4 relative">

            {/* single row — no wrapping */}
            <ul className="flex items-center overflow-x-auto no-scrollbar">

              <li className="shrink-0">
                <Link
                  to="/products"
                  className="flex items-center px-3 py-2 text-[12px] font-medium text-subtle hover:text-ink transition-colors border-b-2 border-transparent hover:border-accent whitespace-nowrap"
                >
                  All Books
                </Link>
              </li>

              <li className="shrink-0">
                <Link
                  to="/offers"
                  className="flex items-center gap-1 px-3 py-2 text-[12px] font-medium text-accent hover:text-ink transition-colors border-b-2 border-transparent hover:border-accent whitespace-nowrap"
                >
                  <Gift className="w-3 h-3" /> Offers
                </Link>
              </li>

              {categories.map(cat => (
                <li
                  key={cat._id}
                  className="flex items-center shrink-0"
                  onMouseEnter={() => handleCatEnter(cat._id)}
                  onMouseLeave={handleCatLeave}
                >
                  <Link
                    to={`/c/${cat.slug}`}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-[12px] font-medium text-subtle hover:text-ink transition-colors border-b-2 whitespace-nowrap',
                      activeMegaMenu === cat._id ? 'text-ink border-accent' : 'border-transparent'
                    )}
                  >
                    {cat.name}
                    {cat.subCategories?.length > 0 && (
                      <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', activeMegaMenu === cat._id && 'rotate-180')} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* ── Mega Menu — outside <ul> so it spans the full container width ── */}
            {(() => {
              const megaCat = categories.find(c => c._id === activeMegaMenu);
              if (!megaCat?.subCategories?.length) return null;
              const cols = megaCat.subCategories.length > 12
                ? 4
                : megaCat.subCategories.length > 6
                  ? 3
                  : 2;
              return (
                <div
                  className="absolute left-0 right-0 top-full bg-bg border border-border-minimal shadow-2xl z-50"
                  onMouseEnter={() => handleCatEnter(megaCat._id)}
                  onMouseLeave={handleCatLeave}
                >
                  <div className="flex gap-8 p-8">

                    {/* Subcategory grid — scrollable for large lists */}
                    <div
                      className="flex-1 grid gap-x-10 gap-y-5 overflow-y-auto"
                      style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        maxHeight: '65vh',
                      }}
                    >
                      {megaCat.subCategories.map(sub => (
                        <div key={sub._id}>
                          <Link
                            to={`/c/${megaCat.slug}/${sub.slug}`}
                            className="font-bold text-[11px] uppercase tracking-widest text-ink mb-2 block hover:text-accent transition-colors leading-snug"
                            onClick={() => setActiveMegaMenu(null)}
                          >
                            {sub.name}
                          </Link>
                          {sub.subCategories?.length > 0 && (
                            <ul className="space-y-1.5">
                              {sub.subCategories.map(child => (
                                <li key={child._id}>
                                  <Link
                                    to={`/c/${megaCat.slug}/${sub.slug}/${child.slug}`}
                                    className="text-[13px] text-subtle hover:text-ink transition-colors flex items-center gap-1.5"
                                    onClick={() => setActiveMegaMenu(null)}
                                  >
                                    <span className="w-1 h-1 rounded-full bg-border-minimal inline-block shrink-0" />
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Featured image column */}
                    <div className="w-48 flex flex-col gap-4 shrink-0">
                      <div className="relative overflow-hidden aspect-3/4 bg-surface rounded-sm">
                        <img
                          src={`https://picsum.photos/seed/${megaCat.slug}/400/600?grayscale`}
                          alt={megaCat.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                          <span className="text-white font-bold text-xs uppercase tracking-wider leading-tight">{megaCat.name}</span>
                        </div>
                      </div>
                      <Link
                        to={`/c/${megaCat.slug}`}
                        className="text-[11px] font-bold uppercase tracking-widest border-b border-ink pb-1 self-start hover:text-accent hover:border-accent transition-colors"
                        onClick={() => setActiveMegaMenu(null)}
                      >
                        Browse All →
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-60 md:hidden"
            />

            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-100 bg-bg z-70 shadow-2xl flex flex-col md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-minimal">
                <span className="text-[14px] font-bold uppercase tracking-[0.2em] text-ink">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-surface transition-colors">
                  <X className="w-5 h-5 text-ink" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="grow overflow-y-auto">
                <div className="p-6 space-y-8">

                  {/* Mobile search */}
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      placeholder="Search books, authors…"
                      className="w-full bg-surface border border-border-minimal rounded-sm py-3 px-5 pl-11 text-[13px] outline-none focus:border-accent"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle w-4 h-4" />
                  </form>

                  {/* Category list */}
                  <div>
                    <h3 className="text-[10px] font-bold text-subtle uppercase tracking-[0.2em] mb-4">Categories</h3>
                    <ul className="space-y-0">

                      <li>
                        <Link
                          to="/products"
                          className="text-[15px] font-medium text-ink block py-2.5 border-b border-border-minimal"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          All Products
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/offers"
                          className="text-[15px] font-medium text-accent flex items-center gap-2 py-2.5 border-b border-border-minimal"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Gift className="w-4 h-4" /> Offers
                        </Link>
                      </li>

                      {categories.map(cat => (
                        <li key={cat._id} className="border-b border-border-minimal">
                          {/* Top-level category row */}
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/c/${cat.slug}`}
                              className="text-[15px] font-medium text-ink py-2.5 grow"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {cat.icon} {cat.name}
                            </Link>
                            {cat.subCategories?.length > 0 && (
                              <button
                                onClick={() => toggleMobileCat(cat._id)}
                                className="p-2 text-subtle hover:text-ink"
                              >
                                <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', mobileOpenCat === cat._id && 'rotate-180')} />
                              </button>
                            )}
                          </div>

                          {/* Subcategory accordion */}
                          <AnimatePresence>
                            {mobileOpenCat === cat._id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 pb-3 space-y-1">
                                  {cat.subCategories.map(sub => (
                                    <div key={sub._id}>
                                      {/* Subcategory row */}
                                      <div className="flex items-center justify-between">
                                        <Link
                                          to={`/c/${cat.slug}/${sub.slug}`}
                                          className="text-[13px] font-bold uppercase tracking-widest text-ink py-2 grow hover:text-accent transition-colors"
                                          onClick={() => setIsMenuOpen(false)}
                                        >
                                          {sub.name}
                                        </Link>
                                        {sub.subCategories?.length > 0 && (
                                          <button
                                            onClick={e => toggleMobileSub(sub._id, e)}
                                            className="p-2 text-subtle hover:text-ink"
                                          >
                                            <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', mobileOpenSub === sub._id && 'rotate-180')} />
                                          </button>
                                        )}
                                      </div>

                                      {/* Child subcategory list */}
                                      <AnimatePresence>
                                        {mobileOpenSub === sub._id && sub.subCategories?.length > 0 && (
                                          <motion.ul
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="overflow-hidden pl-3 space-y-1.5 pb-2"
                                          >
                                            {sub.subCategories.map(child => (
                                              <li key={child._id}>
                                                <Link
                                                  to={`/c/${cat.slug}/${sub.slug}/${child.slug}`}
                                                  className="text-[13px] text-subtle hover:text-ink transition-colors flex items-center gap-2"
                                                  onClick={() => setIsMenuOpen(false)}
                                                >
                                                  <span className="w-1 h-1 rounded-full bg-subtle/40 inline-block shrink-0" />
                                                  {child.name}
                                                </Link>
                                              </li>
                                            ))}
                                          </motion.ul>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  ))}

                                  <Link
                                    to={`/c/${cat.slug}`}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-accent mt-2"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    View All {cat.name} <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      ))}

                    </ul>
                  </div>

                  {/* User links */}
                  <div className="border-t border-border-minimal pt-6 space-y-4">
                    <h3 className="text-[10px] font-bold text-subtle uppercase tracking-[0.2em]">Account</h3>
                    <Link to="/account" className="flex items-center gap-3 text-[14px] font-medium text-ink" onClick={() => setIsMenuOpen(false)}>
                      <User className="w-4 h-4" /> My Account
                    </Link>
                    <Link to="/account/wishlist" className="flex items-center gap-3 text-[14px] font-medium text-ink" onClick={() => setIsMenuOpen(false)}>
                      <Heart className="w-4 h-4" /> Wishlist
                      {wishlist.length > 0 && (
                        <span className="ml-auto bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[10px] min-w-5 text-center">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center gap-3 text-[14px] font-bold text-white bg-ink px-4 py-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4" /> Bag ({cartCount})
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface border-t border-border-minimal">
                <p className="text-[10px] text-subtle uppercase tracking-widest font-bold text-center">
                  {storeName} © {new Date().getFullYear()}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
