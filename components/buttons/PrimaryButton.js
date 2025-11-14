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
    colors = ['#007bff', '#0056b3'],
    style 
}) => (
    <TouchableOpacity style={[styles.button, style, isSmallDevice && styles.buttonSmall]} onPress={onPress} disabled={loading}>
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
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        marginTop: moderateScale(8),
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
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontWeight: '700',
    },
});
