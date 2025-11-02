import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ActivityIndicator, 
    Alert, 
    ScrollView, 
    Platform 
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { ConfirmButton } from '../components/buttons';
import { PreviewHeader, ReceiptSummaryCard, EditableReceiptItemCard } from '../components/cards';

export default function PreViewScreen({ route, navigation }) {
    const { qrLink } = route.params || {};
    const { previewQRCode, confirmQRCode, loading } = useData();
    const [previewData, setPreviewData] = useState(null);

    useEffect(() => {
        if (qrLink) {
            loadPreview();
        }
    }, [qrLink]);

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

    const handleConfirm = async () => {
        try {
            await confirmQRCode(previewData);
            Alert.alert(
                'Sucesso!',
                'Nota fiscal salva com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Home')
                    }
                ]
            );
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
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text style={styles.errorText}>Nenhum dado disponível</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <PreviewHeader onBack={() => navigation.goBack()} />

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

                    {/* Lista de itens */}
                    <Text style={styles.sectionTitle}>Itens ({previewData.itemsCount || 0})</Text>
                    
                    {previewData.items && previewData.items.length > 0 ? (
                        previewData.items.map((item, index) => (
                            <EditableReceiptItemCard 
                                key={index}
                                item={item}
                                itemIndex={index}
                                onUpdate={handleUpdateItem}
                                onDelete={handleDeleteItem}
                            />
                        ))
                    ) : (
                        <Text style={styles.noItemsText}>Nenhum item encontrado</Text>
                    )}
                </ScrollView>

                {/* Botão confirmar - FIXO NA PARTE INFERIOR */}
                <View style={styles.fixedButtonContainer}>
                    <ConfirmButton 
                        onPress={handleConfirm}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#667eea',
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
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
