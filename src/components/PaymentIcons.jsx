import React, { useEffect, useState } from 'react';
import { CreditCard, Wallet, Banknote, Globe } from 'lucide-react';
import { storefrontService } from '../services/storefront';

// Maps the real PaymentGateway.type (server/src/models/PaymentGateway.js) to a
// neutral representative icon — no fabricated brand logos, since which
// gateways are actually configured/active varies per tenant.
const TYPE_ICON = {
  'Manual':        Banknote,
  'Aggregator':    CreditCard,
  'UPI Wallet':    Wallet,
  'International': Globe,
};

// Renders one badge per payment gateway the tenant has actually enabled
// (server: PaymentGateway.isActive), fetched from the public
// /storefront/payment-gateways endpoint. Renders nothing if none are active,
// rather than a static hardcoded Visa/Mastercard/PayPal set.
export default function PaymentIcons({ className = '' }) {
  const [gateways, setGateways] = useState([]);

  useEffect(() => {
    storefrontService.getPaymentGateways()
      .then(r => setGateways(r.data || []))
      .catch(() => {});
  }, []);

  if (gateways.length === 0) return null;

  return (
    <div className={`flex items-center flex-wrap gap-4 ${className}`}>
      {gateways.map(gw => {
        const Icon = TYPE_ICON[gw.type] || CreditCard;
        return (
          <span key={gw.slug} className="flex items-center gap-1.5 text-subtle" title={gw.name}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-normal uppercase tracking-[0.011em]">{gw.name}</span>
          </span>
        );
      })}
    </div>
  );
}
