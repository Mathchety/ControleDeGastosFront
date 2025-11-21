import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { useFilters } from '../contexts/FilterContext';
import { EmptyCard } from '../components/cards';
import { GradientHeader, SkeletonReceiptCard } from '../components/common';
import { DatePeriodModal } from '../components/modals';
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
    isConnected,
    dateList, 
    itemCountList, 
    storeNameList 
  } = useData();
  
  // ✅ Obtém filtros salvos do Context
  const { historyFilter, updateHistoryFilter } = useFilters();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState(historyFilter.filterType); // ✅ Inicializa do Context
  const [filterLoading, setFilterLoading] = useState(false); // Loading ao trocar filtros
  const [customDateModalVisible, setCustomDateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(historyFilter.startDate); // ✅ Inicializa do Context
  const [endDate, setEndDate] = useState(historyFilter.endDate); // ✅ Inicializa do Context
  const [isNavigating, setIsNavigating] = useState(false);

  // ✅ Carrega receipts quando monta a tela ou quando filtros mudam
  useEffect(() => {
    loadReceipts();
  }, [filterType, startDate, endDate]);

  // ✅ Recarrega quando a tela recebe foco (volta da navegação)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadReceipts();
    });

    return unsubscribe;
  }, [navigation, filterType, startDate, endDate]); // ✅ Inclui filtros nas dependências

  const handleReceiptPress = useCallback((receiptId) => {
    if (isNavigating) {
      return;
    }
    
    setIsNavigating(true);
    navigation.navigate('Preview', { receiptId, readOnly: !isConnected });
    
    // Reseta após a navegação
    setTimeout(() => setIsNavigating(false), 1000);
  }, [isNavigating, navigation]);

  const loadReceipts = async () => {
    try {
      setFilterLoading(true); // ⚡ Ativa loading ao trocar filtro
      const today = new Date();
      const formatDate = (date) => {
        const { formatDateToBrazil } = require('../utils/dateUtils');
        return formatDateToBrazil(date);
      };

      switch (filterType) {
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          await fetchReceiptsByPeriod(formatDate(weekAgo), formatDate(today));
          break;
        
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          await fetchReceiptsByPeriod(formatDate(monthStart), formatDate(today));
          break;
        
        case 'custom':
          await fetchReceiptsByPeriod(formatDate(startDate), formatDate(endDate));
          break;
        
        default: // 'all'
          await fetchReceiptsBasic();
          break;
      }
    } catch (error) {
      // Erro tratado pelo DataContext com Alert
    } finally {
      setFilterLoading(false); // ⚡ Desativa loading
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const handleFilterPress = (filter) => {
    const today = new Date();
    let newStartDate = null;
    let newEndDate = null;
    
    // Calcula datas baseado no filtro
    switch (filter) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        newStartDate = weekAgo;
        newEndDate = today;
        break;
      
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        newStartDate = monthStart;
        newEndDate = today;
        break;
      
      case 'all':
        newStartDate = null;
        newEndDate = null;
        break;
    }
    
    // Atualiza estado local
    setFilterType(filter);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    // ✅ Salva no Context para persistir entre navegações
    updateHistoryFilter({
      filterType: filter,
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };

  const handleApplyCustomPeriod = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setFilterType('custom');
    
    // ✅ Salva no Context
    updateHistoryFilter({
      filterType: 'custom',
      startDate: newStart,
      endDate: newEnd,
    });
  };

  const renderFilterButton = (filter, label, icon) => (
    <TouchableOpacity
      style={[styles.filterButton, filterType === filter && styles.filterButtonActive]}
      onPress={() => handleFilterPress(filter)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={18} 
        color={filterType === filter ? '#fff' : '#667eea'} 
      />
      <Text style={[
        styles.filterButtonText,
        filterType === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
          year: 'numeric',
          timeZone: 'America/Sao_Paulo'
        })
      : item.date;
    const itemCount = itemCountList[index] || item.itemCount || 0;
  const total = parseFloat(item.total || 0);
  const discount = parseFloat(item.discount || 0);
  const subtotal = parseFloat(item.subtotal || 0);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.receiptCard}
        onPress={() => handleReceiptPress(item.id)}
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
            {discount > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="pricetag-outline" size={16} color="#10b981" />
                <View style={{ marginLeft: moderateScale(6) }}>
                  <Text style={styles.receiptDiscountLabel}>Desconto</Text>
                  <Text style={styles.receiptDiscount}>
                    - R$ {discount.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={16} color="#ef4444" />
              <Text style={styles.receiptTotal}>
                R$ {total.toFixed(2)}
              </Text>
            </View>
          </View>
          
          <View style={styles.receiptActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                if (!isConnected) {
                  Alert.alert('Modo offline', 'Você está offline. Não é possível excluir notas.');
                  return;
                }
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
          {renderFilterButton('week', 'Semana', 'calendar')}
          {renderFilterButton('month', 'Mês', 'calendar-outline')}
        </View>
        
        {/* Período Customizado */}
        <TouchableOpacity 
          style={[
            styles.customPeriodButton,
            filterType === 'custom' && styles.customPeriodButtonActive
          ]}
          onPress={() => setCustomDateModalVisible(true)}
        >
          <Ionicons 
            name="calendar-sharp" 
            size={18} 
            color={filterType === 'custom' ? '#fff' : '#667eea'} 
          />
          <Text style={[
            styles.customPeriodText,
            filterType === 'custom' && styles.customPeriodTextActive
          ]}>
            {filterType === 'custom' 
              ? `${startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })} - ${endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })}`
              : 'Período customizado'
            }
          </Text>
        </TouchableOpacity>

        {/* Indicador de Loading ao Filtrar */}
        {filterLoading && (
          <View style={styles.filterLoadingIndicator}>
            <ActivityIndicator size="small" color="#667eea" />
            <Text style={styles.filterLoadingText}>Filtrando...</Text>
          </View>
        )}
      </View>

      {/* Modal de Período Customizado */}
      <DatePeriodModal
        visible={customDateModalVisible}
        onClose={() => setCustomDateModalVisible(false)}
        onApply={handleApplyCustomPeriod}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />

      {loading && receipts.length === 0 ? (
        <View style={styles.list}>
          <SkeletonReceiptCard />
          <SkeletonReceiptCard />
          <SkeletonReceiptCard />
          <SkeletonReceiptCard />
          <SkeletonReceiptCard />
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
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: moderateScale(90),
            offset: moderateScale(90) * index,
            index,
          })}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingTop: moderateScale(40),
    paddingBottom: moderateScale(10),
    minHeight: 200,
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
  receiptDiscount: {
    fontSize: moderateScale(14),
    color: '#10b981',
    fontWeight: '700',
    marginLeft: moderateScale(6),
  },
  receiptDiscountLabel: {
    fontSize: moderateScale(12),
    color: '#10b981',
    fontWeight: '600',
    lineHeight: moderateScale(14),
  },
  receiptSubtotal: {
    fontSize: moderateScale(14),
    color: '#666',
    fontWeight: '700',
    marginLeft: moderateScale(6),
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
  customPeriodButtonActive: {
    backgroundColor: '#667eea',
    borderStyle: 'solid',
  },
  customPeriodText: {
    fontSize: 13,
    color: '#667eea',
    marginLeft: 8,
    fontWeight: '500',
  },
  customPeriodTextActive: {
    color: '#fff',
  },
  filterLoadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  filterLoadingText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '500',
  },
});
