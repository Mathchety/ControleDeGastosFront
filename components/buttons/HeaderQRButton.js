import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const HeaderQRButton = ({ onPress, style }) => (
    <TouchableOpacity 
        style={[styles.headerQRButton, style]}
        onPress={onPress}
    >
        <Ionicons name="qr-code-outline" size={theme.iconSizes.xl} color="#fff" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    headerQRButton: {
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(22.5),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
