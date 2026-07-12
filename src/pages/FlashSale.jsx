import React, { useEffect, useState } from 'react';
import { storefrontService } from '../services/storefront';
import ProductCard from '../components/product/ProductCard';
import { Zap } from 'lucide-react';
import { useCountdown } from '../lib/useCountdown';
import { useAppearance } from '../context/AppearanceContext';

export default function FlashSale() {
  const [sale, setSale]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const { gridCols } = useAppearance();

  useEffect(() => {
    storefrontService.getActiveFlashSale()
      .then(r => setSale(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const timeLeft = useCountdown(sale?.endsAt || null);
  const lgCols = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[gridCols] || 'lg:grid-cols-4';

  if (loading) {
    return (
      <div className="bg-bg min-h-screen pb-32">
        <div className="bg-ink py-40 animate-pulse" />
        <div className={`container mx-auto px-10 mt-32 grid grid-cols-2 ${lgCols} gap-12`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-surface animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="bg-bg min-h-screen pb-32">
        <div className="bg-ink text-white py-24 lg:py-40">
          <div className="container mx-auto px-10 text-center">
            <div className="inline-flex items-center gap-3 border border-white/20 px-8 py-3 mb-10">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Flash Sale</span>
            </div>
            <h1 className="text-[48px] lg:text-[100px] font-light tracking-tight mb-12 leading-none uppercase">No Active Sale</h1>
            <p className="text-white/40 text-[14px]">Check back soon for our next limited-time offer.</p>
          </div>
        </div>
      </div>
    );
  }

  const products = sale.products || [];

  return (
    <div className="bg-bg min-h-screen pb-32">
      <div className="bg-ink text-white py-24 lg:py-40 relative">
        <div className="container mx-auto px-10 text-center relative z-10">
          <div className="inline-flex items-center gap-3 border border-white/20 px-8 py-3 mb-10">
            <Zap className="w-4 h-4 text-white uppercase" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Temporal Limitation</span>
          </div>
          <h1 className="text-[48px] lg:text-[100px] font-light tracking-tight mb-12 leading-none uppercase">
            {sale.title || 'Periodic Offer'}
          </h1>
          {timeLeft && (
            <div className="flex items-center justify-center gap-8 lg:gap-20">
              <div className="flex flex-col items-center">
                <span className="text-[32px] lg:text-[48px] font-light">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mt-2">Hours</span>
              </div>
              <span className="text-3xl font-extralight opacity-20">/</span>
              <div className="flex flex-col items-center">
                <span className="text-[32px] lg:text-[48px] font-light">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mt-2">Minutes</span>
              </div>
              <span className="text-3xl font-extralight opacity-20">/</span>
              <div className="flex flex-col items-center">
                <span className="text-[32px] lg:text-[48px] font-light">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mt-2">Seconds</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-10 mt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-8 border-b border-border-minimal">
          <div>
            <h2 className="text-[32px] font-light text-ink tracking-tight mb-2">Curated Reductions</h2>
            <p className="text-subtle text-[13px] font-medium">{products.length} selections</p>
          </div>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-12`}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
