import './Logo.css';

/* The mark is a line badge (V5 spec §5): a black square with the B, the
   way a line number sits on a sign. Better Wolt is the city's own line,
   so its badge is ink rather than one of the restaurants' colours. Drawn
   in type, so it recolours with the theme. */

export default function Logo({ variant = 'full', className = '' }) {
  return (
    <span className={`bw-logo ${className}`} aria-hidden="true">
      <span className="bw-logo__mark">B</span>
      {variant === 'full' && <span className="bw-logo__word">Better Wolt</span>}
    </span>
  );
}
