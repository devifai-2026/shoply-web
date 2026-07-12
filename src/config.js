// ─── API configuration ────────────────────────────────────────────────────────
// Base URL comes from the environment (.env / .env.production).
// Falls back to the local dev server when VITE_API_URL is not set.

export const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_URL = `${SERVER_URL}/api`;
