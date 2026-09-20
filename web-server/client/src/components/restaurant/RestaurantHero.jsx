import { Button, Icon, Rating, Skeleton } from '../ui';
import { getRestaurantMeta } from '../../services/restaurantMeta';
import './RestaurantHero.css';

/* Photo across the top, facts in a card that overlaps it. Owner actions
   live here too, so managing a restaurant starts where you look at it. */

export default function RestaurantHero({ restaurant, isOwner, onEdit, onDelete }) {
  const meta = getRestaurantMeta(restaurant);

  return (
    <header className="bw-restaurant-hero">
      <div className="bw-restaurant-hero__media">
        {restaurant.image ? (
          <img src={restaurant.image} alt="" />
        ) : (
          <span className="bw-restaurant-hero__placeholder" aria-hidden="true">
            {restaurant.name?.trim().charAt(0)}
          </span>
        )}
      </div>

      <div className="bw-restaurant-hero__card">
        <div className="bw-restaurant-hero__headline">
          <h1>{restaurant.name}</h1>
          <Rating value={meta.rating} />
        </div>

        <p className="bw-restaurant-hero__facts">
          <span>
            <Icon name="clock" size={16} />
            {meta.eta} דק׳
          </span>
          <span className={meta.deliveryFee === 0 ? 'bw-restaurant-hero__free' : undefined}>
            <Icon name="scooter" size={16} />
            {meta.deliveryLabel}
          </span>
          {restaurant.address && (
            <span>
              <Icon name="location" size={16} />
              {restaurant.address}
            </span>
          )}
          {restaurant.phone && (
            <span>
              <Icon name="phone" size={16} />
              {restaurant.phone}
            </span>
          )}
        </p>

        {isOwner && (
          <div className="bw-restaurant-hero__owner">
            <span className="bw-restaurant-hero__owner-label">
              <Icon name="store" size={16} />
              המסעדה שלכם
            </span>
            <div className="bw-restaurant-hero__owner-actions">
              <Button size="sm" variant="secondary" icon="edit" onClick={onEdit}>
                עריכת פרטים
              </Button>
              <Button size="sm" variant="danger" icon="trash" onClick={onDelete}>
                סגירת המסעדה
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function RestaurantHeroSkeleton() {
  return (
    <header className="bw-restaurant-hero" aria-busy="true">
      <Skeleton className="bw-restaurant-hero__media" height="100%" radius="lg" />
      <div className="bw-restaurant-hero__card">
        <Skeleton width="45%" height={30} />
        <Skeleton width="70%" height={14} />
      </div>
    </header>
  );
}
