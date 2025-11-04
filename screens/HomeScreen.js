import React, { useState, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    RefreshControl,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

    useEffect(() => {
        loadData();
        loadMonthlyTotal();
    }, []);

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
            
            const monthReceipts = await fetchReceiptsByPeriod(startDate, endDate);
            const total = monthReceipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
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
            
            <HomeHeader 
                userName={user?.name}
            />

            {/* Notificação de processamento */}
            <ProcessingNotification 
                visible={isProcessingReceipt} 
                message="A IA está categorizando sua nota fiscal..."
            />

            <ScrollView 
                style={styles.content}
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

                <RecentReceiptsSection 
                    loading={loading}
                    receipts={receipts}
                    storeNameList={storeNameList}
                    itemCountList={itemCountList}
                    dateList={dateList}
                    onReceiptPress={(receiptId) => navigation.navigate('Preview', { receiptId })}
                    onViewAll={() => navigation.navigate('History')}
                />

                <ScanButton 
                    title="Escanear Nova Nota"
                    onPress={() => navigation.navigate('Scan')}
                    style={styles.addButton}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: -20,
    },
    addButton: {
        marginBottom: 30,
        marginTop: 10,
    },
});
