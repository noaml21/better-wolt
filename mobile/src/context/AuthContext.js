import React, { createContext, useCallback, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// אנחנו מייבאים את פונקציית ההתחברות מה-API שבנית במשימה הקודמת
import { login as apiLogin } from '../services/api';
import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  View,
} from 'react-native';
import { useToast } from '../ui';

// יצירת הקונטקסט
const AuthContext = createContext(null);

/* The token is a 24 h JWT (ARCHITECTURE §4.1). A stored one that has run
   out still looks like a session, but every request made with it is a
   401, so the app would greet the user by name and then fail at every
   step with nothing telling them to sign in again. Only `exp` is read:
   the server is what checks the signature. */
function isExpired(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));

    return !Number.isFinite(exp) || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  // שמירת הנתונים בזיכרון של האפליקציה
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // משתנה עזר שמחשב אוטומטית האם אנחנו מחוברים
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser && isExpired(storedToken)) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        } else if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);

          if (parsedUser) {
            setToken(storedToken);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Failed to load auth from storage', error);

        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  /**
   * פונקציית ההתחברות של האפליקציה
   * היא קוראת ל-API, מקבלת את התשובה מהשרת, ושומרת את הנתונים ב-State
   */
  const login = async (credentials) => {
  try {
    const response = await apiLogin(credentials);

    if (!response || !response.token || !response.user) {
      throw new Error('Invalid login response from server');
    }

    const nextToken = response.token;
    const nextUser = response.user;

    await AsyncStorage.setItem('token', nextToken);
    await AsyncStorage.setItem('user', JSON.stringify(nextUser));

    setToken(nextToken);
    setUser(nextUser);

    return response;
  } catch (error) {
    console.error('Login error in AuthContext:', error);

    setToken(null);
    setUser(null);

    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (storageError) {
      console.error('Failed to clear auth after login error:', storageError);
    }

    throw error;
  }
};

  /**
   * פונקציית התנתקות
   */
  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to remove auth from storage', error);
    }
  }, []);

  /* A phone app is resumed, not reopened: it can come back from the
     background days after the token ran out, so the check is repeated
     whenever the app returns to the foreground. */
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isExpired(token)) {
        logout();
        showToast('החיבור פג. צריך להתחבר שוב.', { tone: 'error' });
      }
    });

    return () => subscription.remove();
  }, [token, logout, showToast]);

  // מעבירים את כל הכלים האלו לכל המסכים באפליקציה
  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});