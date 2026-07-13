const STORAGE_KEY = 'reseller_ref';

// Captures ?ref=<resellerCode> from the current URL into localStorage so it
// survives across pages/visits until checkout. Call once on app mount.
// A fresh ?ref= always overwrites a stale one (last-click attribution).
export function captureResellerRef() {
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) localStorage.setItem(STORAGE_KEY, ref);
}

export function getResellerRef() {
  return localStorage.getItem(STORAGE_KEY) || null;
}
