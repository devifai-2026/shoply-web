import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ShoppingBag, Package, ArrowRight, Gift } from 'lucide-react';
import { storefrontService } from '../services/storefront';
import { useAppearance } from '../context/AppearanceContext';

const TYPE_META = {
  buy_x_get_y: { label: 'Buy X Get Y',  icon: ShoppingBag, color: 'bg-purple-50 border-purple-200 text-purple-700',  badge: 'bg-purple-600' },
  bundle:      { label: 'Bundle Deal',  icon: Package,     color: 'bg-blue-50 border-blue-200 text-blue-700',         badge: 'bg-blue-600' },
  under_price: { label: 'Under Price',  icon: Tag,         color: 'bg-green-50 border-green-200 text-green-700',       badge: 'bg-green-600' },
};

function OfferCard({ offer, formatPrice }) {
  const meta   = TYPE_META[offer.type] || TYPE_META.buy_x_get_y;
  const Icon   = meta.icon;

  const getDescription = () => {
    if (offer.type === 'buy_x_get_y')
      return `Buy ${offer.buyQty}, get ${offer.getQty} absolutely free!`;
    if (offer.type === 'bundle')
      return `Pick any ${offer.bundleCount} items and pay only ${formatPrice(offer.bundlePrice)}`;
    if (offer.type === 'under_price')
      return `Handpicked products, all under ${formatPrice(offer.maxPrice)}`;
    return offer.description;
  };

  const getActionLink = () => {
    if (offer.type === 'under_price') return `/products?maxPrice=${offer.maxPrice}`;
    return `/products?offerId=${offer._id}`;
  };

  return (
    <div className={`border rounded-sm p-8 flex flex-col gap-6 ${meta.color}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${meta.badge} flex items-center justify-center rounded-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{meta.label}</span>
            <h3 className="text-[18px] font-bold tracking-tight mt-0.5">{offer.title}</h3>
          </div>
        </div>
        {offer.badge && (
          <span className={`text-[11px] font-black px-3 py-1 ${meta.badge} text-white uppercase tracking-widest rounded-full shrink-0`}>
            {offer.badge}
          </span>
        )}
      </div>

      <p className="text-[14px] leading-relaxed opacity-80">{offer.description || getDescription()}</p>

      {offer.endsAt && (
        <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">
          Offer ends {new Date(offer.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}

      <Link
        to={getActionLink()}
        className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] hover:gap-3 transition-all"
      >
        Shop Now <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function OffersPage() {
  const { formatPrice } = useAppearance();
  const [offers,  setOffers]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storefrontService.getActiveOffers()
      .then(r => setOffers(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byType = {
    buy_x_get_y: offers.filter(o => o.type === 'buy_x_get_y'),
    bundle:      offers.filter(o => o.type === 'bundle'),
    under_price: offers.filter(o => o.type === 'under_price'),
  };

  if (loading) {
    return (
      <div className="bg-bg min-h-screen py-32 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  if (!offers.length) {
    return (
      <div className="bg-bg min-h-screen py-32 flex flex-col items-center justify-center gap-6 text-center px-10">
        <Gift className="w-12 h-12 text-ink/20" />
        <p className="text-[14px] text-subtle font-medium">No active offers right now. Check back soon!</p>
        <Link to="/products" className="btn-minimal px-10 py-3">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pb-32">
      {/* Hero */}
      <div className="bg-ink text-white py-20 px-10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-4">Exclusive</p>
        <h1 className="text-[36px] sm:text-[48px] font-light tracking-tight mb-4">Special Offers</h1>
        <p className="text-white/50 text-[14px] font-medium max-w-md mx-auto">
          {offers.length} active {offers.length === 1 ? 'offer' : 'offers'} — handpicked deals just for you
        </p>
      </div>

      <div className="container mx-auto px-10 py-20 space-y-24">

        {/* Buy X Get Y */}
        {byType.buy_x_get_y.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-10">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-ink">Buy X Get Y Free</h2>
              <div className="flex-1 h-px bg-border-minimal" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {byType.buy_x_get_y.map(offer => (
                <OfferCard key={offer._id} offer={offer} formatPrice={formatPrice} />
              ))}
            </div>
          </section>
        )}

        {/* Bundle Deals */}
        {byType.bundle.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-10">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-ink">Bundle Deals</h2>
              <div className="flex-1 h-px bg-border-minimal" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {byType.bundle.map(offer => (
                <OfferCard key={offer._id} offer={offer} formatPrice={formatPrice} />
              ))}
            </div>
          </section>
        )}

        {/* Under Price Collections */}
        {byType.under_price.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-10">
              <Tag className="w-5 h-5 text-green-600" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-ink">Under Price Collections</h2>
              <div className="flex-1 h-px bg-border-minimal" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {byType.under_price.map(offer => (
                <Link
                  key={offer._id}
                  to={`/products?maxPrice=${offer.maxPrice}`}
                  className="group border border-border-minimal rounded-sm p-8 hover:border-ink/30 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Collection</span>
                    <ArrowRight className="w-4 h-4 text-subtle group-hover:text-ink group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[28px] font-light text-ink mb-1">
                    Under {formatPrice(offer.maxPrice)}
                  </p>
                  <p className="text-[13px] font-medium text-subtle">{offer.title}</p>
                  {offer.endsAt && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-subtle/60 mt-6">
                      Ends {new Date(offer.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
