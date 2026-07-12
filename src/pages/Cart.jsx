import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAppearance } from '../context/AppearanceContext';
import { getImageUrl } from '../lib/api';
import { Trash2, Plus, Minus, ChevronRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { formatPrice } = useAppearance();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?next=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-bg min-h-screen py-24">
      <div className="container mx-auto px-10 text-center">
        <div className="text-subtle w-16 h-16 mx-auto mb-10">
           <ShoppingBag className="w-full h-full stroke-[1.5]" />
        </div>
        <h1 className="text-[28px] font-light text-ink mb-4 tracking-tight">Your shopping bag is empty</h1>
        <p className="text-subtle mb-12 max-w-sm mx-auto text-[13px] font-medium leading-relaxed">Consider browsing our latest releases to find essentials that resonate with your style.</p>
        <Link to="/products" className="btn-minimal inline-block px-12">
          Discover Collections
        </Link>
      </div>
    </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pb-32 pt-12">
      <div className="container mx-auto px-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-subtle uppercase tracking-widest mb-10">
           <Link to="/" className="hover:text-ink transition-colors">Home</Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-ink">Shopping Bag</span>
        </div>

        <h1 className="text-[32px] font-light text-ink mb-16 tracking-tight">Shopping Bag ({cartCount})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-0">
            {cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="bg-white py-8 flex flex-col sm:flex-row gap-8 border-b border-border-minimal">
                 <div className="w-full sm:w-36 aspect-square bg-surface border border-border-minimal overflow-hidden shrink-0">
                    <img src={getImageUrl(item.images?.[0] || '')} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 </div>
                 <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                       <div className="flex justify-between items-start mb-2">
                          <Link to={`/products/${item.slug}`} className="text-[18px] font-semibold text-ink hover:text-subtle transition-all tracking-tight leading-tight">
                             {item.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                            className="p-1 text-subtle hover:text-ink transition-colors"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                       <div className="flex flex-wrap gap-6 text-[11px] font-bold text-subtle uppercase tracking-widest mt-3">
                          <span className="flex items-center gap-1">Color: <span className="text-ink">{item.selectedColor}</span></span>
                          <span className="flex items-center gap-1">Size: <span className="text-ink">{item.selectedSize}</span></span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                       <div className="flex items-center border border-border-minimal px-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center font-medium hover:text-subtle"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-semibold text-[13px]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center font-medium hover:text-subtle"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                       </div>
                       <div className="text-[17px] font-semibold text-ink">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <aside className="bg-surface p-10 border border-border-minimal sticky top-32">
             <h2 className="text-[11px] font-bold text-ink mb-10 uppercase tracking-[0.2em]">Summary</h2>

             <div className="mb-10">
                <div className="flex justify-between items-baseline">
                   <span className="text-[13px] font-bold uppercase tracking-wider text-ink">Total</span>
                   <span className="text-3xl font-semibold text-ink">{formatPrice(cartTotal)}</span>
                </div>
             </div>

             <button
              onClick={handleCheckout}
              className="btn-minimal w-full py-5 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center"
             >
                Proceed to Checkout
             </button>

             <div className="mt-12 pt-10 border-t border-border-minimal grayscale opacity-20">
                <div className="flex justify-center gap-8">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" referrerPolicy="no-referrer" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" referrerPolicy="no-referrer" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3" referrerPolicy="no-referrer" />
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
