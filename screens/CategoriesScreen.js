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
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import httpClient from '../services/httpClient';
import { CacheService } from '../services/cacheService';
import { useFilters } from '../contexts/FilterContext';
import { SkeletonCategoryCard } from '../components/common';
import { DatePeriodModal } from '../components/modals';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';
import { getValidIcon } from '../utils/iconHelper';
import { useStatusBarColor } from '../hooks/useStatusBarColor';

// Paleta de cores disponíveis
const COLOR_PALETTE = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0',
    '#a8edea', '#fed6e3', '#c471ed', '#12c2e9',
    '#f5af19', '#f12711', '#5f72bd', '#9921e8',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#ffeaa7', '#dfe6e9', '#74b9ff', '#a29bfe',
];

export default function CategoriesScreen({ navigation }) {
    const { fetchCategories, createCategory, deleteCategory } = useData();
    const { categoriesFilter, updateCategoriesFilter } = useFilters();
    
    // Hook para definir a cor da StatusBar
    useStatusBarColor('#667eea', 'light-content');
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    
    // ✅ Usa filtros do Context (persistem entre navegações)
    const [filterPeriod, setFilterPeriod] = useState(categoriesFilter.filterPeriod);
    const [customDateModalVisible, setCustomDateModalVisible] = useState(false);
    const [startDate, setStartDate] = useState(categoriesFilter.startDate);
    const [endDate, setEndDate] = useState(categoriesFilter.endDate);
    
    // Estados do formulário
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

    // ✅ Carrega categorias quando monta a tela ou quando filtros mudam
    useEffect(() => {
        loadCategories();
    }, [filterPeriod, startDate, endDate]);

    // ✅ Recarrega quando a tela recebe foco (volta da navegação)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadCategories();
        });

        return unsubscribe;
    }, [navigation, filterPeriod, startDate, endDate]); // ✅ Inclui filtros nas dependências

    const loadCategories = async () => {
        try {
            setFilterLoading(true); // ⚡ Ativa loading ao trocar filtro
            
            let start, end;
            const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD
            const today = new Date();

            switch (filterPeriod) {
                case 'week':
                    end = new Date();
                    start = new Date();
                    start.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    end = new Date();
                    start = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'custom':
                    start = startDate;
                    end = endDate;
                    break;
                default: // 'all'
                    start = null;
                    end = null;
            }

            // ⚡ fetchCategories agora aceita filtros opcionais de data
            const categoriesData = start && end 
                ? await fetchCategories(formatDate(start), formatDate(end))
                : await fetchCategories();
            
            // ✨ Ordena as categorias: por letra inicial, depois por quantidade de itens
            const sortedCategories = categoriesData.sort((a, b) => {
                // Pega a primeira letra (maiúscula) de cada categoria
                const firstLetterA = (a.name || '').charAt(0).toUpperCase();
                const firstLetterB = (b.name || '').charAt(0).toUpperCase();
                
                // Se as letras iniciais forem diferentes, ordena alfabeticamente
                if (firstLetterA !== firstLetterB) {
                    return firstLetterA.localeCompare(firstLetterB, 'pt-BR');
                }
                
                // ✨ Se começam com a mesma letra, ordena por quantidade de itens (decrescente)
                return (b.itemCount || 0) - (a.itemCount || 0);
            });
            
            setCategories(sortedCategories);
        } catch (error) {
            // Erro já tratado no DataContext com Alert
        } finally {
            setLoading(false);
            setFilterLoading(false); // ⚡ Desativa loading
        }
    };

    const handleFilterPress = (filter) => {
        setFilterPeriod(filter);
        
        const today = new Date();
        let newStartDate = null;
        let newEndDate = null;
        
        // Configura datas baseado no filtro
        switch (filter) {
            case 'week':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                newStartDate = weekAgo;
                newEndDate = today;
                break;
            
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                newStartDate = monthStart;
                newEndDate = today;
                break;
            
            case 'all':
                newStartDate = null;
                newEndDate = null;
                break;
        }
        
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        
        // ✅ Salva no Context para persistir entre navegações
        updateCategoriesFilter({
            filterPeriod: filter,
            startDate: newStartDate,
            endDate: newEndDate,
        });
    };

    const handleApplyCustomPeriod = ({ startDate: newStart, endDate: newEnd }) => {
        setStartDate(newStart);
        setEndDate(newEnd);
        setFilterPeriod('custom');
        
        // ✅ Salva no Context
        updateCategoriesFilter({
            filterPeriod: 'custom',
            startDate: newStart,
            endDate: newEnd,
        });
    };

    const handleAddCategory = () => {
        // Reseta o formulário
        setEditingCategory(null);
        setCategoryName('');
        setCategoryDescription('');
        setSelectedColor(COLOR_PALETTE[0]);
        setModalVisible(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setCategoryDescription(category.description || '');
        setSelectedColor(category.color || COLOR_PALETTE[0]);
        setModalVisible(true);
    };

    const handleDeleteCategory = async (categoryId, categoryName) => {
        Alert.alert(
            'Excluir Categoria',
            `Tem certeza que deseja excluir a categoria "${categoryName}"?\n\nTodos os itens desta categoria serão movidos para "Não categorizado".`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCategory(categoryId);
                            Alert.alert('Sucesso', 'Categoria excluída com sucesso!');
                            loadCategories();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir a categoria.');
                        }
                    }
                }
            ]
        );
    };

    const handleSaveCategory = async () => {
        // Validações
        if (!categoryName.trim()) {
            Alert.alert('Erro', 'Por favor, informe o nome da categoria.');
            return;
        }

        // Se está editando
        if (editingCategory) {
            // Verifica se o nome foi alterado
            const nameChanged = categoryName.trim().toLowerCase() !== editingCategory.name.toLowerCase();
            
            // Se o nome mudou, verifica se já existe outra categoria com esse nome
            if (nameChanged) {
                const categoryExists = categories.some(
                    cat => cat.id !== editingCategory.id && 
                           cat.name.toLowerCase().trim() === categoryName.toLowerCase().trim()
                );

                if (categoryExists) {
                    Alert.alert('Erro', 'Já existe uma categoria com este nome.');
                    return;
                }
            }

            try {
                setSaving(true);
                
                // Monta objeto apenas com campos que mudaram
                const updateData = {};
                
                if (nameChanged) {
                    updateData.name = categoryName.trim();
                }
                
                if (categoryDescription.trim() !== (editingCategory.description || '')) {
                    updateData.description = categoryDescription.trim() || undefined;
                }
                
                if (selectedColor !== editingCategory.color) {
                    updateData.color = selectedColor;
                }

                // Se nada mudou, apenas fecha o modal
                if (Object.keys(updateData).length === 0) {
                    setModalVisible(false);
                    return;
                }

                // Chama API de atualização (precisa implementar no DataContext)
                await httpClient.patch(`/category/${editingCategory.id}`, updateData);
                
                // 🔄 Invalida cache do gráfico se a cor mudou (para atualizar na home)
                if (updateData.color) {
                    await CacheService.invalidateGraphCache();
                }
                
                Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
                setModalVisible(false);
                loadCategories(); // Recarrega a lista
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Não foi possível atualizar a categoria.';
                Alert.alert('Erro', errorMessage);
            } finally {
                setSaving(false);
            }
        } else {
            // Criando nova categoria
            // Verifica se já existe categoria com mesmo nome
            const categoryExists = categories.some(
                cat => cat.name.toLowerCase().trim() === categoryName.toLowerCase().trim()
            );

            if (categoryExists) {
                Alert.alert('Erro', 'Já existe uma categoria com este nome.');
                return;
            }

            try {
                setSaving(true);
                
                const newCategory = {
                    name: categoryName.trim(),
                    description: categoryDescription.trim() || undefined,
                    color: selectedColor,
                };

                await createCategory(newCategory);
                
                Alert.alert('Sucesso', 'Categoria criada com sucesso!');
                setModalVisible(false);
                loadCategories(); // Recarrega a lista
            } catch (error) {
                // Erro já tratado no DataContext com Alert
            } finally {
                setSaving(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#667eea"
                translucent={false}
            />
            <View style={styles.container}>

            {/* Header com gradiente */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Ionicons name="pricetags" size={32} color="#fff" />
                        <Text style={styles.headerTitle}>Minhas Categorias</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddCategory}
                    >
                        <Ionicons name="add-circle" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Filtros */}
            <View style={styles.filtersContainer}>
                <View style={styles.filtersRow}>
                    <TouchableOpacity
                        style={[styles.filterButton, filterPeriod === 'all' && styles.filterButtonActive]}
                        onPress={() => handleFilterPress('all')}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name="apps" 
                            size={18} 
                            color={filterPeriod === 'all' ? '#fff' : '#667eea'} 
                        />
                        <Text style={[
                            styles.filterButtonText,
                            filterPeriod === 'all' && styles.filterButtonTextActive
                        ]}>
                            Todas
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.filterButton, filterPeriod === 'week' && styles.filterButtonActive]}
                        onPress={() => handleFilterPress('week')}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name="calendar" 
                            size={18} 
                            color={filterPeriod === 'week' ? '#fff' : '#667eea'} 
                        />
                        <Text style={[
                            styles.filterButtonText,
                            filterPeriod === 'week' && styles.filterButtonTextActive
                        ]}>
                            Semana
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.filterButton, filterPeriod === 'month' && styles.filterButtonActive]}
                        onPress={() => handleFilterPress('month')}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name="calendar-outline" 
                            size={18} 
                            color={filterPeriod === 'month' ? '#fff' : '#667eea'} 
                        />
                        <Text style={[
                            styles.filterButtonText,
                            filterPeriod === 'month' && styles.filterButtonTextActive
                        ]}>
                            Mês
                        </Text>
                    </TouchableOpacity>
                </View>
                
                {/* Período Customizado */}
                <TouchableOpacity 
                    style={[
                        styles.customPeriodButton,
                        filterPeriod === 'custom' && styles.customPeriodButtonActive
                    ]}
                    onPress={() => setCustomDateModalVisible(true)}
                >
                    <Ionicons 
                        name="calendar-sharp" 
                        size={18} 
                        color={filterPeriod === 'custom' ? '#fff' : '#667eea'} 
                    />
                    <Text style={[
                        styles.customPeriodText,
                        filterPeriod === 'custom' && styles.customPeriodTextActive
                    ]}>
                        {filterPeriod === 'custom' && startDate && endDate
                            ? `${startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
                            : 'Período customizado'
                        }
                    </Text>
                </TouchableOpacity>

                {/* Indicador de Loading ao Filtrar */}
                {filterLoading && (
                    <View style={styles.filterLoadingIndicator}>
                        <ActivityIndicator size="small" color="#667eea" />
                        <Text style={styles.filterLoadingText}>Filtrando...</Text>
                    </View>
                )}
            </View>

            {/* Modal de Período Customizado */}
            <DatePeriodModal
                visible={customDateModalVisible}
                onClose={() => setCustomDateModalVisible(false)}
                onApply={handleApplyCustomPeriod}
                initialStartDate={startDate}
                initialEndDate={endDate}
            />

            {/* Lista de categorias */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <>
                        <SkeletonCategoryCard />
                        <SkeletonCategoryCard />
                        <SkeletonCategoryCard />
                        <SkeletonCategoryCard />
                        <SkeletonCategoryCard />
                    </>
                ) : categories.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="pricetags-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyText}>Nenhuma categoria encontrada</Text>
                        <Text style={styles.emptySubtext}>Toque no + para adicionar sua primeira categoria</Text>
                    </View>
                ) : (
                    categories.map((category, index) => (
                        <TouchableOpacity
                            key={category.id || index}
                            style={styles.categoryCard}
                            onPress={() => navigation.navigate('CategoryDetails', { category })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.categoryHeader}>
                                <View style={styles.categoryLeft}>
                                    <View style={[styles.categoryIcon, { backgroundColor: category.color || '#667eea' }]}>
                                        <Ionicons name={getValidIcon(category.icon)} size={24} color="#fff" />
                                    </View>
                                    <View style={styles.categoryInfo}>
                                        <Text style={styles.categoryName}>{category.name}</Text>
                                        {category.description && (
                                            <Text style={styles.categoryDescription} numberOfLines={1}>
                                                {category.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#ccc" />
                            </View>
                            
                            {/* Rodapé com quantidade e ações */}
                            <View style={styles.categoryFooter}>
                                <View style={styles.categoryStats}>
                                    <Ionicons name="list-outline" size={16} color="#666" />
                                    <Text style={styles.categoryCount}>
                                        {category.itemCount || 0} {(category.itemCount || 0) === 1 ? 'item' : 'itens'}
                                    </Text>
                                </View>
                                
                                <View style={styles.categoryActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.editButton]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleEditCategory(category);
                                        }}
                                    >
                                        <Ionicons name="create-outline" size={18} color="#667eea" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deleteButton]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCategory(category.id, category.name);
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#ff4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Modal de Adicionar Categoria */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    />
                    
                    <View style={styles.modalContent}>
                        {/* Header do Modal */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Campo Nome */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Nome da Categoria *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Alimentação, Transporte..."
                                    value={categoryName}
                                    onChangeText={setCategoryName}
                                    maxLength={50}
                                />
                            </View>

                            {/* Campo Descrição */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Descrição (Exemplos de itens)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Ex: Arroz, feijão, lentilha, grão-de-bico..."
                                    value={categoryDescription}
                                    onChangeText={setCategoryDescription}
                                    multiline
                                    numberOfLines={3}
                                    maxLength={200}
                                />
                            </View>

                            {/* Seletor de Cor */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Escolha uma Cor</Text>
                                <View style={styles.colorPalette}>
                                    {COLOR_PALETTE.map((color, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: color },
                                                selectedColor === color && styles.colorOptionSelected
                                            ]}
                                            onPress={() => setSelectedColor(color)}
                                        >
                                            {selectedColor === color && (
                                                <Ionicons name="checkmark" size={20} color="#fff" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Preview */}
                            <View style={styles.previewContainer}>
                                <Text style={styles.inputLabel}>Preview</Text>
                                <View style={styles.categoryCard}>
                                    <View style={styles.categoryLeft}>
                                        <View style={[styles.categoryIcon, { backgroundColor: selectedColor }]}>
                                            <Ionicons name="pricetag" size={24} color="#fff" />
                                        </View>
                                        <View style={styles.categoryInfo}>
                                            <Text style={styles.categoryName}>
                                                {categoryName || 'Nome da categoria'}
                                            </Text>
                                            {categoryDescription && (
                                                <Text style={styles.categoryDescription}>
                                                    {categoryDescription}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Botões */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSave]}
                                onPress={handleSaveCategory}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonSaveText}>Salvar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        paddingTop: Platform.OS === 'ios' ? moderateScale(60) : StatusBar.currentHeight + moderateScale(10),
        paddingBottom: moderateScale(20),
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(20),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
        flex: 1,
    },
    headerTitle: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        color: '#fff',
    },
    addButton: {
        padding: moderateScale(4),
    },
    filtersContainer: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filtersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    filterButtonActive: {
        backgroundColor: '#667eea',
    },
    filterButtonText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 4,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: 'white',
    },
    customPeriodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#667eea',
        borderStyle: 'dashed',
    },
    customPeriodButtonActive: {
        backgroundColor: '#667eea',
        borderStyle: 'solid',
    },
    customPeriodText: {
        fontSize: 13,
        color: '#667eea',
        marginLeft: 8,
        fontWeight: '500',
    },
    customPeriodTextActive: {
        color: '#fff',
    },
    filterLoadingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    filterLoadingText: {
        fontSize: 13,
        color: '#667eea',
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: moderateScale(20),
    },
    loadingContainer: {
        flex: 1,
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
    categoryCard: {
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
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: moderateScale(12),
    },
    categoryFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: moderateScale(12),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    categoryStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(6),
    },
    categoryCount: {
        fontSize: moderateScale(13),
        color: '#666',
        fontWeight: '500',
    },
    categoryActions: {
        flexDirection: 'row',
        gap: moderateScale(8),
    },
    actionButton: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
    },
    editButton: {
        backgroundColor: '#f0f4ff',
    },
    deleteButton: {
        backgroundColor: '#fff0f0',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(15),
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#333',
    },
    categoryDescription: {
        fontSize: moderateScale(13),
        color: '#666',
        marginTop: moderateScale(4),
    },
    // Estilos do Modal
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: moderateScale(25),
        borderTopRightRadius: moderateScale(25),
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(20),
        paddingBottom: Platform.OS === 'ios' ? moderateScale(40) : moderateScale(20),
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
    inputGroup: {
        marginBottom: moderateScale(20),
    },
    inputLabel: {
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
    textArea: {
        height: moderateScale(80),
        textAlignVertical: 'top',
    },
    colorPalette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: moderateScale(12),
    },
    colorOption: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorOptionSelected: {
        borderColor: '#333',
        borderWidth: 3,
    },
    previewContainer: {
        marginTop: moderateScale(10),
        marginBottom: moderateScale(20),
    },
    modalButtons: {
        flexDirection: 'row',
        gap: moderateScale(12),
        marginTop: moderateScale(20),
    },
    button: {
        flex: 1,
        paddingVertical: moderateScale(15),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCancel: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    buttonCancelText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#666',
    },
    buttonSave: {
        backgroundColor: '#667eea',
    },
    buttonSaveText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#fff',
    },
});
