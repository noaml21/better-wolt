import { Link } from 'react-router-dom';
import { Icon, Media, Plate, Rating, Skeleton, formatPrice } from '../ui';
import { getMenuHighlights, getRestaurantMeta } from '../../services/restaurantMeta';
import './RestaurantCard.css';

/* The unit of discovery: photo first, then the three things that decide
   an order — who, how good, how fast. The whole card is one link.
   `note` replaces the menu highlights when the context has something more
   specific to say (search: the dish that matched). */

export default function RestaurantCard({ restaurant, note }) {
  const meta = getRestaurantMeta(restaurant);
  const highlights = getMenuHighlights(restaurant);

  return (
    <li className="bw-restaurant-card">
      <Link to={`/restaurant/${restaurant.id}`} className="bw-restaurant-card__link">
        <div className="bw-restaurant-card__media">
          <Media
            src={restaurant.image}
            loading="lazy"
            fallback={<Plate restaurant={restaurant} />}
          />

          {meta.fromPrice !== null && (
            <span className="bw-restaurant-card__from">
              מנות מ-<span className="bw-num">{formatPrice(meta.fromPrice)}</span>
            </span>
          )}
        </div>

        <div className="bw-restaurant-card__body">
          <div className="bw-restaurant-card__heading">
            <h3 className="bw-restaurant-card__name">{restaurant.name}</h3>
            <Rating value={meta.rating} />
          </div>

          {note ? (
            <p className="bw-restaurant-card__note">{note}</p>
          ) : (
            highlights && <p className="bw-restaurant-card__highlights">{highlights}</p>
          )}

          <p className="bw-restaurant-card__meta">
            <span>
              <Icon name="clock" size={15} />
              <span className="bw-num">{meta.eta}</span> דק׳
            </span>
            <span className={meta.deliveryFee === 0 ? 'bw-restaurant-card__free' : undefined}>
              <Icon name="scooter" size={15} />
              {meta.deliveryLabel}
            </span>
          </p>
        </div>
      </Link>
    </li>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <li className="bw-restaurant-card bw-restaurant-card--loading">
      <Skeleton height={168} radius="md" />
      <div className="bw-restaurant-card__body">
        <Skeleton width="65%" height={18} />
        <Skeleton width="85%" height={12} />
        <Skeleton width="45%" height={12} />
      </div>
    </li>
  );
}
