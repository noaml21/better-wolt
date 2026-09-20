import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import './AuthLayout.css';

/* Two panels: the form, and one reason to be here. The brand panel is
   decorative and hidden from assistive tech on small screens, where it
   collapses to the logo alone. */

export default function AuthLayout({ title, subtitle, children, footer, aside }) {
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
        {aside}
      </aside>
    </div>
  );
}
