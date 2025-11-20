import React, { createContext, useState, useContext } from 'react';
import { View } from 'react-native';
import { useAuth } from './AuthContext';
import useErrorModal from '../hooks/useErrorModal';
import httpClient from '../services/httpClient';
import { getErrorMessage, getErrorTitle } from '../utils/errorMessages';
import { useConnectivity } from '../hooks/useConnectivity';
import OfflineBanner from '../components/common/OfflineBanner';
import { CacheService } from '../services/cacheService';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { isConnected, isLoading: connectivityLoading } = useConnectivity();
    
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [dateList, setDateList] = useState([]);
    const [itemCountList, setItemCountList] = useState([]);
    const [storeNameList, setStoreNameList] = useState([]);
    const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
    const [categoriesCache, setCategoriesCache] = useState([]); // Cache para itemCount das categorias
    const [categories, setCategories] = useState([]); // Lista completa de categorias
    const { showError } = useErrorModal();

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
            showError(error, errorMessage);
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
            showError(error, errorMessage);
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

            // 💾 Salva no cache
            await CacheService.saveReceipts(receiptsData);

            return receiptsData;
        } catch (error) {
            // 📱 Se falhar, tenta carregar do cache
            if (!isConnected) {
                const cachedReceipts = await CacheService.loadReceipts();
                if (cachedReceipts.length > 0) {
                    const dateList = cachedReceipts.map(r => r.date);
                    const itemCountList = cachedReceipts.map(r => r.itemCount);
                    const storeNameList = cachedReceipts.map(r => r.storeName);
                    setDateList(dateList);
                    setItemCountList(itemCountList);
                    setStoreNameList(storeNameList);
                    setReceipts(cachedReceipts);
                    return cachedReceipts;
                }
            }
            
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar os recibos.');
            showError(error, errorMessage);
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
            showError(error, errorMessage);
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
            showError(error, errorMessage);
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
            showError(error, errorMessage);
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
                const formattedReceipt = {
                    ...receiptData,
                    storeName: receiptData.storeName || receiptData.store_name || 'Loja',
                    itemsCount: receiptData.items?.length || receiptData.itemsCount || 0,
                };
                
                // 💾 Salva detalhes completos no cache
                await CacheService.saveReceiptDetails(id, formattedReceipt);
                
                return formattedReceipt;
            }
            
            throw new Error('Receipt não encontrado');
        } catch (error) {
            // 📱 Se falhar e estiver offline, busca do cache local
            if (!isConnected) {
                // Tenta buscar detalhes completos salvos
                const cachedDetails = await CacheService.loadReceiptDetails(id);
                if (cachedDetails) {
                    return cachedDetails;
                }
                
                // Fallback: busca da lista básica
                const cachedReceipts = await CacheService.loadReceipts();
                const cachedReceipt = cachedReceipts.find(r => r.id === id);
                
                if (cachedReceipt) {
                    return {
                        ...cachedReceipt,
                        storeName: cachedReceipt.storeName || cachedReceipt.store_name || 'Loja',
                        itemsCount: cachedReceipt.items?.length || cachedReceipt.itemsCount || 0,
                    };
                }
            }
            
            const errorMessage = getErrorMessage(error, 'Não foi possível carregar os detalhes do recibo.');
            showError(error, errorMessage);
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
            // showError({ message: 'Recibo excluído com sucesso!', type: 'success' });
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível excluir o recibo.');
            showError(error, errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Atualiza um receipt existente - PATCH /receipts/:id
    const updateReceipt = async (id, receiptData) => {
        try {
            setLoading(true);
            const response = await httpClient.patch(`/receipts/${id}`, receiptData);
            
            // Atualiza a lista local se necessário
            setReceipts(prev => prev.map(r => r.id === id ? { ...r, ...receiptData } : r));
            
            return response;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível atualizar o recibo.');
            showError(error, errorMessage);
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
            
            // 💾 Salva dados do gráfico no cache (determina período baseado nas datas)
            const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
            let period = 'month';
            if (daysDiff <= 7) period = 'week';
            else if (daysDiff > 365) period = 'all';
            else if (daysDiff > 31) period = 'custom';
            
            await CacheService.saveGraphData(filteredCategories, period);
            
            return filteredCategories;
        } catch (error) {
            console.error('[DataContext] Erro ao carregar gráfico:', error.message);
            
            // 📱 Tenta carregar do cache (determina período para buscar cache correto)
            const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
            let period = 'month';
            if (daysDiff <= 7) period = 'week';
            else if (daysDiff > 365) period = 'all';
            else if (daysDiff > 31) period = 'custom';
            
            const cachedGraphData = await CacheService.loadGraphData(period);
            if (cachedGraphData.length > 0) {
                console.log(`[DataContext] ✅ Usando cache do gráfico (${period})`);
                setCategoriesCache(cachedGraphData);
                return cachedGraphData;
            }
            
            // Se não tem cache E não é erro de rede, pode mostrar alerta
            // Mas se é erro de rede, silencioso (usuário já vê banner offline)
            const isNetworkErr = !error.response && 
                (error.message === 'Network Error' || error.message === 'Falha ao conectar-se à rede' || error.message === 'Network request failed');
            
            if (!isNetworkErr) {
                console.warn('[DataContext] Sem cache disponível para o gráfico');
            }
            
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
            setCategories(categoriesData);
            
            // 💾 Salva no cache
            await CacheService.saveCategories(categoriesData);
            
            return categoriesData;
        } catch (error) {
            console.error('[DataContext] Erro ao carregar categorias:', error.message);
            
            // 📱 Tenta carregar do cache (offline OU erro na API)
            const cachedCategories = await CacheService.loadCategories();
            if (cachedCategories.length > 0) {
                console.log('[DataContext] ✅ Usando categorias do cache');
                setCategoriesCache(cachedCategories);
                setCategories(cachedCategories);
                return cachedCategories;
            }
            
            // Verifica se é erro de rede
            const isNetworkErr = !error.response && 
                (error.message === 'Network Error' || error.message === 'Falha ao conectar-se à rede');
            
            // Se não tem cache e NÃO é erro de rede, mostra erro
            // Se é erro de rede, usuário já vê o banner offline
            if (!isNetworkErr && isConnected) {
                const errorMessage = getErrorMessage(error, 'Não foi possível carregar as categorias.');
                showError(error, errorMessage);
            }
            
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
            
            // Prepara o resultado
            const result = {
                category: categoryData,
                items: response?.items || response?.data?.items || [],
                summary: response?.summary || response?.data?.summary || null,
                pagination: response?.pagination || response?.data?.pagination || null,
            };
            
            // 💾 Salva detalhes da categoria no cache
            await CacheService.saveCategoryDetails(id, result);
            
            return result;
        } catch (error) {
            console.error('[DataContext] Erro ao carregar detalhes da categoria:', error.message);
            
            // 📱 Tenta carregar do cache
            const cachedCategoryDetails = await CacheService.loadCategoryDetails(id);
            if (cachedCategoryDetails) {
                console.log(`[DataContext] ✅ Usando cache da categoria ${id}`);
                return cachedCategoryDetails;
            }
            
            // Verifica se é erro de rede
            const isNetworkErr = !error.response && 
                (error.message === 'Network Error' || error.message === 'Falha ao conectar-se à rede');
            
            // Se não tem cache e NÃO é erro de rede, mostra erro
            if (!isNetworkErr) {
                const errorMessage = getErrorMessage(error, 'Não foi possível carregar os detalhes da categoria.');
                Alert.alert(getErrorTitle(error), errorMessage);
            }
            
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
            
            // showError({ message: 'Categoria criada com sucesso!', type: 'success' });
            // Resposta esperada: { data: { id, name, description, icon, color }, message }
            return response?.data || response;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível criar a categoria.');
            showError(error, errorMessage);
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
            // showError({ message: 'Categoria excluída com sucesso!', type: 'success' });
            return response;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível excluir a categoria.');
            showError(error, errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Atualiza um item individual - PATCH /item/{id}
    // ⚡ SILENCIOSO: Não mostra alert, apenas atualiza no backend e estado local
    const updateItem = async (itemId, itemData) => {
        try {
            setLoading(true);
            const response = await httpClient.patch(`/item/${itemId}`, itemData);
            
            // ✅ Atualiza o item no estado local dos receipts E recalcula o total do receipt
            setReceipts(prev => prev.map(receipt => {
                const hasItem = receipt.items?.some(item => item.id === itemId);
                
                if (!hasItem) return receipt;
                
                // Atualiza o item
                const updatedItems = receipt.items.map(item => 
                    item.id === itemId 
                        ? { ...item, ...response.data, ...itemData } 
                        : item
                );
                
                // Recalcula o subtotal somando todos os itens não deletados
                const newSubtotal = updatedItems.reduce((sum, item) => 
                    sum + (item.deleted ? 0 : parseFloat(item.total || 0)), 0
                );
                
                // Calcula o total aplicando o desconto
                const discount = parseFloat(receipt.discount || 0);
                const newTotal = newSubtotal - discount;
                
                return {
                    ...receipt,
                    items: updatedItems,
                    subtotal: newSubtotal,
                    total: newTotal,
                    itemsCount: updatedItems.filter(i => !i.deleted).length,
                };
            }));
            
            return response.data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível atualizar o item.');
            showError(error, errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // 🗑️ Deleta um item - DELETE /item/{id}
    const deleteItem = async (itemId) => {
        try {
            setLoading(true);
            const response = await httpClient.delete(`/item/${itemId}`);
            
            // ✅ Remove o item do estado local dos receipts E recalcula totais
            setReceipts(prev => prev.map(receipt => {
                const hasItem = receipt.items?.some(item => item.id === itemId);
                
                if (!hasItem) return receipt;
                
                // Remove o item
                const updatedItems = receipt.items.filter(item => item.id !== itemId);
                
                // Recalcula o subtotal
                const newSubtotal = updatedItems.reduce((sum, item) => 
                    sum + parseFloat(item.total || 0), 0
                );
                
                // Calcula o total aplicando o desconto
                const discount = parseFloat(receipt.discount || 0);
                const newTotal = newSubtotal - discount;
                
                return {
                    ...receipt,
                    items: updatedItems,
                    subtotal: newSubtotal,
                    total: newTotal,
                    itemsCount: updatedItems.length,
                };
            }));
            
            return response.data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível deletar o item.');
            showError(error, errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Criar Nota Fiscal Manual - POST /receipt
    const createManualReceipt = async (receiptData) => {
        try {
            setLoading(true);
            const response = await httpClient.post('/receipt', receiptData);
            
            // Recarrega a lista de notas
            await fetchReceiptsBasic();
            
            return response.data;
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Não foi possível criar a nota fiscal.');
            Alert.alert(getErrorTitle(error), errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const clearPreview = () => setPreviewData(null);

    // 🚀 Carrega cache na inicialização (antes de tentar API)
    React.useEffect(() => {
        const loadCachedData = async () => {
            if (isAuthenticated && !isConnected) {
                // Offline: carrega do cache
                const cachedReceipts = await CacheService.loadReceipts();
                const cachedCategories = await CacheService.loadCategories();
                const cachedGraphData = await CacheService.loadGraphData();
                
                if (cachedReceipts.length > 0) {
                    const dateList = cachedReceipts.map(r => r.date);
                    const itemCountList = cachedReceipts.map(r => r.itemCount);
                    const storeNameList = cachedReceipts.map(r => r.storeName);
                    setDateList(dateList);
                    setItemCountList(itemCountList);
                    setStoreNameList(storeNameList);
                    setReceipts(cachedReceipts);
                }
                
                if (cachedCategories.length > 0) {
                    setCategoriesCache(cachedCategories);
                    setCategories(cachedCategories);
                }
            }
        };
        
        loadCachedData();
    }, [isAuthenticated, isConnected]);

    // Busca dados completos da conta após login (apenas se online)
    React.useEffect(() => {
        if (isAuthenticated && isConnected && !connectivityLoading) {
            fetchReceiptsBasic().catch(() => {});
            fetchCategories().catch(() => {});
        }
    }, [isAuthenticated, isConnected, connectivityLoading]);

    // Recarrega dados quando a conexão volta
    React.useEffect(() => {
        if (isConnected && !connectivityLoading && isAuthenticated) {
            // Limpa cache e busca dados atualizados da API
            fetchReceiptsBasic().catch(() => {});
            fetchCategories().catch(() => {});
        }
    }, [isConnected]);

    return (
        <DataContext.Provider
            value={{
                receipts,
                loading,
                previewData,
                isConnected,
                previewQRCode,
                confirmQRCode,
                fetchReceiptsBasic,
                fetchReceiptsFull,
                fetchReceiptsByDate,
                fetchReceiptsByPeriod,
                fetchReceiptById,
                fetchCategoriesGraph,
                fetchCategories,
                fetchCategoriesComplete,
                fetchCategoryById,
                createCategory,
                deleteCategory,
                updateItem,
                deleteItem,
                deleteReceipt,
                updateReceipt,
                createManualReceipt,
                clearPreview,
                dateList,
                itemCountList,
                storeNameList,
                isProcessingReceipt,
                setIsProcessingReceipt,
                categoriesCache,
                categories,
            }}
        >
            {/* 📡 Banner não invasivo de modo offline */}
            <OfflineBanner visible={!isConnected && !connectivityLoading && isAuthenticated} />
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

