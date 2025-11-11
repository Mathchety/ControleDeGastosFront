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
    Modal,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function CategoryDetailsScreen({ route, navigation }) {
    const { category } = route.params || {};
    const { fetchCategoryById, updateItem, fetchCategories } = useData();
    const [categoryData, setCategoryData] = useState(null);
    const [categoryItems, setCategoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Estados do formulário de edição
    const [itemQuantity, setItemQuantity] = useState('');
    const [itemTotal, setItemTotal] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (category?.id) {
            loadCategoryDetails();
            loadCategories();
        }
    }, [category]);

    const loadCategoryDetails = async () => {
        try {
            setLoading(true);
            const data = await fetchCategoryById(category.id);
            setCategoryData(data);
            
            // Ordena os itens: alfabeticamente, depois por valor (decrescente)
            const sortedItems = (data?.items || []).sort((a, b) => {
                // Primeiro ordena alfabeticamente pelo nome do produto
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                const nameComparison = nameA.localeCompare(nameB, 'pt-BR');
                
                if (nameComparison !== 0) return nameComparison;
                
                // Se os nomes forem iguais, ordena por valor (decrescente)
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

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            // Ordena categorias alfabeticamente
            const sortedCategories = data.sort((a, b) => 
                a.name.localeCompare(b.name, 'pt-BR')
            );
            setCategories(sortedCategories);
        } catch (error) {
            console.error('[CategoryDetails] Erro ao carregar categorias:', error);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setItemQuantity(String(item.quantity || ''));
        setItemTotal(String(item.total || ''));
        setSelectedCategoryId(item.categoryId);
        setModalVisible(true);
    };

    const handleSaveItem = async () => {
        try {
            // Validações
            if (!itemQuantity || parseFloat(itemQuantity) <= 0) {
                Alert.alert('Erro', 'Quantidade deve ser maior que zero');
                return;
            }
            if (!itemTotal || parseFloat(itemTotal) <= 0) {
                Alert.alert('Erro', 'Total deve ser maior que zero');
                return;
            }

            setSaving(true);

            const quantity = parseFloat(itemQuantity);
            const total = parseFloat(itemTotal);
            const unitPrice = total / quantity;

            const updateData = {
                quantity: quantity,
                total: total,
                unitPrice: unitPrice,
                categoryId: selectedCategoryId
            };

            await updateItem(editingItem.id, updateData);

            Alert.alert('Sucesso', 'Item atualizado com sucesso!');
            setModalVisible(false);
            
            // Se mudou de categoria, volta para a lista
            if (selectedCategoryId !== category.id) {
                navigation.goBack();
            } else {
                // Se não mudou, só recarrega
                loadCategoryDetails();
            }
        } catch (error) {
            console.error('[CategoryDetails] Erro ao salvar item:', error);
            Alert.alert('Erro', 'Não foi possível salvar o item. Tente novamente.');
        } finally {
            setSaving(false);
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
                        onPress={() => navigation.goBack()}
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
                                        <TouchableOpacity
                                            style={styles.editItemButton}
                                            onPress={() => handleEditItem(item)}
                                        >
                                            <Ionicons name="create-outline" size={20} color="#667eea" />
                                        </TouchableOpacity>
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

            {/* Modal de Edição de Item */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Item</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Nome do Produto (readonly) */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Produto</Text>
                                <View style={styles.readOnlyField}>
                                    <Text style={styles.readOnlyText}>{editingItem?.name}</Text>
                                </View>
                            </View>

                            {/* Quantidade */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Quantidade *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={itemQuantity}
                                    onChangeText={setItemQuantity}
                                    placeholder="Ex: 2"
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            {/* Total */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Total (R$) *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={itemTotal}
                                    onChangeText={setItemTotal}
                                    placeholder="Ex: 10.50"
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            {/* Preço Unitário Calculado */}
                            {itemQuantity && itemTotal && parseFloat(itemQuantity) > 0 && (
                                <View style={styles.calculatedField}>
                                    <Text style={styles.calculatedLabel}>Preço Unitário:</Text>
                                    <Text style={styles.calculatedValue}>
                                        R$ {(parseFloat(itemTotal) / parseFloat(itemQuantity)).toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            {/* Categoria */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Categoria</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.categoryChip,
                                                selectedCategoryId === cat.id && styles.categoryChipSelected
                                            ]}
                                            onPress={() => setSelectedCategoryId(cat.id)}
                                        >
                                            <View style={[styles.categoryChipColor, { backgroundColor: cat.color }]} />
                                            <Text style={[
                                                styles.categoryChipText,
                                                selectedCategoryId === cat.id && styles.categoryChipTextSelected
                                            ]}>
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </ScrollView>

                        {/* Botões */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                                onPress={handleSaveItem}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Salvar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    editItemButton: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#f0f4ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: moderateScale(8),
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: moderateScale(25),
        borderTopRightRadius: moderateScale(25),
        padding: moderateScale(20),
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(20),
    },
    modalTitle: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#333',
    },
    formGroup: {
        marginBottom: moderateScale(20),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: moderateScale(8),
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(12),
        padding: moderateScale(15),
        fontSize: moderateScale(16),
        color: '#333',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    readOnlyField: {
        backgroundColor: '#f0f0f0',
        borderRadius: moderateScale(12),
        padding: moderateScale(15),
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    readOnlyText: {
        fontSize: moderateScale(16),
        color: '#666',
    },
    calculatedField: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        borderRadius: moderateScale(12),
        padding: moderateScale(15),
        marginBottom: moderateScale(20),
    },
    calculatedLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#667eea',
    },
    calculatedValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#667eea',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(20),
        paddingVertical: moderateScale(8),
        paddingHorizontal: moderateScale(15),
        marginRight: moderateScale(10),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryChipSelected: {
        backgroundColor: '#f0f4ff',
        borderColor: '#667eea',
    },
    categoryChipColor: {
        width: moderateScale(16),
        height: moderateScale(16),
        borderRadius: moderateScale(8),
        marginRight: moderateScale(8),
    },
    categoryChipText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#666',
    },
    categoryChipTextSelected: {
        color: '#667eea',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: moderateScale(12),
        marginTop: moderateScale(20),
    },
    modalButton: {
        flex: 1,
        paddingVertical: moderateScale(15),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f8f9fa',
    },
    cancelButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        backgroundColor: '#667eea',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#fff',
    },
});
