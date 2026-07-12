import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b py-6">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
           <Link to="/" className="text-2xl font-black tracking-tighter text-slate-900">
            AURA<span className="text-orange-500">.</span>
           </Link>
           <Link to="/cart" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              Return to Cart
           </Link>
        </div>
      </header>
      <main className="flex-grow py-12">
        <Outlet />
      </main>
      <footer className="py-8 text-center text-slate-400 text-xs border-t bg-white">
        © 2026 Aura Marketplace. Secure Encrypted Checkout.
      </footer>
    </div>
  );
}
