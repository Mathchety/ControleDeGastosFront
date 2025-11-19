import { getApiBaseUrl } from '../config/apiConfig';

// Configuração base da API (dinâmica por ambiente)
const API_BASE_URL = getApiBaseUrl();

// Helper para fazer requisições
const apiRequest = async (endpoint, options = {}) => {
    const { token, ...fetchOptions } = options;
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...fetchOptions.headers,
    };

    try {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });
        
        // Tentar ler como texto primeiro
        const textResponse = await response.text();
        
        // Tentar parsear como JSON
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            throw new Error('Servidor retornou resposta inválida. Verifique se a API está online.');
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || `Erro HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export default { apiRequest, API_BASE_URL };
