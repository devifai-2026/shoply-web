import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storefrontService } from '../services/storefront';
import { getImageUrl } from '../lib/api';
import { useAppearance } from '../context/AppearanceContext';
import ProductCard from '../components/product/ProductCard';
import { Store, Star, ChevronRight, ChevronLeft, Package } from 'lucide-react';
import { cn } from '../lib/utils';

const PAGE_SIZE = 12;

export default function VendorStore() {
  const { slug } = useParams();
  const { gridCols } = useAppearance();
  const lgCols = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[gridCols] || 'lg:grid-cols-4';

  const [vendor, setVendor]         = useState(null);
  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');
    storefrontService.getVendor(slug, { page, limit: PAGE_SIZE })
      .then(r => {
        setVendor(r.data?.vendor || null);
        setProducts(r.data?.products || []);
        setPagination(r.data?.pagination || null);
      })
      .catch(e => setError(e.message || 'Store not found'))
      .finally(() => setLoading(false));
  }, [slug, page]);

  const totalPages = pagination?.pages ?? pagination?.totalPages ?? 1;

  if (loading && !vendor) {
    return (
      <div className="bg-bg min-h-screen pb-20">
        <div className="h-56 bg-surface animate-pulse" />
        <div className="container mx-auto px-10 mt-16">
          <div className={`grid grid-cols-2 sm:grid-cols-3 ${lgCols} gap-6 animate-pulse`}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-surface" />
                <div className="h-4 bg-surface w-3/4 rounded" />
                <div className="h-4 bg-surface w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-20 text-center">
        <Store className="w-10 h-10 text-subtle mx-auto mb-6 stroke-[1.2]" />
        <h2 className="text-2xl font-light text-ink">{error || 'Store not found'}</h2>
        <Link to="/products" className="btn-minimal inline-block mt-8 px-12">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pb-32">
      {/* Banner */}
      <div className="relative h-56 sm:h-72 bg-ink overflow-hidden">
        {vendor.banner ? (
          <img
            src={getImageUrl(vendor.banner)}
            alt={`${vendor.storeName} banner`}
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-ink" />
        )}
      </div>

      {/* Vendor header */}
      <div className="container mx-auto px-10">
        <div className="bg-surface border border-border-minimal -mt-16 relative z-10 p-10 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <div className="w-24 h-24 bg-surface border border-border-minimal shrink-0 overflow-hidden flex items-center justify-center">
            {vendor.logo ? (
              <img
                src={getImageUrl(vendor.logo)}
                alt={vendor.storeName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Store className="w-8 h-8 text-subtle stroke-[1.2]" />
            )}
          </div>
          <div className="flex-grow">
            <h1 className="text-[28px] font-heading font-normal text-ink tracking-tight">{vendor.storeName}</h1>
            <div className="flex flex-wrap items-center gap-6 mt-2">
              {vendor.rating > 0 && (
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
                  <Star className="w-3.5 h-3.5 fill-rating text-rating" />
                  {Number(vendor.rating).toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-[0.011em] text-subtle">
                <Package className="w-3.5 h-3.5" />
                {vendor.productCount ?? products.length} {(vendor.productCount ?? products.length) === 1 ? 'product' : 'products'}
              </span>
            </div>
            {vendor.description && (
              <p className="text-subtle text-[13px] font-normal leading-relaxed mt-4 max-w-2xl">
                {vendor.description}
              </p>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-normal text-subtle uppercase tracking-[0.011em] mt-12 mb-10">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink">{vendor.storeName}</span>
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <div className="py-24 text-center bg-surface border border-border-minimal">
            <Package className="w-10 h-10 text-subtle mx-auto mb-6 stroke-[1.2]" />
            <p className="text-subtle text-[13px] font-normal">This store has no products yet.</p>
          </div>
        ) : (
          <div className={cn(`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-6`, loading && 'opacity-50 pointer-events-none')}>
            {products.map(p => <ProductCard key={p._id || p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-16">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-2 text-[11px] font-normal uppercase tracking-[0.011em] border border-border-minimal px-5 py-3 text-subtle hover:border-ink hover:text-ink transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <span className="text-[11px] font-normal uppercase tracking-[0.011em] text-subtle">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-2 text-[11px] font-normal uppercase tracking-[0.011em] border border-border-minimal px-5 py-3 text-subtle hover:border-ink hover:text-ink transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
