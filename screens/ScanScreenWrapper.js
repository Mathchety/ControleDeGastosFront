import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { moderateScale } from '../utils/responsive';
import ScanScreen from './ScanScreen';

/**
 * 🌐 Wrapper do ScanScreen que verifica conexão
 * Bloqueia acesso ao scan quando offline
 */
export default function ScanScreenWrapper({ navigation }) {
    const { isConnected } = useData();

    if (!isConnected) {
        return (
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <Ionicons name="cloud-offline-outline" size={moderateScale(80)} color="#ef4444" />
                </View>
                
                <Text style={styles.title}>Sem conexão com a internet</Text>
                <Text style={styles.message}>
                    Você precisa estar online para escanear notas fiscais.
                </Text>
                
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Home')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={moderateScale(20)} color="#fff" />
                    <Text style={styles.backButtonText}>Voltar para Início</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return <ScanScreen navigation={navigation} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(30),
    },
    iconContainer: {
        width: moderateScale(120),
        height: moderateScale(120),
        borderRadius: moderateScale(60),
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: moderateScale(30),
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#333',
        marginBottom: moderateScale(16),
        textAlign: 'center',
    },
    message: {
        fontSize: moderateScale(16),
        color: '#666',
        textAlign: 'center',
        lineHeight: moderateScale(24),
        marginBottom: moderateScale(40),
    },
    backButton: {
        flexDirection: 'row',
        backgroundColor: '#667eea',
        paddingHorizontal: moderateScale(28),
        paddingVertical: moderateScale(16),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        gap: moderateScale(10),
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    backButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#fff',
    },
});
