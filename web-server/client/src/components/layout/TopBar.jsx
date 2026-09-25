import { startTransition, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../brand/Logo';
import Button, { IconButton } from '../ui/Button';
import Icon from '../ui/Icon';
import './TopBar.css';

/* The one piece of chrome on every page (V5 spec §5): a panel bar on a
   3px ink rule. In Hebrew the brand sits at the inline start (right) and
   the account actions at the inline end; the page you are on is an ink
   block. Below 900px the search field collapses into a toggle so the bar
   keeps one row. */

export default function TopBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const closeOnOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    /* Escape from inside the menu would unmount the link that has focus
       and leave the keyboard on <body>; focus goes back to the button. */
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        if (menuRef.current?.contains(document.activeElement)) {
          menuButtonRef.current?.focus();
        }

        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q')?.toString().trim();

    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  /* Leave and sign out in one render. React Router applies navigation as
     a transition; an urgent sign-out would render first, on the page being
     left, and a protected page's guard would then send you to /login
     carrying this account's page as the place to return to — where the
     next person to sign in would be sent. */
  const handleLogout = () => {
    navigate('/');
    startTransition(() => logout());
  };

  return (
    <header className="bw-topbar">
      <div className="bw-topbar__inner">
        <Link to="/" className="bw-topbar__brand" aria-label="Better Wolt — לעמוד הבית">
          <Logo />
        </Link>

        <form
          className={`bw-topbar__search ${searchOpen ? 'bw-topbar__search--open' : ''} ${
            location.pathname === '/' ? 'bw-topbar__search--home' : ''
          }`}
          onSubmit={handleSearch}
          role="search"
        >
          <label className="bw-visually-hidden" htmlFor="bw-topbar-search">
            חיפוש מסעדות ומנות
          </label>
          <Icon name="search" size={18} className="bw-topbar__search-icon" />
          <input
            id="bw-topbar-search"
            ref={searchInputRef}
            name="q"
            type="search"
            placeholder="מסעדה, מנה או מטבח"
            defaultValue={new URLSearchParams(location.search).get('q') || ''}
          />
          <button type="submit" className="bw-topbar__search-submit">
            חיפוש
          </button>
        </form>

        <div className="bw-topbar__actions">
          <IconButton
            icon="search"
            label={searchOpen ? 'סגירת החיפוש' : 'חיפוש'}
            className="bw-topbar__search-toggle"
            onClick={() => setSearchOpen((open) => !open)}
            aria-expanded={searchOpen}
          />

          <IconButton
            icon={theme === 'light' ? 'moon' : 'sun'}
            label={theme === 'light' ? 'מעבר למצב כהה' : 'מעבר למצב בהיר'}
            onClick={toggleTheme}
          />

          <NavLink to="/restaurants" className="bw-topbar__link bw-topbar__link--wide">
            כל המסעדות
          </NavLink>

          {isAuthenticated ? (
            <div className="bw-topbar__account" ref={menuRef}>
              <NavLink to="/orders" className="bw-topbar__link">
                ההזמנות שלי
              </NavLink>

              {/* A disclosure of links, not an ARIA menu: role="menu" promises
                  arrow-key navigation, and these are reached with Tab. */}
              <button
                ref={menuButtonRef}
                type="button"
                className="bw-topbar__avatar-button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="bw-account-menu"
              >
                {user.image ? (
                  <img src={user.image} alt="" className="bw-topbar__avatar" />
                ) : (
                  <span className="bw-topbar__avatar bw-topbar__avatar--initial">
                    {user.displayName?.trim().charAt(0) || '?'}
                  </span>
                )}
                <span className="bw-topbar__name">{user.displayName}</span>
                <Icon name="down" size={16} />
              </button>

              {menuOpen && (
                <div className="bw-topbar__menu" id="bw-account-menu">
                  <p className="bw-topbar__menu-header">
                    {user.displayName}
                    <span>{user.role === 'restaurant' ? 'בעלי מסעדה' : 'לקוח'}</span>
                  </p>
                  <Link to="/orders" className="bw-topbar__menu-item">
                    <Icon name="bag" size={18} />
                    ההזמנות שלי
                  </Link>
                  {user.role === 'restaurant' && (
                    <Link to="/restaurants?mine=1" className="bw-topbar__menu-item">
                      <Icon name="store" size={18} />
                      המסעדות שלי
                    </Link>
                  )}
                  <button
                    type="button"
                    className="bw-topbar__menu-item bw-topbar__menu-item--danger"
                    onClick={handleLogout}
                  >
                    <Icon name="logout" size={18} />
                    התנתקות
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bw-topbar__auth">
              <NavLink to="/login" className="bw-topbar__link">
                התחברות
              </NavLink>
              <Button size="sm" onClick={() => navigate('/register')}>
                הרשמה
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
