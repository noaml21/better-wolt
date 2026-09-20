import './Skeleton.css';

/* Placeholder that matches the shape of the content it replaces.
   Always inside a container marked aria-busy, so screen readers hear one
   "loading" message instead of a wall of empty boxes. */

export default function Skeleton({ width, height = 16, radius = 'sm', className = '' }) {
  return (
    <span
      className={`bw-skeleton bw-skeleton--${radius} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <span className={`bw-skeleton-text ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} height={12} width={index === lines - 1 ? '60%' : '100%'} />
      ))}
    </span>
  );
}
