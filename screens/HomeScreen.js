import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text,
    StyleSheet, 
    ScrollView, 
    RefreshControl,
    Platform,
    StatusBar,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ScanButton } from '../components/buttons';
import { 
    HomeHeader, 
    StatsSection, 
    TopCategoriesSection, 
    RecentReceiptsSection 
} from '../components/home';
import ProcessingNotification from '../components/ProcessingNotification';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { receipts, loading, fetchReceiptsBasic, fetchReceiptsByPeriod, dateList, itemCountList, storeNameList, isProcessingReceipt } = useData();
    const [refreshing, setRefreshing] = useState(false);
    const [monthSpent, setMonthSpent] = useState(0);
    const [allReceipts, setAllReceipts] = useState([]); // Estado local para não ser afetado por filtros
    const insets = useSafeAreaInsets();
    
    // Animação do header
    const scrollY = useRef(new Animated.Value(0)).current;
    const HEADER_MAX_HEIGHT = 140;
    const HEADER_MIN_HEIGHT = 70;
    const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

    useEffect(() => {
        loadData();
    }, []);

    // Recalcula o total do mês sempre que allReceipts mudar
    useEffect(() => {
        if (allReceipts.length > 0) {
            calculateMonthlyTotal();
        }
    }, [allReceipts]);

    const loadData = async () => {
        try {
            const data = await fetchReceiptsBasic();
            // Salva uma cópia local dos receipts para não ser afetado por filtros de outras telas
            setAllReceipts(data || receipts);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const calculateMonthlyTotal = () => {
        try {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            // Filtra receipts do mês atual usando o estado local (não afetado por filtros de outras telas)
            const monthReceipts = allReceipts.filter(receipt => {
                if (!receipt.date) return false;
                
                const receiptDate = new Date(receipt.date);
                return receiptDate.getMonth() === currentMonth && 
                       receiptDate.getFullYear() === currentYear;
            });
            
            const total = monthReceipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
            setMonthSpent(total);
        } catch (error) {
            console.error('[Home] Erro ao calcular total do mês:', error);
            setMonthSpent(0);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        // calculateMonthlyTotal() será chamado automaticamente pelo useEffect
        setRefreshing(false);
    };

    // Calcular estatísticas reais a partir do estado local (não afetado por filtros)
    const totalSpent = allReceipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
        
    // Agrupar por categoria usando o estado local
    const categoryTotals = {};
    allReceipts.forEach(receipt => {
        receipt.items?.forEach(item => {
            const cat = item.category_name || 'Outros';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(item.total_price || 0);
        });
    });
    
    const topCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // Animação da altura do header
    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    // Animação da opacidade do texto
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0.5, 0],
        extrapolate: 'clamp',
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="#667eea" 
                translucent={false}
            />
            
            {/* Header animado com zIndex alto para ficar na frente */}
            <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
                <HomeHeader 
                    userName={user?.name}
                    opacity={headerOpacity}
                />
            </Animated.View>

            {/* Notificação de processamento */}
            <ProcessingNotification 
                visible={isProcessingReceipt} 
                message="A IA está categorizando sua nota fiscal..."
            />

            <Animated.ScrollView 
                style={styles.content}
                contentContainerStyle={{ 
                    paddingTop: HEADER_MAX_HEIGHT, // Espaço para o header
                }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <StatsSection 
                    totalSpent={totalSpent}
                    monthSpent={monthSpent}
                    receiptsCount={allReceipts.length}
                />

                <TopCategoriesSection categories={topCategories} />

                <RecentReceiptsSection 
                    loading={loading}
                    receipts={allReceipts}
                    storeNameList={storeNameList}
                    itemCountList={itemCountList}
                    dateList={dateList}
                    onReceiptPress={(receiptId) => navigation.navigate('Preview', { receiptId })}
                    onViewAll={() => navigation.navigate('History')}
                />

                {/* Botão para acessar a tela de gráficos */}
                <TouchableOpacity 
                    style={styles.graphicsButton}
                    onPress={() => navigation.navigate('GraphicsScreenTest')}
                >
                    <View style={styles.graphicsButtonContent}>
                        <View style={styles.graphicsButtonLeft}>
                            <Ionicons name="bar-chart" size={24} color={theme.colors.primary} />
                            <Text style={styles.graphicsButtonText}>Ver Análise de Gastos</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                <ScanButton 
                    title="Escanear Nova Nota"
                    onPress={() => navigation.navigate('Scan')}
                    style={styles.addButton}
                />
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        elevation: 10,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    graphicsButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: moderateScale(16),
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    graphicsButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    graphicsButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    graphicsButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#333',
    },
    addButton: {
        marginBottom: moderateScale(30),
        marginTop: theme.spacing.sm,
    },
});
