import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * Header da tela de autenticação com gradiente e logo
 */
export const AuthHeader = () => (
    <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <Ionicons name="wallet" size={60} color="#fff" />
        <Text style={styles.headerTitle}>Controle de Gastos</Text>
        <Text style={styles.headerSubtitle}>Gerencie suas finanças com facilidade</Text>
    </LinearGradient>
);

const styles = StyleSheet.create({
    header: {
        paddingVertical: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginTop: 15,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginTop: 5,
    },
});
