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
    const [categoriesCache, setCategoriesCache] = useState([]); // Cache para itemCount das categorias

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
            // Mostra notificação IMEDIATAMENTE ao salvar
            setIsProcessingReceipt(true);
            
            const finalData = dataToSave || previewData;
            
            if (!finalData) {
                setIsProcessingReceipt(false);
                throw new Error('Nenhum dado de preview disponível para confirmar');
            }

            // Faz a requisição
            const response = await httpClient.post('/scan-qrcode/confirm', finalData);
            
            // Quando a API retornar, esconde notificação e atualiza dados
            console.log('[Data] ✅ API retornou! Escondendo notificação e atualizando dados...');
            setIsProcessingReceipt(false);
            setPreviewData(null);
            
            // Força refresh dos receipts
            await fetchReceiptsBasic();
            
            return { timedOut: false, response };
        } catch (error) {
            console.error('[Data] Erro ao confirmar nota:', error);
            setIsProcessingReceipt(false);
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

    // Busca dados de categorias para gráfico - GET /categories/graph
    const fetchCategoriesGraph = async (startDate, endDate) => {
        try {
            setLoading(true);
            
            // Formata as datas para YYYY-MM-DD
            const formatDate = (date) => {
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const start = formatDate(startDate);
            const end = formatDate(endDate);

            const response = await httpClient.get(`/categories/graph?start_date=${start}&end_date=${end}`);
            
            // Normaliza a resposta
            let categoriesData = [];
            if (response?.categories && Array.isArray(response.categories)) {
                categoriesData = response.categories;
            } else if (response?.data?.categories && Array.isArray(response.data.categories)) {
                categoriesData = response.data.categories;
            } else if (Array.isArray(response)) {
                categoriesData = response;
            } else if (Array.isArray(response?.data)) {
                categoriesData = response.data;
            }

            // Filtra categorias com total > 0
            const filteredCategories = categoriesData.filter(cat => cat.total > 0);
            
            // Armazena no cache para uso na tela de Categorias
            setCategoriesCache(categoriesData); // Armazena todas, não só as filtradas
            
            return filteredCategories;
        } catch (error) {
            console.error('[Data] Erro ao buscar dados do gráfico de categorias:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Busca todas as categorias completas - GET /categories
    const fetchCategoriesComplete = async () => {
        try {
            const response = await httpClient.get('/categories');
            
            let categoriesData = [];
            if (response?.categories && Array.isArray(response.categories)) {
                categoriesData = response.categories;
            } else if (response?.data?.categories && Array.isArray(response.data.categories)) {
                categoriesData = response.data.categories;
            } else if (Array.isArray(response)) {
                categoriesData = response;
            } else if (Array.isArray(response?.data)) {
                categoriesData = response.data;
            }
            
            return categoriesData;
        } catch (error) {
            console.error('[Data] Erro ao buscar categorias completas:', error);
            return [];
        }
    };

    // Busca categorias com dados resumidos e itemCount - GET /categories/graph
    const fetchCategories = async () => {
        try {
            setLoading(true);
            
            // Busca dados do graph (com itemCount e total)
            const graphResponse = await httpClient.get('/categories/graph');
            let graphData = [];
            if (Array.isArray(graphResponse)) {
                graphData = graphResponse;
            } else if (Array.isArray(graphResponse?.data)) {
                graphData = graphResponse.data;
            }
            
            console.log('[Data] 📊 Dados do /categories/graph:', graphData.length, 'categorias');
            setCategoriesCache(graphData); // Armazena no cache
            
            // Busca dados completos (com description, color, icon)
            const completeData = await fetchCategoriesComplete();
            console.log('[Data] � Dados completos do /categories:', completeData.length, 'categorias');
            
            // Combina os dois: dados completos + itemCount do graph
            const categoriesData = completeData.map(cat => {
                const graphInfo = graphData.find(g => g.id === cat.id);
                return {
                    ...cat,
                    itemCount: graphInfo?.itemCount || 0,
                    total: graphInfo?.total || 0,
                };
            });
            
            console.log('[Data] ✅ Categorias combinadas:', categoriesData.length);
            console.log('[Data] 📋 Primeira categoria:', categoriesData[0]);
            
            return categoriesData;
        } catch (error) {
            console.error('[Data] Erro ao buscar categorias:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Busca itens de uma categoria específica - GET /category/{id}
    const fetchCategoryById = async (id) => {
        try {
            setLoading(true);
            const response = await httpClient.get(`/category/${id}`);
            
            let categoryData = null;
            if (response?.category) {
                categoryData = response.category;
            } else if (response?.data?.category) {
                categoryData = response.data.category;
            } else if (response?.id) {
                categoryData = response;
            } else if (response?.data?.id) {
                categoryData = response.data;
            }
            
            return categoryData;
        } catch (error) {
            console.error('[Data] Erro ao buscar categoria:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cria uma nova categoria - POST /category
    // Endpoint salvo, aguardando implementação
    // Body: { name: string (required), description?: string, icon?: string, color?: string }
    const createCategory = async (categoryData) => {
        try {
            setLoading(true);
            const response = await httpClient.post('/category', categoryData);
            
            // Resposta esperada: { data: { id, name, description, icon, color }, message }
            return response?.data || response;
        } catch (error) {
            console.error('[Data] Erro ao criar categoria:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Deleta uma categoria - DELETE /category/{id}
    // Move todos os itens para "Não categorizado"
    const deleteCategory = async (id) => {
        try {
            setLoading(true);
            const response = await httpClient.delete(`/category/${id}`);
            return response;
        } catch (error) {
            console.error('[Data] Erro ao deletar categoria:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Atualiza um item - PATCH /item/{id}
    const updateItem = async (itemId, itemData) => {
        try {
            setLoading(true);
            const response = await httpClient.patch(`/item/${itemId}`, itemData);
            return response.data;
        } catch (error) {
            console.error('[Data] Erro ao atualizar item:', error);
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
                fetchCategoriesGraph,
                fetchCategories,
                fetchCategoryById,
                createCategory,
                deleteCategory,
                updateItem,
                deleteReceipt,
                clearPreview,
                dateList,
                itemCountList,
                storeNameList,
                isProcessingReceipt,
                setIsProcessingReceipt,
                categoriesCache,
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

