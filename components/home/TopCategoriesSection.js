import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategoryItem } from './CategoryItem';
import { fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

/**
 * Seção de top categorias
 * @param {Array} categories - Array de [categoria, total]
 */
export const TopCategoriesSection = ({ categories }) => {
    if (!categories || categories.length === 0) return null;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Categorias</Text>
            </View>
            <View style={styles.categoriesList}>
                {categories.map(([category, total], index) => (
                    <CategoryItem
                        key={category}
                        category={category}
                        total={total}
                        index={index}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.medium,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: fontScale(20),
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    categoriesList: {
        marginTop: theme.spacing.xs,
    },
});
