import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCard } from './AnimatedCard';

/**
 * Card de estatística
 * @param {string} icon - Nome do ícone (Ionicons)
 * @param {string} title - Título do stat
 * @param {string} value - Valor do stat
 * @param {string} color - Cor do ícone
 * @param {number} delay - Delay da animação
 * @param {function} onPress - Função ao pressionar
 */
export const StatCard = ({ icon, title, value, color, delay = 0, onPress }) => (
    <AnimatedCard delay={delay} style={styles.statCard}>
        <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </TouchableOpacity>
    </AnimatedCard>
);

const styles = StyleSheet.create({
    statCard: {
        flex: 1,
        marginHorizontal: 5,
        padding: 15,
    },
    statCardContent: {
        alignItems: 'center',
    },
    statIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    statTitle: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});
