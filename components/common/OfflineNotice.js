import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';

/**
 * 🌐 Componente de Aviso Offline
 * Mostra uma mensagem quando o usuário está sem internet
 * 
 * @param {boolean} visible - Se deve mostrar o aviso
 * @param {function} onRetry - Callback para tentar reconectar
 */
export default function OfflineNotice({ visible, onRetry }) {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="wifi-off" size={moderateScale(32)} color="#ef4444" />
                </View>
                
                <Text style={styles.title}>Sem conexão com a internet</Text>
                <Text style={styles.message}>
                    Você está offline. Suas informações não podem ser carregadas no momento.
                </Text>
                
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={onRetry}
                    activeOpacity={0.7}
                >
                    <Ionicons name="reload" size={moderateScale(18)} color="#fff" />
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: moderateScale(30),
        paddingVertical: moderateScale(40),
    },
    iconContainer: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: moderateScale(20),
    },
    title: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        color: '#333',
        marginBottom: moderateScale(12),
        textAlign: 'center',
    },
    message: {
        fontSize: moderateScale(16),
        color: '#666',
        textAlign: 'center',
        lineHeight: moderateScale(24),
        marginBottom: moderateScale(30),
    },
    retryButton: {
        flexDirection: 'row',
        backgroundColor: '#667eea',
        paddingHorizontal: moderateScale(24),
        paddingVertical: moderateScale(14),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        gap: moderateScale(10),
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    retryButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#fff',
    },
});
