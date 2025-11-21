import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; // 🔐 Armazenamento seguro para tokens
import { getApiBaseUrl } from '../config/apiConfig';

const API_BASE_URL = getApiBaseUrl();

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
        this.onRefreshFail = null; // callback quando o refresh falhar
        this._notifiedRefreshFail = false; // impede notificações duplicadas ao AuthContext
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
            // Ao salvar um novo access token (novo login/refresh bem-sucedido),
            // garantimos que a flag de notificação de falha seja resetada para
            // permitir futuras notificações caso ocorram novas falhas.
            try {
                this._notifiedRefreshFail = false;
            } catch (e) {
                // ignore
            }
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
    async refreshAccessToken(notifyOnFail = true) {
        if (!this.refreshToken) {
            console.log('[HttpClient] ❌ Refresh token não disponível');
            throw new Error('Refresh token não disponível');
        }

        try {
            console.log('[HttpClient] 🔄 Tentando renovar token...');
            console.log('[HttpClient] 📝 Refresh token (primeiros 20 chars):', this.refreshToken.substring(0, 20) + '...');
            
            // ✅ Envia refresh token no BODY (não no header)
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken,
                }),
            });

            console.log('[HttpClient] 📡 Response status:', response.status);

            if (!response.ok) {
                // Lê a resposta de erro
                const errorText = await response.text();
                console.log('[HttpClient] ❌ Erro do servidor:', errorText);
                console.log('[HttpClient] ❌ Falha ao renovar token - Status:', response.status);
                throw new Error(`Falha ao renovar token: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            if (data.accessToken) {
                console.log('[HttpClient] ✅ Token renovado com sucesso');
                console.log('[HttpClient] 📝 Novo refresh token recebido:', !!data.refreshToken);
                // Salva accessToken e refreshToken (API retorna ambos)
                this.setTokens(data.accessToken, data.refreshToken);
                // Reseta sinalização de notificação após sucesso
                this._notifiedRefreshFail = false;
                console.debug('[HttpClient] _notifiedRefreshFail reset -> false (refresh success)');
                return data.accessToken;
            }

            console.log('[HttpClient] ❌ Token não retornado pelo servidor');
            throw new Error('Token não retornado pelo servidor');
        } catch (error) {
            console.error('[HttpClient] ❌ Erro ao renovar token:', error.message);
            // Se falhar, limpa tudo
            this.setTokens(null, null);
            // Não bloqueamos tentativas futuras aqui; apenas limpamos tokens e
            // notificamos quando apropriado (notifyOnFail).
            // Notifica subscribers e consumidor (ex: AuthContext) que o refresh falhou (opcional)
            try {
                this.onRefreshed(null);
            } catch (e) {
                // ignore
            }
            if (notifyOnFail) {
                try {
                    if (typeof this.onRefreshFail === 'function' && !this._notifiedRefreshFail) {
                        this._notifiedRefreshFail = true;
                        console.debug('[HttpClient] Notificando onRefreshFail (from refreshAccessToken)');
                        this.onRefreshFail(error);
                    } else {
                        console.debug('[HttpClient] onRefreshFail presente?', typeof this.onRefreshFail === 'function');
                        console.debug('[HttpClient] _notifiedRefreshFail:', this._notifiedRefreshFail);
                    }
                } catch (notifyErr) {
                    console.error('[HttpClient] Erro ao notificar onRefreshFail:', notifyErr);
                }
            }
            throw error;
        }
    }

    /**
     * Permite registrar um callback para quando o refresh falhar
     * callback(error)
     */
    setOnRefreshFail(callback) {
        this.onRefreshFail = callback;
        console.debug('[HttpClient] setOnRefreshFail called. handlerPresent=', typeof callback === 'function');
        // Reset da sinalização de notificação quando um novo handler for registrado
        if (callback) {
            this._notifiedRefreshFail = false;
        } else {
            // Se remover o handler, garante que a flag também seja limpa
            this._notifiedRefreshFail = false;
        }
    }

    /**
     * Método genérico para fazer requisições HTTP
     * @param {string} endpoint - O endpoint da API (ex: '/receipts')
     * @param {object} options - Opções do fetch (method, body, headers, etc)
     * @param {boolean} requiresAuth - Se true, adiciona o token de autenticação
     * @param {boolean} isRetry - Se true, é uma tentativa após refresh (evita loop infinito)
     */
    async request(endpoint, options = {}, requiresAuth = true, isRetry = false, allowAutoRefresh = true) {
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

            // Extrai headers de rate limit
            const rateLimitHeaders = {
                'x-ratelimit-limit': response.headers.get('X-RateLimit-Limit'),
                'x-ratelimit-remaining': response.headers.get('X-RateLimit-Remaining'),
                'x-ratelimit-reset': response.headers.get('X-RateLimit-Reset'),
                'x-ratelimit-retryafter': response.headers.get('X-RateLimit-RetryAfter') || response.headers.get('Retry-After'),
            };

            // Lê a resposta como texto primeiro
            const textResponse = await response.text();
            
            // Se não for 2xx, trata como erro
            if (!response.ok) {
                // Trata 429 (Too Many Requests) de forma especial
                if (response.status === 429) {
                    let errorData;
                    try {
                        errorData = JSON.parse(textResponse);
                    } catch {
                        errorData = { message: 'Muitas requisições. Tente novamente mais tarde.' };
                    }

                    const error = new Error(errorData.error || errorData.message || 'Muitas requisições');
                    error.statusCode = 429;
                    error.rateLimitHeaders = rateLimitHeaders;
                    error.response = {
                        status: 429,
                        data: errorData
                    };
                    throw error;
                }

                // Tenta parsear como JSON para pegar a mensagem de erro
                let errorData;
                try {
                    errorData = JSON.parse(textResponse);
                } catch {
                    errorData = { message: textResponse || `Erro HTTP ${response.status}` };
                }

                // Se for 401 e requer autenticação:
                // - se allowAutoRefresh === false, NÃO tentamos renovar agora (usado durante inicialização)
                // - caso contrário tentamos renovar, respeitando o isRetry para evitar loops
                if (response.status === 401 && requiresAuth) {
                    if (!allowAutoRefresh) {
                        // Não tentamos renovar neste contexto (ex: inicialização do app)
                        this.setTokens(null, null);
                        const err = new Error(errorData.error || errorData.message || 'Token expirado');
                        err.statusCode = 401;
                        err.response = { status: 401, data: errorData };
                        err.silent = true;
                        throw err;
                    }
                    // Se já está em processo de refresh (outro fluxo), aguarda o resultado
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.addRefreshSubscriber((token) => {
                                if (token) {
                                    this.request(endpoint, options, requiresAuth, true)
                                        .then(resolve)
                                        .catch(reject);
                                } else {
                                    const err = new Error('Sessão expirada. Faça login novamente.');
                                    err.statusCode = 401;
                                    err.silent = true;
                                    reject(err);
                                }
                            });
                        });
                    }
                    // Se esta requisição já é um retry, não tentamos renovar de novo
                    if (isRetry) {
                        try {
                            if (typeof this.onRefreshFail === 'function' && !this._notifiedRefreshFail) {
                                this._notifiedRefreshFail = true;
                                console.debug('[HttpClient] Notificando onRefreshFail (from request isRetry)');
                                this.onRefreshFail(new Error('401 recebido: token inválido/expirado'));
                            } else {
                                console.debug('[HttpClient] isRetry path: handlerPresent=', typeof this.onRefreshFail === 'function', ' _notifiedRefreshFail=', this._notifiedRefreshFail);
                            }
                        } catch (notifyErr) {
                            console.error('[HttpClient] Erro ao notificar onRefreshFail:', notifyErr);
                        }

                        const err = new Error(errorData.error || errorData.message || 'Token expirado');
                        err.statusCode = 401;
                        err.response = { status: 401, data: errorData };
                        err.silent = true;
                        throw err;
                    }

                    // Tenta renovar automaticamente agora
                    try {
                        this.isRefreshing = true;
                        const newToken = await this.refreshAccessToken(false); // false = não notificar onRefreshFail internamente
                        // Notifica subscribers e tenta a requisição original novamente
                        this.onRefreshed(newToken);
                        this.isRefreshing = false;
                        return this.request(endpoint, options, requiresAuth, true);
                    } catch (refreshErr) {
                        // Falha ao renovar: garante estado limpo e notifica AuthContext (uma vez)
                        this.isRefreshing = false;
                        try {
                            this.onRefreshed(null);
                        } catch (e) {
                            // ignore
                        }
                        try {
                            if (typeof this.onRefreshFail === 'function' && !this._notifiedRefreshFail) {
                                this._notifiedRefreshFail = true;
                                console.debug('[HttpClient] Notificando onRefreshFail (from request refreshErr)');
                                this.onRefreshFail(refreshErr);
                            } else {
                                console.debug('[HttpClient] refreshErr path: handlerPresent=', typeof this.onRefreshFail === 'function', ' _notifiedRefreshFail=', this._notifiedRefreshFail);
                            }
                        } catch (notifyErr) {
                            console.error('[HttpClient] Erro ao notificar onRefreshFail:', notifyErr);
                        }

                        const err = new Error(errorData.error || errorData.message || 'Token expirado');
                        err.statusCode = 401;
                        err.response = { status: 401, data: errorData };
                        err.silent = true;
                        throw err;
                    }
                }

                // Se for 401 sem refresh ou outro erro
                if (response.status === 401) {
                    // Se for login/register (não requer auth), usa a mensagem do servidor
                    if (!requiresAuth) {
                        const error = new Error(errorData.error || errorData.message || 'Credenciais inválidas');
                        error.statusCode = 401;
                        error.rateLimitHeaders = rateLimitHeaders;
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
                error.rateLimitHeaders = rateLimitHeaders;
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
    async get(endpoint, requiresAuth = true, allowAutoRefresh = true) {
        return this.request(endpoint, { method: 'GET' }, requiresAuth, false, allowAutoRefresh);
    }
    async post(endpoint, body, requiresAuth = true, allowAutoRefresh = true) {
        return this.request(endpoint, { method: 'POST', body }, requiresAuth, false, allowAutoRefresh);
    }

    async patch(endpoint, body, requiresAuth = true, allowAutoRefresh = true) {
        return this.request(endpoint, { method: 'PATCH', body }, requiresAuth, false, allowAutoRefresh);
    }

    async put(endpoint, body, requiresAuth = true, allowAutoRefresh = true) {
        return this.request(endpoint, { method: 'PUT', body }, requiresAuth, false, allowAutoRefresh);
    }

    async delete(endpoint, requiresAuth = true, allowAutoRefresh = true) {
        return this.request(endpoint, { method: 'DELETE' }, requiresAuth, false, allowAutoRefresh);
    }
}

// Exporta uma instância única (singleton)
const httpClient = new HttpClient();

export default httpClient;
