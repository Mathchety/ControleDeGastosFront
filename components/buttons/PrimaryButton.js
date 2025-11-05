import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, fontScale, getIconSize } from '../../utils/responsive';
export const PrimaryButton = ({ 
    title, 
    onPress, 
    icon, 
    loading = false,
    colors = ['#007bff', '#0056b3'],
    style 
}) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} disabled={loading}>
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <>
                    <Text style={styles.buttonText}>{title}</Text>
                    {icon && <Ionicons name={icon} size={getIconSize('small')} color="#fff" />}
                </>
            )}
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        borderRadius: moderateScale(15),
        overflow: 'hidden',
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradientButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: moderateScale(14),
        paddingHorizontal: moderateScale(20),
        gap: moderateScale(8),
    },
    buttonText: {
        color: '#fff',
        fontSize: fontScale(16),
        fontWeight: 'bold',
    },
});
