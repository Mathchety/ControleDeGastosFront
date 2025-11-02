import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botão de QR Code (usado no HomeScreen)
 * @param {function} onPress - Função ao pressionar
 * @param {object} style - Estilos adicionais
 */
export const QRButton = ({ onPress, style }) => (
    <TouchableOpacity 
        style={[styles.qrButton, style]}
        onPress={onPress}
    >
        <Ionicons name="qr-code" size={28} color="#667eea" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    qrButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
