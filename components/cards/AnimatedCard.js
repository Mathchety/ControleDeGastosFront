import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Card animado genérico
 * @param {node} children - Conteúdo do card
 * @param {number} delay - Delay da animação
 * @param {object} style - Estilos adicionais
 */
export const AnimatedCard = ({ children, delay = 0, style }) => (
    <View
        from={{ opacity: 0, translateY: 30, scale: 0.95 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: 'timing', duration: 500, delay }}
        style={[styles.card, style]}
    >
        {children}
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 15,
    },
});
