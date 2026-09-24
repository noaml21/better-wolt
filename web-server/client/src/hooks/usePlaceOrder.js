import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui';

/* Placing an order from a menu page (the restaurant page, /world-cup).

   The request carries only ids and quantities; the server prices it
   (V2_SPEC §3.1). The answer can arrive after the customer has moved on
   — gone to another page, or signed out — and then it must not pull them
   anywhere: a late success confirms with a toast, and only to the account
   that placed it; a late failure is reported the same way. If the account
   has changed meanwhile (another tab), the answer is not this page's to
   act on even when the page is still open. `from` is where
   signing in should return to.

   A refused order is written next to the cart (`problem`), not in a toast
   (V4 spec §3.5): it stays until the next attempt or until it is
   dismissed, so it cannot vanish while the customer is reading the cart.
   Toasts remain for answers that land after the page is gone. */

/* Contract strings (ARCHITECTURE §4.3): the cart names a dish the menu no
   longer has, or the restaurant itself is gone — changed by the owner
   while the page was open. */
const MENU_GONE = ['Product not found in restaurant menu', 'Restaurant not found'];

export default function usePlaceOrder({ restaurantId, cart, from, onPlaced, onMenuChanged }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, currentUsername } = useAuth();
  const { showToast } = useToast();
  const [placing, setPlacing] = useState(false);
  const [problem, setProblem] = useState(null);
  const mounted = useRef(true);
  const account = user?.username ?? null;

  // A problem belongs to the cart it was about, and that cart belongs to
  // the account (useMenuCart empties it when the account changes).
  useEffect(() => {
    setProblem(null);
  }, [account]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const placeOrder = useCallback(async () => {
    if (!isAuthenticated) {
      showToast('צריך להתחבר כדי להזמין', { tone: 'error' });
      navigate('/login', { state: { from } });
      return;
    }

    const placedBy = user?.username;
    const shownTotal = Math.round(cart.subtotal * 100) / 100;

    setProblem(null);
    setPlacing(true);

    try {
      const order = await createOrder({ restaurant: restaurantId, products: cart.toOrderProducts() });

      // Another tab may have switched the account while this was on its way.
      if (currentUsername() !== placedBy) {
        return;
      }

      if (!mounted.current) {
        showToast('ההזמנה נשלחה. אפשר לעקוב אחריה ב"ההזמנות שלי".');
        return;
      }

      cart.clear();
      onPlaced?.();

      /* The server prices the order from the menu as it is now (V2_SPEC
         §3.1). If the owner changed a price after it was added, what was
         charged is not what the cart showed — the tracking page says so
         beside the receipt, where the customer checks the total. */
      const charged = Number(order.total);

      navigate(`/tracking/${order.id}`, {
        state: charged !== shownTotal ? { priceCorrection: { shown: shownTotal, charged } } : undefined,
      });
    } catch (error) {
      /* A 401 has already signed the session out (so the account check
         below would swallow it); the order needs a fresh sign-in, the same
         path as ordering while signed out. */
      if (error.status === 401) {
        if (mounted.current) {
          showToast('החיבור פג. צריך להתחבר שוב כדי להזמין', { tone: 'error' });
          navigate('/login', { state: { from } });
        }

        return;
      }

      if (currentUsername() !== placedBy) {
        return;
      }

      if (!mounted.current) {
        showToast(error.message, { tone: 'error' });
        return;
      }

      if (error.status === 404 && MENU_GONE.includes(error.message) && onMenuChanged) {
        const explanation = await onMenuChanged();

        if (mounted.current && explanation) {
          setProblem(explanation);
        }

        return;
      }

      setProblem(error.message);
    } finally {
      if (mounted.current) {
        setPlacing(false);
      }
    }
  }, [isAuthenticated, user, currentUsername, restaurantId, cart, from, onPlaced, onMenuChanged, navigate, showToast]);

  const dismissProblem = useCallback(() => setProblem(null), []);

  return { placing, placeOrder, problem, dismissProblem };
}
