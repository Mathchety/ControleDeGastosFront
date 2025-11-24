import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, fontScale, getIconSize } from '../../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

export const PrimaryButton = ({ 
    title, 
    onPress, 
    icon, 
    loading = false,
    disabled = false,
    colors = ['#007bff', '#0056b3'],
    style 
}) => {
    const isDisabled = disabled || loading;

    const displayColors = isDisabled
        ? ['#e6e9ef', '#cbd5e1'] // tons acinzentados para estado desabilitado
        : colors;

    return (
        <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled, style, isSmallDevice && styles.buttonSmall]}
            onPress={onPress}
            disabled={isDisabled}
            accessibilityState={{ disabled: isDisabled }}
        >
            <LinearGradient
                colors={displayColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradientButton, isDisabled && styles.gradientDisabled]}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>{title}</Text>
                        {icon && <Ionicons name={icon} size={getIconSize('small')} color={isDisabled ? '#6b7280' : '#fff'} />}
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        marginTop: moderateScale(8),
    },
    buttonDisabled: {
        shadowColor: 'transparent',
        elevation: 0,
    },
    buttonSmall: {
        marginTop: moderateScale(14),
    },
    gradientButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: moderateScale(11),
        paddingHorizontal: moderateScale(16),
        gap: moderateScale(6),
    },
    gradientDisabled: {
        opacity: 0.95,
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontWeight: '700',
    },
    buttonTextDisabled: {
        color: '#6b7280',
    },
});
