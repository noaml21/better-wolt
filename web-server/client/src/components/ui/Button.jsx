import { Link } from 'react-router-dom';
import Icon from './Icon';
import Spinner from './Spinner';
import './Button.css';

/* Primary action, in four tones and three sizes.
   `loading` swaps the label for a spinner of the same size, so the button
   never changes width mid-action (spec §4.4).

   A loading button refuses activation but is not `disabled`: a disabled
   element cannot hold focus, so the button that was just pressed would
   drop focus to <body> — out of a dialog's focus trap, and away from the
   form whose error is about to appear. Swallowing the click also stops
   a second submit, including Enter in a field (implicit submission
   clicks the submit button). */

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
  onClick,
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
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
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
