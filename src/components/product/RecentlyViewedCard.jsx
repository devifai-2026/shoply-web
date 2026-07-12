import React from 'react';
import { Link } from 'react-router-dom';
import { useAppearance } from '../../context/AppearanceContext';

export default function RecentlyViewedCard({ productName, image, price, productUrl }) {
  const { formatPrice } = useAppearance();

  return (
    <Link to={productUrl} className="flex flex-col group border border-transparent p-2 transition-colors hover:border-border-minimal">
      <div className="aspect-square overflow-hidden rounded-[4px] bg-surface mb-2">
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
      <p className="text-xs font-normal text-ink line-clamp-1 mb-0.5">{productName}</p>
      <p className="text-sm font-medium text-ink">{formatPrice(price)}</p>
    </Link>
  );
}
