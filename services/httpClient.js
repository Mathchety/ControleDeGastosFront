import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; // 🔐 Armazenamento seguro para tokens

const API_BASE_URL = 'http://147.185.221.212:61489/api/v1';

/**
 * Cliente HTTP com interceptor automático de token JWT
 * Adiciona o header Authorization: Bearer <token> automaticamente em todas as requisições
 */
class HttpClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = null;
        this.refreshToken = null;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }

    /**
     * Inicializa o cliente carregando os tokens do SecureStore
     * 🔐 Tokens são dados sensíveis e devem ser criptografados
     */
    async init() {
        try {
            this.token = await SecureStore.getItemAsync('access_token');
            this.refreshToken = await SecureStore.getItemAsync('refresh_token');
        } catch (error) {
            console.log('Erro ao carregar tokens:', error);
        }
    }

    /**
     * Define os tokens JWT para as próximas requisições
     * 🔐 Salva tokens de forma segura no SecureStore
     */
    setTokens(accessToken, refreshToken = null) {
        this.token = accessToken;
        
        if (accessToken) {
            SecureStore.setItemAsync('access_token', accessToken);
        } else {
            SecureStore.deleteItemAsync('access_token');
        }

        if (refreshToken !== null) {
            this.refreshToken = refreshToken;
            if (refreshToken) {
                SecureStore.setItemAsync('refresh_token', refreshToken);
            } else {
                SecureStore.deleteItemAsync('refresh_token');
            }
        }
    }

    /**
     * Define apenas o access token (usado após refresh)
     */
    setToken(token) {
        this.setTokens(token, null);
    }

    /**
     * Obtém o token atual
     */
    getToken() {
        return this.token;
    }

    /**
     * Obtém o refresh token atual
     */
    getRefreshToken() {
        return this.refreshToken;
    }

    /**
     * Adiciona subscriber para aguardar refresh
     */
    addRefreshSubscriber(callback) {
        this.refreshSubscribers.push(callback);
    }

    /**
     * Notifica todos os subscribers quando o refresh termina
     */
    onRefreshed(token) {
        this.refreshSubscribers.forEach(callback => callback(token));
        this.refreshSubscribers = [];
    }

    /**
     * Tenta renovar o access token usando o refresh token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('Refresh token não disponível');
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.refreshToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Falha ao renovar token');
            }

            const data = await response.json();
            
            if (data.accessToken) {
                // Salva accessToken e refreshToken (one-time use)
                this.setTokens(data.accessToken, data.refreshToken);
                return data.accessToken;
            }

            throw new Error('Token não retornado pelo servidor');
        } catch (error) {
            // Se falhar, limpa tudo
            this.setTokens(null, null);
            throw error;
        }
    }

    /**
     * Método genérico para fazer requisições HTTP
     * @param {string} endpoint - O endpoint da API (ex: '/receipts')
     * @param {object} options - Opções do fetch (method, body, headers, etc)
     * @param {boolean} requiresAuth - Se true, adiciona o token de autenticação
     * @param {boolean} isRetry - Se true, é uma tentativa após refresh (evita loop infinito)
     */
    async request(endpoint, options = {}, requiresAuth = true, isRetry = false) {
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

                // Se for 401 e tiver refresh token, tenta renovar
                if (response.status === 401 && requiresAuth && !isRetry && this.refreshToken) {
                    try {
                        // Se já está refreshing, aguarda
                        if (this.isRefreshing) {
                            return new Promise((resolve, reject) => {
                                this.addRefreshSubscriber((token) => {
                                    if (token) {
                                        // Tenta novamente com o novo token
                                        this.request(endpoint, options, requiresAuth, true)
                                            .then(resolve)
                                            .catch(reject);
                                    } else {
                                        reject(new Error('Sessão expirada. Faça login novamente.'));
                                    }
                                });
                            });
                        }

                        // Marca que está refreshing
                        this.isRefreshing = true;

                        // Tenta renovar o token
                        const newToken = await this.refreshAccessToken();
                        
                        // Notifica os subscribers
                        this.onRefreshed(newToken);
                        this.isRefreshing = false;

                        // Tenta novamente com o novo token
                        return this.request(endpoint, options, requiresAuth, true);
                    } catch (refreshError) {
                        // 🔇 Se falhar o refresh, limpa tudo SILENCIOSAMENTE
                        // Não mostra alert - apenas redireciona para login via AuthContext
                        this.isRefreshing = false;
                        this.onRefreshed(null);
                        this.setTokens(null, null);
                        
                        const error = new Error('Token expirado');
                        error.statusCode = 401;
                        error.response = { status: 401, data: errorData };
                        error.silent = true; // 🔇 Flag para não mostrar alert
                        throw error;
                    }
                }

                // Se for 401 sem refresh ou outro erro
                if (response.status === 401) {
                    // Se for login/register (não requer auth), usa a mensagem do servidor
                    if (!requiresAuth) {
                        const error = new Error(errorData.error || errorData.message || 'Credenciais inválidas');
                        error.statusCode = 401;
                        error.response = { status: 401, data: errorData };
                        throw error;
                    }
                    
                    // 🔇 Se requer autenticação, token é inválido/expirado SILENCIOSAMENTE
                    this.setTokens(null, null);
                    const error = new Error('Token expirado');
                    error.statusCode = 401;
                    error.response = { status: 401, data: errorData };
                    error.silent = true; // 🔇 Flag para não mostrar alert
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
