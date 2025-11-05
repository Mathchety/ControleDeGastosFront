import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const ScanButton = ({ onPress, title = 'Escanear Nota', style }) => (
    <TouchableOpacity 
        style={[styles.scanButton, style]}
        onPress={onPress}
    >
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.scanButtonGradient}
        >
            <Ionicons name="scan" size={theme.iconSizes.lg} color="#fff" />
            <Text style={styles.scanButtonText}>{title}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    scanButton: {
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        ...theme.shadows.medium,
    },
    scanButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(18),
        paddingHorizontal: moderateScale(24),
        gap: theme.spacing.sm,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: fontScale(18),
        fontWeight: '700',
    },
});
