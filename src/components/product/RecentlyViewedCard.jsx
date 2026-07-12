import React from 'react';
import { Link } from 'react-router-dom';
import { useAppearance } from '../../context/AppearanceContext';

export default function RecentlyViewedCard({ productName, image, price, productUrl }) {
  const { formatPrice } = useAppearance();

  return (
    <Link to={productUrl} className="flex flex-col group">
      <div className="aspect-square overflow-hidden rounded-lg bg-surface mb-2">
        {image ? (
          <img
            src={image}
            alt={productName}
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center text-subtle text-xs">
            No image
          </div>
        )}
      </div>
      <p className="text-xs text-ink line-clamp-1 mb-0.5">{productName}</p>
      <p className="text-sm text-ink">{formatPrice(price)}</p>
    </Link>
  );
}
