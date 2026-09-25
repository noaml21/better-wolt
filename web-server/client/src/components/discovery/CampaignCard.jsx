import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Media, formatPrice } from '../ui';
import { dishCount } from '../../services/counts';
import { worldCupDishes } from '../../services/worldCup';
import './CampaignCard.css';

/* The seeded World Cup restaurant as the board's one special line (V5
   spec §6): a black band, the name in amber signage, and the teams as
   stations on an amber line. Its name comes from the server
   (ARCHITECTURE §6), never from here; so does the flat price. A flag that
   does not load drops out of the line. */

const STATIONS = 10;

export default function CampaignCard({ restaurant, to }) {
  const [broken, setBroken] = useState(() => new Set());
  const markBroken = useCallback((src) => {
    setBroken((current) => (current.has(src) ? current : new Set(current).add(src)));
  }, []);

  if (!restaurant) {
    return null;
  }

  const products = restaurant.products || [];
  const prices = new Set(products.map((product) => Number(product.price)));
  const flatPrice = prices.size === 1 ? [...prices][0] : null;
  const flags = worldCupDishes.filter((dish) => !broken.has(dish.flag)).slice(0, STATIONS);

  return (
    <Link to={to || `/restaurant/${restaurant.id}`} className="bw-campaign">
      <span className="bw-campaign__text">
        <span className="bw-campaign__title bw-display">{restaurant.name}</span>
        <span className="bw-campaign__description">
          {dishCount(products.length)} מכל העולם
          {flatPrice !== null && (
            <>
              , כל אחת ב־<span className="bw-num">{formatPrice(flatPrice)}</span>
            </>
          )}
          .
        </span>
      </span>

      {flags.length > 0 && (
        <span className="bw-campaign__line" aria-hidden="true">
          {flags.map((dish) => (
            <span key={dish.key} className="bw-campaign__station">
              <Media src={dish.flag} onFail={markBroken} />
            </span>
          ))}
        </span>
      )}

      <span className="bw-campaign__cta">
        לתפריט המונדיאל
        <Icon name="back" size={18} />
      </span>
    </Link>
  );
}
