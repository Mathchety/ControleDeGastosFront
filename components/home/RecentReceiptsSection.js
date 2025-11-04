import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecentReceiptItem } from './RecentReceiptItem';

/**
 * Seção de notas recentes
 * @param {boolean} loading - Estado de carregamento
 * @param {Array} receipts - Lista de notas fiscais
 * @param {Array} storeNameList - Lista de nomes de lojas
 * @param {Array} itemCountList - Lista de quantidade de itens
 * @param {Array} dateList - Lista de datas
 * @param {function} onReceiptPress - Função ao clicar em uma nota
 * @param {function} onViewAll - Função ao clicar em "Ver mais"
 */
export const RecentReceiptsSection = ({ 
    loading, 
    receipts, 
    storeNameList, 
    itemCountList, 
    dateList,
    onReceiptPress,
    onViewAll
}) => {
    return (
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
                <>
                    <View style={styles.receiptsList}>
                        {receipts.slice(0, 3).map((receipt, index) => (
                            <RecentReceiptItem
                                key={receipt.id}
                                receipt={receipt}
                                storeName={storeNameList[index]}
                                itemCount={itemCountList[index]}
                                date={dateList[index] ? new Date(dateList[index]).toLocaleDateString('pt-BR', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric' 
                                }) : ''}
                                onPress={() => onReceiptPress && onReceiptPress(receipt.id)}
                            />
                        ))}
                    </View>
                    
                    {receipts.length > 3 && (
                        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
                            <Text style={styles.viewAllText}>Ver todas as notas</Text>
                            <Ionicons name="arrow-forward" size={18} color="#667eea" />
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#f0f0ff',
    },
    viewAllText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#667eea',
        marginRight: 8,
    },
});
