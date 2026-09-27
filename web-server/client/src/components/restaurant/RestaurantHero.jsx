import { useState } from 'react';
import { Icon, Media, Plate, Rating, Skeleton } from '../ui';
import { getRestaurantMeta } from '../../services/restaurantMeta';
import './RestaurantHero.css';

/* The restaurant's name is set on its own food (V4 spec §4.4): a bottom
   scrim keeps white text readable on any photograph. Without a photo —
   none given, or the URL is dead — the plate takes the frame and the
   name sits on the plate's own tint instead, so there is no scrim to
   darken it. The facts sit on the page underneath, not in a card. */

export default function RestaurantHero({ restaurant }) {
  const meta = getRestaurantMeta(restaurant);
  const [failedSrc, setFailedSrc] = useState(null);
  const hasPhoto = Boolean(restaurant.image) && failedSrc !== restaurant.image;

  return (
    <header className="bw-restaurant-hero">
      <div className={`bw-restaurant-hero__media ${hasPhoto ? 'bw-restaurant-hero__media--photo' : ''}`}>
        <Media
          src={restaurant.image}
          onFail={setFailedSrc}
          fallback={<Plate restaurant={restaurant} size="hero" />}
        />

        <h1 className="bw-restaurant-hero__name bw-display">{restaurant.name}</h1>
      </div>

      <p className="bw-restaurant-hero__facts">
        <Rating value={meta.rating} />
        <span>
          <Icon name="clock" size={16} />
          <span className="bw-num">{meta.eta}</span> דק׳
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
          <a className="bw-restaurant-hero__phone" href={`tel:${restaurant.phone.replace(/[^\d+]/g, '')}`}>
            <Icon name="phone" size={16} />
            <span className="bw-num" dir="ltr">
              {restaurant.phone}
            </span>
          </a>
        )}
      </p>
    </header>
  );
}

/* The page's own shapes while it loads: the hero frame at its real size,
   the facts line, and a few menu rows. */
export function RestaurantHeroSkeleton() {
  return (
    <div aria-busy="true">
      <header className="bw-restaurant-hero">
        <Skeleton className="bw-restaurant-hero__media" height={null} radius="lg" />
        <div className="bw-restaurant-hero__facts">
          <Skeleton width="55%" height={14} />
        </div>
      </header>
      <Skeleton width={120} height={26} />
      <div className="bw-menu-list bw-menu-list--loading">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="bw-dish">
            <div className="bw-dish__text">
              <Skeleton width={160} height={18} />
              <Skeleton width="80%" height={12} />
              <Skeleton width={48} height={14} />
            </div>
            <Skeleton width={40} height={40} radius="pill" />
          </div>
        ))}
      </div>
    </div>
  );
}
