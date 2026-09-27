import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Media, formatPrice } from '../ui';
import { dishCount } from '../../services/counts';
import { worldCupDishes } from '../../services/worldCup';
import './CampaignCard.css';

/* The seeded World Cup restaurant, presented as what it is: a campaign.
   Its name comes from the server (ARCHITECTURE §6), never from here.

   V4 moves it off the night surface onto amber (spec §6): home already has
   one night band, and two stacked dark slabs pushed the first restaurant
   below the fold. The flags are the campaign's picture; a flag that does
   not load simply drops out of the strip. */

const STRIP_FLAGS = 8;

export default function CampaignCard({ restaurant, to }) {
  const [broken, setBroken] = useState(() => new Set());
  const markBroken = useCallback((src) => {
    setBroken((current) => (current.has(src) ? current : new Set(current).add(src)));
  }, []);

  if (!restaurant) {
    return null;
  }

  const products = restaurant.products || [];
  /* The campaign's flat price is whatever the seed priced the dishes at,
     read back from the server rather than written here — the same rule
     the campaign page follows. */
  const prices = new Set(products.map((product) => Number(product.price)));
  const flatPrice = prices.size === 1 ? [...prices][0] : null;
  const flags = worldCupDishes.filter((dish) => !broken.has(dish.flag)).slice(0, STRIP_FLAGS);

  return (
    <Link to={to || `/restaurant/${restaurant.id}`} className="bw-campaign">
      <span className="bw-campaign__text">
        <span className="bw-campaign__title bw-display">{restaurant.name}</span>
        <span className="bw-campaign__description">
          {dishCount(products.length)} מכל העולם
          {flatPrice !== null && (
            <>
              , כל אחת ב-<span className="bw-num">{formatPrice(flatPrice)}</span>
            </>
          )}
          .
        </span>
      </span>

      {flags.length > 0 && (
        <span className="bw-campaign__flags" aria-hidden="true">
          {flags.map((dish) => (
            <Media key={dish.key} src={dish.flag} className="bw-campaign__flag" onFail={markBroken} />
          ))}
        </span>
      )}

      <span className="bw-campaign__cta">
        לתפריט
        <Icon name="back" size={18} />
      </span>
    </Link>
  );
}
