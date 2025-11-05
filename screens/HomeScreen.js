import React, { useState, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    RefreshControl,
    Platform,
    StatusBar,
    TouchableOpacity,
    Text,
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

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { receipts, loading, fetchReceiptsBasic, fetchReceiptsByPeriod, dateList, itemCountList, storeNameList, isProcessingReceipt } = useData();
    const [refreshing, setRefreshing] = useState(false);
    const [monthSpent, setMonthSpent] = useState(0);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // Recalcula o total mensal sempre que receipts mudar
        if (receipts.length > 0) {
            loadMonthlyTotal();
        }
    }, [receipts]);

    const loadData = async () => {
        try {
            await fetchReceiptsBasic();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const loadMonthlyTotal = async () => {
        try {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const today = new Date();
            
            // Formatar datas para YYYY-MM-DD
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            const startDate = formatDate(firstDayOfMonth);
            const endDate = formatDate(today);
            
            console.log('[Home] Calculando total mensal de', startDate, 'até', endDate);
            
            // Calcula localmente sem sobrescrever o estado global
            const monthReceipts = receipts.filter(r => {
                const receiptDate = new Date(r.date);
                const receiptDateStr = formatDate(receiptDate);
                return receiptDateStr >= startDate && receiptDateStr <= endDate;
            });
            
            const total = monthReceipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
            console.log('[Home] Total mensal calculado:', total, 'de', monthReceipts.length, 'notas');
            setMonthSpent(total);
        } catch (error) {
            console.error('Erro ao calcular total do mês:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        await loadMonthlyTotal();
        setRefreshing(false);
    };

    // Calcular estatísticas reais a partir das notas fiscais
    const totalSpent = receipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
        
    // Agrupar por categoria
    const categoryTotals = {};
    receipts.forEach(receipt => {
        receipt.items?.forEach(item => {
            const cat = item.category_name || 'Outros';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(item.total_price || 0);
        });
    });
    
    const topCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="#667eea" 
                translucent={false}
            />
            
            {/* Header fixo com zIndex alto para ficar na frente */}
            <View style={styles.headerContainer}>
                <HomeHeader 
                    userName={user?.name}
                />
            </View>

            {/* Notificação de processamento */}
            <ProcessingNotification 
                visible={isProcessingReceipt} 
                message="A IA está categorizando sua nota fiscal..."
            />

            <ScrollView 
                style={styles.content}
                contentContainerStyle={{ 
                    paddingTop: insets.top + 95, // Espaço dinâmico baseado na safe area + altura do header (reduzido)
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <StatsSection 
                    totalSpent={totalSpent}
                    monthSpent={monthSpent}
                    receiptsCount={receipts.length}
                />

                <TopCategoriesSection categories={topCategories} />

                <ScanButton 
                    title="Escanear Nova Nota"
                    onPress={() => navigation.navigate('Scan')}
                    style={styles.addButton}
                />

                <RecentReceiptsSection 
                    loading={loading}
                    receipts={receipts}
                    storeNameList={storeNameList}
                    itemCountList={itemCountList}
                    dateList={dateList}
                    onReceiptPress={(receiptId) => navigation.navigate('Preview', { receiptId })}
                    onViewAll={() => navigation.navigate('History')}
                />

                {/* Botão para ver gráficos */}
                <TouchableOpacity 
                    style={styles.graphicsButton}
                    onPress={() => navigation.navigate('GraphicsScreenTest')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="bar-chart" size={24} color="#667eea" />
                    <Text style={styles.graphicsButtonText}>Ver Análise de Gastos</Text>
                    <Ionicons name="arrow-forward" size={20} color="#667eea" />
                </TouchableOpacity>
            </ScrollView>
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
        paddingHorizontal: 20,
    },
    addButton: {
        marginBottom: 20,
        marginTop: 10,
    },
    graphicsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    graphicsButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#667eea',
        marginLeft: 10,
        marginRight: 10,
        flex: 1,
    },
});
