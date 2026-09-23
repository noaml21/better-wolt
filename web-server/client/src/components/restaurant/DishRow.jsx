import { IconButton, Tag, formatPrice } from '../ui';
import CartControl from './CartControl';
import './DishRow.css';

/* One dish. Customers get add/stepper; the owner gets edit and delete in
   the same place, so the menu is managed where it is read. */

export default function DishRow({
  product,
  quantity = 0,
  onAdd,
  onRemove,
  isOwner = false,
  onEdit,
  onDelete,
}) {
  return (
    <li className="bw-dish">
      <div className="bw-dish__text">
        <h3 className="bw-dish__name">{product.name}</h3>
        {product.description && <p className="bw-dish__description">{product.description}</p>}
        <Tag className="bw-dish__price">{formatPrice(product.price)}</Tag>
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
