import { getPlateTone } from '../../services/restaurantMeta';
import './Plate.css';

/* What a restaurant looks like without a photograph: its first word, set
   in the display face on the restaurant's own tint (V4 spec §4.4). Owners
   type image URLs by hand and some never add one, so this is an ordinary
   state of the grid, not an error — it has to look chosen. The name is
   already on the page next to it, so the plate is decorative. */

export default function Plate({ restaurant, size = 'card', className = '' }) {
  const word = restaurant?.name?.trim().split(/\s+/)[0] || '';

  return (
    <span
      className={`bw-plate bw-plate--${getPlateTone(restaurant)} bw-plate--${size} ${className}`}
      aria-hidden="true"
    >
      <span className="bw-plate__word">{word}</span>
    </span>
  );
}
