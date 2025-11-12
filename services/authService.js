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

    /**
     * POST /auth/forgot-password - Solicita código de recuperação de senha
     * @param {string} email - Email do usuário
     * @returns {object} { message }
     */
    forgotPassword: async (email) => {
        return await api.apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    /**
     * POST /auth/reset-password - Reseta a senha usando código de verificação
     * @param {string} email - Email do usuário
     * @param {string} token - Código de 6 dígitos recebido por email
     * @param {string} newPassword - Nova senha
     * @returns {object} { message }
     */
    resetPassword: async (email, token, newPassword) => {
        return await api.apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, token, newPassword }),
        });
    },

    /**
     * PATCH /user/profile - Atualiza nome do usuário
     * @param {string} token - Token JWT
     * @param {string} name - Novo nome
     * @returns {object} { message, user }
     */
    updateProfile: async (token, name) => {
        return await api.apiRequest('/user/profile', {
            method: 'PATCH',
            token,
            body: JSON.stringify({ name }),
        });
    },

    /**
     * POST /user/request-email-change - Solicita troca de email (envia código)
     * @param {string} token - Token JWT
     * @param {string} newEmail - Novo email
     * @returns {object} { message }
     */
    requestEmailChange: async (token, newEmail) => {
        return await api.apiRequest('/user/request-email-change', {
            method: 'POST',
            token,
            body: JSON.stringify({ newEmail }),
        });
    },

    /**
     * POST /user/confirm-email-change - Confirma troca de email com código
     * @param {string} token - Token JWT
     * @param {string} newEmail - Novo email
     * @param {string} verificationToken - Código de 6 dígitos
     * @returns {object} { message, user }
     */
    confirmEmailChange: async (token, newEmail, verificationToken) => {
        return await api.apiRequest('/user/confirm-email-change', {
            method: 'POST',
            token,
            body: JSON.stringify({ newEmail, token: verificationToken }),
        });
    },

    /**
     * POST /auth/change-password - Altera a senha do usuário
     * @param {string} token - Token JWT
     * @param {string} currentPassword - Senha atual
     * @param {string} newPassword - Nova senha
     * @returns {object} { message }
     */
    changePassword: async (token, currentPassword, newPassword) => {
        return await api.apiRequest('/auth/change-password', {
            method: 'POST',
            token,
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    },
};
