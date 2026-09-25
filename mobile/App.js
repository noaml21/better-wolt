import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
/* One module per face, so only the seven faces the app uses are bundled
   (each package's index pulls in every weight). */
import { Karantina_700Bold } from '@expo-google-fonts/karantina/700Bold';
import { NotoSansHebrew_400Regular } from '@expo-google-fonts/noto-sans-hebrew/400Regular';
import { NotoSansHebrew_500Medium } from '@expo-google-fonts/noto-sans-hebrew/500Medium';
import { NotoSansHebrew_600SemiBold } from '@expo-google-fonts/noto-sans-hebrew/600SemiBold';
import { NotoSansHebrew_700Bold } from '@expo-google-fonts/noto-sans-hebrew/700Bold';
import { NotoSansHebrew_800ExtraBold } from '@expo-google-fonts/noto-sans-hebrew/800ExtraBold';
import { NotoSansHebrew_900Black } from '@expo-google-fonts/noto-sans-hebrew/900Black';
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
  /* The Line faces (V5 spec §11). The first frame waits for them — a few
     hundred milliseconds behind the splash — rather than drawing every
     screen in the platform font and then jumping. If loading fails the
     app still starts, in the platform font. */
  const [fontsLoaded, fontError] = useFonts({
    Karantina_700Bold,
    NotoSansHebrew_400Regular,
    NotoSansHebrew_500Medium,
    NotoSansHebrew_600SemiBold,
    NotoSansHebrew_700Bold,
    NotoSansHebrew_800ExtraBold,
    NotoSansHebrew_900Black,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

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
