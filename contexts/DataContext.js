import React, { createContext, useState, useContext } from 'react';
import httpClient from '../services/httpClient';
import * as FileSystem from 'expo-file-system';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null); // Para armazenar o preview antes de confirmar
    const [dateList, setDateList] = useState([]); // <-- novo estado exportável
    const [itemCountList, setItemCountList] = useState([]); // <-- novo estado exportável
    const [storeNameList, setStoreNameList] = useState([]); // <-- novo estado exportável
    const [isProcessingReceipt, setIsProcessingReceipt] = useState(false); // Notificação de processamento
    /**
     * PASSO 1: Preview da Nota Fiscal
     * Chama POST /scan-qrcode/preview
     * Retorna os dados da nota para o usuário revisar antes de salvar
     */
    const previewQRCode = async (qrCodeUrl) => {
        try {
            setLoading(true);
            console.log('[Data] Gerando preview do QR Code...');
            
            const response = await httpClient.post('/scan-qrcode/preview', {
                qrCodeUrl: qrCodeUrl  // Corrigido para camelCase conforme Swagger
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
     * Chama POST /scan-qrcode/confirm
     * IMPORTANTE: Envia APENAS o objeto 'data' do preview (SEM wrapper)
     * 
     * @param {Object} dataToSave - Dados do preview para salvar
     * @param {Function} onTimeout - Callback chamado se demorar mais de 5s
     * @returns {Promise} - Retorna { timedOut: boolean, response?: any }
     */
    const confirmQRCode = async (dataToSave = null, onTimeout = null) => {
        try {
            setLoading(true);
            console.log('[Data] Confirmando e salvando nota fiscal...');
            
            // Usa os dados fornecidos ou os dados do preview armazenado
            const finalData = dataToSave || previewData;
            
            if (!finalData) {
                throw new Error('Nenhum dado de preview disponível para confirmar');
            }

            // CRÍTICO: Enviar APENAS o objeto data (SEM wrapper { data: ... })
            // Conforme documentação: envie APENAS o campo 'data' do preview
            
            // Cria uma Promise de timeout de 5 segundos
            let timeoutReached = false;
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => {
                    timeoutReached = true;
                    if (onTimeout) {
                        console.log('[Data] Timeout de 5s atingido, processamento continua em background...');
                        setIsProcessingReceipt(true); // Ativa a notificação
                        onTimeout();
                    }
                    resolve({ timedOut: true });
                }, 5000);
            });

            // Faz a requisição
            const requestPromise = httpClient.post('/scan-qrcode/confirm', finalData)
                .then(response => {
                    if (!timeoutReached) {
                        console.log('[Data] Nota fiscal salva com sucesso!');
                        return { timedOut: false, response };
                    }
                    // Se já deu timeout, continua processando em background
                    console.log('[Data] Nota fiscal salva (após timeout)');
                    setIsProcessingReceipt(false); // Desativa a notificação
                    fetchReceiptsBasic(); // Atualiza lista em background
                    return { timedOut: true, response };
                });

            // Espera a primeira que resolver (timeout ou resposta)
            const result = await Promise.race([timeoutPromise, requestPromise]);

            // Se não deu timeout, limpa preview e recarrega lista
            if (!result.timedOut) {
                setPreviewData(null);
                await fetchReceiptsBasic();
            }
            
            return result;
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

            // Normaliza formatos diferentes que a API pode retornar
            // Possíveis formas observadas:
            //  - { receipts: [...] }
            //  - [...array de receipts...]
            //  - { data: { receipts: [...] } }
            console.log('[Data] Receipts response:', response);

            let receiptsData = [];
            if (!response) {
                receiptsData = [];
            } else if (Array.isArray(response)) {
                receiptsData = response;
            } else if (response.receipts && Array.isArray(response.receipts)) {
                receiptsData = response.receipts;
            } else if (response.data && Array.isArray(response.data)) {
                receiptsData = response.data;
            } else if (response.data && response.data.receipts && Array.isArray(response.data.receipts)) {
                receiptsData = response.data.receipts;
            } else {
                // Caso caída: tentar extrair qualquer array presente
                const possible = Object.values(response).find(v => Array.isArray(v));
                receiptsData = possible || [];
            }

            // Separa cada campo dos receipts em arrays individuais
            // Exemplo: currencyList, itemCountList, storeNameList, totalList, dateList, idList
            const currencyList = receiptsData.map(r => r.currency);
            const itemCountList = receiptsData.map(r => r.itemCount);
            const storeNameList = receiptsData.map(r => r.storeName);
            const totalList = receiptsData.map(r => r.total);
            const dateList = receiptsData.map(r => r.date);
            const idList = receiptsData.map(r => r.id);
            

            setDateList(dateList);
            setItemCountList(itemCountList);
            setStoreNameList(storeNameList);
            setReceipts(receiptsData);
            console.log(`[Data] ${receiptsData.length} receipts carregados (normalizado)`);

            return { response, receiptsData, currencyList, itemCountList, storeNameList, totalList, dateList, idList };
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
        } catch (error) {
            console.error('[Data] Erro ao buscar receipts completos:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Busca receipts por data específica
     * GET /receipts-basic/date/{date}
     * @param {string} date - Data no formato YYYY-MM-DD
     */
    const fetchReceiptsByDate = async (date) => {
        try {
            setLoading(true);
            console.log(`[Data] Buscando receipts da data ${date}...`);
            
            const response = await httpClient.get(`/receipts-basic/date/${date}`);
            
            let receiptsData = [];
            if (Array.isArray(response)) {
                receiptsData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                receiptsData = response.data;
            } else if (response && response.receipts && Array.isArray(response.receipts)) {
                receiptsData = response.receipts;
            }

            const dateList = receiptsData.map(r => r.date);
            const itemCountList = receiptsData.map(r => r.itemCount);
            const storeNameList = receiptsData.map(r => r.storeName);

            setDateList(dateList);
            setItemCountList(itemCountList);
            setStoreNameList(storeNameList);
            setReceipts(receiptsData);
            
            console.log(`[Data] ${receiptsData.length} receipts da data ${date} carregados`);
            return receiptsData;
        } catch (error) {
            console.error('[Data] Erro ao buscar receipts por data:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Busca receipts por período
     * GET /receipts-basic/period?startDate={start}&endDate={end}
     * @param {string} startDate - Data inicial no formato YYYY-MM-DD
     * @param {string} endDate - Data final no formato YYYY-MM-DD
     */
    const fetchReceiptsByPeriod = async (startDate, endDate) => {
        try {
            setLoading(true);
            console.log(`[Data] Buscando receipts do período ${startDate} a ${endDate}...`);
            
            const response = await httpClient.get(`/receipts-basic/period?startDate=${startDate}&endDate=${endDate}`);
            
            let receiptsData = [];
            if (Array.isArray(response)) {
                receiptsData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                receiptsData = response.data;
            } else if (response && response.receipts && Array.isArray(response.receipts)) {
                receiptsData = response.receipts;
            }

            const dateList = receiptsData.map(r => r.date);
            const itemCountList = receiptsData.map(r => r.itemCount);
            const storeNameList = receiptsData.map(r => r.storeName);

            setDateList(dateList);
            setItemCountList(itemCountList);
            setStoreNameList(storeNameList);
            setReceipts(receiptsData);
            
            console.log(`[Data] ${receiptsData.length} receipts do período carregados`);
            return receiptsData;
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
            
            console.log('[Data] Resposta do endpoint /receipt/:id:', JSON.stringify(response).substring(0, 500));
            
            // Tenta diferentes formatos de resposta
            let receiptData = null;
            
            if (response && response.receipt) {
                receiptData = response.receipt;
            } else if (response && response.data && response.data.receipt) {
                receiptData = response.data.receipt;
            } else if (response && typeof response === 'object' && response.id) {
                // A resposta já é o receipt diretamente
                receiptData = response;
            } else if (response && response.data && typeof response.data === 'object' && response.data.id) {
                receiptData = response.data;
            }
            
            if (receiptData) {
                console.log('[Data] Detalhes do receipt carregados:', {
                    id: receiptData.id,
                    storeName: receiptData.storeName,
                    itemsCount: receiptData.items?.length || receiptData.itemsCount
                });
                return receiptData;
            }
            
            console.error('[Data] Formato de resposta não reconhecido:', response);
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
                fetchReceiptsByDate,
                fetchReceiptsByPeriod,
                fetchReceiptById,
                deleteReceipt,
                clearPreview,
                dateList,
                itemCountList,
                storeNameList,
                isProcessingReceipt,
                setIsProcessingReceipt,
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


