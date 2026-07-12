import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAppearance } from '../context/AppearanceContext';

// Real store contact info (StoreSettings, admin-editable) — no stub copy.
export default function Contact() {
  const { storeName, supportEmail, storePhone, storeAddress } = useAppearance();
  const hasContactInfo = storeAddress || storePhone || supportEmail;

  return (
    <div className="bg-bg min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h1 className="font-heading text-3xl md:text-4xl font-normal text-ink mb-4 tracking-tight">
          Contact {storeName}
        </h1>
        <span className="block w-16 h-[3px] bg-[var(--color-accent-decorative)] mx-auto mb-8" />

        {hasContactInfo ? (
          <div className="border border-border-minimal p-8 text-left inline-block">
            <ul className="space-y-4 text-subtle text-[14px]">
              {storeAddress && (
                <li className="flex gap-3">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> <span>{storeAddress}</span>
                </li>
              )}
              {storePhone && (
                <li className="flex gap-3">
                  <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                  <a href={`tel:${storePhone}`} className="hover:text-ink transition-colors">{storePhone}</a>
                </li>
              )}
              {supportEmail && (
                <li className="flex gap-3">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <a href={`mailto:${supportEmail}`} className="hover:text-ink transition-colors">{supportEmail}</a>
                </li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-subtle text-sm">Contact details are not available yet. Please check back soon.</p>
        )}
      </div>
    </div>
  );
}
