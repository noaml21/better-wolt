import { Link, useLocation } from 'react-router-dom';
import Logo from '../brand/Logo';
import './AppFooter.css';

/* Quiet closing band: it orients, it does not sell. Not on the sign-in
   and registration pages, which fill the screen with one task and have
   nothing below it to orient (V4 audit C3). */

const FOCUSED_PATHS = ['/login', '/register'];

export default function AppFooter() {
  const { pathname } = useLocation();

  if (FOCUSED_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <footer className="bw-footer">
      <div className="bw-footer__inner">
        <div className="bw-footer__brand">
          <Logo className="bw-logo--sm" />
          <p>משלוחים מהמסעדות של תל אביב, בלי להתפשר על האוכל.</p>
        </div>

        <nav className="bw-footer__nav" aria-label="קישורים בתחתית הדף">
          <Link to="/restaurants">כל המסעדות</Link>
          <Link to="/orders">ההזמנות שלי</Link>
        </nav>
      </div>

      {/* The API has no rating, delivery time or fee; the clients derive
          them for display (services/restaurantMeta.js), so they are
          named here along with the photos. */}
      <p className="bw-footer__note">
        Better Wolt — פרויקט לדוגמה. התמונות, הדירוגים, זמני המשלוח ודמי המשלוח להמחשה בלבד.
      </p>
    </footer>
  );
}
