import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import TabBar from './TabBar';

import HomeScreen from '../screens/HomeScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import CartScreen from '../screens/CartScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RestaurantDetailsScreen from '../screens/RestaurantDetailsScreen';
import TrackingScreen from '../screens/TrackingScreen';
import WorldCupScreen from '../screens/WorldCupScreen';
import RestaurantFormScreen from '../screens/RestaurantFormScreen';
import ProductFormScreen from '../screens/ProductFormScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

/* Signed in, the four tabs are the app. Everything else is pushed over
   them, so a restaurant or an order never loses the tab you came from
   (V3_DESIGN_SPEC §5.2). Headers are off: every screen draws its own
   ScreenHeader so the layout reads right-to-left.

   Going back to the tabs from a pushed screen is
   `navigate('Tabs', { screen }, { pop: true })`. In React Navigation 7 a
   plain navigate to a route further down the stack pushes a second copy
   of it — a whole new set of tabs, with fresh state, under a back button
   that walks through every copy. */

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'בית' }} />
      <Tabs.Screen name="Search" component={SearchResultsScreen} options={{ tabBarLabel: 'חיפוש' }} />
      <Tabs.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: 'הזמנות' }} />
      <Tabs.Screen name="Cart" component={CartScreen} options={{ tabBarLabel: 'הסל' }} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();

  const navigationTheme = {
    ...DefaultTheme,
    dark: colors.name === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: colors.ink,
      background: colors.ground,
      card: colors.panel,
      text: colors.ink,
      border: colors.hairline,
      notification: colors.ink,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_left' }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Tabs" component={MainTabs} />
            <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="WorldCup" component={WorldCupScreen} />
            <Stack.Screen name="RestaurantForm" component={RestaurantFormScreen} />
            <Stack.Screen name="ProductForm" component={ProductFormScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
