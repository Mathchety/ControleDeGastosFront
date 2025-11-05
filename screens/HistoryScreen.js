import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Platform, StatusBar, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../contexts/DataContext';
import { EmptyCard } from '../components/cards';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function HistoryScreen({ navigation }) {
  const { 
    receipts, 
    loading, 
    fetchReceiptsBasic, 
    fetchReceiptsByDate,
    fetchReceiptsByPeriod,
    dateList, 
    itemCountList, 
    storeNameList 
  } = useData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async (filter = 'all') => {
    try {
      const today = new Date();
      const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

      switch (filter) {
        case 'today':
          await fetchReceiptsByDate(formatDate(today));
          break;
        
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          await fetchReceiptsByPeriod(formatDate(weekAgo), formatDate(today));
          break;
        
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          await fetchReceiptsByPeriod(formatDate(monthAgo), formatDate(today));
          break;
        
        default: // 'all'
          await fetchReceiptsBasic();
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceipts(selectedFilter);
    setRefreshing(false);
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
    loadReceipts(filter);
  };

  const handleCustomPeriod = async () => {
    try {
      const formatDate = (date) => date.toISOString().split('T')[0];
      await fetchReceiptsByPeriod(formatDate(startDate), formatDate(endDate));
      setSelectedFilter('custom');
    } catch (error) {
      console.error('Erro ao aplicar período customizado:', error);
    }
  };

  const onChangeStartDate = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEndDate = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      // Aplica automaticamente após selecionar data final
      setTimeout(() => handleCustomPeriod(), 100);
    }
  };

  const renderFilterButton = (filter, label, icon) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
      onPress={() => handleFilterPress(filter)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={18} 
        color={selectedFilter === filter ? '#fff' : '#667eea'} 
      />
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderReceiptCard = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Preview', { receiptId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="receipt" size={24} color="#667eea" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.storeName}>{storeNameList[index] || item.storeName || 'Loja'}</Text>
          <Text style={styles.date}>
            {dateList[index] 
              ? new Date(dateList[index]).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })
              : item.date
            }
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.amount}>R$ {parseFloat(item.total || 0).toFixed(2)}</Text>
          <Text style={styles.itemCount}>
            {itemCountList[index] || item.itemCount || 0} itens
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#999" style={styles.chevron} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Histórico de Notas</Text>
        <Text style={styles.headerSubtitle}>
          {receipts.length} {receipts.length === 1 ? 'nota escaneada' : 'notas escaneadas'}
        </Text>
      </LinearGradient>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          {renderFilterButton('all', 'Todas', 'apps')}
          {renderFilterButton('today', 'Hoje', 'today')}
          {renderFilterButton('week', 'Semana', 'calendar')}
          {renderFilterButton('month', 'Mês', 'calendar-outline')}
        </View>
        
        {/* Período Customizado */}
        <TouchableOpacity 
          style={styles.customPeriodButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Ionicons name="calendar-sharp" size={18} color="#667eea" />
          <Text style={styles.customPeriodText}>
            {selectedFilter === 'custom' 
              ? `${startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
              : 'Período customizado'
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* DatePickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeStartDate}
          maximumDate={new Date()}
        />
      )}
      
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeEndDate}
          maximumDate={new Date()}
          minimumDate={startDate}
        />
      )}

      {receipts.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <EmptyCard 
            icon="receipt-outline"
            title="Nenhuma nota fiscal"
            message="Escaneie QR Codes de notas fiscais para ver o histórico aqui"
            action="Escanear Nota"
            onAction={() => navigation.navigate('Scan')}
          />
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
    paddingTop: moderateScale(60),
    paddingBottom: moderateScale(30), 
    paddingHorizontal: theme.spacing.lg, 
    borderBottomLeftRadius: moderateScale(30), 
    borderBottomRightRadius: moderateScale(30) 
  },
  headerTitle: { 
    fontSize: theme.fonts.h1, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  headerSubtitle: { 
    fontSize: theme.fonts.body, 
    color: 'rgba(255,255,255,0.9)', 
    marginTop: theme.spacing.xs 
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
    marginBottom: 4,
  },
  chevron: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  customPeriodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667eea',
    borderStyle: 'dashed',
  },
  customPeriodText: {
    fontSize: 13,
    color: '#667eea',
    marginLeft: 8,
    fontWeight: '500',
  },
});
