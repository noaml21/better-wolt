import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Field, Icon, InlineMessage, useToast } from '../components/ui';
import AuthLayout from '../components/auth/AuthLayout';

const highlights = ['משלוחים מכל המסעדות בעיר', 'מעקב אחרי השליח בזמן אמת', 'היסטוריית הזמנות בלחיצה'];

export default function LoginPage() {
  const [values, setValues] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef(null);
  const { login, sessionEnded } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.username.trim() || !values.password) {
      setError('צריך שם משתמש וסיסמה כדי להיכנס.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const user = await login(values.username, values.password);

      showToast(`שלום ${user.displayName}`);
      navigate(location.state?.from || '/');
    } catch (requestError) {
      /* 401 gets the friendly line; everything else (429, 400) shows the
         server's own message, which is contract (ARCHITECTURE §4.3). */
      setError(
        requestError.status === 401 ? 'שם המשתמש או הסיסמה אינם נכונים.' : requestError.message
      );
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="כניסה לחשבון"
      subtitle="עוד רגע אתם מזמינים."
      footer={
        <>
          עוד אין לכם חשבון? <Link to="/register">הרשמה</Link>
        </>
      }
      aside={
        <>
          <div className="bw-auth__aside-quote">
            <strong>האוכל של העיר, אצלכם בדלת.</strong>
            <span>נכנסים פעם אחת, מזמינים בכל פעם בשתי הקשות.</span>
          </div>

          <ul className="bw-auth__aside-list">
            {highlights.map((item) => (
              <li key={item}>
                <Icon name="check" size={18} />
                {item}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <form className="bw-stack" onSubmit={handleSubmit} noValidate>
        {error && <InlineMessage>{error}</InlineMessage>}
        {!error && sessionEnded && (
          <InlineMessage tone="info">החיבור פג. התחברו שוב כדי להמשיך מאיפה שהייתם.</InlineMessage>
        )}

        <Field
          label="שם משתמש"
          name="username"
          ref={usernameRef}
          value={values.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />

        <Field
          label="סיסמה"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          כניסה
        </Button>
      </form>
    </AuthLayout>
  );
}
