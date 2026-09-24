import './Skeleton.css';

/* Placeholder that matches the shape of the content it replaces.
   Always inside a container marked aria-busy, so screen readers hear one
   "loading" message instead of a wall of empty boxes. */

/* `height={null}` leaves the height to the className (a frame whose size
   comes from an aspect ratio or a breakpoint). */
export default function Skeleton({ width, height = 16, radius = 'sm', className = '' }) {
  return (
    <span
      className={`bw-skeleton bw-skeleton--${radius} ${className}`}
      style={height === null ? { width } : { width, height }}
      aria-hidden="true"
    />
  );
}
