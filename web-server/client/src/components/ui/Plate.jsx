import { getLine } from '../../services/restaurantMeta';
import './Plate.css';

/* What a restaurant looks like without a photograph: its line plate — the
   line colour, the line number large in signage type and the name under
   it (V5 spec §4.4). Owners type image URLs by hand and some never add
   one, so this is an ordinary state of the board, not an error — it has
   to look chosen. The name is already on the page next to it, so the
   plate is decorative. */

export default function Plate({ restaurant, size = 'card', className = '' }) {
  const line = getLine(restaurant);

  /* A thumbnail sits beside the line badge, so it shows the name's first
     word instead of repeating the number. */
  if (size === 'thumb') {
    const word = restaurant?.name?.trim().split(/\s+/)[0] || '';

    return (
      <span
        className={`bw-plate ${line.className} bw-plate--thumb ${className}`}
        style={{ '--bw-plate-len': Math.max(word.length, 3) }}
        aria-hidden="true"
      >
        <span className="bw-plate__word">{word}</span>
      </span>
    );
  }

  return (
    <span className={`bw-plate ${line.className} bw-plate--${size} ${className}`} aria-hidden="true">
      <span className="bw-plate__number">{line.number}</span>
      <span className="bw-plate__name">{restaurant?.name}</span>
    </span>
  );
}
