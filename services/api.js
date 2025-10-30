// Configuração base da API
const API_BASE_URL = 'http://147.185.221.212:61489/api/v1';

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
        console.log('API Request:', url, fetchOptions.method || 'GET');
        
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        console.log('API Response Status:', response.status);
        
        // Tentar ler como texto primeiro para debug
        const textResponse = await response.text();
        console.log('API Response Text:', textResponse.substring(0, 200));
        
        // Tentar parsear como JSON
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('Erro ao parsear JSON:', textResponse);
            throw new Error('Servidor retornou resposta inválida. Verifique se a API está online.');
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || `Erro HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
};

export default { apiRequest, API_BASE_URL };
