import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCard } from './AnimatedCard';

/**
 * Card de transação/item
 * @param {string} icon - Nome do ícone (Ionicons)
 * @param {string} title - Título da transação
 * @param {string} subtitle - Subtítulo da transação
 * @param {string} amount - Valor da transação
 * @param {string} type - Tipo: 'income' ou 'expense'
 * @param {number} delay - Delay da animação
 * @param {function} onPress - Função ao pressionar
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

const styles = StyleSheet.create({
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
});
