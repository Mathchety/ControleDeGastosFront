import api from './api';

/**
 * Serviço de Autenticação
 */
export const AuthService = {
    /**
     * POST /register - Registrar novo usuário
     * @param {string} name - Nome do usuário
     * @param {string} email - Email
     * @param {string} password - Senha
     */
    register: async (name, email, password) => {
        return await api.apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    },

    /**
     * POST /login - Fazer login
     * @param {string} email - Email
     * @param {string} password - Senha
     * @returns {object} { token, user, message }
     */
    login: async (email, password) => {
        return await api.apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    /**
     * GET /me - Obter perfil do usuário atual
     * @param {string} token - Token JWT
     */
    getMe: async (token) => {
        return await api.apiRequest('/me', {
            method: 'GET',
            token,
        });
    },
};
