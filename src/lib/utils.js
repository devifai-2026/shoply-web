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
