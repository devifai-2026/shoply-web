import React, { useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { trackEvent } from '../../lib/tracking';

// Visible only when ?preview=1 is in the URL (opened from Appearance →
// Preview in the admin panel) — makes it unmistakable this is a staged
// draft, not what real customers currently see.
function PreviewBanner() {
  const [searchParams] = useSearchParams();
  if (searchParams.get('preview') !== '1') return null;
  return (
    <div className="bg-ink text-white text-center py-2 text-[12px] font-semibold uppercase tracking-wide sticky top-0 z-[60]">
      Preview mode — showing an unpublished draft, not what customers currently see
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);
  return null;
}

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ScrollToTop />
      <PageViewTracker />
      <PreviewBanner />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
