import { IconButton, formatPrice } from '../ui';
import CartControl from './CartControl';
import './DishRow.css';

/* One dish as a stop on the restaurant's route (V5 spec §5): a ring on
   the line, the dish, its price on a tab stop, and the quiet add control
   at the row's end. When the dish is in the cart its ring fills with the
   line colour and shows how many — the menu itself says what you chose.
   The owner gets edit and delete in the same place, so the menu is
   managed where it is read. */

export default function DishRow({
  product,
  quantity = 0,
  onAdd,
  onRemove,
  isOwner = false,
  onEdit,
  onDelete,
}) {
  const inCart = quantity > 0;

  return (
    <li className={`bw-stop ${inCart ? 'bw-stop--on' : ''}`}>
      {/* The stepper already says how many; the ring is the glance. */}
      <span className="bw-stop__ring bw-num" aria-hidden="true">
        {inCart ? quantity : ''}
      </span>

      <div className="bw-stop__text">
        <h3 className="bw-stop__name">
          <span className="bw-dish__label">{product.name}</span>
        </h3>
        {product.description && <p className="bw-stop__description bw-dish__description">{product.description}</p>}
      </div>

      <p className="bw-stop__price bw-num">{formatPrice(product.price)}</p>

      <div className="bw-stop__action">
        {isOwner ? (
          <>
            <IconButton icon="edit" label={`עריכת ${product.name}`} variant="outline" onClick={() => onEdit(product)} />
            <IconButton
              icon="trash"
              label={`מחיקת ${product.name}`}
              variant="danger"
              onClick={() => onDelete(product)}
            />
          </>
        ) : (
          <CartControl
            name={product.name}
            quantity={quantity}
            onAdd={() => onAdd(product)}
            onRemove={() => onRemove(product.id)}
          />
        )}
      </div>
    </li>
  );
}
