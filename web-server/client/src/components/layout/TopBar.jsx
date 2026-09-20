import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../brand/Logo';
import Button, { IconButton } from '../ui/Button';
import Icon from '../ui/Icon';
import './TopBar.css';

/* The one piece of chrome on every page. In Hebrew the brand sits at the
   inline start (right) and the account actions at the inline end. Below
   900px the search field collapses into a toggle so the bar keeps one row. */

export default function TopBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);

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

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bw-topbar">
      <div className="bw-topbar__inner">
        <Link to="/" className="bw-topbar__brand" aria-label="Better Wolt — לעמוד הבית">
          <Logo />
        </Link>

        <form
          className={`bw-topbar__search ${searchOpen ? 'bw-topbar__search--open' : ''}`}
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

          {isAuthenticated ? (
            <div className="bw-topbar__account" ref={menuRef}>
              <Link to="/orders" className="bw-topbar__link">
                <Icon name="bag" size={18} />
                ההזמנות שלי
              </Link>

              <button
                type="button"
                className="bw-topbar__avatar-button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
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
                <div className="bw-topbar__menu" role="menu">
                  <p className="bw-topbar__menu-header">
                    {user.displayName}
                    <span>{user.role === 'restaurant' ? 'בעלי מסעדה' : 'לקוח'}</span>
                  </p>
                  <Link to="/orders" className="bw-topbar__menu-item" role="menuitem">
                    <Icon name="bag" size={18} />
                    ההזמנות שלי
                  </Link>
                  {user.role === 'restaurant' && (
                    <Link to="/restaurants" className="bw-topbar__menu-item" role="menuitem">
                      <Icon name="store" size={18} />
                      המסעדות שלי
                    </Link>
                  )}
                  <button
                    type="button"
                    className="bw-topbar__menu-item bw-topbar__menu-item--danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <Icon name="logout" size={18} />
                    התנתקות
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bw-topbar__auth">
              <Link to="/login" className="bw-topbar__link">
                התחברות
              </Link>
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
