import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Header da HomeScreen com gradiente e saudação
 * @param {string} userName - Nome do usuário
 */
export const HomeHeader = ({ userName }) => (
    <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
    >
        <View style={styles.headerContent}>
            <View>
                <Text style={styles.greeting}>Olá, 👋</Text>
                <Text style={styles.userName}>{userName || 'Usuário'}</Text>
            </View>
        </View>
    </LinearGradient>
);

const styles = StyleSheet.create({
    header: {
        paddingTop: Platform.OS === 'android' ? 20 : 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 5,
    },
});
