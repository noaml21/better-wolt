import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme';

/* The same 24px geometry as the web client's Icon set
   (web-server/client/src/components/ui/Icon.jsx), so a scooter or a bag
   looks identical in both apps. */

const paths = {
  search: (p) => [<Circle key="c" cx="11" cy="11" r="7" {...p} />, <Path key="l" d="m20 20-3.6-3.6" {...p} />],
  cart: (p) => [
    <Path key="b" d="M4 5h2.2l2 10.2a2 2 0 0 0 2 1.6h7.1a2 2 0 0 0 2-1.5L20.8 9H7" {...p} />,
    <Circle key="w1" cx="10.5" cy="20" r="1.3" {...p} />,
    <Circle key="w2" cx="17.5" cy="20" r="1.3" {...p} />,
  ],
  user: (p) => [
    <Circle key="h" cx="12" cy="8.5" r="3.7" {...p} />,
    <Path key="b" d="M4.8 20a7.4 7.4 0 0 1 14.4 0" {...p} />,
  ],
  star: (p) => [<Path key="s" d="m12 3.6 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" {...p} />],
  clock: (p) => [
    <Circle key="c" cx="12" cy="12" r="8.4" {...p} />,
    <Path key="h" d="M12 7.3V12l3 1.8" {...p} />,
  ],
  scooter: (p) => [
    <Circle key="w1" cx="6" cy="17.5" r="2.6" {...p} />,
    <Circle key="w2" cx="18.5" cy="17.5" r="2.6" {...p} />,
    <Path key="b" d="M8.6 17.5h7.3M13 6h3l2.5 11.5M5 9.5h4.5l2 5" {...p} />,
  ],
  plus: (p) => [<Path key="p" d="M12 5.5v13M5.5 12h13" {...p} />],
  minus: (p) => [<Path key="m" d="M5.5 12h13" {...p} />],
  trash: (p) => [
    <Path key="l" d="M4.5 7h15M9.5 7V5.2a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2V7" {...p} />,
    <Path key="b" d="M6.6 7l.8 11.3a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.4 7" {...p} />,
  ],
  edit: (p) => [
    <Path key="b" d="M4.5 19.5h4l9.4-9.4a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4.5 15.5z" {...p} />,
    <Path key="t" d="m13.8 6.6 3.6 3.6" {...p} />,
  ],
  close: (p) => [<Path key="x" d="m6 6 12 12M18 6 6 18" {...p} />],
  check: (p) => [<Path key="c" d="m5 12.5 4.5 4.5L19 7.5" {...p} />],
  alert: (p) => [
    <Circle key="c" cx="12" cy="12" r="8.4" {...p} />,
    <Path key="l" d="M12 7.8v4.9" {...p} />,
    <Circle key="d" cx="12" cy="16.2" r="0.9" fill={p.stroke} stroke="none" />,
  ],
  info: (p) => [
    <Circle key="c" cx="12" cy="12" r="8.4" {...p} />,
    <Path key="l" d="M12 11.3v4.9" {...p} />,
    <Circle key="d" cx="12" cy="8" r="0.9" fill={p.stroke} stroke="none" />,
  ],
  back: (p) => [<Path key="b" d="M14.5 5.5 8 12l6.5 6.5" {...p} />],
  forward: (p) => [<Path key="f" d="M9.5 5.5 16 12l-6.5 6.5" {...p} />],
  down: (p) => [<Path key="d" d="M6 9.5 12 15.5 18 9.5" {...p} />],
  location: (p) => [
    <Path key="p" d="M12 21s6.5-6 6.5-10.6a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21z" {...p} />,
    <Circle key="c" cx="12" cy="10.3" r="2.4" {...p} />,
  ],
  phone: (p) => [
    <Path key="p" d="M5 4.5h3.2l1.5 4-2 1.4a11.5 11.5 0 0 0 5 5l1.4-2 4 1.5v3.2a1.5 1.5 0 0 1-1.7 1.5A15.6 15.6 0 0 1 3.5 6.2 1.5 1.5 0 0 1 5 4.5z" {...p} />,
  ],
  bag: (p) => [
    <Path key="b" d="M6.2 8.6h11.6l1.1 10.2a1.8 1.8 0 0 1-1.8 2H6.9a1.8 1.8 0 0 1-1.8-2z" {...p} />,
    <Path key="h" d="M9.2 10.4V7.4a2.8 2.8 0 0 1 5.6 0v3" {...p} />,
  ],
  store: (p) => [
    <Path key="a" d="M4 9.5 5.4 5h13.2L20 9.5a3 3 0 0 1-5.3 2 3 3 0 0 1-5.4 0 3 3 0 0 1-5.3-2z" {...p} />,
    <Path key="b" d="M5.5 11.4V20h13v-8.6" {...p} />,
  ],
  trophy: (p) => [
    <Path key="c" d="M7.5 4.5h9v4.2a4.5 4.5 0 0 1-9 0z" {...p} />,
    <Path key="h" d="M7.5 6H5a2.2 2.2 0 0 0 2.5 2.9M16.5 6H19a2.2 2.2 0 0 1-2.5 2.9M12 13.2v3.3M9 19.5h6" {...p} />,
  ],
  home: (p) => [
    <Path key="r" d="M4 10.5 12 4l8 6.5" {...p} />,
    <Path key="b" d="M6 10v9.5h12V10" {...p} />,
  ],
  logout: (p) => [
    <Path key="d" d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" {...p} />,
    <Path key="a" d="M17 8.5 20.5 12 17 15.5M20 12H10" {...p} />,
  ],
};

export default function Icon({ name, size = 20, color, strokeWidth = 1.75, filled = false }) {
  const { colors } = useTheme();
  const draw = paths[name];

  if (!draw) {
    return null;
  }

  const stroke = color || colors.ink;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {draw({
        stroke,
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: filled ? stroke : 'none',
      })}
    </Svg>
  );
}
