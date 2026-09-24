import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

/* Until someone picks a theme, the app follows the system's (V4 spec
   §4.1): a first visit from a dark phone should not open on a white page.
   Picking one with the toggle stores it, and the stored choice wins from
   then on. Storage can throw (private modes, blocked site data); the app
   then simply follows the system every time. */
function readStoredTheme() {
  try {
    const stored = localStorage.getItem('theme');

    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch (error) {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeProvider = ({ children }) => {
  const [chosen, setChosen] = useState(readStoredTheme);
  const [system, setSystem] = useState(systemTheme);
  const theme = chosen || system;

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');

    if (!query) {
      return undefined;
    }

    const follow = (event) => setSystem(event.matches ? 'dark' : 'light');

    query.addEventListener('change', follow);

    return () => query.removeEventListener('change', follow);
  }, []);

  // Only the theme's own classes: other components keep layout classes on
  // <body> (the cart bar, the order dock), and overwriting `className`
  // dropped them, so the footer slid back under the bar.
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';

    setChosen(next);

    try {
      localStorage.setItem('theme', next);
    } catch (error) {
      // Not remembered; the toggle still applies for this visit.
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
