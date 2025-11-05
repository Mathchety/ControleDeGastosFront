import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const QRButton = ({ onPress, style }) => (
    <TouchableOpacity 
        style={[styles.qrButton, style]}
        onPress={onPress}
    >
        <Ionicons name="qr-code" size={theme.iconSizes.xl} color={theme.colors.primary} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    qrButton: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(24),
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.small,
    },
});
