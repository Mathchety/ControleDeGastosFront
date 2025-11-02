import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Header da tela de histórico com gradiente
 * @param {number} count - Número de notas escaneadas
 */
export const HistoryHeader = ({ count = 0 }) => (
    <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        style={styles.header}
    >
        <Text style={styles.headerTitle}>Histórico de Notas</Text>
        <Text style={styles.headerSubtitle}>
            {count} {count === 1 ? 'nota escaneada' : 'notas escaneadas'}
        </Text>
    </LinearGradient>
);

const styles = StyleSheet.create({
    header: { 
        paddingTop: 50, 
        paddingBottom: 30, 
        paddingHorizontal: 20, 
        borderBottomLeftRadius: 30, 
        borderBottomRightRadius: 30 
    },
    headerTitle: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#fff' 
    },
    headerSubtitle: { 
        fontSize: 14, 
        color: 'rgba(255,255,255,0.9)', 
        marginTop: 5 
    },
});
