import React, { createContext, useContext, useEffect, useState } from 'react';
import { storefrontService } from '../services/storefront';
import { getImageUrl } from '../lib/api';
import { formatPrice as fmt } from '../lib/utils';

const AppearanceContext = createContext({});

const FONT_FAMILY = {
  sans:    "'Helvetica Neue', Helvetica, Arial, sans-serif",
  serif:   "Georgia, 'Times New Roman', serif",
  mono:    "'Courier New', Courier, monospace",
  cursive: 'cursive',
  system:  'ui-sans-serif, system-ui, sans-serif',
  Roboto:  "'Roboto', sans-serif",
  Poppins: "'Poppins', sans-serif",
  Inter:   "'Inter', sans-serif",
  'Source Serif 4': "'Source Serif 4', Georgia, serif",
};

// Fonts that must be fetched from Google Fonts before they render
const GOOGLE_FONTS = { Roboto: true, Poppins: true, Inter: true, 'Source Serif 4': true };

function loadGoogleFont(name) {
  const id = `gfont-${name}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id   = id;
  link.rel  = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

// Constrained to the design system's binary radius (4px rectangular, 40px
// pill) — the tenant admin's sharp/rounded/pill choice still does something
// (rectangular vs. pill), just within the allowed 2 values, not 3 distinct ones.
const BTN_RADIUS = { sharp: '4px', rounded: '4px', pill: '40px' };

// Parse a hex color to [r, g, b] (0-255 each)
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Blend color a toward color b by factor t (0=a, 1=b), return hex
function blendHex(hexA, hexB, t) {
  const [ar, ag, ab] = hexToRgb(hexA);
  const [br, bg, bb] = hexToRgb(hexB);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = useState(null);

  useEffect(() => {
    storefrontService.getAppearance()
      .then(r => setAppearance(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!appearance) return;
    const root = document.documentElement;
    const { colors = {}, typography = {}, layout = {}, favicon, customCSS = {} } = appearance;

    const bg   = colors.bg   || '#fbf8f6';
    const text = colors.text || '#333333';

    if (colors.primary)  root.style.setProperty('--color-accent', colors.primary);
    root.style.setProperty('--color-bg',             bg);
    root.style.setProperty('--color-ink',            text);
    // Derived (fall back to blends when token absent, so existing consumers keep working)
    root.style.setProperty('--color-surface',        colors.surface || blendHex(bg, text, 0.06));
    root.style.setProperty('--color-subtle',         colors.mutedText || blendHex(text, bg, 0.52));
    root.style.setProperty('--color-border-minimal', colors.border || blendHex(bg, text, 0.12));

    // Full dynamic palette token set (mirrors the server Appearance.colors schema)
    const setColor = (name, val) => { if (val) root.style.setProperty(name, val); };
    setColor('--color-primary',    colors.primary);
    setColor('--color-secondary',  colors.secondary);
    setColor('--color-on-primary', colors.onPrimary);
    setColor('--color-sale',       colors.sale);
    setColor('--color-success',    colors.success);
    setColor('--color-danger',     colors.danger);
    setColor('--color-badge',      colors.badge);
    setColor('--color-rating',     colors.rating);
    setColor('--color-card',       colors.card);
    setColor('--color-border',     colors.border);
    setColor('--color-muted-text', colors.mutedText);
    setColor('--color-text',       text);

    if (typography.headingFont) {
      if (GOOGLE_FONTS[typography.headingFont]) loadGoogleFont(typography.headingFont);
      root.style.setProperty('--font-heading', FONT_FAMILY[typography.headingFont] || `'${typography.headingFont}', sans-serif`);
    }
    if (typography.bodyFont) {
      if (GOOGLE_FONTS[typography.bodyFont]) loadGoogleFont(typography.bodyFont);
      root.style.setProperty('--font-sans', FONT_FAMILY[typography.bodyFont] || `'${typography.bodyFont}', sans-serif`);
    }
    if (typography.baseSize)
      root.style.fontSize = `${typography.baseSize}px`;
    if (typography.buttonCorner)
      root.style.setProperty('--btn-radius', BTN_RADIUS[typography.buttonCorner] ?? '0px');

    if (layout.maxWidth)
      root.style.setProperty('--container-max', `${layout.maxWidth}px`);

    if (appearance.storeName) document.title = appearance.storeName;

    if (favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = getImageUrl(favicon);
    }

    let styleEl = document.getElementById('admin-custom-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'admin-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = (typeof customCSS === 'object' ? customCSS.web : customCSS) || '';
  }, [appearance]);

  const isSectionEnabled = (key) => {
    const sections = appearance?.homepageSections;
    if (!sections) return true;
    return key in sections ? sections[key] !== false : true;
  };

  const gridCols         = appearance?.layout?.webColumns ?? 4;
  const productCardStyle = appearance?.productCardStyle ?? 'minimal';
  const headerConfig     = appearance?.header ?? {};
  const footerConfig     = appearance?.footer ?? {};
  const logo             = appearance?.logo ? getImageUrl(appearance.logo) : null;
  const homepageContent  = appearance?.homepageContent ?? {};

  const currencySymbol = appearance?.regional?.currencySymbol ?? '₹';
  const symbolPosition = appearance?.regional?.symbolPosition ?? 'left';
  const formatPrice    = (amount, decimals = 2) => fmt(amount, currencySymbol, symbolPosition, decimals);

  const taxSettings = {
    gstRate:     appearance?.tax?.gstRate     ?? 0,
    taxIncluded: appearance?.tax?.taxIncluded ?? false,
  };

  const storeName    = appearance?.storeName    || 'My Store';
  const supportEmail = appearance?.supportEmail || '';
  const storePhone   = appearance?.phone        || '';
  const storeAddress = appearance?.address      || '';
  const socialLinks  = appearance?.social       ?? {};
  const policies     = appearance?.policies     ?? {};

  return (
    <AppearanceContext.Provider value={{ appearance, isSectionEnabled, gridCols, productCardStyle, headerConfig, footerConfig, logo, homepageContent, formatPrice, taxSettings, storeName, supportEmail, storePhone, storeAddress, socialLinks, policies }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
