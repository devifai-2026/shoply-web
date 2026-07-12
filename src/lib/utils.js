import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount, symbol = '₹', position = 'left', decimals = 2) {
  const n = Number(amount ?? 0).toFixed(decimals);
  if (position === 'right')      return `${n}${symbol}`;
  if (position === 'left_space') return `${symbol} ${n}`;
  return `${symbol}${n}`;
}

const GENERIC_FALLBACK = 'Something went wrong. Please try again.';

// Raw artifacts that should never reach a user-facing toast verbatim —
// network errors, stack-trace fragments, Mongo/Mongoose internals, etc.
const NOISY_PATTERNS = [
  /failed to fetch/i,
  /networkerror/i,
  /load failed/i,
  /^request failed$/i,
  /cast to objectid/i,
  /^e11000/i,
  /validation failed:/i,
  /\bat\s+\S+\s+\(.*:\d+:\d+\)/, // stack trace frame
  /\.(js|ts|jsx|tsx):\d+/,        // file path with line number
  /mongoose/i,
  /^\s*<!doctype html/i,
];

/**
 * Turns a thrown error (ApiError from lib/api.js, a network TypeError, or
 * anything else) into a short, human-readable message safe to show in a toast.
 *
 * - Session expiry (401) and other well-known statuses get specific copy.
 * - A clean backend `message` (already extracted onto err.message by the
 *   `api.js` request() helper) is passed through as-is.
 * - Anything that looks like a raw network/stack/Mongo artifact is replaced
 *   with `fallback` instead of being shown verbatim.
 */
export function getErrorMessage(err, fallback = GENERIC_FALLBACK) {
  if (!err) return fallback;

  const status = err.status ?? err.response?.status;
  if (status === 401) return 'Please log in again.';
  if (status === 0)   return err.message || 'Check your internet connection and try again.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status >= 500)  return fallback;

  const message = typeof err.message === 'string' ? err.message.trim() : '';
  if (!message) return fallback;
  if (NOISY_PATTERNS.some((re) => re.test(message))) return fallback;
  return message;
}
