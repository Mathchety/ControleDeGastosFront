/**
 * 📚 Mensagens de Erro Amigáveis baseadas na documentação da API
 * 
 * Mapeia erros técnicos para mensagens que o usuário entende
 */

export const ERROR_MESSAGES = {
    // Erros de Autenticação
    UNAUTHORIZED: 'Sua sessão expirou. Por favor, faça login novamente.',
    INVALID_CREDENTIALS: 'Email ou senha incorretos. Tente novamente.',
    EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado. Tente fazer login.',
    WEAK_PASSWORD: 'A senha deve ter pelo menos 6 caracteres.',
    
    // Erros de Rede
    NETWORK_ERROR: 'Sem conexão com a internet. Verifique sua rede e tente novamente.',
    TIMEOUT: 'A operação demorou muito. Tente novamente.',
    SERVER_ERROR: 'Erro no servidor. Tente novamente em alguns instantes.',
    
    // Erros de Recibos
    RECEIPT_NOT_FOUND: 'Recibo não encontrado.',
    RECEIPT_DELETE_ERROR: 'Não foi possível excluir o recibo. Tente novamente.',
    INVALID_QR_CODE: 'Código QR inválido ou não reconhecido.',
    QR_CODE_ALREADY_SCANNED: 'Este QR Code já foi escaneado anteriormente.',
    
    // Erros de Processamento/IA
    AI_PROCESSING_LIMIT: 'Muitas notas estão sendo processadas no momento. Por favor, aguarde alguns minutos e tente novamente.',
    AI_PROCESSING_ERROR: 'Erro ao processar a nota fiscal com IA. Tente novamente.',
    TOO_MANY_REQUESTS: 'Você está enviando muitas requisições. Aguarde um momento e tente novamente.',
    
    // Erros de Categorias
    CATEGORY_NOT_FOUND: 'Categoria não encontrada.',
    CATEGORY_NAME_EXISTS: 'Já existe uma categoria com este nome.',
    CATEGORY_DELETE_ERROR: 'Não foi possível excluir a categoria.',
    CATEGORY_CREATE_ERROR: 'Não foi possível criar a categoria.',
    CATEGORY_UPDATE_ERROR: 'Não foi possível atualizar a categoria.',
    
    // Erros de Itens
    ITEM_NOT_FOUND: 'Item não encontrado.',
    ITEM_UPDATE_ERROR: 'Não foi possível atualizar o item.',
    ITEM_DELETE_ERROR: 'Não foi possível excluir o item.',
    
    // Erros de Produtos
    PRODUCT_NOT_FOUND: 'Produto não encontrado.',
    PRODUCT_UPDATE_ERROR: 'Não foi possível atualizar o produto.',
    PRODUCT_DELETE_ERROR: 'Não foi possível excluir o produto.',
    
    // Erros Genéricos
    UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
    VALIDATION_ERROR: 'Dados inválidos. Verifique as informações e tente novamente.',
    FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
};

/**
 * Extrai mensagem de erro amigável baseada no erro da API
 * @param {Error} error - Erro retornado pela API
 * @param {string} defaultMessage - Mensagem padrão caso não seja reconhecido
 * @returns {string} Mensagem amigável para o usuário
 */
export const getErrorMessage = (error, defaultMessage = ERROR_MESSAGES.UNKNOWN_ERROR) => {
    // Se não há erro, retorna mensagem padrão
    if (!error) return defaultMessage;

    // Erro de rede (sem conexão)
    if (!error.response && (error.message === 'Network Error' || error.message === 'Network request failed')) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
        return ERROR_MESSAGES.TIMEOUT;
    }

    // Verifica status HTTP
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message;

    switch (status) {
        case 400: // Bad Request
            // Verifica mensagens específicas da API
            if (message?.includes('email já existe') || message?.includes('email already exists')) {
                return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
            }
            if (message?.includes('categoria com este nome') || message?.includes('category with this name')) {
                return ERROR_MESSAGES.CATEGORY_NAME_EXISTS;
            }
            if (message?.includes('QR Code já foi escaneado') || message?.includes('already scanned')) {
                return ERROR_MESSAGES.QR_CODE_ALREADY_SCANNED;
            }
            if (message?.includes('senha') || message?.includes('password')) {
                return ERROR_MESSAGES.WEAK_PASSWORD;
            }
            return ERROR_MESSAGES.VALIDATION_ERROR;

        case 401: // Unauthorized
            if (message?.includes('credenciais') || message?.includes('credentials')) {
                return ERROR_MESSAGES.INVALID_CREDENTIALS;
            }
            return ERROR_MESSAGES.UNAUTHORIZED;

        case 403: // Forbidden
            return ERROR_MESSAGES.FORBIDDEN;

        case 404: // Not Found
            if (message?.includes('receipt') || message?.includes('recibo')) {
                return ERROR_MESSAGES.RECEIPT_NOT_FOUND;
            }
            if (message?.includes('category') || message?.includes('categoria')) {
                return ERROR_MESSAGES.CATEGORY_NOT_FOUND;
            }
            if (message?.includes('item')) {
                return ERROR_MESSAGES.ITEM_NOT_FOUND;
            }
            if (message?.includes('product') || message?.includes('produto')) {
                return ERROR_MESSAGES.PRODUCT_NOT_FOUND;
            }
            return 'Recurso não encontrado.';

        case 429: // Too Many Requests
            return ERROR_MESSAGES.TOO_MANY_REQUESTS;

        case 503: // Service Unavailable
            // Verifica se é erro de processamento de IA
            if (message?.includes('processando') || 
                message?.includes('processing') || 
                message?.includes('IA') ||
                message?.includes('AI') ||
                message?.includes('muitas notas') ||
                message?.includes('too many receipts') ||
                message?.includes('limite') ||
                message?.includes('limit')) {
                return ERROR_MESSAGES.AI_PROCESSING_LIMIT;
            }
            return ERROR_MESSAGES.SERVER_ERROR;

        case 500: // Internal Server Error
        case 502: // Bad Gateway
            return ERROR_MESSAGES.SERVER_ERROR;

        default:
            // Se há mensagem da API, usa ela (pode ser mais específica)
            if (message && typeof message === 'string') {
                return message;
            }
            return defaultMessage;
    }
};

