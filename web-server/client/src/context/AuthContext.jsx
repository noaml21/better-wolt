import { createContext, useCallback, useEffect, useRef, useState, useContext } from 'react';
// הייבוא שהיה חסר: מושך את פונקציית ה-login מקובץ ה-api שבנינו
import { login as apiLogin, onUnauthorized } from '../services/api';

const AuthContext = createContext();

function decodeJwt(token) {
  try {
    const payloadBase64 = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const paddedPayload = payloadBase64.padEnd(
      Math.ceil(payloadBase64.length / 4) * 4,
      '='
    );
    const payloadBytes = Uint8Array.from(
      atob(paddedPayload),
      character => character.charCodeAt(0)
    );

    return JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch (error) {
    return null;
  }
}

function clearStoredAuth() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

/* `clean` removes a stored session that is unusable. Only the tab that is
   starting up may do that: a tab following another tab's sign-in sees the
   two keys land one after the other, and must not wipe the half-written
   session in between. */
function restoreStoredAuth({ clean = true } = {}) {
  const signedOut = () => {
    if (clean) {
      clearStoredAuth();
    }

    return { user: null, token: null };
  };

  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (!storedUser || !storedToken) {
      return signedOut();
    }

    const user = JSON.parse(storedUser);
    const payload = decodeJwt(storedToken);
    const isExpired = !payload?.exp || payload.exp * 1000 <= Date.now();

    if (!user || typeof user !== 'object' || !user.username ||
        !payload?.username || payload.username !== user.username || isExpired) {
      return signedOut();
    }

    return { user, token: storedToken };
  } catch (error) {
    return signedOut();
  }
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => restoreStoredAuth());
  const [sessionEnded, setSessionEnded] = useState(false);
  const { user, token } = auth;

  const isAuthenticated = !!user && !!token;

  /* Who is signed in right now, for work that finishes after the page
     that started it is gone and can no longer read this context. */
  const latestUser = useRef(user);

  useEffect(() => {
    latestUser.current = user;
  }, [user]);

  const currentUsername = useCallback(() => latestUser.current?.username ?? null, []);

  const clearAuth = () => {
    setAuth({ user: null, token: null });
    clearStoredAuth();
  };

  /* The token is checked when the page loads, but a tab can stay open
     past its 24 h life, and from then on every request is a 401 while the
     page still shows the account. Sign out when it runs out: on time, and
     again when the tab comes back into view, because timers do not run
     while the machine sleeps. */
  useEffect(() => {
    const exp = token ? decodeJwt(token)?.exp : null;

    if (!exp) {
      return undefined;
    }

    const expireIfDue = () => {
      if (exp * 1000 <= Date.now()) {
        setAuth({ user: null, token: null });
        clearStoredAuth();
        setSessionEnded(true);
      }
    };

    const timer = window.setTimeout(expireIfDue, Math.max(0, exp * 1000 - Date.now()));
    document.addEventListener('visibilitychange', expireIfDue);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', expireIfDue);
    };
  }, [token]);

  /* Every tab shares one stored session, and the API client sends
     whichever token is stored. Signing in or out in another tab must move
     this one too, or it keeps showing one account while acting as another
     (an owner's controls, sending a customer's token). The storage event
     only fires in the other tabs. */
  useEffect(() => {
    const follow = (event) => {
      if (event.key === null || event.key === 'token' || event.key === 'user') {
        setAuth(restoreStoredAuth({ clean: false }));
        setSessionEnded(false);
      }
    };

    window.addEventListener('storage', follow);

    return () => window.removeEventListener('storage', follow);
  }, []);

  /* The server refused the token on a real request: same outcome as
     running out, reached from the other side. */
  useEffect(
    () =>
      onUnauthorized(() => {
        setAuth({ user: null, token: null });
        clearStoredAuth();
        setSessionEnded(true);
      }),
    []
  );

  const login = async (username, password) => {
    try {
      clearAuth();
      // 1. משתמשים בפונקציה המוכנה שיצרת, שהולכת לנתיב הנכון (/api/tokens)
      const data = await apiLogin({ username, password });

      const realToken = data.token;

      if (!realToken) {
        throw new Error('No token returned from server');
      }

      const payload = decodeJwt(realToken);

      if (!payload || !payload.username) {
        throw new Error('Invalid token payload');
      }

      const realUser = {
        id: data.user?.id || payload.id,
        username: data.user?.username || payload.username,
        displayName: data.user?.displayName || payload.displayName || payload.username,
        image: data.user?.image || '',
        role: data.user?.role || payload.role || 'customer'
      };


      // עדכון ה-State של React
      setAuth({ user: realUser, token: realToken });
      setSessionEnded(false);

      // שמירה בזיכרון של הדפדפן
      localStorage.setItem('user', JSON.stringify(realUser));
      localStorage.setItem('token', realToken);
      return realUser;

    } catch (error) {
      clearAuth();
      console.error("התחברות נכשלה:", error);
      throw error;
    }
  };

  const logout = () => {
    // מנקים גם מה-RAM וגם מהדיסק
    clearAuth();
    setSessionEnded(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, sessionEnded, currentUsername, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
