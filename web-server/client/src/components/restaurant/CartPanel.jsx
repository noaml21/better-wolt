import { useEffect } from 'react';
import { Button, Icon, QuantityStepper, formatPrice } from '../ui';
import './CartPanel.css';

/* The cart is a summary, not a source of truth: the server recomputes
   every price when the order is placed (V2_SPEC §3.1), so the total here
   is labelled as an estimate of the items only. */

export default function CartPanel({
  lines,
  itemCount,
  subtotal,
  onAdd,
  onRemove,
  onPlaceOrder,
  placing,
  variant = 'panel',
}) {
  const isEmpty = lines.length === 0;

  return (
    <section
      className={`bw-cart bw-cart--${variant}`}
      aria-labelledby="bw-cart-title"
      aria-live="polite"
    >
      <header className="bw-cart__header">
        <h2 className="bw-cart__title" id="bw-cart-title">
          <Icon name="cart" size={20} />
          הסל שלי
        </h2>
        {itemCount > 0 && <span className="bw-cart__count">{itemCount}</span>}
      </header>

      {isEmpty ? (
        <p className="bw-cart__empty">
          הסל ריק. הוסיפו מנות מהתפריט והן יופיעו כאן.
        </p>
      ) : (
        <>
          <ul className="bw-cart__lines">
            {lines.map((line) => (
              <li key={line.id} className="bw-cart__line">
                <div className="bw-cart__line-text">
                  <span className="bw-cart__line-name">{line.name}</span>
                  <span className="bw-cart__line-price">
                    {formatPrice(Number(line.price) * line.quantity)}
                  </span>
                </div>
                <QuantityStepper
                  size="sm"
                  value={line.quantity}
                  label={line.name}
                  onDecrease={() => onRemove(line.id)}
                  onIncrease={() => onAdd(line)}
                />
              </li>
            ))}
          </ul>

          <div className="bw-cart__summary">
            <div className="bw-cart__total">
              <span>סך המנות</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p className="bw-cart__note">דמי המשלוח מחושבים בשלב התשלום.</p>
            <Button fullWidth size="lg" loading={placing} onClick={onPlaceOrder}>
              לביצוע ההזמנה
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

export function CartBar({ itemCount, subtotal, onOpen }) {
  useEffect(() => {
    document.body.classList.toggle('bw-has-cart-bar', itemCount > 0);

    return () => document.body.classList.remove('bw-has-cart-bar');
  }, [itemCount]);

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="bw-cart-bar">
      <button type="button" className="bw-cart-bar__button" onClick={onOpen}>
        <span className="bw-cart-bar__count">{itemCount}</span>
        <span className="bw-cart-bar__label">צפייה בסל</span>
        <span className="bw-cart-bar__total">{formatPrice(subtotal)}</span>
      </button>
    </div>
  );
}
