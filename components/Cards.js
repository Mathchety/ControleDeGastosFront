import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

/**
 * Card animado genérico
 * @param {node} children - Conteúdo do card
 * @param {number} delay - Delay da animação
 * @param {object} style - Estilos adicionais
 */
export const AnimatedCard = ({ children, delay = 0, style }) => (
    <View
        from={{ opacity: 0, translateY: 30, scale: 0.95 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: 'timing', duration: 500, delay }}
        style={[styles.card, style]}
    >
        {children}
    </View>
);

/**
 * Card de estatística
 */
export const StatCard = ({ icon, title, value, color, delay = 0, onPress }) => (
    <AnimatedCard delay={delay} style={styles.statCard}>
        <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </TouchableOpacity>
    </AnimatedCard>
);

/**
 * Card de transação/item
 */
export const TransactionCard = ({ 
    icon, 
    title, 
    subtitle, 
    amount, 
    type = 'income', 
    delay = 0,
    onPress 
}) => (
    <AnimatedCard delay={delay} style={styles.transactionCard}>
        <TouchableOpacity onPress={onPress} style={styles.transactionContent}>
            <View style={[
                styles.transactionIcon, 
                { backgroundColor: type === 'income' ? '#10b981' : '#ef4444' }
            ]}>
                <Ionicons 
                    name={icon || (type === 'income' ? 'arrow-down' : 'arrow-up')} 
                    size={20} 
                    color="#fff" 
                />
            </View>
            <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{title}</Text>
                {subtitle && <Text style={styles.transactionSubtitle}>{subtitle}</Text>}
            </View>
            <Text style={[
                styles.transactionAmount,
                { color: type === 'income' ? '#10b981' : '#ef4444' }
            ]}>
                {type === 'income' ? '+' : '-'}R$ {amount}
            </Text>
        </TouchableOpacity>
    </AnimatedCard>
);

/**
 * Card de nota fiscal
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

/**
 * Card vazio (placeholder)
 */
export const EmptyCard = ({ icon, title, message, action, onAction }) => (
    <View style={styles.emptyCard}>
        <Ionicons name={icon} size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        {action && onAction && (
            <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
                <Text style={styles.emptyActionText}>{action}</Text>
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 15,
    },
    statCard: {
        flex: 1,
        marginHorizontal: 5,
        padding: 15,
    },
    statCardContent: {
        alignItems: 'center',
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
    transactionCard: {
        padding: 0,
        marginBottom: 10,
    },
    transactionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    transactionSubtitle: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
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
    emptyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginVertical: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyAction: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#667eea',
        borderRadius: 12,
    },
    emptyActionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
