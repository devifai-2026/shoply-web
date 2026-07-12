// ─── API configuration ────────────────────────────────────────────────────────
// VITE_API_URL is an explicit override (e.g. local dev pointing at a remote
// server). Without it, on a real deployed host we call the API on the SAME
// origin the app was served from — every tenant subdomain (bengal-bazar.
// <root>, acme.<root>, ...) is proxied to the one backend by Caddy, so this
// makes each tenant's storefront automatically talk to its own subdomain
// instead of a hardcoded root domain that never resolves that tenant.
const isLocalhost = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

export const SERVER_URL =
  import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000' : window.location.origin);

export const API_URL = `${SERVER_URL}/api`;
