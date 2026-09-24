import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, useToast } from '../components/ui';

/* Placing an order from a menu page (the restaurant page, /world-cup).

   The request carries only ids and quantities; the server prices it
   (V2_SPEC §3.1). The answer can arrive after the customer has moved on
   — gone to another page, or signed out — and then it must not pull them
   anywhere: a late success confirms with a toast, and only to the account
   that placed it; a late failure is reported the same way. If the account
   has changed meanwhile (another tab), the answer is not this page's to
   act on even when the page is still open. `from` is where
   signing in should return to. */

/* Contract strings (ARCHITECTURE §4.3): the cart names a dish the menu no
   longer has, or the restaurant itself is gone — changed by the owner
   while the page was open. */
const MENU_GONE = ['Product not found in restaurant menu', 'Restaurant not found'];

export default function usePlaceOrder({ restaurantId, cart, from, onPlaced, onMenuChanged }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, currentUsername } = useAuth();
  const { showToast } = useToast();
  const [placing, setPlacing] = useState(false);
  const mounted = useRef(true);

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
      navigate(`/tracking/${order.id}`);

      /* The server prices the order from the menu as it is now (V2_SPEC
         §3.1). If the owner changed a price after it was added, what was
         charged is not what the cart showed — say so, don't let it pass. */
      if (Number(order.total) !== shownTotal) {
        showToast(`המחירים בתפריט השתנו בינתיים. ההזמנה חויבה לפי המחיר העדכני: ${formatPrice(order.total)}.`, {
          tone: 'error',
          duration: 7000,
        });
      }
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
        await onMenuChanged();
        return;
      }

      showToast(error.message, { tone: 'error' });
    } finally {
      if (mounted.current) {
        setPlacing(false);
      }
    }
  }, [isAuthenticated, user, currentUsername, restaurantId, cart, from, onPlaced, onMenuChanged, navigate, showToast]);

  return { placing, placeOrder };
}
