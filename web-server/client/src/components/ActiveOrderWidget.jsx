import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/api';
import { getSecondsLeft, isActive } from '../services/orderStatus';
import Icon from './ui/Icon';
import './ActiveOrderWidget.css';

/* A single dock for orders on their way. It refreshes when the route
   changes and once a minute — the server never advances a status, so
   polling harder would only repeat the same answer (ARCHITECTURE §6). */

const REFRESH_MS = 60000;
const HIDDEN_PATHS = ['/tracking', '/login', '/register'];

export default function ActiveOrderWidget() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const account = isAuthenticated ? user?.username : null;
  const [fetched, setFetched] = useState({ account: null, orders: [] });
  const latestRequest = useRef(0);

  /* Orders belong to an account. A request still on its way when the
     account signs out (or another one signs in) must not land: only the
     newest request may write, and what it wrote is shown only while the
     same account is signed in. */
  const refresh = useCallback(async () => {
    const request = latestRequest.current + 1;

    latestRequest.current = request;

    if (!account) {
      setFetched({ account: null, orders: [] });
      return;
    }

    try {
      const orders = await getUserOrders();

      if (latestRequest.current === request) {
        setFetched({ account, orders: Array.isArray(orders) ? orders.filter(isActive) : [] });
      }
    } catch (error) {
      if (latestRequest.current === request) {
        setFetched({ account, orders: [] });
      }
    }
  }, [account]);

  const activeOrders = fetched.account === account ? fetched.orders : [];

  useEffect(() => {
    refresh();
  }, [refresh, location.pathname]);

  useEffect(() => {
    const timer = window.setInterval(refresh, REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [refresh]);

  const hidden = HIDDEN_PATHS.some((path) => location.pathname.startsWith(path));
  const showing = !hidden && activeOrders.length > 0;

  /* The pill floats over the page, so the page has to end above it
     rather than under it — the same arrangement the cart bar uses. */
  useEffect(() => {
    document.body.classList.toggle('bw-has-dock', showing);

    return () => document.body.classList.remove('bw-has-dock');
  }, [showing]);

  if (!showing) {
    return null;
  }

  const [order] = activeOrders;
  const minutesLeft = Math.ceil(getSecondsLeft(order) / 60);

  return (
    <div className="bw-dock">
      <Link to={`/tracking/${order.id}`} className="bw-dock__pill">
        <span className="bw-dock__icon" aria-hidden="true">
          <Icon name="scooter" size={20} />
        </span>

        <span className="bw-dock__text">
          <strong>
            {activeOrders.length > 1 ? `${activeOrders.length} הזמנות בדרך` : 'ההזמנה בדרך'}
          </strong>
          <span>
            {order.restaurantName} · עוד {minutesLeft} דק׳
          </span>
        </span>

        <Icon name="back" size={18} />
      </Link>
    </div>
  );
}
