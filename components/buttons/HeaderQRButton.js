import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botão de QR Code para usar no header com fundo branco translúcido
 * @param {function} onPress - Função ao pressionar
 * @param {object} style - Estilos adicionais
 */
export const HeaderQRButton = ({ onPress, style }) => (
    <TouchableOpacity 
        style={[styles.headerQRButton, style]}
        onPress={onPress}
    >
        <Ionicons name="qr-code-outline" size={28} color="#fff" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    headerQRButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
