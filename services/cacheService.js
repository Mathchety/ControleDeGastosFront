import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 💾 Serviço de Cache Local
 * Armazena dados offline para visualização sem internet
 */

const CACHE_KEYS = {
    RECEIPTS: '@FinaSync:receipts',
    RECEIPTS_DETAILS: '@FinaSync:receipts_details_',
    CATEGORIES: '@FinaSync:categories',
    GRAPH_DATA: '@FinaSync:graph_data',
    LAST_UPDATE: '@FinaSync:last_update',
};

export const CacheService = {
    /**
     * Salva recibos no cache
     */
    saveReceipts: async (receipts) => {
        try {
            await AsyncStorage.setItem(CACHE_KEYS.RECEIPTS, JSON.stringify(receipts));
            await AsyncStorage.setItem(CACHE_KEYS.LAST_UPDATE, new Date().toISOString());
        } catch (error) {
            console.error('Erro ao salvar recibos no cache:', error);
        }
    },

    /**
     * Carrega recibos do cache
     */
    loadReceipts: async () => {
        try {
            const data = await AsyncStorage.getItem(CACHE_KEYS.RECEIPTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao carregar recibos do cache:', error);
            return [];
        }
    },

    /**
     * Salva categorias no cache
     */
    saveCategories: async (categories) => {
        try {
            await AsyncStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(categories));
        } catch (error) {
            console.error('Erro ao salvar categorias no cache:', error);
        }
    },

    /**
     * Carrega categorias do cache
     */
    loadCategories: async () => {
        try {
            const data = await AsyncStorage.getItem(CACHE_KEYS.CATEGORIES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao carregar categorias do cache:', error);
            return [];
        }
    },

    /**
     * Salva dados do gráfico no cache (com período específico)
     */
    saveGraphData: async (graphData, period = 'month') => {
        try {
            const key = `${CACHE_KEYS.GRAPH_DATA}_${period}`;
            await AsyncStorage.setItem(key, JSON.stringify(graphData));
        } catch (error) {
            console.error('Erro ao salvar dados do gráfico:', error);
        }
    },

    /**
     * Carrega dados do gráfico do cache (por período)
     */
    loadGraphData: async (period = 'month') => {
        try {
            const key = `${CACHE_KEYS.GRAPH_DATA}_${period}`;
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao carregar dados do gráfico:', error);
            return [];
        }
    },

    /**
     * Salva detalhes completos de um recibo
     */
    saveReceiptDetails: async (receiptId, receiptData) => {
        try {
            const key = `${CACHE_KEYS.RECEIPTS_DETAILS}${receiptId}`;
            await AsyncStorage.setItem(key, JSON.stringify(receiptData));
        } catch (error) {
            console.error('Erro ao salvar detalhes do recibo:', error);
        }
    },

    /**
     * Carrega detalhes completos de um recibo
     */
    loadReceiptDetails: async (receiptId) => {
        try {
            const key = `${CACHE_KEYS.RECEIPTS_DETAILS}${receiptId}`;
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar detalhes do recibo:', error);
            return null;
        }
    },

    /**
     * Obtém data da última atualização
     */
    getLastUpdate: async () => {
        try {
            const data = await AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE);
            return data ? new Date(data) : null;
        } catch (error) {
            console.error('Erro ao obter última atualização:', error);
            return null;
        }
    },

    /**
     * Salva detalhes completos de uma categoria (incluindo itens)
     */
    saveCategoryDetails: async (categoryId, categoryData) => {
        try {
            const key = `@FinaSync:category_details_${categoryId}`;
            await AsyncStorage.setItem(key, JSON.stringify(categoryData));
        } catch (error) {
            console.error('Erro ao salvar detalhes da categoria:', error);
        }
    },

    /**
     * Carrega detalhes completos de uma categoria
     */
    loadCategoryDetails: async (categoryId) => {
        try {
            const key = `@FinaSync:category_details_${categoryId}`;
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar detalhes da categoria:', error);
            return null;
        }
    },

    /**
     * Limpa todo o cache
     */
    clearCache: async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith('@FinaSync:'));
            await AsyncStorage.multiRemove(cacheKeys);
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
        }
    },
};