/**
 * Extrai título do erro baseado no tipo
 * @param {Error} error - Erro retornado pela API
 * @returns {string} Título para o modal de erro
 */
export const getErrorTitle = (error) => {
    if (!error) return 'Erro';

    const status = error.response?.status;

    switch (status) {
        case 400:
            return 'Dados Inválidos';
        case 401:
            return 'Não Autorizado';
        case 403:
            return 'Acesso Negado';
        case 404:
            return 'Não Encontrado';
        case 429:
            return 'Muitas Requisições';
        case 503:
            return 'Serviço Indisponível';
        case 500:
        case 502:
            return 'Erro no Servidor';
        default:
            return 'Erro';
    }
};

/**
 * Verifica se o erro é de autenticação (requer login)
 * @param {Error} error - Erro retornado pela API
 * @returns {boolean} True se for erro de autenticação
 */
export const isAuthError = (error) => {
    return error?.response?.status === 401;
};

/**
 * Verifica se o erro é de rede (sem conexão)
 * @param {Error} error - Erro retornado pela API
 * @returns {boolean} True se for erro de rede
 */
export const isNetworkError = (error) => {
    return !error.response && (error.message === 'Network Error' || error.message === 'Network request failed');
};

/**
 * Retorna o ícone apropriado baseado no tipo de erro
 * @param {Error} error - Erro retornado pela API
 * @returns {string} Nome do ícone (Ionicons)
 */
export const getErrorIcon = (error) => {
    if (!error) return 'alert-circle';

    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error || error.message;

    // Erro de rede
    if (isNetworkError(error)) {
        return 'cloud-offline';
    }

    // Erro de processamento/IA/limite
    if (status === 503 || status === 429) {
        if (message?.includes('processando') || 
            message?.includes('processing') || 
            message?.includes('IA') ||
            message?.includes('AI') ||
            message?.includes('muitas notas') ||
            message?.includes('limite')) {
            return 'time'; // Ícone de relógio/aguardar
        }
        return 'server';
    }

    switch (status) {
        case 400:
            return 'warning';
        case 401:
            return 'lock-closed';
        case 403:
            return 'hand-left';
        case 404:
            return 'search';
        case 500:
        case 502:
            return 'construct'; // Ícone de manutenção
        default:
            return 'alert-circle';
    }
};

/**
 * Retorna a cor do ícone baseada no tipo de erro
 * @param {Error} error - Erro retornado pela API
 * @returns {string} Cor em hexadecimal
 */
export const getErrorIconColor = (error) => {
    if (!error) return '#ff6b6b';

    const status = error.response?.status;

    // Erro de rede
    if (isNetworkError(error)) {
        return '#4a90e2'; // Azul
    }

    // Erro de processamento/limite (não é tão grave, apenas aguardar)
    if (status === 503 || status === 429) {
        return '#f5a623'; // Laranja
    }

    switch (status) {
        case 400:
            return '#f5a623'; // Laranja - aviso
        case 401:
        case 403:
            return '#e74c3c'; // Vermelho - acesso negado
        case 404:
            return '#9b59b6'; // Roxo - não encontrado
        case 500:
        case 502:
            return '#e74c3c'; // Vermelho - erro crítico
        default:
            return '#ff6b6b'; // Vermelho padrão
    }
};
