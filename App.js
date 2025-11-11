import React, { useRef, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { FilterProvider } from './contexts/FilterContext';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from './screens/SplashScreen';
import useAndroidNavigationBar from './hooks/useAndroidNavigationBar';

function AppContent() {
  const navigationRef = useRef();
  const [showSplash, setShowSplash] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const { loading: authLoading } = useAuth(); // ✨ Pega o estado de loading do AuthContext
  
  // Configura a barra de navegação do Android em modo imersivo
  useAndroidNavigationBar();

  const handleSplashFinish = () => {
    setSplashFinished(true);
  };

  // ✨ Só esconde o splash quando AMBOS terminarem: animação E auth
  useEffect(() => {
    if (splashFinished && !authLoading) {
      setShowSplash(false);
    }
  }, [splashFinished, authLoading]);

  // useEffect DEVE vir ANTES de qualquer return condicional
  useEffect(() => {
    if (Platform.OS === 'android' && !showSplash) {
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
  }, [showSplash]);

  // ✨ Mostra o splash até que AMBOS terminem
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

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
          <FilterProvider>
            <AppContent />
          </FilterProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
