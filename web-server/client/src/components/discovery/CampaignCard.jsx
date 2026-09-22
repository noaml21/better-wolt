import { Link } from 'react-router-dom';
import { Icon, formatPrice } from '../ui';
import { dishCount } from '../../services/counts';
import './CampaignCard.css';

/* The seeded World Cup restaurant, presented as what it is: a campaign.
   Its name comes from the server (ARCHITECTURE §6), never from here. */

export default function CampaignCard({ restaurant, to }) {
  if (!restaurant) {
    return null;
  }

  const products = restaurant.products || [];
  /* The campaign's flat price is whatever the seed priced the dishes at,
     read back from the server rather than written here — the same rule
     the campaign page follows. */
  const prices = new Set(products.map((product) => Number(product.price)));
  const flatPrice = prices.size === 1 ? [...prices][0] : null;

  return (
    <Link to={to || `/restaurant/${restaurant.id}`} className="bw-campaign">
      <span className="bw-campaign__icon" aria-hidden="true">
        <Icon name="trophy" size={28} />
      </span>

      <span className="bw-campaign__text">
        <span className="bw-campaign__eyebrow">קולקציה מיוחדת</span>
        <span className="bw-campaign__title">{restaurant.name}</span>
        <span className="bw-campaign__description">
          {dishCount(products.length)} נבחרת מכל העולם
          {flatPrice !== null ? `, במחיר אחיד של ${formatPrice(flatPrice)}` : ''}.
        </span>
      </span>

      <span className="bw-campaign__cta">
        לתפריט
        <Icon name="back" size={18} />
      </span>
    </Link>
  );
}
