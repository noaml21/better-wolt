/* One inline SVG set, drawn on a 24px grid with a 1.75 stroke.
   Icons inherit currentColor and are hidden from assistive tech: the
   control around them carries the label. */

const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></>,
  cart: <><path d="M4 5h2.2l2 10.2a2 2 0 0 0 2 1.6h7.1a2 2 0 0 0 2-1.5L20.8 9H7" /><circle cx="10.5" cy="20" r="1.3" /><circle cx="17.5" cy="20" r="1.3" /></>,
  user: <><circle cx="12" cy="8.5" r="3.7" /><path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" /></>,
  star: <path d="m12 3.6 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" />,
  clock: <><circle cx="12" cy="12" r="8.4" /><path d="M12 7.3V12l3 1.8" /></>,
  scooter: <><circle cx="6" cy="17.5" r="2.6" /><circle cx="18.5" cy="17.5" r="2.6" /><path d="M8.6 17.5h7.3M13 6h3l2.5 11.5M5 9.5h4.5l2 5" /></>,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  trash: <><path d="M4.5 7h15M9.5 7V5.2a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2V7" /><path d="M6.6 7l.8 11.3a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.4 7" /></>,
  edit: <><path d="M4.5 19.5h4l9.4-9.4a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4.5 15.5z" /><path d="m13.8 6.6 3.6 3.6" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: <><circle cx="12" cy="12" r="8.4" /><path d="M12 7.8v4.9" /><circle cx="12" cy="16.2" r="0.9" fill="currentColor" stroke="none" /></>,
  info: <><circle cx="12" cy="12" r="8.4" /><path d="M12 11.3v4.9" /><circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" /></>,
  moon: <path d="M20 13.6A8.2 8.2 0 0 1 10.4 4a8.4 8.4 0 1 0 9.6 9.6z" />,
  sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2.8v2.1M12 19.1v2.1M4.5 4.5l1.5 1.5M18 18l1.5 1.5M2.8 12h2.1M19.1 12h2.1M4.5 19.5 6 18M18 6l1.5-1.5" /></>,
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  forward: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  down: <path d="M6 9.5 12 15.5 18 9.5" />,
  location: <><path d="M12 21s6.5-6 6.5-10.6a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21z" /><circle cx="12" cy="10.3" r="2.4" /></>,
  phone: <path d="M5 4.5h3.2l1.5 4-2 1.4a11.5 11.5 0 0 0 5 5l1.4-2 4 1.5v3.2a1.5 1.5 0 0 1-1.7 1.5A15.6 15.6 0 0 1 3.5 6.2 1.5 1.5 0 0 1 5 4.5z" />,
  bag: <><path d="M6.2 8.6h11.6l1.1 10.2a1.8 1.8 0 0 1-1.8 2H6.9a1.8 1.8 0 0 1-1.8-2z" /><path d="M9.2 10.4V7.4a2.8 2.8 0 0 1 5.6 0v3" /></>,
  store: <><path d="M4 9.5 5.4 5h13.2L20 9.5a3 3 0 0 1-5.3 2 3 3 0 0 1-5.4 0 3 3 0 0 1-5.3-2z" /><path d="M5.5 11.4V20h13v-8.6" /></>,
  trophy: <><path d="M7.5 4.5h9v4.2a4.5 4.5 0 0 1-9 0z" /><path d="M7.5 6H5a2.2 2.2 0 0 0 2.5 2.9M16.5 6H19a2.2 2.2 0 0 1-2.5 2.9M12 13.2v3.3M9 19.5h6" /></>,
  filter: <path d="M4.5 6.5h15M7.5 12h9M10.5 17.5h3" />,
  logout: <><path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" /><path d="M17 8.5 20.5 12 17 15.5M20 12H10" /></>,
};

export const iconNames = Object.keys(paths);

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.75 }) {
  const glyph = paths[name];

  if (!glyph) {
    return null;
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
