import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatCard } from '../cards';
import { theme } from '../../utils/theme';

export const StatsSection = ({ totalSpent, monthSpent, receiptsCount }) => (
    <View style={styles.statsContainer}>
        <StatCard 
            icon="wallet" 
            title="Total Gasto" 
            value={`R$ ${totalSpent.toFixed(2)}`} 
            color={theme.colors.primary} 
        />
        <StatCard 
            icon="calendar" 
            title="Este Mês" 
            value={`R$ ${monthSpent.toFixed(2)}`} 
            color={theme.colors.success} 
        />
        <StatCard 
            icon="receipt" 
            title="Notas Fiscais" 
            value={receiptsCount.toString()} 
            color={theme.colors.warning} 
        />
    </View>
);

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
});
