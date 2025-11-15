import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
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
import { SkeletonStatCard, SkeletonReceiptCard } from '../components/common';
import ProcessingNotification from '../components/ProcessingNotification';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';
import { useStatusBarColor } from '../hooks/useStatusBarColor';

export default function HomeScreen({ navigation }) {
    const { isConnected } = useData();
    const { user } = useAuth();
    
    // Hook para definir a cor da StatusBar
    useStatusBarColor('#667eea', 'light-content');
    const { receipts, loading, fetchReceiptsBasic, dateList, itemCountList, storeNameList, isProcessingReceipt } = useData();
    const [refreshing, setRefreshing] = useState(false);
    const [monthSpent, setMonthSpent] = useState(0);
    const [allReceipts, setAllReceipts] = useState([]); // Estado local para não ser afetado por filtros
    const [initialLoading, setInitialLoading] = useState(true); // ⚡ Loading apenas na primeira carga
    const isLoadingRef = useRef(false); // ⚡ Ref para prevenir múltiplas chamadas simultâneas
    const scrollY = useRef(new Animated.Value(0)).current;
    const HEADER_HEIGHT = moderateScale(170);
    const HEADER_SCROLL_DISTANCE = Platform.OS === 'ios' ? moderateScale(115) : moderateScale(110);
    

    useEffect(() => {
        loadData();
    }, []);

    // Observa mudanças nos receipts do contexto (ex: após deletar uma nota)
    useEffect(() => {
        if (receipts && receipts.length >= 0) {
            setAllReceipts(receipts);
        }
    }, [receipts]);

    // Recarrega dados toda vez que a tela ganhar foco (ex: voltar de deletar uma nota)
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    // Recarrega dados quando a notificação de processamento desaparecer
    useEffect(() => {
        if (!isProcessingReceipt) {
            loadData();
        }
    }, [isProcessingReceipt]);

    // Recalcula o total do mês sempre que allReceipts mudar
    useEffect(() => {
        calculateMonthlyTotal();
    }, [allReceipts]);

    const loadData = async () => {
        // ⚡ Previne múltiplas chamadas simultâneas
        if (isLoadingRef.current) {
            return;
        }

        try {
            isLoadingRef.current = true;
            const data = await fetchReceiptsBasic();
            // Salva uma cópia local dos receipts para não ser afetado por filtros de outras telas
            setAllReceipts(data || receipts);
            setInitialLoading(false); // ⚡ Marca que a primeira carga foi concluída
        } catch (error) {
            // Erro já tratado no DataContext
            setInitialLoading(false);
        } finally {
            isLoadingRef.current = false;
        }
    };

    const calculateMonthlyTotal = () => {
        try {
            if (!allReceipts || allReceipts.length === 0) {
                setMonthSpent(0);
                return;
            }

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
                {initialLoading && allReceipts.length === 0 ? (
                    <>
                        {/* Skeleton Loading - apenas na primeira carga */}
                        <View style={styles.statsSkeletonRow}>
                            <SkeletonStatCard />
                            <SkeletonStatCard />
                        </View>
                        <View style={styles.statsSkeletonRow}>
                            <SkeletonStatCard />
                        </View>
                        <View style={styles.sectionSkeleton}>
                            <SkeletonReceiptCard />
                            <SkeletonReceiptCard />
                            <SkeletonReceiptCard />
                        </View>
                    </>
                ) : (
                    <>
                        <StatsSection 
                            totalSpent={totalSpent}
                            monthSpent={monthSpent}
                            receiptsCount={allReceipts.length}
                        />

                        {/* ✅ Notas Recentes ACIMA de Categorias */}
                        <RecentReceiptsSection 
                            loading={false}
                            receipts={allReceipts}
                            storeNameList={storeNameList}
                            itemCountList={itemCountList}
                            dateList={dateList}
                            onReceiptPress={(receiptId) => navigation.navigate('Preview', { receiptId })}
                            onViewAll={() => navigation.navigate('History')}
                        />

                        <CategoriesSection />

                        {isConnected && (
                            <ScanButton 
                                title="Adicionar Nota Manualmente"
                                iconName="add-circle"
                                onPress={() => navigation.navigate('ManualReceipt')}
                                style={styles.addButton}
                            />
                        )}
                    </>
                )}
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
    statsSkeletonRow: {
        flexDirection: 'row',
        marginBottom: moderateScale(12),
        gap: moderateScale(12),
    },
    sectionSkeleton: {
        marginTop: moderateScale(20),
    },
});
