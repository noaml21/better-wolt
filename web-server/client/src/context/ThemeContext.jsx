import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // קריאת המצב ההתחלתי מהזיכרון המקומי, או ברירת מחדל 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // בכל פעם שה-theme משתנה:
  // 1. נעדכן את ה-class של תגית ה-body כדי שה-CSS יעבוד גלובלית
  // 2. נשמור את הבחירה ב-localStorage
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);