import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

export const BackButton = ({ onPress, color = theme.colors.primary, style }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={[styles.backButton, style]}
    >
        <Ionicons name="arrow-back" size={theme.iconSizes.lg} color={color} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    backButton: {
        padding: theme.spacing.xs,
    },
});
