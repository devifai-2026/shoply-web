import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, User, Heart, Star, Lock, LogOut, ChevronRight, MapPin, Wallet, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export default function AccountLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/account' },
    { label: 'Orders', icon: ShoppingBag, path: '/account/orders' },
    { label: 'Profile', icon: User, path: '/account/profile' },
    { label: 'Addresses', icon: MapPin, path: '/account/addresses' },
    { label: 'Wallet', icon: Wallet, path: '/account/wallet' },
    { label: 'Reseller', icon: Share2, path: '/account/reseller' },
    { label: 'Wishlist', icon: Heart, path: '/account/wishlist' },
    { label: 'Reviews', icon: Star, path: '/account/reviews' },
    { label: 'Security', icon: Lock, path: '/account/change-password' },
  ];

  return (
    <div className="bg-bg min-h-screen pb-32 pt-12">
      <div className="container mx-auto px-10">
        <h1 className="font-heading text-[32px] font-normal text-ink mb-16 tracking-tight">Account</h1>

        <div className="flex flex-col lg:flex-row gap-20">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-surface border border-border-minimal overflow-hidden">
               <div className="p-10 border-b border-border-minimal flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-bg border border-border-minimal flex items-center justify-center font-normal text-[24px] mb-6">
                    {user?.name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-medium text-ink text-[16px] tracking-tight">{user?.name}</h2>
                    <p className="text-subtle text-[11px] font-normal uppercase tracking-[0.011em] mt-1">Identity Verified</p>
                  </div>
               </div>

               <nav className="p-4">
                  <ul className="space-y-1">
                    {navItems.map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          end={item.path === '/account'}
                          className={({ isActive }) => cn(
                            "flex items-center p-4 text-[12px] uppercase font-normal tracking-[0.011em] transition-all rounded-[4px]",
                            isActive ? "text-ink bg-bg" : "text-subtle hover:text-ink hover:bg-bg/50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <item.icon className="w-4 h-4 stroke-[1.5]" />
                            {item.label}
                          </div>
                        </NavLink>
                      </li>
                    ))}
                    <li className="mt-4 pt-4 border-t border-border-minimal">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-4 text-[12px] uppercase font-normal tracking-[0.011em] text-subtle hover:text-ink transition-all rounded-[4px]"
                      >
                        <LogOut className="w-4 h-4 stroke-[1.5]" />
                        Sign Out
                      </button>
                    </li>
                  </ul>
               </nav>
            </div>
          </aside>

          {/* Page Content */}
          <div className="flex-grow">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
