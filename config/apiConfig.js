/**
 * Configuração da API por Ambiente
 * Automaticamente seleciona a URL correta baseado no __DEV__
 */

// URLs da API por ambiente
const API_URLS = {
    // Desenvolvimento (Expo/EAS preview)
    development: 'http://147.185.221.212:61489/api/v1',
    
    // Produção (APK final)
    production: 'http://147.185.221.212:61489/api/v1', // Mesmo URL, mas pode ser diferente
};

/**
 * Retorna a URL da API baseado no ambiente
 */
export const getApiBaseUrl = () => {
    // __DEV__ é injetado automaticamente pelo React Native
    // true = desenvolvimento | false = produção/APK
    const env = __DEV__ ? 'development' : 'production';
    const baseUrl = API_URLS[env];
    
    // Log apenas em desenvolvimento
    if (__DEV__) {
        console.log(`[API Config] Ambiente: ${env}, URL: ${baseUrl}`);
    }
    
    return baseUrl;
};

/**
 * Retorna verdadeiro se está em modo desenvolvimento
 */
export const isDevelopment = () => __DEV__;

/**
 * Retorna verdadeiro se está em modo produção
 */
export const isProduction = () => !__DEV__;

export default {
    API_URLS,
    getApiBaseUrl,
    isDevelopment,
    isProduction,
};
