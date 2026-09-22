import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/theme';
import { ToastProvider } from './src/ui';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

/* Signing out or switching accounts must not hand the next person the
   previous one's cart. Keying the provider on the account is React's own
   way to reset state, and it costs no effect and no extra render. */
function CartScope({ children }) {
  const { user } = useAuth();

  return <CartProvider key={user?.id || 'signed-out'}>{children}</CartProvider>;
}

function Shell() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartScope>
              <Shell />
            </CartScope>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
