import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Caps a desired quantity at the product's available stock (when known).
  const capAtStock = (quantity, stock) =>
    typeof stock === 'number' && stock > 0 ? Math.min(quantity, stock) : quantity;

  const addToCart = (product, quantity = 1, selectedColor, selectedSize) => {
    const productId = product.id || product._id;
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          (item.id || item._id) === productId &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        const item = newItems[existingItemIndex];
        newItems[existingItemIndex] = {
          ...item,
          quantity: capAtStock(item.quantity + quantity, item.stock ?? product.stock),
        };
        return newItems;
      }

      return [...prevItems, {
        ...product,
        id: productId,
        quantity: capAtStock(quantity, product.stock),
        selectedColor,
        selectedSize,
      }];
    });
  };

  const removeFromCart = (productId, selectedColor, selectedSize) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize)
      )
    );
  };

  const updateQuantity = (productId, selectedColor, selectedSize, quantity) => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item.id === productId &&
         item.selectedColor === selectedColor &&
         item.selectedSize === selectedSize)
          ? { ...item, quantity: capAtStock(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
