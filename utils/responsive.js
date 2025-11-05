import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Dimensões base do design (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Escala proporcionalmente baseado na largura da tela
 * @param {number} size - Tamanho base do design
 * @returns {number} - Tamanho escalado
 */
export const scale = (size) => {
    return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Escala verticalmente baseado na altura da tela
 * @param {number} size - Tamanho base do design
 * @returns {number} - Tamanho escalado
 */
export const verticalScale = (size) => {
    return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Escala moderada - usa fator de moderação para não escalar muito
 * Ideal para fontes e elementos que não devem crescer proporcionalmente
 * @param {number} size - Tamanho base do design
 * @param {number} factor - Fator de moderação (padrão 0.5)
 * @returns {number} - Tamanho escalado moderadamente
 */
export const moderateScale = (size, factor = 0.5) => {
    return size + (scale(size) - size) * factor;
};

/**
 * Escala para fontes - garante legibilidade em todas as telas
 * @param {number} size - Tamanho da fonte
 * @returns {number} - Tamanho escalado
 */
export const fontScale = (size) => {
    return moderateScale(size, 0.3);
};

/**
 * Verifica se é um dispositivo pequeno (width < 375)
 * @returns {boolean}
 */
export const isSmallDevice = () => {
    return SCREEN_WIDTH < 375;
};

/**
 * Verifica se é um tablet
 * @returns {boolean}
 */
export const isTablet = () => {
    return SCREEN_WIDTH >= 768;
};

/**
 * Retorna padding horizontal responsivo
 * @returns {number}
 */
export const getHorizontalPadding = () => {
    if (isTablet()) return scale(40);
    if (isSmallDevice()) return scale(16);
    return scale(20);
};

/**
 * Retorna padding vertical responsivo
 * @returns {number}
 */
export const getVerticalPadding = () => {
    if (isTablet()) return verticalScale(30);
    if (isSmallDevice()) return verticalScale(12);
    return verticalScale(15);
};

/**
 * Retorna tamanho de ícone responsivo
 * @param {string} size - 'small', 'medium', 'large'
 * @returns {number}
 */
export const getIconSize = (size = 'medium') => {
    const sizes = {
        small: isSmallDevice() ? 16 : 18,
        medium: isSmallDevice() ? 20 : 24,
        large: isSmallDevice() ? 28 : 32,
        xlarge: isSmallDevice() ? 48 : 64,
    };
    return scale(sizes[size] || sizes.medium);
};

/**
 * Dimensões da tela
 */
export const dimensions = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
};

/**
 * Verifica se é iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Verifica se é Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Retorna o pixel ratio
 */
export const pixelRatio = PixelRatio.get();
