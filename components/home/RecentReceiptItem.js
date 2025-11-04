import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Item de nota fiscal recente (versão simplificada para HomeScreen)
 * @param {object} receipt - Dados da nota
 * @param {string} storeName - Nome da loja
 * @param {string} date - Data formatada
 * @param {number} itemCount - Quantidade de itens
 * @param {function} onPress - Função ao clicar no item
 */
export const RecentReceiptItem = ({ receipt, storeName, date, itemCount, onPress }) => (
    <TouchableOpacity style={styles.receiptItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.receiptIcon}>
            <Ionicons name="receipt" size={20} color="#667eea" />
        </View>
        <View style={styles.receiptDetails}>
            <Text style={styles.receiptStore}>{storeName || 'Loja'}</Text>
            <Text style={styles.receiptItemsCount}>{itemCount || 0} itens</Text>
            <Text style={styles.receiptDate}>{date}</Text>
        </View>
        <View style={styles.receiptRight}>
            <Text style={styles.receiptAmount}>
                R$ {parseFloat(receipt.total || 0).toFixed(2)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.chevron} />
        </View>
    </TouchableOpacity>
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
    receiptRight: {
        alignItems: 'flex-end',
    },
    receiptAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    chevron: {
        marginTop: 4,
    },
});
