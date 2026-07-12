import React from 'react';
import { Link } from 'react-router-dom';
import { useAppearance } from '../../context/AppearanceContext';

export default function FlashSaleCard({
  productName,
  image,
  discountedPrice,
  originalPrice,
  discountPercent,
  soldPercent,
  productUrl,
}) {
  const { formatPrice } = useAppearance();
  const hasSoldData = soldPercent !== null && soldPercent !== undefined;
  const clampedSold = hasSoldData ? Math.min(100, Math.max(0, soldPercent)) : null;

  return (
    <Link to={productUrl} className="group flex flex-col bg-surface border border-border-minimal flex-shrink-0 h-full transition-colors hover:border-ink">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-surface">
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-surface border border-border-minimal text-sale text-[10px] font-medium px-1.5 py-0.5 leading-none">
            -{discountPercent}%
          </span>
        )}
        {image ? (
          <img
            src={image}
            alt={productName}
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center text-subtle text-xs uppercase tracking-[0.011em]">
            No image
          </div>
        )}
      </div>

      {/* Sold % progress bar — only shown when backed by real stock/sales data */}
      {hasSoldData && (
        <div className="h-1 bg-border-minimal overflow-hidden">
          <div
            className="h-full bg-sale transition-all duration-500"
            style={{ width: `${clampedSold}%` }}
          />
        </div>
      )}

      {/* Card body */}
      <div className="p-2.5 flex flex-col gap-1">
        <p className="text-xs font-normal text-ink line-clamp-1">{productName}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-sale">{formatPrice(discountedPrice)}</span>
          {originalPrice > discountedPrice && (
            <span className="text-[11px] text-subtle line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
        {hasSoldData && <p className="text-[10px] text-subtle">{clampedSold}% sold</p>}
      </div>
    </Link>
  );
}
