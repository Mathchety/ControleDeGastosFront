import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Item de categoria com medalha e valor
 * @param {string} category - Nome da categoria
 * @param {number} total - Valor total gasto
 * @param {number} index - Índice para determinar a medalha (0=🥇, 1=🥈, 2=🥉)
 */
export const CategoryItem = ({ category, total, index }) => {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[index] || '🏅';

    return (
        <View style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
                <Text style={styles.categoryMedal}>{medal}</Text>
                <Text style={styles.categoryName}>{category}</Text>
            </View>
            <Text style={styles.categoryValue}>R$ {total.toFixed(2)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryMedal: {
        fontSize: 24,
        marginRight: 12,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    categoryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#667eea',
    },
});
