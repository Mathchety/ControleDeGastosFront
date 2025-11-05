import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const IconButton = ({ icon, onPress, color = theme.colors.primary, size = moderateScale(40), style }) => (
    <TouchableOpacity 
        style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }, style]}
        onPress={onPress}
    >
        <Ionicons name={icon} size={size * 0.5} color={color} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    iconButton: {
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
