import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

/* One cart, one restaurant, one line per product.

   V2 pushed an entry per unit, so three burgers were three rows with no
   way to adjust them. A line holds a quantity instead. The totals here
   are for display only: the order request carries nothing but ids and
   quantities, and the server prices it (V2_SPEC §3.1).

   Restaurant and lines are one piece of state so that switching
   restaurants is a single, replayable update. */

const CartContext = createContext(null);

const EMPTY = { restaurant: null, lines: [] };

function entityId(entity) {
  const id = entity?.id || entity?._id;

  return id ? String(id) : null;
}

function withoutEmptyLines(cart) {
  const lines = cart.lines.filter((line) => line.quantity > 0);

  return lines.length === 0 ? EMPTY : { ...cart, lines };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY);
  const { user } = useAuth();

  /* A cart belongs to whoever is signed in. Signing out or switching
     accounts empties it rather than handing it to the next person. */
  useEffect(() => {
    setCart(EMPTY);
  }, [user?.id]);

  /* Adding from another restaurant replaces the cart. The screen asks
     first; this only carries out the answer. */
  const addItem = useCallback((product, fromRestaurant) => {
    const productId = entityId(product);
    const restaurantId = entityId(fromRestaurant);

    if (!productId || !restaurantId) {
      return;
    }

    const line = { id: productId, name: product.name, price: Number(product.price) || 0, quantity: 1 };

    setCart((current) => {
      const restaurant = { ...fromRestaurant, id: restaurantId };

      if (entityId(current.restaurant) !== restaurantId) {
        return { restaurant, lines: [line] };
      }

      const existing = current.lines.find((item) => item.id === productId);

      return {
        restaurant,
        lines: existing
          ? current.lines.map((item) =>
              item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
            )
          : [...current.lines, line],
      };
    });
  }, []);

  const decreaseItem = useCallback((productId) => {
    const id = String(productId);

    setCart((current) =>
      withoutEmptyLines({
        ...current,
        lines: current.lines.map((line) =>
          line.id === id ? { ...line, quantity: line.quantity - 1 } : line
        ),
      })
    );
  }, []);

  const removeLine = useCallback((productId) => {
    const id = String(productId);

    setCart((current) =>
      withoutEmptyLines({ ...current, lines: current.lines.filter((line) => line.id !== id) })
    );
  }, []);

  const clear = useCallback(() => setCart(EMPTY), []);

  const value = useMemo(() => {
    const quantities = Object.fromEntries(cart.lines.map((line) => [line.id, line.quantity]));

    return {
      restaurant: cart.restaurant,
      restaurantId: entityId(cart.restaurant),
      lines: cart.lines,
      quantities,
      itemsCount: cart.lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: cart.lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
      addItem,
      decreaseItem,
      removeLine,
      clear,
      toOrderProducts: () => cart.lines.map((line) => ({ id: line.id, quantity: line.quantity })),
    };
  }, [cart, addItem, decreaseItem, removeLine, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }

  return context;
}
