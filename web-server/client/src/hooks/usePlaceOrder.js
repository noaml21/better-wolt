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
   that placed it; a late failure is reported the same way. `from` is where
   signing in should return to. */

export default function usePlaceOrder({ restaurantId, cart, from, onPlaced }) {
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

    setPlacing(true);

    try {
      const order = await createOrder({ restaurant: restaurantId, products: cart.toOrderProducts() });

      if (!mounted.current) {
        if (currentUsername() === placedBy) {
          showToast('ההזמנה נשלחה. אפשר לעקוב אחריה ב"ההזמנות שלי".');
        }

        return;
      }

      cart.clear();
      onPlaced?.();
      navigate(`/tracking/${order.id}`);
    } catch (error) {
      if (!mounted.current) {
        if (currentUsername() === placedBy && error.status !== 401) {
          showToast(error.message, { tone: 'error' });
        }

        return;
      }

      /* A 401 has already signed the session out; the order needs a
         fresh sign-in, the same path as ordering while signed out. */
      if (error.status === 401) {
        showToast('החיבור פג. צריך להתחבר שוב כדי להזמין', { tone: 'error' });
        navigate('/login', { state: { from } });
        return;
      }

      showToast(error.message, { tone: 'error' });
    } finally {
      if (mounted.current) {
        setPlacing(false);
      }
    }
  }, [isAuthenticated, user, currentUsername, restaurantId, cart, from, onPlaced, navigate, showToast]);

  return { placing, placeOrder };
}
