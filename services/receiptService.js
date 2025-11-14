import api from './api';

/**
 * Serviço de Notas Fiscais (Receipts)
 */
export const ReceiptService = {
    /**
     * GET /receipts - Listar todos os recibos
     */
    getAllReceipts: async (token) => {
        return await api.apiRequest('/receipts', {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /receipts-basic - Listar recibos básicos (resposta 55% menor)
     */
    getBasicReceipts: async (token) => {
        return await api.apiRequest('/receipts-basic', {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /receipt/{id} - Buscar recibo por ID
     */
    getReceiptById: async (token, id) => {
        return await api.apiRequest(`/receipt/${id}`, {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /receipts/date/{date} - Buscar recibos por data específica
     * @param {string} date - Formato: YYYY-MM-DD
     */
    getReceiptsByDate: async (token, date) => {
        return await api.apiRequest(`/receipts/date/${date}`, {
            method: 'GET',
            token,
        });
    },

    /**
     * GET /receipts/period - Buscar recibos por período
     * @param {string} startDate - Data inicial (YYYY-MM-DD)
     * @param {string} endDate - Data final (YYYY-MM-DD)
     */
    getReceiptsByPeriod: async (token, startDate, endDate) => {
        return await api.apiRequest(`/receipts/period?start_date=${startDate}&end_date=${endDate}`, {
            method: 'GET',
            token,
        });
    },

    /**
     * POST /scan-qrcode/preview - Preview de NFC-e via QR Code (Etapa 1/2)
     * @param {string} qrCodeData - Dados do QR Code da nota fiscal
     */
    previewQRCode: async (token, qrCodeData) => {
        return await api.apiRequest('/scan-qrcode/preview', {
            method: 'POST',
            token,
            body: JSON.stringify({ qr_code_data: qrCodeData }),
        });
    },

    /**
     * POST /scan-qrcode/confirm - Confirmar e salvar NFC-e (Etapa 2/2)
     * @param {string} qrCodeData - Dados do QR Code
     * @param {object} receiptData - Dados do recibo para confirmar
     */
    confirmQRCode: async (token, qrCodeData, receiptData) => {
        return await api.apiRequest('/scan-qrcode/confirm', {
            method: 'POST',
            token,
            body: JSON.stringify({ 
                qr_code_data: qrCodeData,
                receipt_data: receiptData 
            }),
        });
    },

    /**
     * PATCH /receipts/{id} - Atualizar recibo existente
     * @param {string} token - Token de autenticação
     * @param {number} id - ID do recibo
     * @param {object} receiptData - Dados atualizados do recibo
     */
    updateReceipt: async (token, id, receiptData) => {
        return await api.apiRequest(`/receipts/${id}`, {
            method: 'PATCH',
            token,
            body: JSON.stringify(receiptData),
        });
    },
};
