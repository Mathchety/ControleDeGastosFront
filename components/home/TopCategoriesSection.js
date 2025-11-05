import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategoryItem } from './CategoryItem';

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
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    categoriesList: {
        marginTop: 5,
    },
});
