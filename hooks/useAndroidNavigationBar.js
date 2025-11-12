import { useEffect } from 'react';
import { Platform, AppState } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

/**
 * Hook para configurar a barra de navegação do Android
 * Esconde os botões em modo imersivo e mostra ao deslizar
 */
export const useAndroidNavigationBar = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      configureNavigationBar();

      // Listener para quando o app volta ao foco
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          // Reaplica as configurações quando o app volta ao foco
          configureNavigationBar();
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  const configureNavigationBar = async () => {
    try {
      // Define a cor de fundo da barra de navegação
      await NavigationBar.setBackgroundColorAsync('#ffffff');
      
      // Define o estilo dos botões (escuro para fundo claro)
      await NavigationBar.setButtonStyleAsync('dark');
      
      // Modo imersivo: esconde a barra mas permite mostrar ao deslizar
      await NavigationBar.setVisibilityAsync('hidden');
      
      // Define comportamento ao deslizar
      await NavigationBar.setBehaviorAsync('overlay-swipe');
      
    } catch (error) {
    }
  };
};

export default useAndroidNavigationBar;
