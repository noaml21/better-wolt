import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// אנחנו מייבאים את פונקציית ההתחברות מה-API שבנית במשימה הקודמת
import { login as apiLogin } from '../services/api';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

// יצירת הקונטקסט
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // שמירת הנתונים בזיכרון של האפליקציה
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // משתנה עזר שמחשב אוטומטית האם אנחנו מחוברים
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
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
  const logout = async () => {
    setUser(null);
    setToken(null);
    
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to remove auth from storage', error);
    }
  };

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