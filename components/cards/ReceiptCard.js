import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCard } from './AnimatedCard';

/**
 * Card de nota fiscal
 * @param {string} storeName - Nome da loja
 * @param {string} date - Data da compra
 * @param {string} total - Valor total
 * @param {number} itemCount - Quantidade de itens
 * @param {number} delay - Delay da animação
 * @param {function} onPress - Função ao pressionar
 */
export const ReceiptCard = ({ 
    storeName, 
    date, 
    total, 
    itemCount, 
    delay = 0,
    onPress 
}) => (
    <AnimatedCard delay={delay} style={styles.receiptCard}>
        <TouchableOpacity onPress={onPress} style={styles.receiptContent}>
            <View style={styles.receiptIcon}>
                <Ionicons name="receipt-outline" size={32} color="#667eea" />
            </View>
            <View style={styles.receiptDetails}>
                <Text style={styles.receiptStoreName}>{storeName}</Text>
                <Text style={styles.receiptDate}>{date}</Text>
                <Text style={styles.receiptItems}>{itemCount} itens</Text>
            </View>
            <View style={styles.receiptRight}>
                <Text style={styles.receiptTotal}>R$ {total}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    </AnimatedCard>
);

const styles = StyleSheet.create({
    receiptCard: {
        padding: 0,
    },
    receiptContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    receiptIcon: {
        marginRight: 15,
    },
    receiptDetails: {
        flex: 1,
    },
    receiptStoreName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    receiptDate: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    receiptItems: {
        fontSize: 12,
        color: '#999',
    },
    receiptRight: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
    },
    receiptTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#667eea',
        marginRight: 8,
    },
});
