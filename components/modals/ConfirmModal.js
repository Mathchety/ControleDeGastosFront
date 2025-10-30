import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BaseModal } from './BaseModal';

/**
 * Modal de confirmação com botões de ação
 */
export const ConfirmModal = ({ visible, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'info' }) => {
    const iconName = {
        info: 'information-circle',
        warning: 'warning',
        danger: 'alert-circle',
        success: 'checkmark-circle',
    }[type];

    const iconColor = {
        info: '#667eea',
        warning: '#f59e0b',
        danger: '#ef4444',
        success: '#10b981',
    }[type];

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <View style={styles.confirmContent}>
                <Ionicons name={iconName} size={60} color={iconColor} />
                <Text style={styles.confirmTitle}>{title}</Text>
                <Text style={styles.confirmMessage}>{message}</Text>

                <View style={styles.confirmButtons}>
                    <TouchableOpacity 
                        style={[styles.confirmButton, styles.cancelButton]} 
                        onPress={onClose}
                    >
                        <Text style={styles.cancelButtonText}>{cancelText}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.confirmButton} 
                        onPress={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        <LinearGradient
                            colors={type === 'danger' ? ['#ef4444', '#dc2626'] : ['#667eea', '#764ba2']}
                            style={styles.confirmButtonGradient}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    confirmContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    confirmTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginTop: 15,
        marginBottom: 10,
    },
    confirmMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    confirmButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    confirmButton: {
        flex: 1,
    },
    confirmButtonGradient: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});
