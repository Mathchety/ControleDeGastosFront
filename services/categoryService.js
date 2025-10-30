import httpClient from './httpClient';import api from './api';



/**/**

 * Serviço de Categorias * Serviço de Categorias

 * CRUD completo para gerenciar categorias de produtos */

 */export const CategoryService = {

    /**

/**     * GET /categories - Listar todas as categorias

 * Lista todas as categorias     */

 * GET /categories    getAllCategories: async (token) => {

 */        return await api.apiRequest('/categories', {

export const getCategories = async () => {            method: 'GET',

    try {            token,

        const response = await httpClient.get('/categories');        });

        return response.categories || [];    },

    } catch (error) {

        console.error('[Categories] Erro ao listar categorias:', error);    /**

        throw error;     * GET /category/{id} - Obter detalhes de uma categoria

    }     */

};    getCategoryById: async (token, id) => {

        return await api.apiRequest(`/category/${id}`, {

/**            method: 'GET',

 * Busca uma categoria específica por ID            token,

 * GET /category/:id        });

 */    },

export const getCategoryById = async (id) => {

    try {    /**

        const response = await httpClient.get(`/category/${id}`);     * POST /category - Criar nova categoria

        return response.category;     * @param {string} name - Nome da categoria

    } catch (error) {     * @param {string} description - Descrição (opcional)

        console.error(`[Categories] Erro ao buscar categoria ${id}:`, error);     */

        throw error;    createCategory: async (token, name, description = '') => {

    }        return await api.apiRequest('/category', {

};            method: 'POST',

            token,

/**            body: JSON.stringify({ name, description }),

 * Cria uma nova categoria        });

 * POST /category    },

 * @param {object} categoryData - { name, description, icon, color }

 */    /**

export const createCategory = async (categoryData) => {     * PATCH /category/{id} - Atualizar categoria

    try {     */

        const response = await httpClient.post('/category', categoryData);    updateCategory: async (token, id, name, description) => {

        console.log('[Categories] Categoria criada:', response.category?.name);        return await api.apiRequest(`/category/${id}`, {

        return response.category;            method: 'PATCH',

    } catch (error) {            token,

        console.error('[Categories] Erro ao criar categoria:', error);            body: JSON.stringify({ name, description }),

        throw error;        });

    }    },

};

    /**

/**     * DELETE /category/{id} - Deletar categoria

 * Atualiza uma categoria existente     */

 * PATCH /category/:id    deleteCategory: async (token, id) => {

 * @param {number} id - ID da categoria        return await api.apiRequest(`/category/${id}`, {

 * @param {object} categoryData - { name, description, icon, color }            method: 'DELETE',

 */            token,

export const updateCategory = async (id, categoryData) => {        });

    try {    },

        const response = await httpClient.patch(`/category/${id}`, categoryData);};

        console.log('[Categories] Categoria atualizada:', response.category?.name);
        return response.category;
    } catch (error) {
        console.error(`[Categories] Erro ao atualizar categoria ${id}:`, error);
        throw error;
    }
};

/**
 * Deleta uma categoria
 * DELETE /category/:id
 */
export const deleteCategory = async (id) => {
    try {
        await httpClient.delete(`/category/${id}`);
        console.log(`[Categories] Categoria ${id} deletada com sucesso`);
    } catch (error) {
        console.error(`[Categories] Erro ao deletar categoria ${id}:`, error);
        throw error;
    }
};
