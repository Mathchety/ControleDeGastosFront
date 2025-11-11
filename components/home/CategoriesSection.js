import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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

export const CategoriesSection = () => {
    const navigation = useNavigation();
    const { fetchCategoriesGraph, isProcessingReceipt } = useData();
    const [graphData, setGraphData] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false); // ⚡ Loading para trocar filtros
    const [filterPeriod, setFilterPeriod] = useState('month'); // 'week', 'month', 'all', 'custom'
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        // Carrega dados iniciais ao montar o componente
        loadGraphData();
    }, []);

    useEffect(() => {
        // Recarrega quando o filtro muda
        loadGraphData();
    }, [filterPeriod]);

    // Recarrega o gráfico quando a notificação de processamento desaparecer
    useEffect(() => {
        if (!isProcessingReceipt) {
            loadGraphData();
        }
    }, [isProcessingReceipt]);

    // Recarrega dados toda vez que a tela Home ganhar foco (ex: voltar de deletar nota)
    useFocusEffect(
        useCallback(() => {
            loadGraphData();
        }, [filterPeriod, startDate, endDate])
    );

    const loadGraphData = async () => {
        try {
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
                    // Pega data muito antiga para incluir tudo
                    start = new Date(2020, 0, 1);
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
        }
    };

    const handleCategoryPress = (category) => {
        // ⚡ Navegação direta e rápida - sem modal pesado!
        navigation.navigate('CategoryDetails', { category });
    };

    const handleCustomPeriod = async () => {
        setFilterPeriod('custom');
    };

    const showStartDatePicker = () => {
        setStartDatePickerVisibility(true);
    };

    const hideStartDatePicker = () => {
        setStartDatePickerVisibility(false);
    };

    const handleConfirmStartDate = (date) => {
        setStartDate(date);
        hideStartDatePicker();
        // Abre automaticamente o picker de data final
        setTimeout(() => setEndDatePickerVisibility(true), 500);
    };

    const showEndDatePicker = () => {
        setEndDatePickerVisibility(true);
    };

    const hideEndDatePicker = () => {
        setEndDatePickerVisibility(false);
    };

    const handleConfirmEndDate = (date) => {
        setEndDate(date);
        hideEndDatePicker();
        // Aplica o filtro customizado
        setTimeout(() => handleCustomPeriod(), 300);
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

    // Top 3 categorias (já ordenadas)
    const top3Categories = sortedGraphData.slice(0, 3);

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
                        onPress={() => setFilterPeriod('week')}
                    >
                        <Text style={[styles.filterChipText, filterPeriod === 'week' && styles.filterChipTextActive]}>
                            Semana
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.filterChip, filterPeriod === 'month' && styles.filterChipActive]}
                        onPress={() => setFilterPeriod('month')}
                    >
                        <Text style={[styles.filterChipText, filterPeriod === 'month' && styles.filterChipTextActive]}>
                            Mês
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.filterChip, filterPeriod === 'all' && styles.filterChipActive]}
                        onPress={() => setFilterPeriod('all')}
                    >
                        <Text style={[styles.filterChipText, filterPeriod === 'all' && styles.filterChipTextActive]}>
                            Tudo
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterChip, filterPeriod === 'custom' && styles.filterChipActive]}
                        onPress={showStartDatePicker}
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

            {/* DatePickers - Nova Biblioteca */}
            <DateTimePickerModal
                isVisible={isStartDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmStartDate}
                onCancel={hideStartDatePicker}
                maximumDate={new Date()}
                locale="pt_BR"
                confirmTextIOS="Confirmar"
                cancelTextIOS="Cancelar"
                headerTextIOS="Selecione a data inicial"
                accentColor="#667eea"
                textColor="#333"
                buttonTextColorIOS="#667eea"
            />
            
            <DateTimePickerModal
                isVisible={isEndDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmEndDate}
                onCancel={hideEndDatePicker}
                maximumDate={new Date()}
                minimumDate={startDate}
                locale="pt_BR"
                confirmTextIOS="Confirmar"
                cancelTextIOS="Cancelar"
                headerTextIOS="Selecione a data final"
                accentColor="#667eea"
                textColor="#333"
                buttonTextColorIOS="#667eea"
            />

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
                            <View style={[styles.colorDot, { backgroundColor: COLORS[index % COLORS.length] }]} />
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
                            {[...allCategories].sort((a, b) => b.total - a.total).map((category, index) => (
                                <TouchableOpacity
                                    key={category.id || index}
                                    style={styles.modalCategoryCard}
                                    onPress={() => handleCategoryPress(category)}
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
                            ))}
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
});
