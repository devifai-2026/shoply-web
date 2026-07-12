import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function MyReviews() {
  return (
    <div className="bg-white border border-border-minimal animate-in fade-in duration-700">
      <div className="flex items-center justify-between p-10 border-b border-border-minimal">
        <h2 className="text-[14px] font-bold text-ink uppercase tracking-[0.2em]">My Reviews</h2>
      </div>

      <div className="py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-10 text-subtle">
          <Star className="w-full h-full stroke-[1.2]" />
        </div>
        <h3 className="text-[18px] font-light text-ink mb-3">No reviews yet</h3>
        <p className="text-subtle text-[13px] mb-12 max-w-xs mx-auto leading-relaxed">
          Your product reviews will appear here.
        </p>
        <Link to="/account/orders" className="btn-minimal inline-block px-12">View Orders</Link>
      </div>
    </div>
  );
}
