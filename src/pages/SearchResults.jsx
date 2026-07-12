import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storefrontService } from '../services/storefront';
import ProductCard from '../components/product/ProductCard';
import { Search, Info } from 'lucide-react';
import { useAppearance } from '../context/AppearanceContext';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults]   = useState([]);
  const { gridCols } = useAppearance();
  const lgCols = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[gridCols] || 'lg:grid-cols-4';
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    storefrontService.getProducts({ search: query, limit: 40 })
      .then(r => setResults(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="bg-bg min-h-screen pb-20">
      <div className="container mx-auto px-10 pt-12">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 border border-border-minimal flex items-center justify-center">
            <Search className="w-6 h-6 text-ink" />
          </div>
          <div>
            <h1 className="text-[32px] font-light text-ink tracking-tight">Search Results</h1>
            <p className="text-subtle text-sm font-medium">
              {loading ? 'Searching...' : `Found ${results.length} results for`}{' '}
              <span className="text-ink font-bold">"{query}"</span>
            </p>
          </div>
        </div>

        {loading ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-12 animate-pulse`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square bg-surface mb-3" />
                <div className="h-3 bg-surface rounded w-1/3 mb-2" />
                <div className="h-4 bg-surface rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-12`}>
            {results.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="bg-surface p-20 text-center border border-dashed border-border-minimal">
            <Info className="w-12 h-12 text-subtle mx-auto mb-8 stroke-[1.2]" />
            <h3 className="text-[20px] font-light text-ink mb-3 tracking-tight">No results for "{query}"</h3>
            <p className="text-subtle text-[13px] mb-12 max-w-sm mx-auto leading-relaxed">
              Try checking your spelling or using more general terms.
            </p>
            <button onClick={() => window.history.back()} className="btn-minimal px-12">
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
