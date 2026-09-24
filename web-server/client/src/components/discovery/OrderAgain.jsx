import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../services/api';
import { formatOrderDay } from '../../services/orderStatus';
import { Media, Plate } from '../ui';
import './OrderAgain.css';

/* The restaurants this account ordered from most recently, still open
   (V4 spec §6) — real data from GET /orders, nothing inferred. Hidden
   until there is something to show; a failed request shows nothing
   rather than an error, because the rest of the page does not depend on
   it. An answer that lands after the account changed is dropped, the
   same rule as the order dock. */

const LIMIT = 4;

export default function OrderAgain({ restaurants }) {
  const { isAuthenticated, user } = useAuth();
  const account = isAuthenticated ? user?.username : null;
  const [fetched, setFetched] = useState({ account: null, orders: [] });

  useEffect(() => {
    if (!account) {
      return undefined;
    }

    let current = true;

    getUserOrders()
      .then((orders) => {
        if (current) {
          setFetched({ account, orders: Array.isArray(orders) ? orders : [] });
        }
      })
      .catch(() => {});

    return () => {
      current = false;
    };
  }, [account]);

  const orders = fetched.account === account ? fetched.orders : [];
  const byId = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  const picks = [];
  const seen = new Set();

  for (let index = orders.length - 1; index >= 0 && picks.length < LIMIT; index -= 1) {
    const order = orders[index];
    const restaurant = byId.get(order.restaurant);

    if (restaurant && !seen.has(restaurant.id)) {
      seen.add(restaurant.id);
      picks.push({ restaurant, day: formatOrderDay(order.date) });
    }
  }

  if (picks.length === 0) {
    return null;
  }

  return (
    <section className="bw-again" aria-labelledby="bw-again-title">
      <h2 className="bw-again__title" id="bw-again-title">
        להזמין שוב
      </h2>
      <ul className="bw-again__list">
        {picks.map(({ restaurant, day }) => (
          <li key={restaurant.id}>
            <Link to={`/restaurant/${restaurant.id}`} className="bw-again__item">
              <span className="bw-again__thumb">
                <Media src={restaurant.image} loading="lazy" fallback={<Plate restaurant={restaurant} />} />
              </span>
              <span className="bw-again__text">
                <span className="bw-again__name">{restaurant.name}</span>
                {day && <span className="bw-again__day">הזמנתם {day === 'היום' || day === 'אתמול' ? day : `ב-${day}`}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
