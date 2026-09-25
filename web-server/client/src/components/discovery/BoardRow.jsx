import { Link } from 'react-router-dom';
import { Media, Plate, Skeleton, formatPrice } from '../ui';
import { getLine, getMenuHighlights, getRestaurantMeta } from '../../services/restaurantMeta';
import './BoardRow.css';

/* One line on the departures board (V5 spec §5): the line badge, the
   food, the name with up to three dishes as its stops, and the two
   numbers that decide an order — how long and what delivery costs — in
   aligned columns. The whole row is one link; pointing at it floods it
   with the line's colour. `note` replaces the dishes when the context has
   something more specific to say (search: the dish that matched). */

export default function BoardRow({ restaurant, note, ordered = false }) {
  const meta = getRestaurantMeta(restaurant);
  const line = getLine(restaurant);
  const highlights = getMenuHighlights(restaurant, 3).replace(/ · /g, '  /  ');
  const eta = meta.eta.replace('-', '–');
  const fee = meta.deliveryFee === 0 ? 'חינם' : formatPrice(meta.deliveryFee);

  return (
    <li className={`bw-board-row ${line.className}`}>
      <Link to={`/restaurant/${restaurant.id}`} className="bw-board-row__link">
        <span className="bw-board-row__badge" aria-hidden="true">
          {line.number}
        </span>

        <span className="bw-board-row__photo">
          <Media src={restaurant.image} loading="lazy" fallback={<Plate restaurant={restaurant} size="thumb" />} />
        </span>

        <span className="bw-board-row__main">
          <h3 className="bw-board-row__name bw-display">{restaurant.name}</h3>
          {note ? (
            <span className="bw-board-row__stops bw-board-row__stops--note" data-testid="note">
              {note}
            </span>
          ) : (
            highlights && <span className="bw-board-row__stops">{highlights}</span>
          )}
          <span className="bw-board-row__meta">
            {ordered && <span className="bw-board-row__mark">הזמנתם כאן</span>}
            <span>
              דירוג <span className="bw-num">{meta.rating}</span>
            </span>
            {meta.fromPrice !== null && (
              <span>
                מנות מ־<span className="bw-num">{formatPrice(meta.fromPrice)}</span>
              </span>
            )}
            <span className="bw-board-row__meta-fee">{meta.deliveryLabel}</span>
          </span>
        </span>

        <span className="bw-board-row__time">
          <span className="bw-board-row__big bw-num bw-range">{eta}</span>
          <span className="bw-board-row__unit">דקות</span>
        </span>

        <span className="bw-board-row__fee">
          <span className="bw-board-row__big bw-num">{fee}</span>
          <span className="bw-board-row__unit">משלוח</span>
        </span>
      </Link>
    </li>
  );
}

export function BoardRowSkeleton() {
  return (
    <li className="bw-board-row bw-board-row--loading" aria-hidden="true">
      <span className="bw-board-row__link">
        <Skeleton className="bw-board-row__badge" height={null} />
        <Skeleton className="bw-board-row__photo" height={null} />
        <span className="bw-board-row__main">
          <Skeleton width="55%" height={40} />
          <Skeleton width="80%" height={14} />
        </span>
        <span className="bw-board-row__time">
          <Skeleton width={72} height={32} />
        </span>
        <span className="bw-board-row__fee">
          <Skeleton width={56} height={32} />
        </span>
      </span>
    </li>
  );
}
