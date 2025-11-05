import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatCard } from '../cards';

/**
 * Seção de estatísticas da HomeScreen
 * @param {number} totalSpent - Total gasto
 * @param {number} monthSpent - Total gasto no mês
 * @param {number} receiptsCount - Quantidade de notas fiscais
 */
export const StatsSection = ({ totalSpent, monthSpent, receiptsCount }) => (
    <View style={styles.statsContainer}>
        <StatCard 
            icon="wallet" 
            title="Total Gasto" 
            value={`R$ ${totalSpent.toFixed(2)}`} 
            color="#667eea" 
        />
        <StatCard 
            icon="calendar" 
            title="Este Mês" 
            value={`R$ ${monthSpent.toFixed(2)}`} 
            color="#10b981" 
        />
        <StatCard 
            icon="receipt" 
            title="Notas Fiscais" 
            value={receiptsCount.toString()} 
            color="#f59e0b" 
        />
    </View>
);

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        /* marginBottom: 5, */
        marginTop: 20
    },
});
