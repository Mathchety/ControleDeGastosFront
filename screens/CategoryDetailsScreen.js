import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function CategoryDetailsScreen({ route, navigation }) {
    const { category } = route.params || {};
    const { fetchCategoryById, deleteCategory } = useData();
    const [categoryData, setCategoryData] = useState(null);
    const [categoryItems, setCategoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (category?.id) {
            loadCategoryDetails();
        }
    }, [category]);

    const loadCategoryDetails = async () => {
        try {
            setLoading(true);
            const data = await fetchCategoryById(category.id);
            setCategoryData(data);
            
            // Ordena os itens do mais caro para o mais barato
            const sortedItems = (data?.items || []).sort((a, b) => {
                const totalA = parseFloat(a.total || 0);
                const totalB = parseFloat(b.total || 0);
                return totalB - totalA;
            });
            
            setCategoryItems(sortedItems);
        } catch (error) {
            console.error('[CategoryDetails] Erro ao carregar itens:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = () => {
        Alert.alert(
            'Excluir Categoria',
            `Tem certeza que deseja excluir a categoria "${category?.name}"?\n\nTodos os itens desta categoria serão movidos para "Não categorizado" e poderão ser recategorizados depois.`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: confirmDeleteCategory
                }
            ]
        );
    };

    const confirmDeleteCategory = async () => {
        try {
            setDeleting(true);
            await deleteCategory(category.id);
            
            Alert.alert(
                'Sucesso',
                'Categoria excluída com sucesso! Os itens foram movidos para "Não categorizado".',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Categories')
                    }
                ]
            );
        } catch (error) {
            console.error('[CategoryDetails] Erro ao deletar categoria:', error);
            
            // Verifica se é erro de categoria "Não categorizado"
            if (error.message?.includes('Não categorizado') || error.response?.status === 400) {
                Alert.alert(
                    'Erro',
                    'Não é possível excluir a categoria "Não categorizado".'
                );
            } else {
                Alert.alert(
                    'Erro',
                    'Não foi possível excluir a categoria. Tente novamente.'
                );
            }
        } finally {
            setDeleting(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={true}
            />

            {/* Header com gradiente */}
            <LinearGradient
                colors={[category?.color || '#667eea', category?.color || '#764ba2']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Categories')}
                    >
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>{category?.name || 'Categoria'}</Text>
                        {category?.description && (
                            <Text style={styles.headerSubtitle}>{category.description}</Text>
                        )}
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            {/* Conteúdo */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={category?.color || '#667eea'} />
                        <Text style={styles.loadingText}>Carregando itens...</Text>
                    </View>
                ) : categoryItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyText}>Nenhum item encontrado</Text>
                        <Text style={styles.emptySubtext}>
                            Não há itens cadastrados nesta categoria
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Resumo */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total de Itens</Text>
                                <Text style={styles.summaryValue}>{categoryItems.length}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Valor Total</Text>
                                <Text style={[styles.summaryValue, { color: category?.color || '#667eea' }]}>
                                    R$ {categoryItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        {/* Lista de itens */}
                        <Text style={styles.sectionTitle}>Itens da Categoria</Text>
                        {categoryItems.map((item, index) => {
                            const itemTotal = parseFloat(item.total || 0);
                            const quantity = parseFloat(item.quantity || 1);
                            const unitPrice = quantity > 0 ? itemTotal / quantity : 0;

                            return (
                                <View key={index} style={styles.itemCard}>
                                    <View style={styles.itemHeader}>
                                        <View style={[styles.itemBadge, { backgroundColor: category?.color || '#667eea' }]}>
                                            <Text style={styles.itemBadgeText}>#{index + 1}</Text>
                                        </View>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                    </View>
                                    <View style={styles.itemDetails}>
                                        <View style={styles.itemDetailRow}>
                                            <Ionicons name="cube-outline" size={16} color="#666" />
                                            <Text style={styles.itemDetailText}>
                                                Quantidade: {item.quantity} {item.unit || 'un'}
                                            </Text>
                                        </View>
                                        <View style={styles.itemDetailRow}>
                                            <Ionicons name="pricetag-outline" size={16} color="#666" />
                                            <Text style={styles.itemDetailText}>
                                                Preço Unitário: R$ {unitPrice.toFixed(2)}
                                            </Text>
                                        </View>
                                        {item.storeName && (
                                            <View style={styles.itemDetailRow}>
                                                <Ionicons name="storefront-outline" size={16} color="#666" />
                                                <Text style={styles.itemDetailText}>{item.storeName}</Text>
                                            </View>
                                        )}
                                        {item.purchaseDate && (
                                            <View style={styles.itemDetailRow}>
                                                <Ionicons name="calendar-outline" size={16} color="#666" />
                                                <Text style={styles.itemDetailText}>
                                                    {new Date(item.purchaseDate).toLocaleDateString('pt-BR')}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.itemFooter}>
                                        <Text style={styles.itemTotalLabel}>Total</Text>
                                        <Text style={[styles.itemTotalValue, { color: category?.color || '#667eea' }]}>
                                            R$ {itemTotal.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}
            </ScrollView>

            {/* Botão Flutuante de Deletar */}
            <TouchableOpacity
                style={[styles.floatingButton, deleting && styles.floatingButtonDisabled]}
                onPress={handleDeleteCategory}
                disabled={deleting}
            >
                {deleting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Ionicons name="trash" size={28} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? moderateScale(60) : StatusBar.currentHeight + moderateScale(10),
        paddingBottom: moderateScale(25),
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(20),
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: moderateScale(14),
        color: '#fff',
        opacity: 0.9,
        marginTop: moderateScale(4),
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: moderateScale(20),
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(60),
    },
    loadingText: {
        marginTop: moderateScale(15),
        fontSize: moderateScale(16),
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(60),
    },
    emptyText: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        color: '#666',
        marginTop: moderateScale(20),
    },
    emptySubtext: {
        fontSize: moderateScale(14),
        color: '#999',
        marginTop: moderateScale(8),
        textAlign: 'center',
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: moderateScale(15),
        padding: moderateScale(20),
        marginBottom: moderateScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: moderateScale(15),
    },
    summaryLabel: {
        fontSize: moderateScale(13),
        color: '#666',
        marginBottom: moderateScale(8),
    },
    summaryValue: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#333',
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#333',
        marginBottom: moderateScale(15),
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(15),
        padding: moderateScale(16),
        marginBottom: moderateScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(12),
    },
    itemBadge: {
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(4),
        borderRadius: moderateScale(12),
        marginRight: moderateScale(10),
    },
    itemBadgeText: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#fff',
    },
    itemName: {
        flex: 1,
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#333',
    },
    itemDetails: {
        marginBottom: moderateScale(12),
    },
    itemDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(6),
    },
    itemDetailText: {
        fontSize: moderateScale(14),
        color: '#666',
        marginLeft: moderateScale(8),
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: moderateScale(12),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    itemTotalLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#666',
    },
    itemTotalValue: {
        fontSize: moderateScale(20),
        fontWeight: '700',
    },
    floatingButton: {
        position: 'absolute',
        bottom: moderateScale(30),
        right: moderateScale(20),
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        backgroundColor: '#ff4444',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    floatingButtonDisabled: {
        opacity: 0.6,
    },
});
