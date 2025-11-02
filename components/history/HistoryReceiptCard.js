import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Card de nota fiscal para lista de histórico
 * @param {object} item - Dados da nota fiscal
 * @param {string} storeName - Nome da loja
 * @param {string} date - Data formatada
 * @param {number} itemCount - Quantidade de itens
 * @param {function} onPress - Função ao pressionar
 */
export const HistoryReceiptCard = ({ item, storeName, date, itemCount, onPress }) => (
    <TouchableOpacity 
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
                <Ionicons name="receipt" size={24} color="#667eea" />
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.storeName}>{storeName || 'Loja'}</Text>
                <Text style={styles.date}>{date}</Text>
            </View>
            <View style={styles.cardRight}>
                <Text style={styles.amount}>R$ {item.total}</Text>
                {itemCount && (
                    <Text style={styles.itemCount}>{itemCount} itens</Text>
                )}
            </View>
        </View>
        <View style={styles.cardFooter}>
            <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
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
});
