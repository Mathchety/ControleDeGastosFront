import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AppNavigator from './navigation/AppNavigator';
import useAndroidNavigationBar from './hooks/useAndroidNavigationBar';

function AppContent() {
  const navigationRef = useRef();
  
  // Configura a barra de navegação do Android em modo imersivo
  useAndroidNavigationBar();

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Listener para mudanças de rota
      const unsubscribe = navigationRef.current?.addListener('state', () => {
        // Reaplica configuração ao mudar de tela
        setTimeout(() => {
          NavigationBar.setVisibilityAsync('hidden').catch(() => {});
        }, 100);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
