import api from './api';

/**
 * Serviço de Categorias
 * CRUD completo para gerenciar categorias de produtos
 */
export const CategoryService = {
    /**
     * GET /categories - Listar todas as categorias
     */
    getAllCategories: async (token) => {
        return await api.apiRequest('/categories', {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /category/{id} - Obter detalhes de uma categoria
     */
    getCategoryById: async (token, id) => {
        return await api.apiRequest(`/category/${id}`, {
            method: 'GET',
            token,
        });
    },

    /**
     * POST /category - Criar nova categoria
     * @param {string} name - Nome da categoria
     * @param {string} description - Descrição (opcional)
     */
    createCategory: async (token, name, description = '') => {
        return await api.apiRequest('/category', {
            method: 'POST',
            token,
            body: JSON.stringify({ name, description }),
        });
    },

    /**
     * PATCH /category/{id} - Atualizar categoria
     */
    updateCategory: async (token, id, name, description) => {
        return await api.apiRequest(`/category/${id}`, {
            method: 'PATCH',
            token,
            body: JSON.stringify({ name, description }),
        });
    },

    /**
     * DELETE /category/{id} - Deletar categoria
     */
    deleteCategory: async (token, id) => {
        return await api.apiRequest(`/category/${id}`, {
            method: 'DELETE',
            token,
        });
    },
};
