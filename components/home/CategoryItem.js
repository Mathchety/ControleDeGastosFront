import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const CategoryItem = ({ category, total, index }) => {
    return (
        <View style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
                <View style={styles.categoryRank}>
                    <Text style={styles.categoryRankText}>{index + 1}</Text>
                </View>
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
    categoryRank: {
        width: moderateScale(32),
        height: moderateScale(32),
        borderRadius: moderateScale(16),
        backgroundColor: '#667eea',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    categoryRankText: {
        fontSize: fontScale(14),
        fontWeight: '700',
        color: '#fff',
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
