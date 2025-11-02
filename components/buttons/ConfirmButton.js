import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botão de confirmar (usado na tela de preview)
 * @param {function} onPress - Função ao pressionar
 * @param {string} title - Texto do botão (padrão: "Confirmar e Salvar")
 * @param {object} style - Estilos adicionais
 */
export const ConfirmButton = ({ onPress, title = 'Confirmar e Salvar', style }) => (
    <TouchableOpacity 
        style={[styles.confirmButton, style]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.confirmButtonGradient}
        >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.confirmButtonText}>{title}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    confirmButton: {
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        gap: 10,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
