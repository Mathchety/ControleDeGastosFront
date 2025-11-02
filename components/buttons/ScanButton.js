import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botão de escanear nota (usado em várias telas)
 * @param {function} onPress - Função ao pressionar
 * @param {string} title - Texto do botão (padrão: "Escanear Nota")
 * @param {object} style - Estilos adicionais
 */
export const ScanButton = ({ onPress, title = 'Escanear Nota', style }) => (
    <TouchableOpacity 
        style={[styles.scanButton, style]}
        onPress={onPress}
    >
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.scanButtonGradient}
        >
            <Ionicons name="scan" size={24} color="#fff" />
            <Text style={styles.scanButtonText}>{title}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    scanButton: {
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    scanButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        gap: 10,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
