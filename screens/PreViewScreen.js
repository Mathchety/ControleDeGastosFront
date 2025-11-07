import React, { useEffect, useState } from 'react';
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
    const { previewQRCode, confirmQRCode, fetchReceiptById, deleteReceipt, loading } = useData();
    const [previewData, setPreviewData] = useState(receivedData || null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    useEffect(() => {
        // MODO 1: Se recebeu ID de uma nota já salva, busca pelo endpoint
        if (receiptId) {
            console.log('[Preview] Carregando receipt por ID:', receiptId);
            setIsReadOnly(true); // Modo visualização, não pode editar/salvar
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
        setPreviewData(prev => {
            const updatedItems = prev.items.map((item, index) => 
                index === itemIndex ? updatedItem : item
            );
            
            // Recalcula o subtotal
            const newSubtotal = updatedItems.reduce((sum, item) => 
                sum + (item.deleted ? 0 : parseFloat(item.total || 0)), 0
            );
            
            // Recalcula o total
            const newTotal = newSubtotal - parseFloat(prev.discount || 0);
            
            console.log('[Preview] Item atualizado:', {
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
                            const updatedItems = prev.items.map((item, index) => 
                                index === itemIndex ? { ...item, deleted: true } : item
                            );
                            
                            // Recalcula totais
                            const newSubtotal = updatedItems.reduce((sum, item) => 
                                sum + (item.deleted ? 0 : parseFloat(item.total || 0)), 0
                            );
                            const newTotal = newSubtotal - parseFloat(prev.discount || 0);
                            
                            console.log('[Preview] Item deletado:', {
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

    const handleDeleteReceipt = () => {
        Alert.alert(
            'Excluir Nota Fiscal',
            'Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita.',
            [
                { 
                    text: 'Cancelar', 
                    style: 'cancel' 
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteReceipt(receiptId);
                            Alert.alert(
                                'Sucesso',
                                'Nota fiscal excluída com sucesso!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.navigate('Main', { screen: 'History' })
                                    }
                                ]
                            );
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir a nota fiscal.');
                            console.error('[Preview] Erro ao deletar nota:', error);
                        }
                    }
                }
            ]
        );
    };

    const handleConfirm = async () => {
        try {
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

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ReceiptSummaryCard 
                        storeName={previewData.storeName}
                        subtotal={previewData.subtotal}
                        discount={previewData.discount}
                        total={previewData.total}
                    />

                    {/* Cabeçalho dos itens com botão de deletar */}
                    <View style={styles.itemsHeader}>
                        <Text style={styles.sectionTitle}>Itens ({previewData.itemsCount || 0})</Text>
                        
                        {/* Botão de deletar - só aparece em modo readonly (nota já salva) */}
                        {isReadOnly && receiptId && (
                            <TouchableOpacity 
                                style={styles.deleteButton}
                                onPress={handleDeleteReceipt}
                            >
                                <Ionicons name="trash" size={24} color="#ff4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {previewData.items && previewData.items.length > 0 ? (
                        previewData.items.map((item, index) => (
                            <EditableReceiptItemCard 
                                key={index}
                                item={item}
                                itemIndex={index}
                                onUpdate={!isReadOnly ? handleUpdateItem : undefined}
                                onDelete={!isReadOnly ? handleDeleteItem : undefined}
                                readOnly={isReadOnly}
                            />
                        ))
                    ) : (
                        <Text style={styles.noItemsText}>Nenhum item encontrado</Text>
                    )}
                </ScrollView>

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
    headerGradient: {
        borderBottomLeftRadius: theme.radius.xl,
        borderBottomRightRadius: theme.radius.xl,
        paddingTop: Platform.OS === 'ios' ? moderateScale(60) : StatusBar.currentHeight + moderateScale(10),
        paddingBottom: moderateScale(20),
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
        paddingBottom: 20,
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
    deleteButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
