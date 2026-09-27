import { useEffect, useRef } from 'react';
import { Icon, QuantityStepper } from '../ui';
import './CartControl.css';

/* "Add" until the dish is in the cart, then a stepper. The first add
   replaces the button that has focus, and taking the last one out
   replaces the stepper, so without a hand-off a keyboard user's focus
   falls to <body> and their place in the menu is gone. When a click is
   about to swap the controls, focus follows to the new one: the
   stepper's "more" after adding, the add button after removing.

   The add button is a quiet round control (V4 spec §5): it repeats on
   every row, so it must not outshout the dish. It has no visible word,
   and its accessible name carries the dish (WCAG 2.5.3 / 4.1.2). */

export default function CartControl({ name, quantity, onAdd, onRemove, stepperSize = 'md' }) {
  const container = useRef(null);
  const swapping = useRef(false);
  const inCart = quantity > 0;

  useEffect(() => {
    if (!swapping.current) {
      return;
    }

    swapping.current = false;

    const buttons = container.current?.querySelectorAll('button');

    buttons?.[buttons.length - 1]?.focus();
  }, [inCart]);

  return (
    <span className="bw-cart-control" ref={container}>
      {inCart ? (
        <QuantityStepper
          size={stepperSize}
          value={quantity}
          label={name}
          onDecrease={() => {
            swapping.current = quantity === 1;
            onRemove();
          }}
          onIncrease={onAdd}
        />
      ) : (
        <button
          type="button"
          className="bw-add"
          aria-label={`הוספה: ${name}`}
          onClick={() => {
            swapping.current = true;
            onAdd();
          }}
        >
          <Icon name="plus" size={20} />
        </button>
      )}
    </span>
  );
}
