import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  return ctx || { toast: () => {}, success: () => {}, error: () => {}, warning: () => {}, info: () => {} };
};

// Flat, bordered, no-shadow vocabulary — matches DiscountBadge / ProductCard / SectionHeading.
const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
const ACCENTS = {
  success: 'text-success',
  error:   'text-sale',
  warning: 'text-badge',
  info:    'text-ink',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info') => {
    if (!message) return;
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 3500);
    return id;
  }, [dismiss]);

  const value = {
    toast,
    success: (message) => toast(message, 'success'),
    error:   (message) => toast(message, 'error'),
    warning: (message) => toast(message, 'warning'),
    info:    (message) => toast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'flex items-start gap-3 bg-surface border border-border-minimal px-5 py-4 pointer-events-auto',
                'animate-in fade-in slide-in-from-bottom-2 duration-300'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', ACCENTS[t.type])} />
              <span className="text-[13px] font-normal text-ink leading-snug flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="text-subtle hover:text-ink transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
