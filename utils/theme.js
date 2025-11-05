import { fontScale, moderateScale, scale } from './responsive';

/**
 * Tema com tipografia e espaçamentos responsivos
 */
export const theme = {
    // Cores
    colors: {
        primary: '#667eea',
        primaryDark: '#764ba2',
        secondary: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        background: '#f8f9fa',
        card: '#ffffff',
        text: '#333333',
        textSecondary: '#666666',
        textLight: '#999999',
        border: '#e5e7eb',
        borderLight: '#f0f0f0',
    },

    // Tipografia responsiva
    fonts: {
        h1: fontScale(28),
        h2: fontScale(24),
        h3: fontScale(20),
        h4: fontScale(18),
        h5: fontScale(16),
        h6: fontScale(14),
        body: fontScale(14),
        bodyLarge: fontScale(16),
        bodySmall: fontScale(12),
        caption: fontScale(11),
        button: fontScale(16),
    },

    // Espaçamentos responsivos
    spacing: {
        xs: moderateScale(4),
        sm: moderateScale(8),
        md: moderateScale(12),
        lg: moderateScale(16),
        xl: moderateScale(20),
        xxl: moderateScale(24),
        xxxl: moderateScale(32),
    },

    // Border radius
    radius: {
        sm: moderateScale(8),
        md: moderateScale(12),
        lg: moderateScale(16),
        xl: moderateScale(20),
        round: moderateScale(50),
    },

    // Tamanhos de ícones
    iconSizes: {
        xs: scale(12),
        sm: scale(16),
        md: scale(20),
        lg: scale(24),
        xl: scale(32),
        xxl: scale(48),
    },

    // Tamanhos de botões
    buttonSizes: {
        small: {
            paddingVertical: moderateScale(8),
            paddingHorizontal: moderateScale(16),
            fontSize: fontScale(13),
        },
        medium: {
            paddingVertical: moderateScale(12),
            paddingHorizontal: moderateScale(20),
            fontSize: fontScale(14),
        },
        large: {
            paddingVertical: moderateScale(14),
            paddingHorizontal: moderateScale(24),
            fontSize: fontScale(16),
        },
    },

    // Sombras
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
        },
    },
};
