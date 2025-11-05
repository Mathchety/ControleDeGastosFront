import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const SecondaryButton = ({ title, onPress, icon, style }) => (
    <TouchableOpacity 
        style={[styles.secondaryButton, style]} 
        onPress={onPress}
    >
        {icon && <Ionicons name={icon} size={theme.iconSizes.sm} color={theme.colors.primary} style={{ marginRight: theme.spacing.sm }} />}
        <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(14),
        paddingHorizontal: moderateScale(20),
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: 'transparent',
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        fontSize: theme.fonts.button,
        fontWeight: '600',
    },
});
