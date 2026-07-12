/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useParams } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppearanceProvider } from './context/AppearanceContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import RootLayout from './components/layout/RootLayout';
import AccountLayout from './components/layout/AccountLayout';
import CheckoutLayout from './components/layout/CheckoutLayout';

// Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import CategoryPage from './pages/CategoryPage';
import BrandsPage from './pages/BrandsPage';
import FlashSale from './pages/FlashSale';
import OffersPage from './pages/OffersPage';
import VendorStore from './pages/VendorStore';

import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import PhoneLogin from './pages/auth/PhoneLogin';
import OtpVerify from './pages/auth/OtpVerify';
import ProfileSetup from './pages/auth/ProfileSetup';

import Dashboard from './pages/account/Dashboard';
import Orders from './pages/account/Orders';
import OrderDetail from './pages/account/OrderDetail';
import Profile from './pages/account/Profile';
import Addresses from './pages/account/Addresses';
import Wishlist from './pages/account/Wishlist';
import MyReviews from './pages/account/MyReviews';
import ChangePassword from './pages/account/ChangePassword';
import TrackOrder from './pages/TrackOrder';
import About from './pages/About';
import Contact from './pages/Contact';
import Policy from './pages/Policy';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function CategoryRoute() {
  const { category, subcategory, child } = useParams();
  const key = [category, subcategory, child].filter(Boolean).join('/');
  return <CategoryPage key={key} />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: '/search', element: <SearchResults /> },
      { path: '/products', element: <ProductListing /> },
      { path: '/products/:slug', element: <ProductDetail /> },

      { path: '/c/:category', element: <CategoryRoute /> },
      { path: '/c/:category/:subcategory', element: <CategoryRoute /> },
      { path: '/c/:category/:subcategory/:child', element: <CategoryRoute /> },

      { path: '/vendor/:slug', element: <VendorStore /> },

      { path: '/brands', element: <BrandsPage /> },
      { path: '/flash-sale', element: <FlashSale /> },
      { path: '/offers', element: <OffersPage /> },

      { path: '/cart', element: <Cart /> },
      { path: '/track', element: <TrackOrder /> },
      { path: '/track/:awb', element: <TrackOrder /> },

      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/privacy-policy', element: <Policy /> },
      { path: '/terms', element: <Policy /> },
      { path: '/shipping-policy', element: <Policy /> },
      { path: '/return-policy', element: <Policy /> },

      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password/:token', element: <ResetPassword /> },
      { path: '/phone-login', element: <PhoneLogin /> },
      { path: '/otp-verify', element: <OtpVerify /> },
      { path: '/profile-setup', element: <ProfileSetup /> },

      {
        path: '/account',
        element: (
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'orders', element: <Orders /> },
          { path: 'orders/:id', element: <OrderDetail /> },
          { path: 'profile', element: <Profile /> },
          { path: 'addresses', element: <Addresses /> },
          { path: 'wishlist', element: <Wishlist /> },
          { path: 'reviews', element: <MyReviews /> },
          { path: 'change-password', element: <ChangePassword /> },
        ],
      },
    ],
  },

  {
    path: '/checkout',
    element: <CheckoutLayout />,
    children: [
      { index: true, element: <Checkout /> },
      { path: 'confirmation/:id', element: <OrderConfirmation /> },
    ],
  },
]);

export default function App() {
  return (
    <ToastProvider>
      <AppearanceProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </AppearanceProvider>
    </ToastProvider>
  );
}
