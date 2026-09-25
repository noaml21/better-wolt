import { Button, Icon, formatPrice } from '../ui';
import { dishCount } from '../../services/counts';
import './OwnerPanel.css';

/* The owner's tools for the restaurant they are looking at. It takes the
   column a customer's cart uses (V4 audit C1): the menu column narrows,
   so a dish's edit and delete sit next to its name, and managing starts
   beside what is being managed. Below the wide layout it is a toolbar
   above the menu. */

export default function OwnerPanel({ products, onAddDish, onEdit, onDelete }) {
  const prices = products.map((product) => Number(product.price)).filter(Number.isFinite);
  const low = prices.length ? Math.min(...prices) : null;
  const high = prices.length ? Math.max(...prices) : null;

  return (
    <section className="bw-owner-panel" aria-labelledby="bw-owner-panel-title">
      <div className="bw-owner-panel__head">
        <h2 className="bw-owner-panel__title" id="bw-owner-panel-title">
          <Icon name="store" size={20} />
          ניהול המסעדה
        </h2>
        <p className="bw-owner-panel__summary">
          {products.length ? dishCount(products.length) : 'אין מנות בתפריט'}
          {low !== null && (
            <>
              {' · '}
              <span className="bw-num bw-range">
                {low === high ? formatPrice(low) : `${formatPrice(low)}–${formatPrice(high)}`}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="bw-owner-panel__actions">
        <Button icon="plus" onClick={onAddDish}>
          הוספת מנה
        </Button>
        <Button variant="secondary" icon="edit" onClick={onEdit}>
          עריכת פרטים
        </Button>
        <Button variant="ghost" icon="trash" className="bw-owner-panel__close" onClick={onDelete}>
          סגירת המסעדה
        </Button>
      </div>
    </section>
  );
}
