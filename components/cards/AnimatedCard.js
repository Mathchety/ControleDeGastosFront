import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Card genérico (animações removidas para melhor performance)
 * @param {node} children - Conteúdo do card
 * @param {number} delay - Delay da animação (deprecado, mantido por compatibilidade)
 * @param {object} style - Estilos adicionais
 */
export const AnimatedCard = ({ children, delay = 0, style }) => (
    <View style={[styles.card, style]}>
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
