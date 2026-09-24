import Icon from './Icon';
import './Labels.css';

/* Small labelling pieces: the notched tag that marks prices and promos,
   the filter chip, the order-status pill and the rating.
   The tag shape appears nowhere else in the product (spec §3.2). */

export function Tag({ children, tone = 'price', className = '' }) {
  return <span className={`bw-tag bw-tag--${tone} ${className}`}>{children}</span>;
}

export function Price({ amount, className = '' }) {
  return <Tag className={className}>{formatPrice(amount)}</Tag>;
}

export function formatPrice(amount) {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;

  const [whole, fraction] = (safe % 1 === 0 ? String(safe) : safe.toFixed(2)).split('.');
  // Grouped by hand rather than with Intl, so both clients (and every JS
  // engine they run on) write ₪1,000,000 the same way.
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `₪${grouped}${fraction ? `.${fraction}` : ''}`;
}

export function Chip({ children, selected = false, icon, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`bw-chip ${selected ? 'bw-chip--selected' : ''} ${className}`}
      aria-pressed={selected}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

export function StatusPill({ children, tone = 'active', className = '' }) {
  return (
    <span className={`bw-status bw-status--${tone} ${className}`}>
      <span className="bw-status__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

export function Rating({ value, count, className = '' }) {
  return (
    <span className={`bw-rating ${className}`}>
      <Icon name="star" size={15} className="bw-rating__star" />
      <span className="bw-rating__value">{value}</span>
      {count ? <span className="bw-rating__count">({count})</span> : null}
    </span>
  );
}
