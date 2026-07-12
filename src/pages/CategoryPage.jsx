import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storefrontService } from '../services/storefront';
import { getImageUrl } from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppearance } from '../context/AppearanceContext';

export default function CategoryPage() {
  const { category: catSlug, subcategory: subSlug, child: childSlug } = useParams();
  const navigate = useNavigate();

  const [tree, setTree]         = useState([]);       // full category tree
  const [products, setProducts] = useState([]);
  const [facets, setFacets]     = useState({});
  const [loading, setLoading]   = useState(true);
  const { gridCols } = useAppearance();
  const lgCols = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[gridCols] || 'lg:grid-cols-4';

  // resolve nodes from the tree
  const catNode   = tree.find(c => c.slug === catSlug);
  const subNode   = catNode?.subCategories?.find(s => s.slug === subSlug);
  const childNode = subNode?.subCategories?.find(c => c.slug === childSlug);

  // the most-specific active node
  const activeNode = childNode || subNode || catNode;
  // the slug to actually query by (most specific)
  const activeSlug = childSlug || subSlug || catSlug;

  useEffect(() => {
    storefrontService.getCategories()
      .then(r => setTree(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!catSlug) return;
    setLoading(true);
    storefrontService.getProducts({ categorySlug: activeSlug, limit: 40 })
      .then(r => {
        setProducts(r.data || []);
        if (r.facets) setFacets(r.facets);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catSlug, subSlug, childSlug]);

  const displayName = activeNode?.name || catSlug;

  return (
    <div className="bg-bg min-h-screen pb-32">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative h-[240px] lg:h-[380px] overflow-hidden bg-ink">
        <img
          src={
            catNode?.image
              ? getImageUrl(catNode.image)
              : `https://picsum.photos/seed/${catSlug}/1600/600?grayscale`
          }
          alt={displayName}
          className="w-full h-full object-cover opacity-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-12 text-center px-6">
          <div>
            <h1 className="text-4xl lg:text-6xl font-light text-white tracking-tight uppercase mb-4">
              {displayName}
            </h1>
            {activeNode?.description && (
              <p className="text-white/60 text-sm max-w-lg mx-auto mb-4">{activeNode.description}</p>
            )}
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-white/60 text-[11px] font-bold uppercase tracking-widest">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              {catNode && (
                <Link to={`/c/${catSlug}`} className="hover:text-white transition-colors">
                  {catNode.name}
                </Link>
              )}
              {subNode && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <Link to={`/c/${catSlug}/${subSlug}`} className="hover:text-white transition-colors">
                    {subNode.name}
                  </Link>
                </>
              )}
              {childNode && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-white">{childNode.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-10 mt-12">

        {/* ── Subcategory quick-nav ────────────────────────────────────── */}
        {!subSlug && catNode?.subCategories?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-subtle mb-4">Browse by subcategory</h2>
            <div className="flex flex-wrap gap-2">
              {catNode.subCategories.map(sub => (
                <Link
                  key={sub._id}
                  to={`/c/${catSlug}/${sub.slug}`}
                  className="px-4 py-2 border border-border-minimal text-[13px] font-medium text-ink hover:bg-ink hover:text-white transition-all"
                >
                  {sub.name}
                  {sub.subCategories?.length > 0 && (
                    <span className="ml-2 text-subtle text-[11px]">({sub.subCategories.length})</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Child subcategory quick-nav when at sub level */}
        {subSlug && !childSlug && subNode?.subCategories?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-subtle mb-4">Narrow by type</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/c/${catSlug}/${subSlug}`}
                className="px-4 py-2 border border-ink bg-ink text-white text-[13px] font-medium"
              >
                All {subNode.name}
              </Link>
              {subNode.subCategories.map(child => (
                <Link
                  key={child._id}
                  to={`/c/${catSlug}/${subSlug}/${child.slug}`}
                  className={cn(
                    'px-4 py-2 border border-border-minimal text-[13px] font-medium text-ink hover:bg-ink hover:text-white transition-all',
                    childSlug === child.slug && 'bg-ink text-white border-ink'
                  )}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Header row ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-[26px] font-light text-ink tracking-tight">
              {childSlug ? childNode?.name : subSlug ? `All ${subNode?.name}` : `Explore ${catNode?.name}`}
            </h2>
            <p className="text-subtle text-[13px] font-medium mt-1">
              {loading ? '…' : `${products.length} products`}
            </p>
          </div>
          <Link
            to={`/products?categorySlug=${activeSlug}`}
            className="hidden md:flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-subtle hover:text-ink transition-colors border-b border-subtle hover:border-ink pb-0.5"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filter & Sort
          </Link>
        </div>

        {/* ── Products grid ─────────────────────────────────────────────── */}
        {loading ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-8 animate-pulse`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square bg-surface mb-3" />
                <div className="h-3 bg-surface rounded w-1/3 mb-2" />
                <div className="h-4 bg-surface rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-8`}>
            {products.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-border-minimal">
            <p className="text-subtle text-[14px] mb-4">No products in this category yet.</p>
            <Link
              to="/products"
              className="inline-block border border-ink px-8 py-3 text-[12px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* ── Related categories ───────────────────────────────────────── */}
        {!loading && products.length > 0 && catNode?.subCategories?.length > 0 && (
          <div className="mt-24 pt-16 border-t border-border-minimal">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-subtle mb-6">
              More in {catNode.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {catNode.subCategories
                .filter(s => s.slug !== subSlug)
                .slice(0, 4)
                .map(sub => (
                  <Link
                    key={sub._id}
                    to={`/c/${catSlug}/${sub.slug}`}
                    className="group relative h-40 bg-surface overflow-hidden"
                  >
                    <img
                      src={`https://picsum.photos/seed/${sub.slug}/400/320?grayscale`}
                      alt={sub.name}
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white/90 border border-border-minimal px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-ink">
                        {sub.name}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
