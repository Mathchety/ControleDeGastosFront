import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const CategoryItem = ({ category, total, index }) => {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[index] || '🏅';

    return (
        <View style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
                <Text style={styles.categoryMedal}>{medal}</Text>
                <Text style={styles.categoryName} numberOfLines={1}>{category}</Text>
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
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    categoryMedal: {
        fontSize: fontScale(24),
        marginRight: theme.spacing.md,
    },
    categoryName: {
        fontSize: theme.fonts.body,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
    },
    categoryValue: {
        fontSize: theme.fonts.body,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
});
