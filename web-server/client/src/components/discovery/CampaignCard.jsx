import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import './CampaignCard.css';

/* The seeded World Cup restaurant, presented as what it is: a campaign.
   Its name comes from the server (ARCHITECTURE §6), never from here. */

export default function CampaignCard({ restaurant, to }) {
  if (!restaurant) {
    return null;
  }

  const dishCount = restaurant.products?.length || 0;

  return (
    <Link to={to || `/restaurant/${restaurant.id}`} className="bw-campaign">
      <span className="bw-campaign__icon" aria-hidden="true">
        <Icon name="trophy" size={28} />
      </span>

      <span className="bw-campaign__text">
        <span className="bw-campaign__eyebrow">קולקציה מיוחדת</span>
        <span className="bw-campaign__title">{restaurant.name}</span>
        <span className="bw-campaign__description">
          {dishCount} מנות נבחרת מכל העולם, במחיר אחיד של ₪30.
        </span>
      </span>

      <span className="bw-campaign__cta">
        לתפריט
        <Icon name="back" size={18} />
      </span>
    </Link>
  );
}
