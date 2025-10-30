import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Modal base com animação
 */
export const BaseModal = ({ visible, onClose, children, title }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <View
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'timing', duration: 300 }}
                    style={styles.modalContainer}
                >
                    <TouchableOpacity activeOpacity={1}>
                        <View style={styles.modalContent}>
                            {title && (
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{title}</Text>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {children}
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

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

/**
 * Modal de loading
 */
export const LoadingModal = ({ visible, message = 'Carregando...' }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.loadingOverlay}>
                <View
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 300 }}
                    style={styles.loadingContainer}
                >
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

/**
 * Bottom Sheet Modal (desliza de baixo para cima)
 */
export const BottomSheetModal = ({ visible, onClose, children, title, height = 400 }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <View
                    from={{ translateY: height }}
                    animate={{ translateY: 0 }}
                    exit={{ translateY: height }}
                    transition={{ type: 'timing', duration: 300 }}
                    style={[styles.bottomSheet, { height }]}
                >
                    <TouchableOpacity activeOpacity={1}>
                        <View style={styles.bottomSheetHandle} />
                        
                        {title && (
                            <View style={styles.bottomSheetHeader}>
                                <Text style={styles.bottomSheetTitle}>{title}</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        <View style={styles.bottomSheetContent}>
                            {children}
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Base Modal
    modalContainer: {
        width: '85%',
        maxWidth: 400,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },

    // Confirm Modal
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

    // Alert Modal
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

    // Loading Modal
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },

    // Bottom Sheet
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    bottomSheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#ddd',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    bottomSheetContent: {
        padding: 20,
    },
});
