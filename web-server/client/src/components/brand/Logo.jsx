import './Logo.css';

/* The mark is the price tag from the design language (spec §3.2): the
   same shape that marks a price in the product marks the product. It is
   drawn, not raster, so it recolours with the theme. */

export default function Logo({ variant = 'full', className = '' }) {
  return (
    <span className={`bw-logo ${className}`} aria-hidden="true">
      <svg className="bw-logo__mark" viewBox="0 0 36 36" width="36" height="36" role="img">
        <path
          className="bw-logo__tag"
          d="M31.6 14.3 22.4 4.6A5.2 5.2 0 0 0 18.6 3H8.2A5.2 5.2 0 0 0 3 8.2v19.6A5.2 5.2 0 0 0 8.2 33h10.4a5.2 5.2 0 0 0 3.8-1.6l9.2-9.7a5.4 5.4 0 0 0 0-7.4z"
        />
        <circle className="bw-logo__hole" cx="25.6" cy="18" r="2.6" />
        <path
          className="bw-logo__letter"
          d="M9.4 24.6V11.4h5.2c2.6 0 4 1.2 4 3.2 0 1.4-.7 2.4-2 2.9 1.6.4 2.5 1.5 2.5 3.1 0 2.4-1.7 4-4.6 4zm2.9-7.9h1.9c1 0 1.6-.5 1.6-1.4s-.6-1.3-1.6-1.3h-1.9zm0 5.5h2.2c1.1 0 1.8-.5 1.8-1.5s-.7-1.5-1.8-1.5h-2.2z"
        />
      </svg>

      {variant === 'full' && (
        <span className="bw-logo__word">
          Better <span className="bw-logo__word-accent">Wolt</span>
        </span>
      )}
    </span>
  );
}
