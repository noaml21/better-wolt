import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import { getRestaurants } from '../../services/api';
import { WORLD_CUP_RESTAURANT_NAME, getLine, getRestaurantMeta } from '../../services/restaurantMeta';
import './AuthLayout.css';

/* Two panels (V5 spec §6): the form as a ticket-machine panel, and the
   board — tonight's lines, from the public restaurant list, fetched only
   where the board is visible (900px and up). The board is decorative and
   hidden from assistive tech; below 900px it is not shown at all and the
   form side carries the logo. If the list fails, the board keeps its
   headline and loses its rows. */

const WIDE = '(min-width: 900px)';
const ROWS = 6;

function useBoardLines() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    if (!window.matchMedia?.(WIDE).matches) {
      return undefined;
    }

    let current = true;

    getRestaurants()
      .then((list) => {
        if (current && Array.isArray(list)) {
          setRestaurants(list.filter((restaurant) => restaurant.name !== WORLD_CUP_RESTAURANT_NAME).slice(0, ROWS));
        }
      })
      .catch(() => {});

    return () => {
      current = false;
    };
  }, []);

  return restaurants;
}

export default function AuthLayout({ title, subtitle, children, footer, aside }) {
  const lines = useBoardLines();

  return (
    <div className="bw-auth">
      <div className="bw-auth__form-side">
        <Link to="/" className="bw-auth__brand" aria-label="Better Wolt — לעמוד הבית">
          <Logo />
        </Link>

        <div className="bw-auth__form-card">
          <header className="bw-auth__header">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </header>

          <div className="bw-auth__form-body">{children}</div>
        </div>

        {footer && <p className="bw-auth__footer">{footer}</p>}
      </div>

      <aside className="bw-auth__aside" aria-hidden="true">
        <div className="bw-auth__aside-text">{aside}</div>

        {lines.length > 0 && (
          <ol className="bw-auth__lines">
            {lines.map((restaurant) => {
              const line = getLine(restaurant);

              return (
                <li key={restaurant.id} className={`bw-auth__line ${line.className}`}>
                  <span className="bw-auth__line-badge">{line.number}</span>
                  <span className="bw-auth__line-name">{restaurant.name}</span>
                  <span className="bw-auth__line-eta bw-num bw-range">
                    {getRestaurantMeta(restaurant).eta.replace('-', '–')}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </aside>
    </div>
  );
}
