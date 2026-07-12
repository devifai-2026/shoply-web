import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAppearance } from '../context/AppearanceContext';

// Real store info (StoreSettings, admin-editable) — no lorem-ipsum stub copy.
export default function About() {
  const { storeName, supportEmail, storePhone, storeAddress } = useAppearance();
  const hasContactInfo = storeAddress || storePhone || supportEmail;

  return (
    <div className="bg-bg min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h1 className="font-heading text-3xl md:text-4xl font-normal text-ink mb-4 tracking-tight">
          About {storeName}
        </h1>
        <span className="block w-16 h-[3px] bg-[var(--color-accent-decorative)] mx-auto mb-8" />
        <p className="text-subtle text-sm leading-relaxed mb-12">
          {storeName} is a multi-vendor marketplace connecting shoppers with a curated
          selection of independent sellers — quality products, fast delivery, and easy returns.
        </p>

        {hasContactInfo && (
          <div className="border border-border-minimal p-8 text-left inline-block">
            <h2 className="text-[11px] font-normal uppercase tracking-[0.011em] text-ink mb-5">Get in Touch</h2>
            <ul className="space-y-3 text-subtle text-[13px]">
              {storeAddress && (
                <li className="flex gap-3">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> <span>{storeAddress}</span>
                </li>
              )}
              {storePhone && (
                <li className="flex gap-3">
                  <Phone className="w-4 h-4 shrink-0 mt-0.5" /> <span>{storePhone}</span>
                </li>
              )}
              {supportEmail && (
                <li className="flex gap-3">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" /> <span>{supportEmail}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-12">
          <Link to="/products" className="btn-minimal inline-block px-12">
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
