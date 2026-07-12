import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="bg-surface border-b border-border-minimal py-6">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
           <Link to="/" className="font-heading text-2xl font-normal text-ink">
            AURA<span className="text-accent">.</span>
           </Link>
           <Link to="/cart" className="text-sm font-normal text-subtle hover:text-ink transition-colors">
              Return to Cart
           </Link>
        </div>
      </header>
      <main className="flex-grow py-12">
        <Outlet />
      </main>
      <footer className="py-8 text-center text-subtle text-xs border-t border-border-minimal bg-surface">
        © 2026 Aura Marketplace. Secure Encrypted Checkout.
      </footer>
    </div>
  );
}
