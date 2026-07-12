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
  const clampedSold = Math.min(100, Math.max(0, soldPercent));

  return (
    <Link to={productUrl} className="flex flex-col bg-bg border border-border-minimal flex-shrink-0 h-full">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-surface">
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-red-600 text-bg text-[10px] font-bold px-1.5 py-0.5 leading-none">
            -{discountPercent}%
          </span>
        )}
        {image ? (
          <img
            src={image}
            alt={productName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center text-subtle text-xs">
            No image
          </div>
        )}
      </div>

      {/* Sold % progress bar */}
      <div className="h-1 bg-border-minimal overflow-hidden">
        <div
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${clampedSold}%` }}
        />
      </div>

      {/* Card body */}
      <div className="p-2.5 flex flex-col gap-1">
        <p className="text-xs font-medium text-ink line-clamp-1">{productName}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-red-600">{formatPrice(discountedPrice)}</span>
          {originalPrice > discountedPrice && (
            <span className="text-[11px] text-subtle line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
        <p className="text-[10px] text-subtle">{clampedSold}% sold</p>
      </div>
    </Link>
  );
}
