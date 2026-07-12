import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, User, Heart, Star, Lock, LogOut, ChevronRight } from 'lucide-react';
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
    { label: 'Wishlist', icon: Heart, path: '/account/wishlist' },
    { label: 'Reviews', icon: Star, path: '/account/reviews' },
    { label: 'Security', icon: Lock, path: '/account/change-password' },
  ];

  return (
    <div className="bg-bg min-h-screen pb-32 pt-12">
      <div className="container mx-auto px-10">
        <h1 className="text-[32px] font-light text-ink mb-16 tracking-tight">Account</h1>

        <div className="flex flex-col lg:flex-row gap-20">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-border-minimal overflow-hidden">
               <div className="p-10 border-b border-border-minimal flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-surface border border-border-minimal flex items-center justify-center font-light text-[24px] mb-6">
                    {user?.name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-ink text-[16px] tracking-tight">{user?.name}</h2>
                    <p className="text-subtle text-[11px] font-bold uppercase tracking-widest mt-1">Identity Verified</p>
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
                            "flex items-center p-4 text-[12px] uppercase font-bold tracking-widest transition-all",
                            isActive ? "text-ink bg-surface" : "text-subtle hover:text-ink hover:bg-surface/50"
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
                        className="w-full flex items-center gap-4 p-4 text-[12px] uppercase font-bold tracking-widest text-subtle hover:text-ink transition-all"
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
