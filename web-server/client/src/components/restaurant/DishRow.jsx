import { IconButton, formatPrice } from '../ui';
import CartControl from './CartControl';
import './DishRow.css';

/* One dish, read the way a menu is read: name, what is in it, what it
   costs. The add action repeats on every row, so it stays quiet — a small
   round control at the row's end (V4 spec §5) — and the dish name is the
   loudest thing in the row. The owner gets edit and delete in the same
   place, so the menu is managed where it is read. */

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
    <li className={`bw-dish ${inCart ? 'bw-dish--in-cart' : ''}`}>
      <div className="bw-dish__text">
        <h3 className="bw-dish__name">
          {/* The stepper already says how many; this is the glance. */}
          {inCart && (
            <span className="bw-dish__count bw-num" aria-hidden="true">
              {quantity}
            </span>
          )}
          <span className="bw-dish__label">{product.name}</span>
        </h3>
        {product.description && <p className="bw-dish__description">{product.description}</p>}
        <p className="bw-dish__price bw-num">{formatPrice(product.price)}</p>
      </div>

      <div className="bw-dish__action">
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
