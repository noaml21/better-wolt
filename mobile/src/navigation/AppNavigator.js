import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RestaurantDetailsScreen from '../screens/RestaurantDetailsScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import WorldCupScreen from '../screens/WorldCupScreen';
import RestaurantFormScreen from '../screens/RestaurantFormScreen';

import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
            />
            <Stack.Screen
              name="RestaurantDetails"
              component={RestaurantDetailsScreen}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
            />
            <Stack.Screen
              name="Orders"
              component={OrdersScreen}
            />
            <Stack.Screen
              name="SearchResults"
              component={SearchResultsScreen}
            />
            <Stack.Screen
              name="WorldCup"
              component={WorldCupScreen}
            />
            <Stack.Screen
              name="RestaurantForm"
              component={RestaurantFormScreen}
            />
            <Stack.Screen
              name="ProductForm"
              component={ProductFormScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
