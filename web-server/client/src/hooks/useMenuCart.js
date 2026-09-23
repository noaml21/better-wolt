import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/* Cart state for one restaurant page.

   It holds one line per product with a quantity — V2 pushed one entry per
   unit, which is why the old cart listed the same dish three times. The
   totals here are for display only: the order request carries nothing but
   ids and quantities, and the server prices it (V2_SPEC §3.1). */

export default function useMenuCart() {
  const [lines, setLines] = useState([]);
  const { user } = useAuth();
  const account = user?.username ?? null;
  const cartAccount = useRef(account);

  /* A cart belongs to whoever filled it. The account can change under an
     open page — signing out or in from another tab — and the next person
     must not inherit (or order) the previous one's dishes. The mobile
     client does the same by keying its cart provider on the account. */
  useEffect(() => {
    if (cartAccount.current !== account) {
      cartAccount.current = account;
      setLines([]);
    }
  }, [account]);

  const addItem = useCallback((product) => {
    setLines((current) => {
      const existing = current.find((line) => line.id === product.id);

      if (existing) {
        return current.map((line) =>
          line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }

      return [...current, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setLines((current) =>
      current
        .map((line) => (line.id === productId ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0)
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  /* Drops lines whose dish is no longer on the menu (`ids` is a Set). */
  const keepOnly = useCallback((ids) => {
    setLines((current) => current.filter((line) => ids.has(line.id)));
  }, []);

  const quantities = useMemo(
    () => Object.fromEntries(lines.map((line) => [line.id, line.quantity])),
    [lines]
  );

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines]
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0),
    [lines]
  );

  const toOrderProducts = useCallback(
    () => lines.map((line) => ({ id: line.id, quantity: line.quantity })),
    [lines]
  );

  return { lines, quantities, itemCount, subtotal, addItem, removeItem, clear, keepOnly, toOrderProducts };
}
