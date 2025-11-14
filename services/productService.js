import api from './api';

/**
 * Serviço de Produtos
 */
export const ProductService = {
    /**
     * GET /products - Listar todos os produtos
     */
    getAllProducts: async (token) => {
        return await api.apiRequest('/products', {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /products/{id} - Buscar produto por ID
     */
    getProductById: async (token, id) => {
        return await api.apiRequest(`/products/${id}`, {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /products/date/{date} - Buscar produtos por data
     */
    getProductsByDate: async (token, date) => {
        return await api.apiRequest(`/products/date/${date}`, {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /products/period - Buscar produtos por período
     */
    getProductsByPeriod: async (token, startDate, endDate) => {
        return await api.apiRequest(`/products/period?start_date=${startDate}&end_date=${endDate}`, {
            method: 'GET',
            token,
        });
    },
};

/**
 * Serviço de Itens
 */
export const ItemService = {
    /**
     * GET /items - Listar todos os itens
     */
    getAllItems: async (token) => {
        return await api.apiRequest('/items', {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /item/{id} - Buscar item por ID
     */
    getItemById: async (token, id) => {
        return await api.apiRequest(`/item/${id}`, {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /items/date/{date} - Listar itens por data de recibo
     */
    getItemsByDate: async (token, date) => {
        return await api.apiRequest(`/items/date/${date}`, {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /items/period - Listar itens por período
     */
    getItemsByPeriod: async (token, startDate, endDate) => {
        return await api.apiRequest(`/items/period?start_date=${startDate}&end_date=${endDate}`, {
            method: 'GET',
            token,
        });
    },

    /**
     * 🔄 PATCH /item/:id - Atualizar item individual
     * @param {string} token - JWT token
     * @param {number} itemId - ID do item a ser atualizado
     * @param {object} itemData - Dados a atualizar { categoryId?, quantity?, unitPrice? }
     * @returns {Promise} Item atualizado
     * 
     * ⚡ Atualização parcial: Envia apenas os campos que mudaram
     * 🔒 Requer autenticação: Token JWT (renovado automaticamente se expirado)
     * 
     * Exemplo:
     * ```js
     * await updateItem(token, 123, { 
     *   categoryId: 5, 
     *   quantity: 3.0 
     * });
     * ```
     */
    updateItem: async (token, itemId, itemData) => {
        return await api.apiRequest(`/item/${itemId}`, {
            method: 'PATCH',
            token,
            body: JSON.stringify(itemData),
        });
    },
};
