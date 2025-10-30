import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BaseModal } from './BaseModal';

/**
 * Modal de alerta simples
 */
export const AlertModal = ({ visible, onClose, title, message, type = 'info', buttonText = 'OK' }) => {
    const iconName = {
        info: 'information-circle',
        warning: 'warning',
        error: 'close-circle',
        success: 'checkmark-circle',
    }[type];

    const iconColor = {
        info: '#667eea',
        warning: '#f59e0b',
        error: '#ef4444',
        success: '#10b981',
    }[type];

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <View style={styles.alertContent}>
                <Ionicons name={iconName} size={60} color={iconColor} />
                <Text style={styles.alertTitle}>{title}</Text>
                <Text style={styles.alertMessage}>{message}</Text>

                <TouchableOpacity style={styles.alertButton} onPress={onClose}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.alertButtonGradient}
                    >
                        <Text style={styles.alertButtonText}>{buttonText}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    alertContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    alertTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginTop: 15,
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    alertButton: {
        width: '100%',
    },
    alertButtonGradient: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    alertButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
