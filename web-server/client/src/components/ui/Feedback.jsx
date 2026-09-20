import Icon from './Icon';
import Button from './Button';
import './Feedback.css';

/* Empty and error states. Both say what happened and offer the action
   that resolves it — they are never a bare sentence (spec §6.1). */

export function EmptyState({ icon = 'bag', title, description, action, className = '' }) {
  return (
    <div className={`bw-state ${className}`}>
      <span className="bw-state__icon bw-state__icon--empty">
        <Icon name={icon} size={26} />
      </span>
      <h2 className="bw-state__title">{title}</h2>
      {description && <p className="bw-state__description">{description}</p>}
      {action && <div className="bw-state__action">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'לא הצלחנו לטעון את הדף', description, onRetry, className = '' }) {
  return (
    <div className={`bw-state ${className}`} role="alert">
      <span className="bw-state__icon bw-state__icon--error">
        <Icon name="alert" size={26} />
      </span>
      <h2 className="bw-state__title">{title}</h2>
      {description && <p className="bw-state__description">{description}</p>}
      {onRetry && (
        <div className="bw-state__action">
          <Button variant="secondary" onClick={onRetry}>
            נסו שוב
          </Button>
        </div>
      )}
    </div>
  );
}

export function InlineMessage({ tone = 'error', children, className = '' }) {
  return (
    <p className={`bw-inline-message bw-inline-message--${tone} ${className}`} role="alert">
      <Icon name={tone === 'error' ? 'alert' : 'info'} size={18} />
      <span>{children}</span>
    </p>
  );
}
