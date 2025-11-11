import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';
import httpClient from '../services/httpClient';
import { getErrorMessage, getErrorTitle } from '../utils/errorMessages';

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
            const errorMessage = getErrorMessage(error, 'Não foi possível processar o QR Code. Verifique se o código é válido.');
            Alert.alert(getErrorTitle(error), errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Confirmar e Salvar Nota Fiscal - POST /scan-qrcode/confirm
    const confirmQRCode = async (dataToSave = null, onTimeout = null) => {
        try {
            setLoading(true);
            setIsProcessingReceipt(true);
            
            const finalData = dataToSave || previewData;
            
            if (!finalData) {
                setIsProcessingReceipt(false);
                throw new Error('Nenhum dado de preview disponível para confirmar');
            }

            const response = await httpClient.post('/scan-qrcode/confirm', finalData);
            
            setIsProcessingReceipt(false);
            setPreviewData(null);
            
            // Atualiza lista de recibos
            await fetchReceiptsBasic();
            
            return { timedOut: false, response };
        } catch (error) {
            setIsProcessingReceipt(false);
            const errorMessage = getErrorMessage(error, 'Não foi possível salvar o recibo. Tente novamente.');
            Alert.alert(getErrorTitle(error), errorMessage);
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
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar os recibos.');
            Alert.alert(getErrorTitle(error), errorMessage);
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
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar os recibos completos.');
            Alert.alert(getErrorTitle(error), errorMessage);
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
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar recibos desta data.');
            Alert.alert(getErrorTitle(error), errorMessage);
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
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar recibos deste período.');
            Alert.alert(getErrorTitle(error), errorMessage);
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
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar os detalhes do recibo.');
            Alert.alert(getErrorTitle(error), errorMessage);
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
            Alert.alert('Sucesso', 'Recibo excluído com sucesso!');
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível excluir o recibo.');
            Alert.alert(getErrorTitle(error), errorMessage);
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
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar dados do gráfico de categorias.');
            // Não mostra alert aqui, apenas retorna array vazio
            return [];
        } finally {
            setLoading(false);
        }
    };

    // ✅ Busca todas as categorias - GET /categories/summary (OTIMIZADO - 650x mais rápido!)
    // Backend já retorna apenas metadados + itemCount, sem array de items (5KB vs 5MB antes)
    const fetchCategoriesComplete = async () => {
        try {
            const response = await httpClient.get('/categories/summary');
            
            let categoriesData = [];
            // Backend retorna formato: { categories: [...], total: 23 }
            if (response?.categories && Array.isArray(response.categories)) {
                categoriesData = response.categories;
            } else if (response?.data?.categories && Array.isArray(response.data.categories)) {
                categoriesData = response.data.categories;
            } else if (Array.isArray(response)) {
                categoriesData = response;
            } else if (Array.isArray(response?.data)) {
                categoriesData = response.data;
            }
            
            // Backend já retorna otimizado: { id, name, description, icon, color, itemCount }
            // Não precisa mais remover items - backend já não envia!
            return categoriesData;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar as categorias.');
            // Não mostra alert aqui, retorna array vazio silenciosamente
            return [];
        }
    };

    // ⚡ Busca categorias OTIMIZADO - Usa apenas /categories/summary (50% mais rápido!)
    // Backend já retorna: name, description, icon, color, itemCount
    // Eliminada requisição duplicada ao /categories/graph (era 2 requests, agora é 1)
    const fetchCategories = async (startDate = null, endDate = null) => {
        try {
            setLoading(true);
            
            // ✅ Uma única requisição otimizada (com filtro de período opcional)
            let url = '/categories/summary';
            if (startDate && endDate) {
                url += `?start_date=${startDate}&end_date=${endDate}`;
            }
            
            const response = await httpClient.get(url);
            
            let categoriesData = [];
            // Backend retorna formato: { categories: [...], total: 23 }
            if (response?.categories && Array.isArray(response.categories)) {
                categoriesData = response.categories;
            } else if (response?.data?.categories && Array.isArray(response.data.categories)) {
                categoriesData = response.data.categories;
            } else if (Array.isArray(response)) {
                categoriesData = response;
            } else if (Array.isArray(response?.data)) {
                categoriesData = response.data;
            }
            
            // Armazena no cache para uso posterior
            setCategoriesCache(categoriesData);
            
            return categoriesData;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar as categorias.');
            Alert.alert(getErrorTitle(error), errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Busca itens de uma categoria específica - GET /category/{id}
    // Agora com suporte a filtros de período e paginação
    const fetchCategoryById = async (id, options = {}) => {
        try {
            setLoading(true);
            
            // Constrói URL com parâmetros opcionais
            let url = `/category/${id}`;
            const params = [];
            
            if (options.startDate && options.endDate) {
                params.push(`start_date=${options.startDate}`);
                params.push(`end_date=${options.endDate}`);
            }
            
            if (options.page) {
                params.push(`page=${options.page}`);
            }
            
            if (options.limit) {
                params.push(`limit=${options.limit}`);
            }
            
            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }
            
            const response = await httpClient.get(url);
            
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
            
            // Retorna também informações de paginação e summary do backend
            return {
                category: categoryData,
                items: response?.items || response?.data?.items || [],
                summary: response?.summary || response?.data?.summary || null,
                pagination: response?.pagination || response?.data?.pagination || null,
            };
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar os detalhes da categoria.');
            Alert.alert(getErrorTitle(error), errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cria uma nova categoria - POST /category
    const createCategory = async (categoryData) => {
        try {
            setLoading(true);
            const response = await httpClient.post('/category', categoryData);
            
            Alert.alert('Sucesso', 'Categoria criada com sucesso!');
            // Resposta esperada: { data: { id, name, description, icon, color }, message }
            return response?.data || response;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível criar a categoria.');
            Alert.alert(getErrorTitle(error), errorMessage);
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
            Alert.alert('Sucesso', 'Categoria excluída com sucesso!');
            return response;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível excluir a categoria.');
            Alert.alert(getErrorTitle(error), errorMessage);
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
            Alert.alert('Sucesso', 'Item atualizado com sucesso!');
            return response.data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível atualizar o item.');
            Alert.alert(getErrorTitle(error), errorMessage);
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

