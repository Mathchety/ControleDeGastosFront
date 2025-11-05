import React, { useState, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    RefreshControl,
    Platform,
    StatusBar,
} from 'react-native';
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

    return (
        <View style={styles.container}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="transparent" 
                translucent={true}
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

                <ScanButton 
                    title="Escanear Nova Nota"
                    onPress={() => navigation.navigate('Scan')}
                    style={styles.addButton}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        marginTop: moderateScale(-20),
    },
    addButton: {
        marginBottom: moderateScale(30),
        marginTop: theme.spacing.sm,
    },
});
