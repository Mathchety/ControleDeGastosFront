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
            console.error('Erro ao carregar token:', error);
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
        
        console.log(`[HTTP ${method}] ${url}`);
        if (body) {
            console.log('[HTTP Body]', JSON.stringify(body, null, 2).substring(0, 200));
        }

        try {
            const response = await fetch(url, {
                method,
                headers: finalHeaders,
                ...(body && { body: JSON.stringify(body) }),
                ...otherOptions,
            });

            console.log(`[HTTP Response] Status: ${response.status}`);

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

                // Se for 401, o token é inválido/expirado
                if (response.status === 401) {
                    this.setToken(null); // Limpa o token
                    throw new Error('Sessão expirada. Faça login novamente.');
                }

                throw new Error(errorData.error || errorData.message || `Erro ${response.status}`);
            }

            // Tenta parsear a resposta como JSON
            if (!textResponse || textResponse.trim() === '') {
                return null; // Resposta vazia é válida para alguns endpoints
            }

            try {
                return JSON.parse(textResponse);
            } catch (parseError) {
                console.error('[HTTP] Erro ao parsear JSON:', textResponse.substring(0, 200));
                throw new Error('Resposta inválida do servidor');
            }

        } catch (error) {
            console.error(`[HTTP Error] ${method} ${endpoint}:`, error.message);
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
