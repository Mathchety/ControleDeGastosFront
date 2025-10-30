import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity,
    RefreshControl,
    Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const { width } = Dimensions.get('window');

// Componente de Estatística
const StatCard = ({ icon, title, value, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
);

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { receipts, loading, fetchReceiptsBasic } = useData();
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
    
    const monthlyReceipts = receipts.filter(r => {
        const date = new Date(r.purchase_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlySpent = monthlyReceipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
    
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
            {/* Header com Gradiente */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Olá, 👋</Text>
                        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.qrButton}
                        onPress={() => navigation.navigate('Scan')}
                    >
                        <Ionicons name="qr-code-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Conteúdo */}
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Cards de Estatísticas */}
                <View style={styles.statsContainer}>
                    <StatCard 
                        icon="wallet" 
                        title="Total Gasto" 
                        value={`R$ ${totalSpent.toFixed(2)}`} 
                        color="#667eea" 
                    />
                    <StatCard 
                        icon="calendar" 
                        title="Este Mês" 
                        value={`R$ ${monthlySpent.toFixed(2)}`} 
                        color="#10b981" 
                    />
                    <StatCard 
                        icon="receipt" 
                        title="Notas Fiscais" 
                        value={receipts.length.toString()} 
                        color="#f59e0b" 
                    />
                </View>

                {/* Top Categorias */}
                {topCategories.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Top Categorias</Text>
                        </View>
                        <View style={styles.categoriesList}>
                            {topCategories.map(([category, total], index) => (
                                <View key={category} style={styles.categoryItem}>
                                    <View style={styles.categoryLeft}>
                                        <Text style={styles.categoryMedal}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                        </Text>
                                        <Text style={styles.categoryName}>{category}</Text>
                                    </View>
                                    <Text style={styles.categoryValue}>R$ {total.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Notas Recentes */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Notas Recentes</Text>
                    </View>

                    {loading && receipts.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Carregando...</Text>
                        </View>
                    ) : receipts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>Nenhuma nota fiscal ainda</Text>
                            <Text style={styles.emptySubtext}>Escaneie seu primeiro QR Code!</Text>
                        </View>
                    ) : (
                        <View style={styles.receiptsList}>
                            {receipts.slice(0, 5).map((receipt, index) => (
                                <View key={receipt.id} style={styles.receiptItem}>
                                    <View style={styles.receiptIcon}>
                                        <Ionicons name="receipt" size={20} color="#667eea" />
                                    </View>
                                    <View style={styles.receiptDetails}>
                                        <Text style={styles.receiptStore}>{receipt.store_name || 'Loja'}</Text>
                                        <Text style={styles.receiptDate}>
                                            {new Date(receipt.purchase_date).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                    <Text style={styles.receiptAmount}>R$ {parseFloat(receipt.total).toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Botão de Escanear */}
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => navigation.navigate('Scan')}
                >
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.addButtonGradient}
                    >
                        <Ionicons name="qr-code" size={28} color="#fff" />
                        <Text style={styles.addButtonText}>Escanear Nova Nota</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 5,
    },
    qrButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: -20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginHorizontal: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    statTitle: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    categoriesList: {
        marginTop: 5,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryMedal: {
        fontSize: 24,
        marginRight: 12,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    categoryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#667eea',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#999',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
    },
    receiptsList: {
        marginTop: 5,
    },
    receiptItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    receiptIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    receiptDetails: {
        flex: 1,
    },
    receiptStore: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    receiptDate: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    receiptAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    addButton: {
        marginBottom: 30,
        marginTop: 10,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
