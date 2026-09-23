import { Button, IconButton, QuantityStepper, Tag, formatPrice } from '../ui';
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
        ) : quantity > 0 ? (
          <QuantityStepper
            value={quantity}
            label={product.name}
            onDecrease={() => onRemove(product.id)}
            onIncrease={() => onAdd(product)}
          />
        ) : (
          /* Six buttons all called "הוספה" say nothing to a screen reader
             listing the page's controls; the dish name is added out of
             sight, after the visible word (WCAG 2.5.3). */
          <Button size="sm" icon="plus" onClick={() => onAdd(product)}>
            הוספה<span className="bw-visually-hidden">: {product.name}</span>
          </Button>
        )}
      </div>
    </li>
  );
}
