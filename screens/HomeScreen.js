import React, { useState, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    RefreshControl,
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

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { receipts, loading, fetchReceiptsBasic, dateList, itemCountList, storeNameList } = useData();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

 const loadData = async () => {
        try {
            await fetchReceiptsBasic();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
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
        <View style={styles.container}>
            <HomeHeader 
                userName={user?.name}
                onQRPress={() => navigation.navigate('Scan')}
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
                    monthSpent={2} // TODO: calcular gasto mensal real
                    receiptsCount={receipts.length}
                />

                <TopCategoriesSection categories={topCategories} />

                <RecentReceiptsSection 
                    loading={loading}
                    receipts={receipts}
                    storeNameList={storeNameList}
                    itemCountList={itemCountList}
                    dateList={dateList}
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
        paddingHorizontal: 20,
        marginTop: -20,
    },
    addButton: {
        marginBottom: 30,
        marginTop: 10,
    },
});
