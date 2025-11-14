import { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';

/**
 * Hook para definir a cor da barra de status no Android
 * @param {string} color - Cor em hexadecimal (ex: '#667eea')
 * @param {string} barStyle - 'light-content' ou 'dark-content'
 */
export const useStatusBarColor = (color = '#667eea', barStyle = 'light-content') => {
    useEffect(() => {
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor(color);
            StatusBar.setBarStyle(barStyle);
        }
    }, [color, barStyle]);
};
