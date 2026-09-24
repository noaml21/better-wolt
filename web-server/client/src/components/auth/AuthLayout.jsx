import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import { Media } from '../ui';
import { getRestaurants } from '../../services/api';
import './AuthLayout.css';

/* Two panels: the form, and one reason to be here. The brand panel is
   decorative and hidden from assistive tech; below 900px it is not shown
   at all and the form side carries the logo.

   The panel shows the food (V4 spec §6) rather than a decorative glow: a
   few photographs from the public restaurant list, fetched only where
   the panel is visible. If the list fails or has too few photos, the
   panel is the headline on its own. */

const WIDE = '(min-width: 900px)';

function useFoodPhotos() {
  const [photos, setPhotos] = useState([]);
  const [broken, setBroken] = useState(() => new Set());
  const markBroken = useCallback((src) => {
    setBroken((current) => (current.has(src) ? current : new Set(current).add(src)));
  }, []);

  useEffect(() => {
    if (!window.matchMedia?.(WIDE).matches) {
      return undefined;
    }

    let current = true;

    getRestaurants()
      .then((restaurants) => {
        if (current && Array.isArray(restaurants)) {
          setPhotos(restaurants.map((restaurant) => restaurant.image).filter(Boolean));
        }
      })
      .catch(() => {});

    return () => {
      current = false;
    };
  }, []);

  return { photos: photos.filter((src) => !broken.has(src)).slice(0, 3), markBroken };
}

export default function AuthLayout({ title, subtitle, children, footer, aside }) {
  const { photos, markBroken } = useFoodPhotos();

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

          {children}
        </div>

        {footer && <p className="bw-auth__footer">{footer}</p>}
      </div>

      <aside className="bw-auth__aside" aria-hidden="true">
        <div className="bw-auth__aside-text">{aside}</div>

        {photos.length === 3 && (
          <div className="bw-auth__photos">
            {photos.map((src) => (
              <Media key={src} src={src} className="bw-auth__photo" onFail={markBroken} />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
