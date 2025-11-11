import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';
import { useData } from '../../contexts/DataContext';

const screenWidth = Dimensions.get('window').width;

// Paleta de cores para o gráfico
const COLORS = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0',
    '#a8edea', '#fed6e3', '#c471ed', '#12c2e9',
    '#f5af19', '#f12711', '#5f72bd', '#9921e8'
];

// ⚡ Estado global para prevenir remontagens causarem loops
let globalIsLoading = false;
let globalHasLoaded = false;
let globalLastFilter = 'month'; // ⚡ Rastreia último filtro usado
let globalLastProcessingState = null; // ⚡ Rastreia último estado de processamento
let globalCurrentFilter = 'month'; // ⚡ Filtro global que persiste entre remontagens

const CategoriesSectionComponent = () => {
    const navigation = useNavigation();
    const { fetchCategoriesGraph, isProcessingReceipt } = useData();
    const scrollViewRef = useRef(null); // ✨ Ref para ScrollView
    const isLoadingRef = useRef(false); // ⚡ Ref para prevenir múltiplas chamadas simultâneas
    const [graphData, setGraphData] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false); // ⚡ Loading para trocar filtros
    const [filterPeriod, setFilterPeriod] = useState(globalCurrentFilter); // ⚡ Inicializa com o filtro global
    const [customDateModalVisible, setCustomDateModalVisible] = useState(false); // ✨ Modal para período customizado
    const [showStartPicker, setShowStartPicker] = useState(false); // ✨ Controla picker de data inicial
    const [showEndPicker, setShowEndPicker] = useState(false); // ✨ Controla picker de data final
    const [tempStartDate, setTempStartDate] = useState(new Date()); // ✨ Data temporária
    const [tempEndDate, setTempEndDate] = useState(new Date()); // ✨ Data temporária
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    // ⚡ Função para mudar filtro que atualiza tanto o estado local quanto o global
    const changeFilterPeriod = (newFilter) => {
        console.log('[CategoriesSection] changeFilterPeriod chamado com:', newFilter);
        
        // ⚡ Só atualiza globalCurrentFilter, NÃO atualiza globalLastFilter ainda
        // O useEffect vai detectar a mudança e atualizar globalLastFilter
        globalCurrentFilter = newFilter;
        setFilterPeriod(newFilter);
    };

    // ✅ Carrega dados APENAS na primeira montagem GLOBAL
    useEffect(() => {
        if (!globalHasLoaded) {
            console.log('[CategoriesSection] Primeira montagem GLOBAL - carregando dados');
            globalHasLoaded = true;
            globalLastFilter = filterPeriod;
            loadGraphData();
        } else {
            console.log('[CategoriesSection] Remontagem detectada - verificando filtro (global:', globalCurrentFilter, 'local:', filterPeriod, ')');
            // ⚡ Se na remontagem o filtro local for diferente do global, sincroniza
            if (filterPeriod !== globalCurrentFilter) {
                console.log('[CategoriesSection] Sincronizando filtro na remontagem:', globalCurrentFilter);
                setFilterPeriod(globalCurrentFilter);
            }
        }
    }, []); // ⚡ Array vazio - só roda na montagem

    // ✅ Recarrega quando trocar filtro (mas não na primeira vez)
    useEffect(() => {
        if (globalHasLoaded && globalLastFilter !== filterPeriod) {
            console.log('[CategoriesSection] Filtro REALMENTE mudou de', globalLastFilter, 'para:', filterPeriod);
            globalLastFilter = filterPeriod;
            globalCurrentFilter = filterPeriod;
            loadGraphData();
        } else if (globalHasLoaded && globalLastFilter === filterPeriod) {
            console.log('[CategoriesSection] Filtro', filterPeriod, 'já é o mesmo - IGNORANDO');
        }
    }, [filterPeriod]);

    // ✅ Recarrega o gráfico quando a notificação de processamento desaparecer
    useEffect(() => {
        // ⚡ Só recarrega se o estado REALMENTE mudou de true para false
        if (globalLastProcessingState === true && isProcessingReceipt === false && globalHasLoaded) {
            console.log('[CategoriesSection] Processamento FINALIZADO - recarregando dados');
            globalLastProcessingState = isProcessingReceipt;
            loadGraphData();
        } else {
            console.log('[CategoriesSection] isProcessingReceipt:', isProcessingReceipt, '(anterior:', globalLastProcessingState, ') - IGNORANDO');
            globalLastProcessingState = isProcessingReceipt;
        }
    }, [isProcessingReceipt]);

    const loadGraphData = async () => {
        // ⚡ Previne múltiplas chamadas simultâneas GLOBALMENTE
        if (globalIsLoading) {
            console.log('[CategoriesSection] Já está carregando GLOBALMENTE, ignorando chamada duplicada');
            return;
        }

        try {
            globalIsLoading = true;
            isLoadingRef.current = true;
            setFilterLoading(true); // ⚡ Ativa loading ao trocar filtro
            let start, end;
            const today = new Date();

            switch (filterPeriod) {
                case 'week':
                    // Semana atual (últimos 7 dias a partir de hoje)
                    end = new Date();
                    start = new Date();
                    start.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    // Mês atual (do dia 1 até hoje)
                    end = new Date();
                    start = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'all':
                    // Pega data desde 1999 para incluir tudo
                    start = new Date(1999, 0, 1);
                    end = new Date();
                    break;
                case 'custom':
                    start = startDate;
                    end = endDate;
                    break;
                default:
                    end = new Date();
                    start = new Date(today.getFullYear(), today.getMonth(), 1);
            }

            const graphResponse = await fetchCategoriesGraph(start, end);
            setGraphData(graphResponse || []);
            // Atualiza também as categorias do modal com os mesmos dados
            setAllCategories(graphResponse || []);
        } catch (error) {
            // Erro já tratado no DataContext
        } finally {
            setFilterLoading(false); // ⚡ Desativa loading
            isLoadingRef.current = false;
            globalIsLoading = false;
        }
    };

    const handleCategoryPress = (category) => {
        // ⚡ Fecha o modal se estiver aberto
        setModalVisible(false);
        
        // ⚡ Navegação direta para CategoryDetails (mesmo componente usado na tela de categorias)
        navigation.navigate('CategoryDetails', { category });
    };

    // ✨ Abre modal para selecionar período customizado
    const handleOpenCustomPeriod = () => {
        setTempStartDate(startDate);
        setTempEndDate(endDate);
        setCustomDateModalVisible(true);
    };

    // ✨ Aplica o período customizado
    const handleApplyCustomPeriod = () => {
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        changeFilterPeriod('custom'); // ⚡ Usa função wrapper
        setCustomDateModalVisible(false);
        // ⚡ Força reload após aplicar período customizado
        setTimeout(() => loadGraphData(), 100);
    };

    // ✨ Cancela seleção de período customizado
    const handleCancelCustomPeriod = () => {
        setCustomDateModalVisible(false);
        setShowStartPicker(false);
        setShowEndPicker(false);
    };

    // ✨ Abre picker de data inicial
    const handleOpenStartPicker = () => {
        setShowStartPicker(true);
        setShowEndPicker(false);
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 80, animated: true });
        }, 200);
    };

    // ✨ Confirma data inicial
    const handleConfirmStartDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowStartPicker(false);
        }
        
        if (event.type === 'set' && selectedDate) {
            setTempStartDate(selectedDate);
            if (Platform.OS === 'ios') {
                setShowStartPicker(false);
            }
        } else if (event.type === 'dismissed') {
            setShowStartPicker(false);
        }
    };

    // ✨ Abre picker de data final
    const handleOpenEndPicker = () => {
        setShowEndPicker(true);
        setShowStartPicker(false);
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 350, animated: true });
        }, 200);
    };

    // ✨ Confirma data final
    const handleConfirmEndDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowEndPicker(false);
        }
        
        if (event.type === 'set' && selectedDate) {
            setTempEndDate(selectedDate);
            if (Platform.OS === 'ios') {
                setShowEndPicker(false);
            }
        } else if (event.type === 'dismissed') {
            setShowEndPicker(false);
        }
    };

    // Prepara dados para o gráfico - ordenado por valor (maior para menor)
    const sortedGraphData = [...graphData].sort((a, b) => b.total - a.total);
    
    const chartData = sortedGraphData.slice(0, 5).map((cat, index) => ({
        name: cat.name,
        population: cat.total,
        color: COLORS[index % COLORS.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
    }));

    // Top 3 categorias (já ordenadas) com cores do gráfico
    const top3Categories = sortedGraphData.slice(0, 3).map((cat, index) => ({
        ...cat,
        color: cat.color || COLORS[index % COLORS.length], // ⚡ Adiciona cor se não existir
    }));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Categorias</Text>
            </View>

            {/* Card do Gráfico com Filtros e Botão Ver Mais */}
            <View style={styles.chartCard}>
                {/* Filtros de Período */}
                <View style={styles.filtersRow}>
                    <TouchableOpacity
                        style={[styles.filterChip, filterPeriod === 'week' && styles.filterChipActive]}
                        onPress={() => changeFilterPeriod('week')}
                    >
                        <Text style={[styles.filterChipText, filterPeriod === 'week' && styles.filterChipTextActive]}>
                            Semana
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.filterChip, filterPeriod === 'month' && styles.filterChipActive]}
                        onPress={() => changeFilterPeriod('month')}
                    >
                        <Text style={[styles.filterChipText, filterPeriod === 'month' && styles.filterChipTextActive]}>
                            Mês
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.filterChip, filterPeriod === 'all' && styles.filterChipActive]}
                        onPress={() => changeFilterPeriod('all')}
                    >
                        <Text style={[styles.filterChipText, filterPeriod === 'all' && styles.filterChipTextActive]}>
                            Tudo
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterChip, filterPeriod === 'custom' && styles.filterChipActive]}
                        onPress={handleOpenCustomPeriod}
                    >
                        <Ionicons 
                            name="calendar-outline" 
                            size={14} 
                            color={filterPeriod === 'custom' ? '#fff' : '#667eea'} 
                        />
                    </TouchableOpacity>
                </View>

                {/* ⚡ Container com altura fixa para evitar redimensionamento */}
                <View style={styles.chartFixedContainer}>
                    {/* ⚡ Loading ao trocar filtros */}
                    {filterLoading ? (
                        <View style={styles.filterLoadingContainer}>
                            <ActivityIndicator size="large" color="#667eea" />
                            <Text style={styles.filterLoadingText}>Atualizando dados...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Gráfico de Pizza */}
                            {chartData.length > 0 ? (
                                <View style={styles.chartContainer}>
                                    <PieChart
                                        data={chartData}
                                        width={screenWidth - moderateScale(80)}
                                        height={220}
                                        chartConfig={{
                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        }}
                                        accessor="population"
                                        backgroundColor="transparent"
                                        paddingLeft="0"
                                        center={[(screenWidth - moderateScale(80)) / 4, 0]}
                                        absolute
                                        hasLegend={false}
                                    />
                                </View>
                            ) : (
                                <View style={styles.emptyChart}>
                                    <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
                                    <Text style={styles.emptyChartText}>Nenhum dado para o período selecionado</Text>
                                </View>
                            )}
                        </>
                    )}
                </View>

                {/* Botão Ver Mais Categorias - Maior */}
                <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="list" size={20} color="#667eea" />
                    <Text style={styles.viewAllButtonText}>Ver Detalhes das Categorias</Text>
                    <Ionicons name="arrow-forward" size={18} color="#667eea" />
                </TouchableOpacity>
                
                {/* Dica para ir para aba Categories */}
                <Text style={styles.tabHint}>
                    Para gerenciar categorias, acesse a aba "Categorias"
                </Text>
            </View>

            {/* ✨ Modal de Período Customizado */}
            <Modal
                visible={customDateModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCancelCustomPeriod}
            >
                <TouchableOpacity 
                    style={styles.customDateOverlay}
                    activeOpacity={1}
                    onPress={handleCancelCustomPeriod}
                >
                    <TouchableOpacity 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.customDateModal}>
                            <View style={styles.customDateHeader}>
                                <Text style={styles.customDateTitle}>Período Customizado</Text>
                                <TouchableOpacity onPress={handleCancelCustomPeriod}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView 
                                ref={scrollViewRef}
                                style={styles.customDateScrollView}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.customDateContent}>
                                    {/* Data Inicial */}
                                    <View style={styles.dateRow}>
                                        <Text style={styles.dateLabel}>Data Inicial:</Text>
                                        <TouchableOpacity 
                                            style={styles.dateButton}
                                            onPress={handleOpenStartPicker}
                                        >
                                            <Ionicons name="calendar" size={20} color="#667eea" />
                                            <Text style={styles.dateText}>
                                                {tempStartDate.toLocaleDateString('pt-BR')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* ✨ DateTimePicker para Data Inicial */}
                                    {showStartPicker && (
                                        <View style={styles.datePickerContainer}>
                                            <DateTimePicker
                                                value={tempStartDate}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                                onChange={handleConfirmStartDate}
                                                maximumDate={new Date()}
                                                locale="pt-BR"
                                                textColor="#333"
                                                accentColor="#667eea"
                                                themeVariant="light"
                                            />
                                        </View>
                                    )}

                                    <View style={styles.dateDivider} />

                                    {/* Data Final */}
                                    <View style={styles.dateRow}>
                                        <Text style={styles.dateLabel}>Data Final:</Text>
                                        <TouchableOpacity 
                                            style={styles.dateButton}
                                            onPress={handleOpenEndPicker}
                                        >
                                            <Ionicons name="calendar" size={20} color="#667eea" />
                                            <Text style={styles.dateText}>
                                                {tempEndDate.toLocaleDateString('pt-BR')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* ✨ DateTimePicker para Data Final */}
                                    {showEndPicker && (
                                        <View style={styles.datePickerContainer}>
                                            <DateTimePicker
                                                value={tempEndDate}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                                onChange={handleConfirmEndDate}
                                                maximumDate={new Date()}
                                                minimumDate={tempStartDate}
                                                locale="pt-BR"
                                                textColor="#333"
                                                accentColor="#667eea"
                                                themeVariant="light"
                                            />
                                        </View>
                                    )}

                                    {/* Atalhos Rápidos */}
                                    <View style={styles.quickFilters}>
                                        <Text style={styles.quickFiltersLabel}>Atalhos:</Text>
                                        <View style={styles.quickFiltersRow}>
                                            <TouchableOpacity 
                                                style={styles.quickFilterChip}
                                                onPress={() => {
                                                    const end = new Date();
                                                    const start = new Date();
                                                    start.setDate(end.getDate() - 7);
                                                    setTempStartDate(start);
                                                    setTempEndDate(end);
                                                }}
                                            >
                                                <Text style={styles.quickFilterText}>Últimos 7 dias</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={styles.quickFilterChip}
                                                onPress={() => {
                                                    const end = new Date();
                                                    const start = new Date();
                                                    start.setDate(end.getDate() - 30);
                                                    setTempStartDate(start);
                                                    setTempEndDate(end);
                                                }}
                                            >
                                                <Text style={styles.quickFilterText}>Últimos 30 dias</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Botões de Ação */}
                            <View style={styles.customDateButtons}>
                                <TouchableOpacity 
                                    style={styles.customDateCancelButton}
                                    onPress={handleCancelCustomPeriod}
                                >
                                    <Text style={styles.customDateCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.customDateApplyButton}
                                    onPress={handleApplyCustomPeriod}
                                >
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        style={styles.customDateApplyGradient}
                                    >
                                        <Text style={styles.customDateApplyText}>Aplicar</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Top 3 Categorias */}
            <View style={styles.categoriesList}>
                {top3Categories.map((category, index) => (
                    <TouchableOpacity
                        key={category.id || index}
                        style={styles.categoryCard}
                        onPress={() => handleCategoryPress(category)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.categoryLeft}>
                            <View style={[styles.colorDot, { backgroundColor: category.color }]} />
                            <View style={styles.categoryInfo}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <Text style={styles.categoryCount}>{category.itemCount || 0} itens</Text>
                            </View>
                        </View>
                        <View style={styles.categoryRight}>
                            <Text style={styles.categoryValue}>R$ {parseFloat(category.total || 0).toFixed(2)}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Modal - Todas as Categorias */}
            <Modal
                visible={modalVisible}
                animationType="fade" // ✨ Mudado de "slide" para "fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
                statusBarTranslucent={true} // ✨ Melhor comportamento no Android
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity 
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    />
                    <View style={[styles.modalContent, styles.modalSlideIn]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Todas as Categorias</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalScroll}>
                            {[...allCategories].sort((a, b) => b.total - a.total).map((category, index) => {
                                // ⚡ Adiciona cor da paleta se não existir
                                const categoryWithColor = {
                                    ...category,
                                    color: category.color || COLORS[index % COLORS.length],
                                };
                                
                                return (
                                    <TouchableOpacity
                                        key={category.id || index}
                                        style={styles.modalCategoryCard}
                                        onPress={() => handleCategoryPress(categoryWithColor)}
                                    >
                                        <View style={styles.categoryLeft}>
                                            <View style={[styles.colorDot, { backgroundColor: COLORS[index % COLORS.length] }]} />
                                            <View style={styles.categoryInfo}>
                                                <Text style={styles.categoryName}>{category.name}</Text>
                                                <Text style={styles.categoryCount}>{category.itemCount || 0} itens</Text>
                                            </View>
                                        </View>
                                        <View style={styles.modalCategoryRight}>
                                            <Text style={styles.categoryValue}>R$ {parseFloat(category.total || 0).toFixed(2)}</Text>
                                            <Ionicons name="chevron-forward" size={20} color="#999" />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#333',
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: moderateScale(16),
        marginBottom: theme.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    filtersRow: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.md,
    },
    filterChip: {
        flex: 1,
        paddingVertical: moderateScale(8),
        paddingHorizontal: moderateScale(12),
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipActive: {
        backgroundColor: '#667eea',
    },
    filterChipText: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#666',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    chartFixedContainer: {
        minHeight: 280, // ⚡ Altura fixa para evitar redimensionamento
        justifyContent: 'center',
    },
    emptyChart: {
        alignItems: 'center',
        paddingVertical: moderateScale(40),
    },
    emptyChartText: {
        marginTop: theme.spacing.sm,
        fontSize: moderateScale(14),
        color: '#999',
    },
    filterLoadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(60),
    },
    filterLoadingText: {
        marginTop: theme.spacing.md,
        fontSize: moderateScale(14),
        color: '#667eea',
        fontWeight: '600',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0ff',
        paddingVertical: moderateScale(14),
        paddingHorizontal: moderateScale(20),
        borderRadius: 12,
        gap: theme.spacing.xs,
    },
    viewAllButtonText: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: '#667eea',
    },
    tabHint: {
        fontSize: moderateScale(12),
        color: '#999',
        textAlign: 'center',
        marginTop: moderateScale(12),
        fontStyle: 'italic',
    },
    seeAllButton: {
        fontSize: moderateScale(14),
        color: '#667eea',
        fontWeight: '600',
    },
    categoriesList: {
        gap: theme.spacing.sm,
    },
    categoryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: moderateScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: theme.spacing.sm,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: moderateScale(13),
        color: '#999',
    },
    categoryValue: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#667eea',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✨ Fundo semi-transparente ao invés de preto
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        maxHeight: '90%',
    },
    modalSlideIn: {
        // ✨ Animação suave de entrada
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#333',
    },
    modalScroll: {
        marginBottom: theme.spacing.lg,
    },
    modalCategoryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: moderateScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalCategoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: moderateScale(16),
        marginBottom: theme.spacing.sm,
    },
    itemInfo: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    itemName: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: moderateScale(13),
        color: '#666',
    },
    itemTotal: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#667eea',
    },
    loader: {
        marginTop: moderateScale(40),
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: moderateScale(14),
        marginTop: moderateScale(40),
    },
    // ✨ Estilos do Modal de Período Customizado
    customDateOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    customDateModal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: 400,
        height: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    customDateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    customDateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    customDateScrollView: {
        flex: 1,
    },
    customDateContent: {
        padding: 20,
    },
    dateRow: {
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 12,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    datePickerContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginTop: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dateDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 16,
    },
    quickFilters: {
        marginTop: 20,
    },
    quickFiltersLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
    },
    quickFiltersRow: {
        flexDirection: 'row',
        gap: 8,
    },
    quickFilterChip: {
        flex: 1,
        backgroundColor: '#f0f4ff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    quickFilterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#667eea',
    },
    customDateButtons: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    customDateCancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
    },
    customDateCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    customDateApplyButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    customDateApplyGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    customDateApplyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

// ⚡ Usa React.memo para evitar re-renderizações desnecessárias
export const CategoriesSection = React.memo(CategoriesSectionComponent);
