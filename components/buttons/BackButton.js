import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botão de voltar (usado em headers)
 * @param {function} onPress - Função ao pressionar
 * @param {string} color - Cor do ícone
 * @param {object} style - Estilos adicionais
 */
export const BackButton = ({ onPress, color = '#667eea', style }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={[styles.backButton, style]}
    >
        <Ionicons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    backButton: {
        padding: 5,
    },
});
