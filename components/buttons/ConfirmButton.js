import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const ConfirmButton = ({ onPress, title = 'Confirmar e Salvar', style, disabled = false }) => (
    <TouchableOpacity 
        style={[styles.confirmButton, disabled && styles.buttonDisabled, style]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.8}
        disabled={disabled}
    >
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.confirmButtonGradient}
        >
            <Ionicons name="checkmark-circle" size={theme.iconSizes.lg} color="#fff" />
            <Text style={styles.confirmButtonText}>{title}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    confirmButton: {
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        ...theme.shadows.medium,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    confirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(18),
        paddingHorizontal: moderateScale(24),
        gap: theme.spacing.sm,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: fontScale(18),
        fontWeight: '700',
    },
});
