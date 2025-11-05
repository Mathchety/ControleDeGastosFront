//Tela apenas para testes do gráfico de categorias




import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator,
    Platform,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { PieChartCategories } from '../components/charts';

export default function GraphicsScreenTest({ navigation }) {
    const { fetchCategoriesGraph, loading, receipts } = useData();
    const [categories, setCategories] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('all');

    useEffect(() => {
        loadCategories();
    }, [selectedPeriod]);

    const loadCategories = async () => {
        try {
            let startDate = null;
            let endDate = null;

            if (selectedPeriod === 'current') {
                // Mês atual
                const now = new Date();
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = now;
            } else if (selectedPeriod === 'last') {
                // Mês passado
                const now = new Date();
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Último dia do mês passado
            } else if (selectedPeriod === 'all') {
                // Todos - busca da nota mais antiga até hoje
                if (receipts && receipts.length > 0) {
                    // Encontra a data mais antiga nos receipts
                    const dates = receipts.map(r => new Date(r.date));
                    const oldestDate = new Date(Math.min(...dates));
                    
                    startDate = oldestDate;
                    endDate = new Date();
                    
                    console.log('[Graphics] Período "Todos":', startDate.toLocaleDateString(), 'até', endDate.toLocaleDateString());
                } else {
                    // Se não tiver receipts, usa último ano
                    const now = new Date();
                    startDate = new Date(now.getFullYear() - 1, 0, 1);
                    endDate = now;
                }
            }

            const data = await fetchCategoriesGraph(startDate, endDate);
            setCategories(data);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    };

    const renderPeriodButton = (period, label, icon) => (
        <TouchableOpacity
            style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
            activeOpacity={0.7}
        >
            <Ionicons 
                name={icon} 
                size={18} 
                color={selectedPeriod === period ? '#fff' : '#667eea'} 
            />
            <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="#667eea" 
                translucent={false}
            />
            
            <LinearGradient 
                colors={['#667eea', '#764ba2']} 
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Análise de Gastos</Text>
                <Text style={styles.headerSubtitle}>Visualize seus gastos por categoria</Text>
            </LinearGradient>

            {/* Filtros de período */}
            <View style={styles.filtersContainer}>
                <View style={styles.filtersRow}>
                    {renderPeriodButton('all', 'Todos', 'infinite')}
                    {renderPeriodButton('current', 'Mês Atual', 'calendar')}
                    {renderPeriodButton('last', 'Mês Passado', 'calendar-outline')}
                </View>
            </View>

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#667eea" />
                        <Text style={styles.loadingText}>Carregando dados...</Text>
                    </View>
                ) : (
                    <PieChartCategories categories={categories} />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 20 : 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 5,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },
    filtersContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filtersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    periodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    periodButtonActive: {
        backgroundColor: '#667eea',
    },
    periodButtonText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    periodButtonTextActive: {
        color: '#fff',
    },
});
