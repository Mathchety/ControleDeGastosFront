import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Input de busca
 * @param {string} value - Valor do input
 * @param {function} onChangeText - Função de mudança
 * @param {string} placeholder - Placeholder do input
 * @param {object} style - Estilos adicionais
 */
export const SearchInput = ({ value, onChangeText, placeholder = 'Buscar...', style }) => (
    <View style={[styles.searchContainer, style]}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChangeText}
        />
        {value !== '' && (
            <TouchableOpacity onPress={() => onChangeText('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
});
