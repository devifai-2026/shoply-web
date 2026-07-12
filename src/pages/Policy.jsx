import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppearance } from '../context/AppearanceContext';

const TITLES = {
  'privacy-policy': 'Privacy Policy',
  'terms':          'Terms of Service',
  'shipping-policy':'Shipping Policy',
  'return-policy':  'Returns & Exchanges',
};

// Real store-configured policy data (StoreSettings orders/shipping fields,
// admin-editable) — no fabricated legal text. Sections render only when the
// store has actually configured the relevant setting; otherwise the page
// clearly says the policy isn't published yet rather than showing a dead
// link or invented copy.
export default function Policy() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '');
  const { storeName, supportEmail, policies } = useAppearance();
  const title = TITLES[slug] || 'Policy';

  const shippingRows = [
    policies.metroDeliveryTime && { label: 'Metro delivery time', value: policies.metroDeliveryTime },
    policies.restOfCountryTime && { label: 'Rest of country', value: policies.restOfCountryTime },
  ].filter(Boolean);

  const returnRows = [
    { label: 'Cancellations allowed', value: policies.allowCancel ? 'Yes' : 'No' },
    policies.cancellationWindow && { label: 'Cancellation window', value: policies.cancellationWindow },
    policies.refundMethod && { label: 'Refund method', value: policies.refundMethod },
  ].filter(Boolean);

  const hasContent =
    (slug === 'shipping-policy' && shippingRows.length > 0) ||
    (slug === 'return-policy' && returnRows.length > 0);

  return (
    <div className="bg-bg min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-heading text-3xl md:text-4xl font-normal text-ink mb-4 tracking-tight text-center">
          {title}
        </h1>
        <span className="block w-16 h-[3px] bg-[var(--color-accent-decorative)] mx-auto mb-10" />

        {slug === 'shipping-policy' && (
          shippingRows.length > 0 ? (
            <dl className="border border-border-minimal divide-y divide-border-minimal">
              {shippingRows.map(row => (
                <div key={row.label} className="flex justify-between px-6 py-4 text-[13px]">
                  <dt className="text-subtle">{row.label}</dt>
                  <dd className="text-ink font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-subtle text-sm text-center">Shipping policy details haven't been published yet.</p>
          )
        )}

        {slug === 'return-policy' && (
          returnRows.length > 0 ? (
            <dl className="border border-border-minimal divide-y divide-border-minimal">
              {returnRows.map(row => (
                <div key={row.label} className="flex justify-between px-6 py-4 text-[13px]">
                  <dt className="text-subtle">{row.label}</dt>
                  <dd className="text-ink font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-subtle text-sm text-center">Return policy details haven't been published yet.</p>
          )
        )}

        {(slug === 'privacy-policy' || slug === 'terms') && (
          <p className="text-subtle text-sm text-center leading-relaxed">
            This page is coming soon.
            {supportEmail && <> For questions, contact <a href={`mailto:${supportEmail}`} className="text-ink hover:underline">{supportEmail}</a>.</>}
          </p>
        )}

        <div className="mt-12 text-center">
          <Link to="/" className="text-[11px] font-normal uppercase tracking-[0.011em] text-ink border-b border-ink pb-0.5 hover:text-subtle hover:border-subtle transition-colors">
            Back to {storeName}
          </Link>
        </div>
      </div>
    </div>
  );
}
