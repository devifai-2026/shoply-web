import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { storefrontService } from '../services/storefront';
import ProductCard from '../components/product/ProductCard';
import { Filter, ChevronDown, SlidersHorizontal, X, ChevronRight, Gift, ShoppingBag, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppearance } from '../context/AppearanceContext';
import { motion, AnimatePresence } from 'motion/react';
import { useActiveOffer } from '../lib/useActiveOffer';

// Builds a windowed page-number list (current page ±1, plus first/last),
// with '…' markers for gaps — keeps the pagination bar's width bounded
// regardless of how many total pages exist.
function getPaginationRange(current, total) {
  const delta = 1;
  const range = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  const withEllipses = [];
  let prev = null;
  for (const p of range) {
    if (prev !== null && p - prev > 1) withEllipses.push('…');
    withEllipses.push(p);
    prev = p;
  }
  return withEllipses;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border-minimal pb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-4"
      >
        <span className="font-normal text-ink uppercase tracking-[0.011em] text-[11px]">{title}</span>
        <ChevronDown className={cn('w-4 h-4 text-subtle transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && children}
    </div>
  );
}

function CheckPill({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-0.5">
      <div className="relative flex items-center shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 border border-border-minimal rounded-[4px] checked:bg-accent checked:border-accent appearance-none transition-all"
        />
        {checked && (
          <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-medium pointer-events-none">✓</span>
        )}
      </div>
      <span className="text-[13px] text-subtle group-hover:text-ink transition-colors leading-tight">{label}</span>
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { formatPrice, gridCols } = useAppearance();
  const activeOffer = useActiveOffer();
  const lgCols = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[gridCols] || 'lg:grid-cols-4';

  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [facets, setFacets]         = useState({ sizes: [], colors: [], brands: [], minPrice: 0, maxPrice: 9999 });
  const [categories, setCategories] = useState([]);   // full tree
  const [loading, setLoading]       = useState(true);

  // Price range local state (slider hasn't committed yet)
  const [priceRange, setPriceRange] = useState([0, 9999]);
  const priceCommitTimer            = useRef(null);

  // ── Read filters from URL ─────────────────────────────────────────────────
  const categorySlug  = searchParams.get('categorySlug') || '';
  const subcatSlug    = searchParams.get('subcatSlug')   || '';
  const childSlug     = searchParams.get('childSlug')    || '';
  const selectedBrands = (searchParams.get('brand') || '').split(',').filter(Boolean);
  const selectedSizes  = (searchParams.get('size')  || '').split(',').filter(Boolean);
  const selectedColors = (searchParams.get('color') || '').split(',').filter(Boolean);
  const minPrice       = searchParams.get('minPrice') || '';
  const maxPrice       = searchParams.get('maxPrice') || '';
  const inStock        = searchParams.get('inStock') === 'true';
  const sortBy         = searchParams.get('sort') || 'newest';
  const page           = searchParams.get('page') || '1';

  // Determine the active slug to actually filter by (most specific wins)
  const activeSlug = childSlug || subcatSlug || categorySlug;

  // ── Load category tree once ───────────────────────────────────────────────
  useEffect(() => {
    storefrontService.getCategories().then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  // ── Sync price range state with URL ───────────────────────────────────────
  useEffect(() => {
    setPriceRange([
      minPrice ? Number(minPrice) : facets.minPrice,
      maxPrice ? Number(maxPrice) : facets.maxPrice,
    ]);
  }, [minPrice, maxPrice, facets.minPrice, facets.maxPrice]);

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { sort: sortBy, page };
    if (activeSlug)            params.categorySlug = activeSlug;
    if (selectedBrands.length) params.brand        = selectedBrands.join(',');
    if (selectedSizes.length)  params.size         = selectedSizes.join(',');
    if (selectedColors.length) params.color        = selectedColors.join(',');
    if (minPrice)              params.minPrice     = minPrice;
    if (maxPrice)              params.maxPrice     = maxPrice;
    if (inStock)               params.inStock      = 'true';

    storefrontService.getProducts(params)
      .then(r => {
        setProducts(r.data || []);
        setPagination(r.pagination);
        if (r.facets) setFacets(r.facets);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeSlug, selectedBrands.join(','), selectedSizes.join(','), selectedColors.join(','), minPrice, maxPrice, inStock, sortBy, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── URL setters ───────────────────────────────────────────────────────────
  const setParam = (key, value) =>
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      if (key !== 'page') prev.delete('page');
      return prev;
    });

  const toggleMulti = (key, value) => {
    const current = (searchParams.get(key) || '').split(',').filter(Boolean);
    const next    = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setParam(key, next.join(','));
  };

  const selectCategory = (slug) => {
    setSearchParams(prev => {
      prev.set('categorySlug', slug);
      prev.delete('subcatSlug');
      prev.delete('childSlug');
      prev.delete('page');
      return prev;
    });
  };

  const selectSubcat = (catSlug, subSlug) => {
    setSearchParams(prev => {
      prev.set('categorySlug', catSlug);
      prev.set('subcatSlug', subSlug);
      prev.delete('childSlug');
      prev.delete('page');
      return prev;
    });
  };

  const selectChild = (catSlug, subSlug, cSlug) => {
    setSearchParams(prev => {
      prev.set('categorySlug', catSlug);
      prev.set('subcatSlug', subSlug);
      prev.set('childSlug', cSlug);
      prev.delete('page');
      return prev;
    });
  };

  const clearFilters = () => setSearchParams({});

  // Price slider commit (debounced 400ms)
  const commitPrice = (range) => {
    clearTimeout(priceCommitTimer.current);
    priceCommitTimer.current = setTimeout(() => {
      setSearchParams(prev => {
        prev.set('minPrice', range[0]);
        prev.set('maxPrice', range[1]);
        return prev;
      });
    }, 400);
  };

  // ── Derived display state ─────────────────────────────────────────────────
  const activeCategory = categories.find(c => c.slug === categorySlug);
  const activeSub      = activeCategory?.subCategories?.find(s => s.slug === subcatSlug);
  const activeChild    = activeSub?.subCategories?.find(c => c.slug === childSlug);

  const activeLabel = activeChild?.name || activeSub?.name || activeCategory?.name || 'All Products';

  const hasFilters = categorySlug || subcatSlug || childSlug ||
    selectedBrands.length || selectedSizes.length ||
    selectedColors.length || minPrice || maxPrice || inStock;

  // ── Sidebar (shared between desktop and mobile) ───────────────────────────
  const Sidebar = (
    <div className="space-y-6">

      {/* Categories */}
      <FilterSection title="Categories" defaultOpen>
        <div className="space-y-1">
          <button
            onClick={clearFilters}
            className={cn('w-full text-left text-[13px] py-0.5 transition-colors', !categorySlug ? 'text-ink font-medium' : 'text-subtle hover:text-ink')}
          >
            All Products
          </button>

          {categories.map(cat => (
            <div key={cat._id}>
              <button
                onClick={() => selectCategory(cat.slug)}
                className={cn(
                  'w-full text-left text-[13px] py-0.5 transition-colors flex items-center justify-between group',
                  categorySlug === cat.slug && !subcatSlug ? 'text-ink font-medium' : 'text-subtle hover:text-ink'
                )}
              >
                <span>{cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name}</span>
                {cat.subCategories?.length > 0 && <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100" />}
              </button>

              {/* Subcategories — show when parent is selected */}
              {categorySlug === cat.slug && cat.subCategories?.length > 0 && (
                <div className="pl-3 mt-1 space-y-1 border-l border-border-minimal ml-1">
                  {cat.subCategories.map(sub => (
                    <div key={sub._id}>
                      <button
                        onClick={() => selectSubcat(cat.slug, sub.slug)}
                        className={cn(
                          'w-full text-left text-[12px] py-0.5 transition-colors flex items-center justify-between group',
                          subcatSlug === sub.slug && !childSlug ? 'text-ink font-medium' : 'text-subtle hover:text-ink'
                        )}
                      >
                        <span>{sub.name}</span>
                        {sub.subCategories?.length > 0 && <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100" />}
                      </button>

                      {/* Child subcategories — show when sub is selected */}
                      {subcatSlug === sub.slug && sub.subCategories?.length > 0 && (
                        <div className="pl-3 mt-1 space-y-1 border-l border-border-minimal ml-1">
                          {sub.subCategories.map(child => (
                            <button
                              key={child._id}
                              onClick={() => selectChild(cat.slug, sub.slug, child.slug)}
                              className={cn(
                                'w-full text-left text-[12px] py-0.5 transition-colors',
                                childSlug === child.slug ? 'text-ink font-medium' : 'text-subtle hover:text-ink'
                              )}
                            >
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen>
        <CheckPill
          label="In Stock Only"
          checked={inStock}
          onChange={() => setParam('inStock', inStock ? '' : 'true')}
        />
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" defaultOpen>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={facets.minPrice}
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={e => {
                const v = [Number(e.target.value), priceRange[1]];
                setPriceRange(v);
                commitPrice(v);
              }}
              className="w-full border border-border-minimal rounded-sm px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
              placeholder="Min"
            />
            <span className="text-subtle text-sm shrink-0">—</span>
            <input
              type="number"
              min={priceRange[0]}
              max={facets.maxPrice}
              value={priceRange[1]}
              onChange={e => {
                const v = [priceRange[0], Number(e.target.value)];
                setPriceRange(v);
                commitPrice(v);
              }}
              className="w-full border border-border-minimal rounded-sm px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
              placeholder="Max"
            />
          </div>
          <div className="flex justify-between text-[11px] text-subtle font-medium">
            <span>{formatPrice(facets.minPrice, 0)}</span>
            <span>{formatPrice(facets.maxPrice, 0)}</span>
          </div>
        </div>
      </FilterSection>

      {/* Brands */}
      {facets.brands.length > 0 && (
        <FilterSection title="Brand" defaultOpen>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {facets.brands.map(brand => (
              <CheckPill
                key={brand}
                label={brand}
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleMulti('brand', brand)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sizes */}
      {facets.sizes.length > 0 && (
        <FilterSection title="Size" defaultOpen>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map(size => (
              <button
                key={size}
                onClick={() => toggleMulti('size', size)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all',
                  selectedSizes.includes(size)
                    ? 'border-accent bg-accent text-white'
                    : 'border-border-minimal text-subtle hover:border-ink hover:text-ink'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {facets.colors.length > 0 && (
        <FilterSection title="Color" defaultOpen>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {facets.colors.map(color => (
              <CheckPill
                key={color}
                label={color}
                checked={selectedColors.includes(color)}
                onChange={() => toggleMulti('color', color)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-[12px] font-normal uppercase tracking-[0.011em] text-ink border border-ink rounded-[4px] py-2 hover:bg-ink hover:text-white transition-all"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-bg min-h-screen pb-20">

      {/* Page header */}
      <div className="bg-surface border-b border-border-minimal py-10">
        <div className="container mx-auto px-10">
          {/* Breadcrumb */}
          {categorySlug && (
            <div className="flex items-center gap-2 text-[11px] text-subtle font-normal uppercase tracking-[0.011em] mb-4">
              <button onClick={clearFilters} className="hover:text-ink transition-colors">All</button>
              {activeCategory && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <button onClick={() => selectCategory(activeCategory.slug)} className="hover:text-ink transition-colors">
                    {activeCategory.name}
                  </button>
                </>
              )}
              {activeSub && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <button onClick={() => selectSubcat(activeCategory.slug, activeSub.slug)} className="hover:text-ink transition-colors">
                    {activeSub.name}
                  </button>
                </>
              )}
              {activeChild && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-ink">{activeChild.name}</span>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div>
              <h1 className="font-heading text-[32px] font-normal tracking-tight text-ink mb-1">{activeLabel}</h1>
              <p className="text-subtle text-sm font-normal">
                {loading ? 'Loading…' : `${pagination?.total ?? products.length} products`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Active filter chips */}
              <div className="hidden md:flex flex-wrap gap-2">
                {selectedBrands.map(b => (
                  <span key={b} className="flex items-center gap-1.5 bg-ink text-white text-[11px] font-normal uppercase tracking-[0.011em] rounded-full px-3 py-1">
                    {b}
                    <button onClick={() => toggleMulti('brand', b)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {selectedSizes.map(s => (
                  <span key={s} className="flex items-center gap-1.5 bg-ink text-white text-[11px] font-normal uppercase tracking-[0.011em] rounded-full px-3 py-1">
                    {s}
                    <button onClick={() => toggleMulti('size', s)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {selectedColors.map(c => (
                  <span key={c} className="flex items-center gap-1.5 bg-ink text-white text-[11px] font-normal uppercase tracking-[0.011em] rounded-full px-3 py-1">
                    {c}
                    <button onClick={() => toggleMulti('color', c)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {inStock && (
                  <span className="flex items-center gap-1.5 bg-ink text-white text-[11px] font-normal uppercase tracking-[0.011em] rounded-full px-3 py-1">
                    In Stock
                    <button onClick={() => setParam('inStock', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 border border-border-minimal rounded-[4px] px-4 py-2 font-normal text-[12px] uppercase tracking-[0.011em]"
              >
                <Filter className="w-4 h-4" /> Filters
                {hasFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
              </button>

              <div className="relative min-w-45">
                <select
                  value={sortBy}
                  onChange={e => setParam('sort', e.target.value)}
                  className="w-full appearance-none bg-surface border border-border-minimal rounded-[4px] px-4 py-2 font-normal text-[13px] outline-none focus:border-accent cursor-pointer text-ink"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-10 mt-10">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">{Sidebar}</aside>

          {/* Product grid */}
          <div className="grow">

            {/* Active offer banner — neutral treatment, icon-differentiated (matches Home.jsx Special Offers) */}
            {activeOffer && (() => {
              const ICON_MAP = { buy_x_get_y: ShoppingBag, bundle: Package };
              const Icon = ICON_MAP[activeOffer.type];
              if (!Icon) return null;
              const desc = activeOffer.type === 'buy_x_get_y'
                ? `Buy ${activeOffer.buyQty}, get ${activeOffer.getQty} absolutely free — applied automatically when you add to cart.`
                : `Add any ${activeOffer.bundleCount} items and pay only ₹${activeOffer.bundlePrice} — discount applied at checkout.`;
              return (
                <div className="flex items-start gap-4 border border-border-minimal bg-surface rounded-[4px] p-4 mb-8">
                  <div className="w-10 h-10 bg-ink flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-ink">{activeOffer.title}</p>
                    <p className="text-[12px] mt-0.5 text-subtle">{desc}</p>
                  </div>
                  {activeOffer.badge && (
                    <span className="ml-auto shrink-0 text-[10px] font-normal px-2.5 py-1 rounded-[4px] bg-ink text-white uppercase tracking-[0.011em]">
                      {activeOffer.badge}
                    </span>
                  )}
                </div>
              );
            })()}

            {loading ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-x-6 gap-y-12`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-surface mb-3" />
                    <div className="h-3 bg-surface rounded w-1/3 mb-2" />
                    <div className="h-4 bg-surface rounded w-2/3 mb-2" />
                    <div className="h-4 bg-surface rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-x-6 gap-y-12`}>
                  {products.map(product => (
                    <ProductCard key={product._id || product.id} product={product} activeOffer={activeOffer} />
                  ))}
                </div>

                {/* Pagination — windowed around the current page (current ±1, plus
                    first/last) with ellipses, so page-number buttons never
                    overflow the viewport regardless of total page count. */}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2 overflow-x-auto max-w-full px-2">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => { setParam('page', pagination.page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="shrink-0 w-10 h-10 rounded-[4px] text-[13px] font-normal border border-border-minimal bg-surface text-subtle hover:border-ink hover:text-ink transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ‹
                    </button>
                    {getPaginationRange(pagination.page, pagination.pages).map((p, idx) =>
                      p === '…' ? (
                        <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-[13px] text-subtle shrink-0">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => { setParam('page', p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={cn(
                            'shrink-0 w-10 h-10 rounded-[4px] text-[13px] font-normal border transition-all',
                            pagination.page === p
                              ? 'bg-ink text-white border-ink'
                              : 'border-border-minimal bg-surface text-subtle hover:border-ink hover:text-ink'
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => { setParam('page', pagination.page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="shrink-0 w-10 h-10 rounded-[4px] text-[13px] font-normal border border-border-minimal bg-surface text-subtle hover:border-ink hover:text-ink transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-surface p-20 text-center border border-dashed border-border-minimal rounded-[4px]">
                <SlidersHorizontal className="w-12 h-12 text-subtle mx-auto mb-6" />
                <h3 className="font-heading text-xl font-normal text-ink mb-2 tracking-tight">No products found</h3>
                <p className="text-subtle text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                  Try adjusting or clearing your filters.
                </p>
                <button onClick={clearFilters} className="border border-ink rounded-[4px] px-8 py-3 text-[12px] font-normal uppercase tracking-[0.011em] hover:bg-ink hover:text-white transition-all">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-100 lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="absolute inset-y-0 left-0 w-[85%] max-w-95 bg-bg border-r border-border-minimal flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border-minimal">
                <span className="font-normal text-ink uppercase tracking-[0.011em] text-[13px]">Filters</span>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-ink" />
                </button>
              </div>
              <div className="grow overflow-y-auto p-6 space-y-6">
                {Sidebar}
              </div>
              <div className="p-6 border-t border-border-minimal">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-accent text-white rounded-[4px] py-4 text-[12px] font-normal uppercase tracking-[0.011em]"
                >
                  Show {pagination?.total ?? products.length} Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
