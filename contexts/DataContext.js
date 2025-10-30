import React, { createContext, useState, useContext } from 'react';
import httpClient from '../services/httpClient';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null); // Para armazenar o preview antes de confirmar

    /**
     * PASSO 1: Preview da Nota Fiscal
     * Chama POST /receipts/qr-code/preview
     * Retorna os dados da nota para o usuário revisar antes de salvar
     */
    const previewQRCode = async (qrCodeUrl) => {
        try {
            setLoading(true);
            console.log('[Data] Gerando preview do QR Code...');
            
            const response = await httpClient.post('/receipts/qr-code/preview', {
                qr_code_url: qrCodeUrl
            });

            if (response && response.data) {
                // Armazena o preview no estado para usar no passo 2
                setPreviewData(response.data);
                console.log('[Data] Preview gerado com sucesso');
                return response.data;
            } else {
                throw new Error('Preview não contém dados');
            }
        } catch (error) {
            console.error('[Data] Erro ao gerar preview:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * PASSO 2: Confirmar e Salvar a Nota Fiscal
     * Chama POST /receipts/qr-code/confirm
     * IMPORTANTE: Envia APENAS o objeto 'data' do preview
     */
    const confirmQRCode = async (dataToSave = null) => {
        try {
            setLoading(true);
            console.log('[Data] Confirmando e salvando nota fiscal...');
            
            // Usa os dados fornecidos ou os dados do preview armazenado
            const finalData = dataToSave || previewData;
            
            if (!finalData) {
                throw new Error('Nenhum dado de preview disponível para confirmar');
            }

            // CRÍTICO: Enviar APENAS o campo 'data' conforme documentação
            const response = await httpClient.post('/receipts/qr-code/confirm', {
                data: finalData
            });

            console.log('[Data] Nota fiscal salva com sucesso!');
            
            // Limpa o preview após salvar
            setPreviewData(null);
            
            // Recarrega a lista de receipts
            await fetchReceiptsBasic();
            
            return response;
        } catch (error) {
            console.error('[Data] Erro ao confirmar nota:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Busca lista BÁSICA de receipts (otimizada para dashboard)
     * GET /receipts-basic
     */
    const fetchReceiptsBasic = async () => {
        try {
            setLoading(true);
            console.log('[Data] Buscando lista de receipts (básico)...');
            
            const response = await httpClient.get('/receipts-basic');
            
            if (response && response.receipts) {
                setReceipts(response.receipts);
                console.log(`[Data] ${response.receipts.length} receipts carregados`);
            }
            
            return response;
        } catch (error) {
            console.error('[Data] Erro ao buscar receipts básicos:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Busca lista COMPLETA de receipts (com todos os itens)
     * GET /receipts
     * Use apenas quando precisar de todos os detalhes (ex: relatórios)
     */
    const fetchReceiptsFull = async () => {
        try {
            setLoading(true);
            console.log('[Data] Buscando lista completa de receipts...');
            
            const response = await httpClient.get('/receipts');
            
            if (response && response.receipts) {
                setReceipts(response.receipts);
                console.log(`[Data] ${response.receipts.length} receipts completos carregados`);
            }
            
            return response;
        } catch (error) {
            console.error('[Data] Erro ao buscar receipts completos:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Busca receipts por período
     * GET /receipts-basic/period?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
     */
    const fetchReceiptsByPeriod = async (startDate, endDate, fullData = false) => {
        try {
            setLoading(true);
            const endpoint = fullData ? '/receipts/period' : '/receipts-basic/period';
            const params = `?start_date=${startDate}&end_date=${endDate}`;
            
            console.log(`[Data] Buscando receipts por período: ${startDate} a ${endDate}`);
            
            const response = await httpClient.get(endpoint + params);
            
            if (response && response.receipts) {
                console.log(`[Data] ${response.receipts.length} receipts encontrados no período`);
                return response.receipts;
            }
            
            return [];
        } catch (error) {
            console.error('[Data] Erro ao buscar receipts por período:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Busca detalhes completos de um receipt específico
     * GET /receipt/:id
     */
    const fetchReceiptById = async (id) => {
        try {
            setLoading(true);
            console.log(`[Data] Buscando detalhes do receipt ${id}...`);
            
            const response = await httpClient.get(`/receipt/${id}`);
            
            if (response && response.receipt) {
                console.log('[Data] Detalhes do receipt carregados');
                return response.receipt;
            }
            
            throw new Error('Receipt não encontrado');
        } catch (error) {
            console.error('[Data] Erro ao buscar receipt:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Deleta um receipt
     * DELETE /receipt/:id
     */
    const deleteReceipt = async (id) => {
        try {
            setLoading(true);
            console.log(`[Data] Deletando receipt ${id}...`);
            
            await httpClient.delete(`/receipt/${id}`);
            
            // Atualiza a lista removendo o receipt deletado
            setReceipts(prev => prev.filter(r => r.id !== id));
            
            console.log('[Data] Receipt deletado com sucesso');
        } catch (error) {
            console.error('[Data] Erro ao deletar receipt:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Limpa o preview armazenado
     */
    const clearPreview = () => {
        setPreviewData(null);
    };

    return (
        <DataContext.Provider
            value={{
                receipts,
                loading,
                previewData,
                previewQRCode,
                confirmQRCode,
                fetchReceiptsBasic,
                fetchReceiptsFull,
                fetchReceiptsByPeriod,
                fetchReceiptById,
                deleteReceipt,
                clearPreview,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};
