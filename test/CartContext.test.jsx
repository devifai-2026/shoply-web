import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from '../src/context/CartContext';

function TestHarness() {
  const { cartItems, addToCart, updateQuantity, cartCount } = useCart();
  return (
    <div>
      <span data-testid="count">{cartCount}</span>
      <span data-testid="qty">{cartItems[0]?.quantity ?? 'none'}</span>
    </div>
  );
}

// Exposes the cart API on window so tests can call it outside of JSX event
// handlers, since CartContext has no built-in UI of its own.
function ExposeApi() {
  const api = useCart();
  window.__cartApi = api;
  return null;
}

function renderCart() {
  return render(
    <CartProvider>
      <ExposeApi />
      <TestHarness />
    </CartProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  window.__cartApi = undefined;
});

describe('CartContext quantity handling', () => {
  it('adds an item with a positive quantity', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 10 }, 2));
    expect(screen.getByTestId('qty').textContent).toBe('2');
    expect(screen.getByTestId('count').textContent).toBe('2');
  });

  it('caps added quantity at available stock', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 5 }, 20));
    expect(screen.getByTestId('qty').textContent).toBe('5');
  });

  it('ignores an update to a negative quantity — cart stays unchanged', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 10 }, 3));
    act(() => window.__cartApi.updateQuantity('p1', undefined, undefined, -5));
    expect(screen.getByTestId('qty').textContent).toBe('3');
  });

  it('ignores an update to a zero quantity — cart stays unchanged', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 10 }, 3));
    act(() => window.__cartApi.updateQuantity('p1', undefined, undefined, 0));
    expect(screen.getByTestId('qty').textContent).toBe('3');
  });

  it('ignores a non-integer (fractional) quantity update', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 10 }, 3));
    act(() => window.__cartApi.updateQuantity('p1', undefined, undefined, 1.5));
    expect(screen.getByTestId('qty').textContent).toBe('3');
  });

  it('ignores a NaN quantity update', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 10 }, 3));
    act(() => window.__cartApi.updateQuantity('p1', undefined, undefined, NaN));
    expect(screen.getByTestId('qty').textContent).toBe('3');
  });

  it('accepts a valid positive integer quantity update', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 10 }, 3));
    act(() => window.__cartApi.updateQuantity('p1', undefined, undefined, 7));
    expect(screen.getByTestId('qty').textContent).toBe('7');
  });

  it('caps an update at available stock', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 10 }, 3));
    act(() => window.__cartApi.updateQuantity('p1', undefined, undefined, 999));
    expect(screen.getByTestId('qty').textContent).toBe('10');
  });

  it('cartCount never goes negative regardless of malformed updates', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 10 }, 1));
    act(() => window.__cartApi.updateQuantity('p1', undefined, undefined, -100));
    act(() => window.__cartApi.updateQuantity('p1', undefined, undefined, 0));
    act(() => window.__cartApi.updateQuantity('p1', undefined, undefined, NaN));
    expect(Number(screen.getByTestId('count').textContent)).toBeGreaterThanOrEqual(1);
  });

  it('persists cart to localStorage', () => {
    renderCart();
    act(() => window.__cartApi.addToCart({ id: 'p1', price: 100, stock: 10 }, 2));
    const stored = JSON.parse(localStorage.getItem('cart'));
    expect(stored).toHaveLength(1);
    expect(stored[0].quantity).toBe(2);
  });
});
