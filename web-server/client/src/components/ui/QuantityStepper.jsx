import Icon from './Icon';
import './QuantityStepper.css';

/* Quantity control for a cart line. The live count is announced through
   the group's label, so screen readers hear the dish and its quantity. */

export default function QuantityStepper({ value, onDecrease, onIncrease, label, min = 0, size = 'md' }) {
  const atMin = value <= min;

  return (
    <div className={`bw-stepper bw-stepper--${size}`} role="group" aria-label={label}>
      <button
        type="button"
        className="bw-stepper__button"
        onClick={onDecrease}
        aria-label={atMin ? `הסרה של ${label}` : `פחות ${label}`}
      >
        <Icon name={atMin ? 'trash' : 'minus'} size={16} />
      </button>

      <span className="bw-stepper__value" aria-live="polite">
        {value}
      </span>

      <button
        type="button"
        className="bw-stepper__button"
        onClick={onIncrease}
        aria-label={`עוד ${label}`}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
