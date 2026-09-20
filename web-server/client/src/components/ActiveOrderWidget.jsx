import { useCallback, useEffect, useState } from 'react';
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
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [activeOrders, setActiveOrders] = useState([]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setActiveOrders([]);
      return;
    }

    try {
      const orders = await getUserOrders();

      setActiveOrders(Array.isArray(orders) ? orders.filter(isActive) : []);
    } catch (error) {
      setActiveOrders([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh, location.pathname]);

  useEffect(() => {
    const timer = window.setInterval(refresh, REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [refresh]);

  const hidden = HIDDEN_PATHS.some((path) => location.pathname.startsWith(path));

  if (hidden || activeOrders.length === 0) {
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
