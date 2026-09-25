import { Link } from 'react-router-dom';
import { formatOrderDay } from '../../services/orderStatus';
import { getLine } from '../../services/restaurantMeta';
import './OrderAgain.css';

/* The restaurants this account ordered from most recently, still open
   (V5 spec §6) — from the customer's own orders, nothing inferred — as a
   row of line chips: the line badge, the name, when. Hidden until there
   is something to show. */

const LIMIT = 4;

export default function OrderAgain({ restaurants, orders }) {
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
        {picks.map(({ restaurant, day }) => {
          const line = getLine(restaurant);

          return (
            <li key={restaurant.id}>
              <Link to={`/restaurant/${restaurant.id}`} className={`bw-again__chip ${line.className}`}>
                <span className="bw-again__badge" aria-hidden="true">
                  {line.number}
                </span>
                <span className="bw-again__text">
                  <span className="bw-again__name">{restaurant.name}</span>
                  {day && (
                    <span className="bw-again__day">
                      {day === 'היום' || day === 'אתמול' ? `הזמנתם ${day}` : `הזמנתם ב־${day}`}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
