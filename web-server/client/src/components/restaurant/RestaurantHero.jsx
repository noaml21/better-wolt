import { useState } from 'react';
import { Media, Skeleton, formatPrice } from '../ui';
import { getLine, getRestaurantMeta } from '../../services/restaurantMeta';
import './RestaurantHero.css';

/* The restaurant's header (V5 spec §6): its line block — badge, name at
   signage scale, the facts — beside the food, which is the largest thing
   on the page. The name never sits on the photo. Without a photo (none
   given, or the URL is dead) the line block takes the whole width rather
   than framing an empty panel. For the owner the block turns neutral, so
   managing the menu never looks like an alert (spec §6, owner mode). */

export default function RestaurantHero({ restaurant, owner = false }) {
  const meta = getRestaurantMeta(restaurant);
  const line = getLine(restaurant);
  const [failedSrc, setFailedSrc] = useState(null);
  const hasPhoto = Boolean(restaurant.image) && failedSrc !== restaurant.image;
  const phone = restaurant.phone?.trim();

  return (
    <header
      className={[
        'bw-restaurant-hero',
        line.className,
        hasPhoto ? 'bw-restaurant-hero--photo' : '',
        owner ? 'bw-restaurant-hero--owner' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="bw-restaurant-hero__block">
        <span className="bw-restaurant-hero__badge" aria-hidden="true">
          {line.number}
        </span>

        <h1
          className={`bw-restaurant-hero__name bw-display ${
            restaurant.name.length > 24 ? 'bw-restaurant-hero__name--long' : ''
          }`}
        >
          {restaurant.name}
        </h1>

        <dl className="bw-restaurant-hero__facts">
          <div>
            <dt>זמן משלוח</dt>
            <dd>
              <span className="bw-num bw-range">{meta.eta.replace('-', '–')}</span> דק׳
            </dd>
          </div>
          <div>
            <dt>משלוח</dt>
            <dd className="bw-num">{meta.deliveryFee === 0 ? 'חינם' : formatPrice(meta.deliveryFee)}</dd>
          </div>
          <div>
            <dt>דירוג</dt>
            <dd className="bw-num">{meta.rating}</dd>
          </div>
          {restaurant.address && (
            <div>
              <dt>כתובת</dt>
              <dd>
                <bdi>{restaurant.address}</bdi>
              </dd>
            </div>
          )}
          {phone && (
            <div>
              <dt>טלפון</dt>
              <dd>
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="bw-num" dir="ltr">
                  {phone}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {hasPhoto && (
        <div className="bw-restaurant-hero__photo">
          <Media src={restaurant.image} alt="" onFail={setFailedSrc} />
        </div>
      )}
    </header>
  );
}

/* The page's own shapes while it loads: the header at its real size and a
   few stops of the route. */
export function RestaurantHeroSkeleton() {
  return (
    <div aria-busy="true" className="bw-restaurant-skeleton">
      <header className="bw-restaurant-hero bw-restaurant-hero--photo bw-restaurant-hero--loading">
        <div className="bw-restaurant-hero__block">
          <Skeleton width={72} height={72} />
          <Skeleton width="70%" height={96} />
          <Skeleton width="55%" height={20} />
        </div>
        <Skeleton className="bw-restaurant-hero__photo" height={null} />
      </header>
      <div className="bw-route bw-route--loading">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="bw-stop">
            <Skeleton className="bw-stop__ring" height={null} />
            <div className="bw-stop__text">
              <Skeleton width={180} height={20} />
              <Skeleton width="70%" height={14} />
            </div>
            <Skeleton width={56} height={20} />
            <Skeleton width={44} height={44} />
          </div>
        ))}
      </div>
    </div>
  );
}
