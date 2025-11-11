import React, { useEffect, useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ActivityIndicator, 
    Alert, 
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
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function PreViewScreen({ route, navigation }) {
    const { qrLink, previewData: receivedData, receiptId } = route.params || {};
    const { previewQRCode, confirmQRCode, fetchReceiptById, loading } = useData();
    const [previewData, setPreviewData] = useState(receivedData || null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    
    // Animação do header ao rolar
    const scrollY = useRef(new Animated.Value(0)).current;
    const HEADER_HEIGHT = Platform.OS === 'ios' ? moderateScale(80) : moderateScale(110);
    const HEADER_SCROLL_DISTANCE = Platform.OS === 'ios' ? moderateScale(50) : moderateScale(45);

    useEffect(() => {
        // MODO 1: Se recebeu ID de uma nota já salva, busca pelo endpoint
        if (receiptId) {
            console.log('[Preview] Carregando receipt por ID:', receiptId);
            setIsReadOnly(false); // AGORA PERMITE EDIÇÃO mesmo do histórico
            loadReceiptById();
            return;
        }
        
        // MODO 2: Se já recebeu os dados do ScanScreen, não precisa chamar previewQRCode de novo
        if (receivedData) {
            console.log('[Preview] Dados recebidos do ScanScreen:', receivedData);
            setIsReadOnly(false); // Modo edição, pode salvar
            return;
        }
        
        // MODO 3: Se não recebeu, carrega usando o qrLink (modo antigo)
        if (qrLink) {
            setIsReadOnly(false);
            loadPreview();
        }
    }, [qrLink, receivedData, receiptId]);

    const loadReceiptById = async () => {
        try {
            console.log('[Preview] ========== CARREGANDO RECEIPT ==========');
            console.log('[Preview] Receipt ID:', receiptId);
            const data = await fetchReceiptById(receiptId);
            console.log('[Preview] ========== DADOS RECEBIDOS ==========');
            console.log('[Preview] Data completo:', JSON.stringify(data, null, 2));
            console.log('[Preview] Store Name:', data.storeName);
            console.log('[Preview] Items:', data.items?.length);
            console.log('[Preview] First Item Product:', data.items?.[0]?.product);
            setPreviewData(data);
        } catch (error) {
            console.error('[Preview] ❌ Erro ao carregar receipt:', error);
            console.error('[Preview] Stack trace:', error.stack);
            Alert.alert(
                'Erro',
                `Não foi possível carregar os dados da nota fiscal.\n\nDetalhes: ${error.message}`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        }
    };

    const loadPreview = async () => {
        try {
            console.log('[Preview] Carregando preview com link:', qrLink);
            const data = await previewQRCode(qrLink);
            setPreviewData(data);
            console.log('[Preview] Dados recebidos:', data);
        } catch (error) {
            console.error('[Preview] Erro ao carregar preview:', error);
            Alert.alert(
                'Erro',
                'Não foi possível carregar os dados da nota fiscal.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        }
    };

    const handleUpdateItem = (updatedItem, itemIndex) => {
        console.log('[Preview] 📝 handleUpdateItem chamado:', {
            itemIndex,
            updatedItem: {
                quantity: updatedItem.quantity,
                total: updatedItem.total,
                unitPrice: updatedItem.unitPrice
            }
        });
        
        setPreviewData(prev => {
            if (!prev || !prev.items) {
                console.log('[Preview] ❌ Dados inválidos em previewData');
                return prev;
            }
            
            const updatedItems = prev.items.map((item, index) => 
                index === itemIndex ? updatedItem : item
            );
            
            // Recalcula o subtotal
            const newSubtotal = updatedItems.reduce((sum, item) => 
                sum + (item.deleted ? 0 : parseFloat(item.total || 0)), 0
            );
            
            // Recalcula o total
            const newTotal = newSubtotal - parseFloat(prev.discount || 0);
            
            console.log('[Preview] ✅ Item atualizado com sucesso:', {
                itemIndex,
                newTotal: updatedItem.total,
                newSubtotal,
                finalTotal: newTotal
            });
            
            return {
                ...prev,
                items: updatedItems,
                subtotal: newSubtotal,
                total: newTotal,
                itemsCount: updatedItems.filter(i => !i.deleted).length,
            };
        });
    };

    const handleDeleteItem = (itemIndex) => {
        console.log('[Preview] 🗑️ handleDeleteItem chamado:', { itemIndex });
        
        Alert.alert(
            'Excluir Item',
            'Tem certeza que deseja excluir este item?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => {
                        console.log('[Preview] ✅ Confirmado exclusão do item:', itemIndex);
                        
                        setPreviewData(prev => {
                            if (!prev || !prev.items) {
                                console.log('[Preview] ❌ Dados inválidos em previewData');
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
                            
                            console.log('[Preview] ✅ Item deletado com sucesso:', {
                                itemIndex,
                                newSubtotal,
                                finalTotal: newTotal
                            });
                            
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

    const handleConfirm = async () => {
        try {
            if (receiptId) {
                // MODO HISTÓRICO: Salva as alterações da nota existente
                console.log('[Preview] 💾 Salvando alterações da nota:', receiptId);
                Alert.alert(
                    'Sucesso',
                    'Alterações salvas com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                // MODO SCAN: Confirma e salva nova nota
                console.log('[Preview] 💾 Salvando nova nota fiscal...');
                // Navega para Home IMEDIATAMENTE ao clicar em salvar
                navigation.navigate('Main', { screen: 'Home' });
                
                // Callback de timeout: ativa notificação se demorar mais de 5s
                const handleTimeout = () => {
                    console.log('[Preview] Timeout: mostrando notificação de processamento');
                };

                // Inicia o salvamento em background
                const result = await confirmQRCode(previewData, handleTimeout);
                
                // Se completou rápido (< 5s), não faz nada (já está na Home)
                // Se demorou (> 5s), a notificação já está aparecendo
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar a nota fiscal.');
        }
    };

    if (loading) {
        return (
            <View style={styles.fullLoading}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.fullLoadingText}>Carregando nota fiscal...</Text>
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
                    <PreviewHeader onBack={() => navigation.goBack()} />
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
                    <PreviewHeader onBack={() => navigation.goBack()} />
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
                            />
                        ))
                    ) : (
                        <Text style={styles.noItemsText}>Nenhum item encontrado</Text>
                    )}
                </Animated.ScrollView>

                {/* Botão confirmar - FIXO NA PARTE INFERIOR - Só mostra se NÃO for readonly */}
                {!isReadOnly && (
                    <View style={styles.fixedButtonContainer}>
                        <ConfirmButton 
                            onPress={handleConfirm}
                        />
                    </View>
                )}
            </View>
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
