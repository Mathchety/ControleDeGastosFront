import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ActivityIndicator, 
    Alert, 
    ScrollView, 
    TouchableOpacity,
    Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';

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
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Carregando nota fiscal...</Text>
                </View>
            </SafeAreaView>
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
                {/* Header com botão voltar */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#667eea" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Preview da Nota</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Card grande com informações da loja e totais */}
                    <View style={styles.summaryCard}>
                        <View style={styles.storeHeader}>
                            <Ionicons name="storefront" size={32} color="#667eea" />
                            <Text style={styles.storeName}>{previewData.storeName || 'Loja'}</Text>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal:</Text>
                            <Text style={styles.totalValue}>R$ {parseFloat(previewData.subtotal || 0).toFixed(2)}</Text>
                        </View>
                        
                        {previewData.discount > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Desconto:</Text>
                                <Text style={[styles.totalValue, styles.discountValue]}>
                                    - R$ {parseFloat(previewData.discount || 0).toFixed(2)}
                                </Text>
                            </View>
                        )}
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabelBold}>Total:</Text>
                            <Text style={styles.totalValueBold}>R$ {parseFloat(previewData.total || 0).toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Lista de itens */}
                    <Text style={styles.sectionTitle}>Itens ({previewData.itemsCount || 0})</Text>
                    
                    {previewData.items && previewData.items.length > 0 ? (
                        previewData.items.map((item, index) => (
                            <View 
                                key={index} 
                                style={[
                                    styles.itemCard,
                                    item.deleted && styles.itemCardDeleted
                                ]}
                            >
                                <Text 
                                    style={[
                                        styles.itemDescription,
                                        item.deleted && styles.itemTextDeleted
                                    ]}
                                    numberOfLines={2}
                                >
                                    {item.description}
                                </Text>
                                
                                <View style={styles.itemFooter}>
                                    <Text style={[styles.itemQuantity, item.deleted && styles.itemTextDeleted]}>
                                        {item.quantity}x R$ {parseFloat(item.unitPrice || 0).toFixed(2)}
                                    </Text>
                                    <Text style={[styles.itemTotal, item.deleted && styles.itemTextDeleted]}>
                                        R$ {parseFloat(item.total || 0).toFixed(2)}
                                    </Text>
                                </View>
                                
                                {item.deleted && (
                                    <View style={styles.deletedBadge}>
                                        <Text style={styles.deletedText}>Deletado</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noItemsText}>Nenhum item encontrado</Text>
                    )}
                </ScrollView>

                {/* Botão confirmar - FIXO NA PARTE INFERIOR */}
                <View style={styles.fixedButtonContainer}>
                    <TouchableOpacity 
                        style={styles.confirmButton}
                        onPress={handleConfirm}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.confirmButtonGradient}
                        >
                            <Ionicons name="checkmark-circle" size={24} color="#fff" />
                            <Text style={styles.confirmButtonText}>Confirmar e Salvar</Text>
                        </LinearGradient>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    storeHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    storeName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginTop: 10,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 6,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
    },
    totalValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    discountValue: {
        color: '#10b981',
    },
    totalLabelBold: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    totalValueBold: {
        fontSize: 24,
        fontWeight: '700',
        color: '#667eea',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    itemCardDeleted: {
        opacity: 0.5,
        backgroundColor: '#f3f4f6',
    },
    itemDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    itemTextDeleted: {
        textDecorationLine: 'line-through',
        color: '#9ca3af',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#666',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#667eea',
    },
    deletedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    deletedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
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
    confirmButton: {
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        gap: 10,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
