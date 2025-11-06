import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text,
    StyleSheet, 
    ScrollView, 
    RefreshControl,
    StatusBar,
    TouchableOpacity,
    Animated,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ScanButton } from '../components/buttons';
import { 
    HomeHeader, 
    StatsSection, 
    CategoriesSection,
    RecentReceiptsSection 
} from '../components/home';
import ProcessingNotification from '../components/ProcessingNotification';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { receipts, loading, fetchReceiptsBasic, dateList, itemCountList, storeNameList, isProcessingReceipt } = useData();
    const [refreshing, setRefreshing] = useState(false);
    const [monthSpent, setMonthSpent] = useState(0);
    const [allReceipts, setAllReceipts] = useState([]); // Estado local para não ser afetado por filtros
    const scrollY = useRef(new Animated.Value(0)).current;
    const HEADER_HEIGHT = moderateScale(170);
    const HEADER_SCROLL_DISTANCE = Platform.OS === 'ios' ? moderateScale(115) : moderateScale(110);
    

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

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -HEADER_SCROLL_DISTANCE],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE * 0.6, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0.7, 0],
        extrapolate: 'clamp',
    });

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="transparent" 
                translucent={true}
            />

            <Animated.View
                style={[
                    styles.headerContainer,
                    {
                        height: HEADER_HEIGHT,
                        transform: [{ translateY: headerTranslateY }],
                    },
                ]}
            >
                <HomeHeader userName={user?.name} opacity={headerOpacity} />
            </Animated.View>

            {/* Notificação de processamento */}
            <ProcessingNotification 
                visible={isProcessingReceipt} 
                message="A IA está categorizando sua nota fiscal..."
            />

            <Animated.ScrollView 
                style={styles.content}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: HEADER_HEIGHT },
                ]}
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

                <CategoriesSection />

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
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: moderateScale(40),
    },
    addButton: {
        marginBottom: moderateScale(30),
        marginTop: theme.spacing.sm,
    },
});
