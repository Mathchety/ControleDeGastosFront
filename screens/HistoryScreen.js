import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../contexts/DataContext';
import { EmptyCard } from '../components/cards';
import { GradientHeader } from '../components/common';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function HistoryScreen({ navigation }) {
  const { 
    receipts, 
    loading, 
    fetchReceiptsBasic, 
    fetchReceiptsByDate,
    fetchReceiptsByPeriod,
    deleteReceipt,
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

  const handleEditReceipt = (receiptId) => {
    navigation.navigate('Preview', { receiptId });
  };

  const handleDeleteReceipt = async (receiptId, storeName) => {
    Alert.alert(
      'Excluir Nota Fiscal',
      `Tem certeza que deseja excluir a nota fiscal de "${storeName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReceipt(receiptId);
              Alert.alert('Sucesso', 'Nota fiscal excluída com sucesso!');
              onRefresh();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a nota fiscal.');
            }
          }
        }
      ]
    );
  };

  const renderReceiptCard = ({ item, index }) => {
    const storeName = storeNameList[index] || item.storeName || 'Loja';
    const date = dateList[index] 
      ? new Date(dateList[index]).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })
      : item.date;
    const itemCount = itemCountList[index] || item.itemCount || 0;
    const total = parseFloat(item.total || 0);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.receiptCard}
        onPress={() => navigation.navigate('Preview', { receiptId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.receiptHeader}>
          <View style={styles.receiptLeft}>
            <View style={styles.receiptIcon}>
              <Ionicons name="receipt" size={24} color="#fff" />
            </View>
            <View style={styles.receiptInfo}>
              <Text style={styles.receiptName}>{storeName}</Text>
              {date && (
                <Text style={styles.receiptDate} numberOfLines={1}>
                  {date}
                </Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
        
        {/* Rodapé com valor e ações */}
        <View style={styles.receiptFooter}>
          <View style={styles.receiptStats}>
            <View style={styles.statItem}>
              <Ionicons name="list-outline" size={16} color="#666" />
              <Text style={styles.receiptCount}>
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={16} color="#ef4444" />
              <Text style={styles.receiptTotal}>
                R$ {total.toFixed(2)}
              </Text>
            </View>
          </View>
          
          <View style={styles.receiptActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleEditReceipt(item.id);
              }}
            >
              <Ionicons name="create-outline" size={18} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteReceipt(item.id, storeName);
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      <GradientHeader
        icon="time"
        title="Histórico de Notas"
        subtitle={`${receipts.length} ${receipts.length === 1 ? 'nota escaneada' : 'notas escaneadas'}`}
      />

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      ) : receipts.length === 0 ? (
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
  list: { 
    padding: moderateScale(20)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(60),
  },
  loadingText: {
    marginTop: moderateScale(15),
    fontSize: moderateScale(16),
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(40),
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(15),
    padding: moderateScale(16),
    marginBottom: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(12),
  },
  receiptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  receiptIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  receiptInfo: {
    flex: 1,
  },
  receiptName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: moderateScale(4),
  },
  receiptDate: {
    fontSize: moderateScale(13),
    color: '#999',
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  receiptStats: {
    flexDirection: 'row',
    gap: moderateScale(16),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  receiptCount: {
    fontSize: moderateScale(13),
    color: '#666',
    fontWeight: '500',
  },
  receiptTotal: {
    fontSize: moderateScale(14),
    color: '#ef4444',
    fontWeight: '700',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  actionButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  editButton: {
    backgroundColor: '#f0f4ff',
  },
  deleteButton: {
    backgroundColor: '#fff0f0',
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
