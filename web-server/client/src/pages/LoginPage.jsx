import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [role, setRole] = useState('customer');
    const usernameInputRef = useRef(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('חובה להזין שם משתמש וסיסמה.');
            return;
        }

        setError('');

        try {
            await login(username, password);
            navigate('/');
        } catch (error) {
            setError('שם משתמש או סיסמה לא נכונים.');
        }
    };

    return (
        <div className="auth-page">
            <h2>התחברות 🔐</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>שם משתמש</label>
                    <input
                        type="text"
                        ref={usernameInputRef}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="הזן שם משתמש"
                        className={error && !username.trim() ? 'input-error' : ''}
                    />
                </div>

                <div className="form-group">
                    <label>סיסמה</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="הזן סיסמה"
                        className={error && !password.trim() ? 'input-error' : ''}
                    />
                </div>

                <button type="submit" className="submit-btn">היכנס</button>
            </form>

            <p className="auth-switch">
                עוד אין לך חשבון? <Link to="/register">הירשם כאן</Link>
            </p>
        </div>
    );
};

export default LoginPage;