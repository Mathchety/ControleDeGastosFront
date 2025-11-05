import React, { createContext, useState, useContext } from 'react';
import httpClient from '../services/httpClient';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [dateList, setDateList] = useState([]);
    const [itemCountList, setItemCountList] = useState([]);
    const [storeNameList, setStoreNameList] = useState([]);
    const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);

    // Preview da Nota Fiscal - POST /scan-qrcode/preview
    const previewQRCode = async (qrCodeUrl) => {
        try {
            setLoading(true);
            const response = await httpClient.post('/scan-qrcode/preview', {
                qrCodeUrl: qrCodeUrl
            });

            if (response && response.data) {
                setPreviewData(response.data);
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

    // Confirmar e Salvar Nota Fiscal - POST /scan-qrcode/confirm
    const confirmQRCode = async (dataToSave = null, onTimeout = null) => {
        try {
            setLoading(true);
            const finalData = dataToSave || previewData;
            
            if (!finalData) {
                throw new Error('Nenhum dado de preview disponível para confirmar');
            }

            let timeoutReached = false;
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => {
                    timeoutReached = true;
                    if (onTimeout) {
                        setIsProcessingReceipt(true);
                        onTimeout();
                    }
                    resolve({ timedOut: true });
                }, 5000);
            });

            const requestPromise = httpClient.post('/scan-qrcode/confirm', finalData)
                .then(response => {
                    if (!timeoutReached) {
                        return { timedOut: false, response };
                    }
                    setIsProcessingReceipt(false);
                    fetchReceiptsBasic();
                    return { timedOut: true, response };
                });

            const result = await Promise.race([timeoutPromise, requestPromise]);

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

    // Busca lista de receipts - GET /receipts-basic
    const fetchReceiptsBasic = async () => {
        try {
            setLoading(true);
            const response = await httpClient.get('/receipts-basic');

            let receiptsData = [];
            if (Array.isArray(response)) {
                receiptsData = response;
            } else if (response?.receipts && Array.isArray(response.receipts)) {
                receiptsData = response.receipts;
            } else if (response?.data && Array.isArray(response.data)) {
                receiptsData = response.data;
            } else if (response?.data?.receipts && Array.isArray(response.data.receipts)) {
                receiptsData = response.data.receipts;
            }

            const dateList = receiptsData.map(r => r.date);
            const itemCountList = receiptsData.map(r => r.itemCount);
            const storeNameList = receiptsData.map(r => r.storeName);

            setDateList(dateList);
            setItemCountList(itemCountList);
            setStoreNameList(storeNameList);
            setReceipts(receiptsData);

            return receiptsData;
        } catch (error) {
            console.error('[Data] Erro ao buscar receipts:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Busca lista completa de receipts - GET /receipts
    const fetchReceiptsFull = async () => {
        try {
            setLoading(true);
            const response = await httpClient.get('/receipts');
            
            if (response?.receipts) {
                setReceipts(response.receipts);
            }
        } catch (error) {
            console.error('[Data] Erro ao buscar receipts completos:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Busca receipts por data - GET /receipts-basic/date/{date}
    const fetchReceiptsByDate = async (date) => {
        try {
            setLoading(true);
            const response = await httpClient.get(`/receipts-basic/date/${date}`);
            
            let receiptsData = [];
            if (Array.isArray(response)) {
                receiptsData = response;
            } else if (response?.data && Array.isArray(response.data)) {
                receiptsData = response.data;
            } else if (response?.receipts && Array.isArray(response.receipts)) {
                receiptsData = response.receipts;
            }

            setDateList(receiptsData.map(r => r.date));
            setItemCountList(receiptsData.map(r => r.itemCount));
            setStoreNameList(receiptsData.map(r => r.storeName));
            setReceipts(receiptsData);
            
            return receiptsData;
        } catch (error) {
            console.error('[Data] Erro ao buscar receipts por data:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Busca receipts por período - GET /receipts-basic/period
    const fetchReceiptsByPeriod = async (startDate, endDate) => {
        try {
            setLoading(true);
            const response = await httpClient.get(`/receipts-basic/period?start_date=${startDate}&end_date=${endDate}`);
            
            let receiptsData = [];
            if (Array.isArray(response)) {
                receiptsData = response;
            } else if (response?.data && Array.isArray(response.data)) {
                receiptsData = response.data;
            } else if (response?.receipts && Array.isArray(response.receipts)) {
                receiptsData = response.receipts;
            }

            setDateList(receiptsData.map(r => r.date));
            setItemCountList(receiptsData.map(r => r.itemCount));
            setStoreNameList(receiptsData.map(r => r.storeName));
            setReceipts(receiptsData);
            
            return receiptsData;
        } catch (error) {
            console.error('[Data] Erro ao buscar receipts por período:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Busca detalhes de um receipt - GET /receipt/:id
    const fetchReceiptById = async (id) => {
        try {
            setLoading(true);
            const response = await httpClient.get(`/receipt/${id}`);
            
            let receiptData = null;
            
            if (response?.receipt) {
                receiptData = response.receipt;
            } else if (response?.data?.receipt) {
                receiptData = response.data.receipt;
            } else if (response?.id) {
                receiptData = response;
            } else if (response?.data?.id) {
                receiptData = response.data;
            } else if (Array.isArray(response) && response.length > 0) {
                receiptData = response[0];
            } else if (Array.isArray(response?.data) && response.data.length > 0) {
                receiptData = response.data[0];
            }
            
            if (receiptData) {
                return {
                    ...receiptData,
                    storeName: receiptData.storeName || receiptData.store_name || 'Loja',
                    itemsCount: receiptData.items?.length || receiptData.itemsCount || 0,
                };
            }
            
            throw new Error('Receipt não encontrado');
        } catch (error) {
            console.error('[Data] Erro ao buscar receipt:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Deleta um receipt - DELETE /receipt/:id
    const deleteReceipt = async (id) => {
        try {
            setLoading(true);
            await httpClient.delete(`/receipt/${id}`);
            setReceipts(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('[Data] Erro ao deletar receipt:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const clearPreview = () => setPreviewData(null);

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

