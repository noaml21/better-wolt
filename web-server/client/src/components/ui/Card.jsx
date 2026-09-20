import './Card.css';

/* The resting surface: 1px line, radius md, elevation e1. Only the
   discovery grid raises on hover, via `interactive` (spec §4.3). */

export default function Card({ as = 'div', interactive = false, className = '', children, ...rest }) {
  const Element = as;

  return (
    <Element
      className={`bw-card ${interactive ? 'bw-card--interactive' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Element>
  );
}
