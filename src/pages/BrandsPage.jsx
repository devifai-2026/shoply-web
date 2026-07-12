import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storefrontService } from '../services/storefront';
import { getImageUrl } from '../lib/api';
import { ArrowRight, Search } from 'lucide-react';

export default function BrandsPage() {
  const [brands, setBrands]     = useState([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    storefrontService.getBrands()
      .then(r => setBrands(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = brands.filter(b => b.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-bg min-h-screen pb-32">
      <div className="bg-surface border-b border-border-minimal py-24 lg:py-40">
        <div className="container mx-auto px-10 max-w-3xl">
          <h1 className="font-heading text-[40px] lg:text-[64px] font-normal text-ink tracking-tight mb-2">Collaborations</h1>
          <span className="block w-16 h-[3px] bg-[var(--color-accent-decorative)] mt-2 mb-8" />
          <p className="text-subtle text-[14px] font-normal mb-12 max-w-xl leading-loose">
            We maintain direct synergies with global designers to curate collections of unparalleled precision and certified integrity.
          </p>
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Query brand index..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-surface border border-border-minimal rounded-full py-4 px-12 focus:border-ink outline-none text-[12px] uppercase tracking-[0.011em] font-normal"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-10 mt-32">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border-minimal">
                <div className="h-64 bg-surface" />
                <div className="p-10 space-y-4">
                  <div className="h-5 bg-surface rounded w-1/3" />
                  <div className="h-4 bg-surface rounded w-full" />
                  <div className="h-4 bg-surface rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filtered.map(brand => (
              <Link
                key={brand._id}
                to={`/search?q=${brand.name}`}
                className="bg-surface border border-border-minimal group transition-all duration-500 overflow-hidden flex flex-col h-full hover:border-ink"
              >
                <div className="relative h-64 overflow-hidden bg-surface flex items-center justify-center border-b border-border-minimal">
                  {brand.logo ? (
                    <img
                      src={getImageUrl(brand.logo)}
                      alt={brand.name}
                      className="w-1/2 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 p-8 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-[24px] font-normal text-subtle uppercase tracking-[0.011em]">{brand.name}</span>
                  )}
                </div>
                <div className="p-10 flex flex-col flex-grow">
                  <h3 className="text-[18px] font-medium text-ink mb-6 uppercase tracking-tight">{brand.name}</h3>
                  <p className="text-subtle text-[13px] mb-10 leading-relaxed flex-grow font-normal">
                    {brand.description || 'Premium quality products from this brand.'}
                  </p>
                  <div className="flex items-center gap-4 text-accent font-normal uppercase tracking-[0.011em] text-[10px]">
                    Catalog <ArrowRight className="w-4 h-4 stroke-[2]" />
                  </div>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && !loading && (
              <p className="col-span-3 text-center py-20 text-subtle text-[14px]">No brands found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
