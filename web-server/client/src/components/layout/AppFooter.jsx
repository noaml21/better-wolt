import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import './AppFooter.css';

/* Quiet closing band: it orients, it does not sell. */

export default function AppFooter() {
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

      <p className="bw-footer__note">
        Better Wolt — פרויקט לדוגמה. התמונות להמחשה בלבד.
      </p>
    </footer>
  );
}
