import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const SearchInput = ({ value, onChangeText, placeholder = 'Buscar...', style }) => (
    <View style={[styles.searchContainer, style]}>
        <Ionicons name="search-outline" size={theme.iconSizes.md} color={theme.colors.textLight} style={styles.searchIcon} />
        <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textLight}
            value={value}
            onChangeText={onChangeText}
        />
        {value !== '' && (
            <TouchableOpacity onPress={() => onChangeText('')}>
                <Ionicons name="close-circle" size={theme.iconSizes.md} color={theme.colors.textLight} />
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    searchIcon: {
        marginRight: theme.spacing.xs,
    },
    searchInput: {
        flex: 1,
        fontSize: theme.fonts.body,
        color: theme.colors.text,
    },
});
