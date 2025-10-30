import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
export default function HistoryScreen({ navigation }) {
  const { receipts, loading, fetchReceiptsBasic, dateList, itemCountList, storeNameList } = useData();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      await fetchReceiptsBasic();
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const renderReceiptCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ReceiptDetail', { receiptId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="receipt" size={24} color="#667eea" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.storeName}>{storeNameList[1] || 'Loja'}</Text>
          <Text style={styles.date}>{(dateList[1] && new Date(dateList[1]).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })) }</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.amount}>R$ {(item.total)}</Text>
          {itemCountList[1] && (
            <Text style={styles.itemCount}>{itemCountList[1]} itens</Text>
          )}
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Histórico de Notas</Text>
        <Text style={styles.headerSubtitle}>
          {receipts.length} {receipts.length === 1 ? 'nota escaneada' : 'notas escaneadas'}
        </Text>
      </LinearGradient>

      {receipts.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Nenhuma nota fiscal</Text>
          <Text style={styles.emptyMessage}>
            Escaneie QR Codes de notas fiscais para ver o histórico aqui
          </Text>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => navigation.navigate('Scan')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.scanButtonGradient}
            >
              <Ionicons name="qr-code" size={24} color="#fff" />
              <Text style={styles.scanButtonText}>Escanear Nota</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReceiptCard}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#667eea']}
              tintColor="#667eea"
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: { 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: 20, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.9)', 
    marginTop: 5 
  },
  list: { 
    padding: 20 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#667eea',
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  scanButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
