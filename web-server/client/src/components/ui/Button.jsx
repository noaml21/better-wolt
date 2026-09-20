import { Link } from 'react-router-dom';
import Icon from './Icon';
import Spinner from './Spinner';
import './Button.css';

/* Primary action, in four tones and three sizes.
   `loading` swaps the label for a spinner of the same size, so the button
   never changes width mid-action (spec §4.4). */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = '',
  disabled,
  ...rest
}) {
  const classes = [
    'bw-button',
    `bw-button--${variant}`,
    `bw-button--${size}`,
    fullWidth ? 'bw-button--full' : '',
    loading ? 'bw-button--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner className="bw-button__spinner" size={size === 'lg' ? 22 : 18} />}
      <span className="bw-button__content">
        {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
        <span className="bw-button__label">{children}</span>
        {iconEnd && <Icon name={iconEnd} size={size === 'sm' ? 16 : 18} />}
      </span>
    </button>
  );
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}) {
  const classes = ['bw-icon-button', `bw-icon-button--${variant}`, `bw-icon-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={size === 'sm' ? 18 : 20} />
    </button>
  );
}

export function LinkButton({ children, variant = 'primary', size = 'md', icon, className = '', ...rest }) {
  const classes = ['bw-button', `bw-button--${variant}`, `bw-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Link className={classes} {...rest}>
      <span className="bw-button__content">
        {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
        <span className="bw-button__label">{children}</span>
      </span>
    </Link>
  );
}
