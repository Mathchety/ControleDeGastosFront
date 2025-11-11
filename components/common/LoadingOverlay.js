import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { moderateScale } from '../../utils/responsive';

/**
 * ✨ Componente de Loading Padronizado
 * 
 * Uso consistente em todas as telas do app
 */
export const LoadingOverlay = ({ 
    visible = true, 
    message = 'Carregando...', 
    color = '#667eea',
    size = 'large',
    fullScreen = false 
}) => {
    if (!visible) return null;

    return (
        <View style={[
            styles.container, 
            fullScreen && styles.fullScreen
        ]}>
            <View style={styles.content}>
                <ActivityIndicator size={size} color={color} />
                {message && (
                    <Text style={[styles.message, { color }]}>
                        {message}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateScale(20),
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: moderateScale(24),
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        minWidth: moderateScale(150),
    },
    message: {
        marginTop: moderateScale(16),
        fontSize: moderateScale(15),
        fontWeight: '600',
        textAlign: 'center',
    },
});
