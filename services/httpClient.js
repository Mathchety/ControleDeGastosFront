import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://147.185.221.212:61489/api/v1';

/**
 * Cliente HTTP com interceptor automático de token JWT
 * Adiciona o header Authorization: Bearer <token> automaticamente em todas as requisições
 */
class HttpClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = null;
    }

    /**
     * Inicializa o cliente carregando o token do AsyncStorage
     */
    async init() {
        try {
            this.token = await AsyncStorage.getItem('token');
        } catch (error) {
            // Silencioso
        }
    }

    /**
     * Define o token JWT para as próximas requisições
     */
    setToken(token) {
        this.token = token;
        if (token) {
            AsyncStorage.setItem('token', token);
        } else {
            AsyncStorage.removeItem('token');
        }
    }

    /**
     * Obtém o token atual
     */
    getToken() {
        return this.token;
    }

    /**
     * Método genérico para fazer requisições HTTP
     * @param {string} endpoint - O endpoint da API (ex: '/receipts')
     * @param {object} options - Opções do fetch (method, body, headers, etc)
     * @param {boolean} requiresAuth - Se true, adiciona o token de autenticação
     */
    async request(endpoint, options = {}, requiresAuth = true) {
        const { method = 'GET', body, headers = {}, ...otherOptions } = options;

        // Monta os headers
        const finalHeaders = {
            'Content-Type': 'application/json',
            ...headers,
        };

        // Adiciona o token se a rota requer autenticação
        if (requiresAuth && this.token) {
            finalHeaders['Authorization'] = `Bearer ${this.token}`;
        }

        // Monta a URL completa
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                method,
                headers: finalHeaders,
                ...(body && { body: JSON.stringify(body) }),
                ...otherOptions,
            });

            // Lê a resposta como texto primeiro
            const textResponse = await response.text();
            
            // Se não for 2xx, trata como erro
            if (!response.ok) {
                // Tenta parsear como JSON para pegar a mensagem de erro
                let errorData;
                try {
                    errorData = JSON.parse(textResponse);
                } catch {
                    errorData = { message: textResponse || `Erro HTTP ${response.status}` };
                }

                // Se for 401, verifica se é erro de autenticação ou sessão expirada
                if (response.status === 401) {
                    // Se for login/register (não requer auth), usa a mensagem do servidor
                    if (!requiresAuth) {
                        const error = new Error(errorData.error || errorData.message || 'Credenciais inválidas');
                        error.statusCode = 401;
                        error.response = { status: 401, data: errorData };
                        throw error;
                    }
                    
                    // Se requer autenticação, token é inválido/expirado
                    this.setToken(null); // Limpa o token
                    const error = new Error('Sessão expirada. Faça login novamente.');
                    error.statusCode = 401;
                    error.response = { status: 401, data: errorData };
                    throw error;
                }

                // Cria erro com informações completas
                const error = new Error(errorData.error || errorData.message || `Erro ${response.status}`);
                error.statusCode = response.status;
                error.response = {
                    status: response.status,
                    data: errorData
                };
                throw error;
            }

            // Tenta parsear a resposta como JSON
            if (!textResponse || textResponse.trim() === '') {
                return null; // Resposta vazia é válida para alguns endpoints
            }

            try {
                return JSON.parse(textResponse);
            } catch (parseError) {
                throw new Error('Resposta inválida do servidor');
            }

        } catch (error) {
            throw error;
        }
    }

    /**
     * Métodos de conveniência
     */
    async get(endpoint, requiresAuth = true) {
        return this.request(endpoint, { method: 'GET' }, requiresAuth);
    }

    async post(endpoint, body, requiresAuth = true) {
        return this.request(endpoint, { method: 'POST', body }, requiresAuth);
    }

    async patch(endpoint, body, requiresAuth = true) {
        return this.request(endpoint, { method: 'PATCH', body }, requiresAuth);
    }

    async put(endpoint, body, requiresAuth = true) {
        return this.request(endpoint, { method: 'PUT', body }, requiresAuth);
    }

    async delete(endpoint, requiresAuth = true) {
        return this.request(endpoint, { method: 'DELETE' }, requiresAuth);
    }
}

// Exporta uma instância única (singleton)
const httpClient = new HttpClient();

export default httpClient;
