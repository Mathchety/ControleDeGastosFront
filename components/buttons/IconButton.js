import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botão de ícone redondo
 * @param {string} icon - Nome do ícone (Ionicons)
 * @param {function} onPress - Função ao pressionar
 * @param {string} color - Cor do ícone
 * @param {number} size - Tamanho do botão
 * @param {object} style - Estilos adicionais
 */
export const IconButton = ({ icon, onPress, color = '#667eea', size = 40, style }) => (
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
