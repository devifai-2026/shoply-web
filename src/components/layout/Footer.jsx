import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useAppearance } from '../../context/AppearanceContext';
import PaymentIcons from '../PaymentIcons';

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
  </svg>
);

const SOCIAL_CONFIG = [
  { key: 'facebook',  Icon: Facebook,    buildUrl: (v) => v.startsWith('http') ? v : `https://facebook.com/${v.replace(/^@/, '')}` },
  { key: 'instagram', Icon: Instagram,   buildUrl: (v) => `https://instagram.com/${v.replace(/^@/, '')}` },
  { key: 'twitter',   Icon: Twitter,     buildUrl: (v) => `https://x.com/${v.replace(/^@/, '')}` },
  { key: 'youtube',   Icon: Youtube,     buildUrl: (v) => v.startsWith('http') ? v : `https://youtube.com/@${v.replace(/^@/, '')}` },
  { key: 'whatsapp',  Icon: WhatsAppIcon, buildUrl: (v) => `https://wa.me/${v.replace(/\D/g, '')}` },
  { key: 'tiktok',   Icon: TikTokIcon,   buildUrl: (v) => `https://tiktok.com/@${v.replace(/^@/, '')}` },
];

export default function Footer() {
  const { footerConfig, logo, storeName, socialLinks, supportEmail, storePhone, storeAddress } = useAppearance();
  const showSocialLinks  = footerConfig.socialLinks  !== false;
  const showPaymentIcons = footerConfig.paymentIcons !== false;

  const activeSocialLinks = SOCIAL_CONFIG.filter(({ key }) => socialLinks[key]);
  const hasContactInfo = storeAddress || storePhone || supportEmail;

  return (
    <footer className="bg-bg border-t border-border-minimal pt-16 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand Info */}
          <div className="space-y-5">
            <Link to="/" className="block">
              {logo
                ? <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
                : <span className="font-heading text-[22px] font-normal text-ink">{storeName}</span>
              }
            </Link>
            <p className="text-subtle leading-relaxed text-[13px] max-w-sm">
              Quality products, curated for you — with fast delivery and easy returns.
            </p>
            {showSocialLinks && activeSocialLinks.length > 0 && (
              <div className="flex items-center gap-5">
                {activeSocialLinks.map(({ key, Icon, buildUrl }) => (
                  <a
                    key={key}
                    href={buildUrl(socialLinks[key])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-subtle hover:text-ink transition-colors"
                    aria-label={key}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-normal text-ink mb-5 uppercase tracking-[0.011em] text-[11px]">Quick Links</h4>
            <ul className="space-y-3 text-subtle text-[13px]">
              <li><Link to="/about" className="hover:text-ink transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-ink transition-colors">Contact Us</Link></li>
              <li><Link to="/offers" className="hover:text-ink transition-colors">Special Offers</Link></li>
              <li><Link to="/flash-sale" className="hover:text-ink transition-colors">Flash Sale</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-ink transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-ink transition-colors">Returns &amp; Exchanges</Link></li>
              <li><Link to="/terms" className="hover:text-ink transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-normal text-ink mb-5 uppercase tracking-[0.011em] text-[11px]">Account</h4>
            <ul className="space-y-3 text-subtle text-[13px]">
              <li><Link to="/account" className="hover:text-ink transition-colors">Dashboard</Link></li>
              <li><Link to="/account/orders" className="hover:text-ink transition-colors">Order History</Link></li>
              <li><Link to="/account/wishlist" className="hover:text-ink transition-colors">Wishlist</Link></li>
              <li><Link to="/login" className="hover:text-ink transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Contact */}
          {hasContactInfo && (
            <div>
              <h4 className="font-normal text-ink mb-5 uppercase tracking-[0.011em] text-[11px]">Contact</h4>
              <ul className="space-y-3 text-subtle text-[13px] leading-relaxed">
                {storeAddress && (
                  <li className="flex gap-3">
                    <MapPin className="w-4 h-4 text-subtle shrink-0 mt-0.5" />
                    <span>{storeAddress}</span>
                  </li>
                )}
                {storePhone && (
                  <li className="flex gap-3">
                    <Phone className="w-4 h-4 text-subtle shrink-0 mt-0.5" />
                    <span>{storePhone}</span>
                  </li>
                )}
                {supportEmail && (
                  <li className="flex gap-3">
                    <Mail className="w-4 h-4 text-subtle shrink-0 mt-0.5" />
                    <span>{supportEmail}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-minimal pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-subtle text-[12px]">© {new Date().getFullYear()} {storeName}. All Rights Reserved.</p>
          {showPaymentIcons && <PaymentIcons />}
        </div>
      </div>
    </footer>
  );
}
