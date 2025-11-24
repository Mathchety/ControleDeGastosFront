import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import MainTabNavigator from './MainTabNavigator';
import PreViewScreen from '../screens/PreViewScreen';
import CategoryDetailsScreen from '../screens/CategoryDetailsScreen';
import ManualReceiptScreen from '../screens/ManualReceiptScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ForgotPasswordLoggedScreen from '../screens/ForgotPasswordLoggedScreen';
import ResetPasswordLoggedScreen from '../screens/ResetPasswordLoggedScreen';
import TermsScreen from '../screens/TermsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#f8f9fa' }, // Fundo claro durante transição
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        // ✨ Habilita gesture de voltar em todas as plataformas
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        // Configurações específicas de gesture
        gestureResponseDistance: Platform.select({
          ios: 50, // iOS: gesture apenas nas bordas
          android: 150, // Android: área maior para gesture
        }),
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300, // Transição mais rápida
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
        },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen 
            name="Preview" 
            component={PreViewScreen}
            options={{
              cardStyle: { backgroundColor: '#f8f9fa' },
            }}
          />
          <Stack.Screen 
            name="CategoryDetails" 
            component={CategoryDetailsScreen}
            options={{
              cardStyle: { backgroundColor: '#f8f9fa' },
            }}
          />
          <Stack.Screen 
            name="ManualReceipt" 
            component={ManualReceiptScreen}
            options={{
              cardStyle: { backgroundColor: '#f8f9fa' },
            }}
          />
          <Stack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen}
            options={{
              cardStyle: { backgroundColor: '#f8f9fa' },
            }}
          />
          <Stack.Screen 
            name="ForgotPasswordLogged" 
            component={ForgotPasswordLoggedScreen}
            options={{
              cardStyle: { backgroundColor: '#fff' },
            }}
          />
          <Stack.Screen 
            name="ResetPasswordLogged" 
            component={ResetPasswordLoggedScreen}
            options={{
              cardStyle: { backgroundColor: '#fff' },
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen 
            name="Terms" 
            component={TermsScreen} 
            options={{ cardStyle: { backgroundColor: '#fff' } }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{
              cardStyle: { backgroundColor: '#fff' },
            }}
          />
          <Stack.Screen 
            name="ResetPassword" 
            component={ResetPasswordScreen}
            options={{
              cardStyle: { backgroundColor: '#fff' },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
