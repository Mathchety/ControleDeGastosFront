import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Item de nota fiscal recente (versão simplificada para HomeScreen)
 * @param {object} receipt - Dados da nota
 * @param {string} storeName - Nome da loja
 * @param {string} date - Data formatada
 * @param {number} itemCount - Quantidade de itens
 */
export const RecentReceiptItem = ({ receipt, storeName, date, itemCount }) => (
    <View style={styles.receiptItem}>
        <View style={styles.receiptIcon}>
            <Ionicons name="receipt" size={20} color="#667eea" />
        </View>
        <View style={styles.receiptDetails}>
            <Text style={styles.receiptStore}>{storeName || 'Loja'}</Text>
            <Text style={styles.receiptItemsCount}>{itemCount || 0} itens</Text>
            <Text style={styles.receiptDate}>{date}</Text>
        </View>
        <Text style={styles.receiptAmount}>
            R$ {parseFloat(receipt.total || 0).toFixed(2)}
        </Text>
    </View>
);

const styles = StyleSheet.create({
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
    receiptItemsCount: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
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
});
