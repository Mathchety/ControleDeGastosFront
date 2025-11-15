import React, { useEffect, useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ActivityIndicator, 
    ScrollView, 
    Platform,
    StatusBar,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { ConfirmButton } from '../components/buttons';
import { PreviewHeader, ReceiptSummaryCard, EditableReceiptItemCard } from '../components/cards';
import { SkeletonPreviewScreen, ErrorMessage } from '../components/common';
import { useRequestThrottle } from '../hooks/useScreenFade';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function PreViewScreen({ route, navigation }) {
    const { qrLink, previewData: receivedData, receiptId } = route.params || {};
    const { previewQRCode, confirmQRCode, fetchReceiptById, updateReceipt, updateItem, categories, loading, fetchCategories } = useData();
    const [errorState, setErrorState] = useState({ visible: false, title: '', message: '' });
    const [previewData, setPreviewData] = useState(receivedData || null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [isOpening, setIsOpening] = useState(false); // ⚡ Previne múltiplos cliques
    const [isInitializing, setIsInitializing] = useState(!receivedData); // ✨ Mostra skeleton na inicialização
    
    // Animação do header ao rolar
    const scrollY = useRef(new Animated.Value(0)).current;
    const HEADER_HEIGHT = Platform.OS === 'ios' ? moderateScale(80) : moderateScale(110);
    const HEADER_SCROLL_DISTANCE = Platform.OS === 'ios' ? moderateScale(50) : moderateScale(45);
    
    // ✨ Throttle para prevenir sobrecarga de requisições
    const { getDelay } = useRequestThrottle('PreViewScreen');

    // ✅ Carrega categorias assim que a tela abre (se não tiver carregado ainda)
    useEffect(() => {
        const loadCategoriesIfNeeded = async () => {
            if (!categories || categories.length === 0) {
                try {
                    await fetchCategories(); // ✅ Usa fetchCategories que atualiza o estado
                } catch (error) {
                    console.error('Erro ao carregar categorias:', error);
                }
            }
        };
        loadCategoriesIfNeeded();
    }, []);

    useEffect(() => {
        // MODO 1: Se recebeu ID de uma nota já salva, busca pelo endpoint
        if (receiptId) {
            setIsReadOnly(false); // AGORA PERMITE EDIÇÃO mesmo do histórico
            loadReceiptById();
            return;
        }
        
        // MODO 2: Se já recebeu os dados do ScanScreen, não precisa chamar previewQRCode de novo
        if (receivedData) {
            setIsReadOnly(false); // Modo edição, pode salvar
            // ✨ Pequeno delay para mostrar transição suave
            setTimeout(() => setIsInitializing(false), 300);
            return;
        }
        
        // MODO 3: Se não recebeu, carrega usando o qrLink (modo antigo)
        if (qrLink) {
            setIsReadOnly(false);
            loadPreview();
        }
    }, [qrLink, receivedData, receiptId]);

    const loadReceiptById = async () => {
        // ⚡ Previne múltiplas chamadas se já está carregando
        if (isOpening) return;
        
        try {
            setIsOpening(true);
            
            // ✨ Adiciona delay progressivo se usuário abriu a tela múltiplas vezes
            const delay = getDelay();
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            const data = await fetchReceiptById(receiptId);
            setPreviewData(data);
        } catch (error) {
            setErrorState({
                visible: true,
                title: 'Erro ao Carregar',
                message: error.message || 'Não foi possível carregar os dados da nota fiscal.'
            });
            navigation.goBack();
        } finally {
            setIsOpening(false);
            setIsInitializing(false); // ✨ Finaliza inicialização
        }
    };

    const loadPreview = async () => {
        try {
            const data = await previewQRCode(qrLink);
            setPreviewData(data);
        } catch (error) {
            setErrorState({
                visible: true,
                title: 'Erro ao Carregar',
                message: error.message || 'Não foi possível carregar os dados da nota fiscal.'
            });
            navigation.goBack();
        } finally {
            setIsInitializing(false); // ✨ Finaliza inicialização
        }
    };

    const handleUpdateItem = async (updatedItem, itemIndex) => {
        try {
            // 🔍 MODO 1: Item tem ID (já existe no backend) → Atualiza via API
            if (updatedItem.id && receiptId) {
                // Prepara apenas os campos que podem ser atualizados
                const itemData = {};
                if (updatedItem.categoryId !== undefined) itemData.categoryId = updatedItem.categoryId;
                if (updatedItem.quantity !== undefined) itemData.quantity = parseFloat(updatedItem.quantity);
                if (updatedItem.total !== undefined) itemData.total = parseFloat(updatedItem.total);
                if (updatedItem.unitPrice !== undefined) itemData.unitPrice = parseFloat(updatedItem.unitPrice);
                
                // ⚡ Atualiza no backend
                await updateItem(updatedItem.id, itemData);
                
                // ✅ API confirmou - Recarrega nota fiscal completa
                const updatedReceipt = await fetchReceiptById(receiptId);
                setPreviewData(updatedReceipt);
                
                return;
            }
            
            // 🔍 MODO 2: Modo SCAN (sem ID) → Apenas atualiza estado local em RAM
            // Dados serão enviados quando usuário clicar em "Confirmar Nota"
            setPreviewData(prev => {
                if (!prev || !prev.items) return prev;
                
                const updatedItems = prev.items.map((item, index) => 
                    index === itemIndex ? { ...item, ...updatedItem } : item
                );
                
                // Recalcula totais localmente
                const newSubtotal = updatedItems.reduce((sum, item) => 
                    sum + parseFloat(item.total || 0), 0
                );
                const newTotal = newSubtotal - parseFloat(prev.discount || 0);
                
                return {
                    ...prev,
                    items: updatedItems,
                    subtotal: newSubtotal,
                    total: newTotal,
                    itemsCount: updatedItems.length,
                };
            });
            
        } catch (error) {
            // ❌ API falhou
            setErrorState({
                visible: true,
                title: 'Erro ao Atualizar',
                message: error.message || 'Não foi possível atualizar o item.'
            });
        }
    };

    const handleDeleteItem = (itemIndex) => {
        Alert.alert(
            'Excluir Item',
            'Tem certeza que deseja excluir este item?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => {
                        setPreviewData(prev => {
                            if (!prev || !prev.items) {
                                return prev;
                            }
                            
                            const updatedItems = prev.items.map((item, index) => 
                                index === itemIndex ? { ...item, deleted: true } : item
                            );
                            
                            // Recalcula totais
                            const newSubtotal = updatedItems.reduce((sum, item) => 
                                sum + (item.deleted ? 0 : parseFloat(item.total || 0)), 0
                            );
                            const newTotal = newSubtotal - parseFloat(prev.discount || 0);
                            
                            return {
                                ...prev,
                                items: updatedItems,
                                subtotal: newSubtotal,
                                total: newTotal,
                                itemsCount: updatedItems.filter(i => !i.deleted).length,
                            };
                        });
                    }
                }
            ]
        );
    };

    const handleConfirmNewReceipt = async () => {
        try {
            // 🔍 MODO SCAN: Confirma e salva nova nota com todas as modificações feitas em RAM
            // O previewData contém todos os items com as edições do usuário
            
            // Limpa a stack e navega para Home (não aguarda a resposta da API)
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'Main', params: { screen: 'Home' } }
                ],
            });

            // Inicia o salvamento em background com os dados modificados
            // Envia previewData que contém os items editados pelo usuário
            await confirmQRCode(previewData);
            
        } catch (error) {
            setErrorState({
                visible: true,
                title: 'Erro ao Salvar',
                message: error.message || 'Não foi possível salvar a nota fiscal.'
            });
        }
    };

    // ✨ Mostra skeleton durante loading OU inicialização
    if (loading || isInitializing) {
        return (
            <View style={styles.safeArea}>
                <StatusBar 
                    barStyle="light-content" 
                    backgroundColor="transparent" 
                    translucent={true}
                />
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.headerGradient}
                >
                    <PreviewHeader
                        title={receiptId ? 'Nota fiscal' : 'Preview da nota'}
                        onBack={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                navigation.navigate('Main', { screen: 'Home' });
                            }
                        }}
                    />
                </LinearGradient>
                <SkeletonPreviewScreen />
            </View>
        );
    }

    if (!previewData) {
        return (
            <View style={styles.safeArea}>
                <StatusBar 
                    barStyle="light-content" 
                    backgroundColor="transparent" 
                    translucent={true}
                />
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.headerGradient}
                >
                    <PreviewHeader
                        title={receiptId ? 'Nota fiscal' : 'Preview da nota'}
                        onBack={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                navigation.navigate('Main', { screen: 'Home' });
                            }
                        }}
                    />
                </LinearGradient>
                <View style={styles.container}>
                    <Text style={styles.errorText}>Nenhum dado disponível</Text>
                </View>
            </View>
        );
    }

    // Animações do header ao rolar
    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -HEADER_SCROLL_DISTANCE],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE * 0.6, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0.5, 0],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.safeArea}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="transparent" 
                translucent={true}
            />
            
            <Animated.View
                style={[
                    styles.headerAnimatedContainer,
                    {
                        height: HEADER_HEIGHT,
                        transform: [{ translateY: headerTranslateY }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.headerGradient}
                />
                <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
                    <PreviewHeader
                        title={receiptId ? 'Nota fiscal' : 'Preview da nota'}
                        onBack={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                navigation.navigate('Main', { screen: 'Home' });
                            }
                        }}
                    />
                </Animated.View>
            </Animated.View>
            
            <View style={styles.container}>

                <Animated.ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: HEADER_HEIGHT },
                    ]}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                >
                    <ReceiptSummaryCard 
                        storeName={previewData.storeName}
                        subtotal={previewData.subtotal}
                        discount={previewData.discount}
                        total={previewData.total}
                    />

                    {/* Cabeçalho dos itens */}
                    <View style={styles.itemsHeader}>
                        <Text style={styles.sectionTitle}>Itens ({previewData.itemsCount || 0})</Text>
                    </View>
                    
                    {previewData.items && previewData.items.length > 0 ? (
                        previewData.items.map((item, index) => (
                            <EditableReceiptItemCard 
                                key={index}
                                item={item}
                                itemIndex={index}
                                onUpdate={handleUpdateItem}
                                onDelete={handleDeleteItem}
                                readOnly={false}
                                categories={categories || []}
                                {...(!receiptId ? { hideCategory: true } : {})}
                            />
                        ))
                    ) : (
                        <Text style={styles.noItemsText}>Nenhum item encontrado</Text>
                    )}
                </Animated.ScrollView>

                {/* Botão confirmar - Só mostra para novas notas (modo scan) */}
                {!receiptId && (
                    <View style={styles.fixedButtonContainer}>
                        <ConfirmButton 
                            onPress={handleConfirmNewReceipt}
                        />
                    </View>
                )}
            </View>

            {/* Modal de Erro/Sucesso */}
            <ErrorMessage
                visible={errorState.visible}
                title={errorState.title}
                message={errorState.message}
                type={errorState.type}
                onClose={() => setErrorState({ ...errorState, visible: false })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerAnimatedContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        overflow: 'hidden',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderBottomLeftRadius: theme.radius.xl,
        borderBottomRightRadius: theme.radius.xl,
    },
    headerContent: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: Platform.OS === 'ios' ? moderateScale(15) : StatusBar.currentHeight + moderateScale(5),
        paddingBottom: moderateScale(5),
        zIndex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Espaço extra para o botão fixo
    },
    fullLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    fullLoadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
    },
    itemsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    noItemsText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginTop: 20,
    },
    fixedButtonContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'android' ? 20 : 15,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
});
