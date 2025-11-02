import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botão secundário (outline)
 * @param {string} title - Texto do botão
 * @param {function} onPress - Função ao pressionar
 * @param {string} icon - Nome do ícone (Ionicons)
 * @param {object} style - Estilos adicionais
 */
export const SecondaryButton = ({ title, onPress, icon, style }) => (
    <TouchableOpacity 
        style={[styles.secondaryButton, style]} 
        onPress={onPress}
    >
        {icon && <Ionicons name={icon} size={20} color="#667eea" style={{ marginRight: 8 }} />}
        <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#667eea',
        backgroundColor: 'transparent',
    },
    secondaryButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
});
