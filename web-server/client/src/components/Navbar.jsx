import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../Better_Wolt.png';

const Navbar = () => {
    const searchRef = useRef();
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchRef.current.value;
        if (query) {
            navigate(`/search?q=${query}`);
            // אפשר גם לאפס את השדה אחרי החיפוש:
            // searchRef.current.value = '';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login'); // זורק את המשתמש חזרה לעמוד התחברות
    };

    return (
        <nav className="navbar">
            <Link to="/" className="brand">
                <img src={logo} alt="Better Wolt" style={{ height: '40px', objectFit: 'contain' }} />
            </Link>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    ref={searchRef}
                    placeholder="חפש מסעדות או מנות..."
                />
                <button type="submit" className="search-btn">🔍</button>
            </form>

            <div className="navbar-actions">
                <button onClick={toggleTheme} className="theme-toggle">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {isAuthenticated ? (
                    <div className="user-menu">
                        {user.image && (
                            <img
                                src={user.image}
                                alt={user.displayName}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginLeft: '8px'
                                }}
                            />
                        )}
                        <span className="user-greeting">שלום, {user.displayName}</span>
                        <Link to="/orders" className="nav-link">הזמנות</Link>
                        <button onClick={handleLogout} className="logout-btn">התנתק</button>
                    </div>
                ) : (
                    <div className="auth-links">
                        <Link to="/login" className="nav-link">התחברות</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
