import { useEffect, useRef } from 'react';
import { Button, Icon, QuantityStepper, formatPrice } from '../ui';
import './CartPanel.css';

/* The cart is the ticket (V5 spec §5): a band in the restaurant's line
   colour, the lines on perforations, the total in big condensed figures,
   and the one primary action carrying it. It is a summary, not a source
   of truth: the server recomputes every price when the order is placed
   (V2_SPEC §3.1), so the note says the final price is the menu's at the
   moment of ordering. `line` is getLine(restaurant): the sheet renders in
   a portal outside the page, so it cannot inherit the page's colour. */

export default function CartPanel({
  lines,
  itemCount,
  subtotal,
  onAdd,
  onRemove,
  onPlaceOrder,
  placing,
  restaurantName,
  problem,
  onDismissProblem,
  line,
  variant = 'panel',
}) {
  const isEmpty = lines.length === 0;
  const panel = useRef(null);
  const lineLeaving = useRef(false);

  /* Taking a line to zero removes the row that holds focus. In the sheet
     that would drop focus to <body>, behind the modal, so it moves to the
     cart itself, which stays put (its heading is hidden in the sheet). */
  useEffect(() => {
    if (lineLeaving.current) {
      lineLeaving.current = false;
      panel.current?.focus();
    }
  }, [lines.length]);

  return (
    <section
      ref={panel}
      tabIndex={-1}
      className={`bw-cart bw-cart--${variant} ${line?.className || ''} ${isEmpty ? 'bw-cart--empty' : ''}`}
      aria-labelledby="bw-cart-title"
    >
      <header className="bw-cart__header">
        {line && (
          <span className="bw-cart__badge" aria-hidden="true">
            {line.number}
          </span>
        )}
        <div className="bw-cart__heading">
          <h2 className="bw-cart__title" id="bw-cart-title">
            הסל שלי
            {/* Keyed by the count: each change remounts it, which replays the
                bump that confirms the add landed. */}
            {itemCount > 0 && (
              <span key={itemCount} className="bw-cart__count bw-num">
                {itemCount}
              </span>
            )}
          </h2>
          {restaurantName && (
            <p className="bw-cart__from">
              <bdi>{restaurantName}</bdi>
            </p>
          )}
        </div>
      </header>

      {isEmpty ? (
        <div className="bw-cart__empty">
          <p>הסל ריק. כל + בתפריט עולה לכאן.</p>
        </div>
      ) : (
        <>
          {/* The lines are the live part: a quantity changing is announced,
              the whole panel is not re-read. */}
          <ul className="bw-cart__lines" aria-live="polite">
            {lines.map((line) => (
              <li key={line.id} className="bw-cart__line">
                <div className="bw-cart__line-text">
                  <span className="bw-cart__line-name">{line.name}</span>
                  <span className="bw-cart__line-price bw-num">
                    {formatPrice(Number(line.price) * line.quantity)}
                    {line.quantity > 1 && (
                      <span className="bw-cart__line-unit"> · {formatPrice(line.price)} ליחידה</span>
                    )}
                  </span>
                </div>
                <QuantityStepper
                  size="sm"
                  value={line.quantity}
                  label={line.name}
                  onDecrease={() => {
                    lineLeaving.current = line.quantity === 1;
                    onRemove(line.id);
                  }}
                  onIncrease={() => onAdd(line)}
                />
              </li>
            ))}
          </ul>

          <div className="bw-cart__summary">
            <div className="bw-cart__total">
              <span>סך הכול</span>
              <strong className="bw-num">{formatPrice(subtotal)}</strong>
            </div>
            {/* True of every order: the client never sets a price
                (V2_SPEC §3.1). There is no payment step and no fee. */}
            <p className="bw-cart__note">המחיר הסופי נקבע לפי התפריט ברגע ההזמנה.</p>

            {problem && (
              <div className="bw-cart__problem" role="alert">
                <Icon name="alert" size={18} />
                {/* Server strings are contract and shown as they come
                    (ARCHITECTURE §4.3); the lead says what they mean. */}
                <p>
                  <strong>ההזמנה לא נשלחה.</strong> {problem}
                </p>
                {onDismissProblem && (
                  <button type="button" className="bw-cart__problem-close" aria-label="סגירת ההודעה" onClick={onDismissProblem}>
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>
            )}

            <Button fullWidth size="lg" loading={placing} onClick={onPlaceOrder} className="bw-cart__cta">
              <span>לביצוע ההזמנה</span>
              <span className="bw-cart__cta-total bw-num">{formatPrice(subtotal)}</span>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

export function CartBar({ itemCount, subtotal, onOpen, line }) {
  useEffect(() => {
    document.body.classList.toggle('bw-has-cart-bar', itemCount > 0);

    return () => document.body.classList.remove('bw-has-cart-bar');
  }, [itemCount]);

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className={`bw-cart-bar ${line?.className || ''}`}>
      <button type="button" className="bw-cart-bar__button" onClick={onOpen}>
        <span key={itemCount} className="bw-cart-bar__count bw-num">
          {itemCount}
        </span>
        <span className="bw-cart-bar__label">לסל</span>
        <span className="bw-cart-bar__total bw-num">{formatPrice(subtotal)}</span>
      </button>
    </div>
  );
}
