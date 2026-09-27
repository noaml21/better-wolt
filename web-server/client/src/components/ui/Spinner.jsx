import './Spinner.css';

/* A spinner is only ever shown inside a control or beside a short line of
   text. Lists use skeletons instead (spec §6.1). */

export default function Spinner({ size = 20, className = '', label }) {
  return (
    <span
      className={`bw-spinner ${className}`}
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    />
  );
}
