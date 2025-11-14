import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from '../../utils/responsive';

/**
 * Modal de Permissão de Câmera
 * Solicitação elegante para acesso à câmera com opções Permitir/Cancelar
 */
export const CameraPermissionModal = ({ visible, onAllow, onCancel, loading = false }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1} 
                onPress={onCancel}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity activeOpacity={1}>
                        <View style={styles.modalContent}>
                            {/* Ícone de Câmera */}
                            <View style={styles.iconContainer}>
                                <View style={styles.iconCircle}>
                                    <Ionicons 
                                        name="camera" 
                                        size={moderateScale(48)} 
                                        color="#667eea"
                                    />
                                </View>
                            </View>

                            {/* Título */}
                            <Text style={styles.title}>Acesso à Câmera</Text>

                            {/* Descrição */}
                            <Text style={styles.description}>
                                Precisamos de permissão para acessar sua câmera para escanear QR Codes das notas fiscais.
                            </Text>

                            {/* Lista de Permissões */}
                            <View style={styles.permissionsList}>
                                <View style={styles.permissionItem}>
                                    <View style={styles.checkCircle}>
                                        <Ionicons name="checkmark" size={16} color="#10b981" />
                                    </View>
                                    <Text style={styles.permissionText}>Escanear QR Codes</Text>
                                </View>
                                <View style={styles.permissionItem}>
                                    <View style={styles.checkCircle}>
                                        <Ionicons name="checkmark" size={16} color="#10b981" />
                                    </View>
                                    <Text style={styles.permissionText}>Importar Notas Fiscais</Text>
                                </View>
                                <View style={styles.permissionItem}>
                                    <View style={styles.checkCircle}>
                                        <Ionicons name="checkmark" size={16} color="#10b981" />
                                    </View>
                                    <Text style={styles.permissionText}>Processar Despesas</Text>
                                </View>
                            </View>

                            {/* Botões de Ação */}
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity 
                                    style={styles.cancelButton}
                                    onPress={onCancel}
                                    disabled={loading}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.allowButtonWrapper}
                                    onPress={onAllow}
                                    disabled={loading}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.allowButton}
                                    >
                                        {loading ? (
                                            <Ionicons name="hourglass" size={20} color="#fff" />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                                <Text style={styles.allowButtonText}>Permitir</Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Rodapé Informativo */}
                            <Text style={styles.footerText}>
                                Você pode alterar essas permissões a qualquer momento nas configurações do aplicativo.
                            </Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        maxWidth: 450,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(24),
        padding: moderateScale(24),
        elevation: 8,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: moderateScale(16),
    },
    iconCircle: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: moderateScale(8),
    },
    description: {
        fontSize: moderateScale(14),
        color: '#666',
        textAlign: 'center',
        lineHeight: moderateScale(22),
        marginBottom: moderateScale(20),
    },
    permissionsList: {
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        marginBottom: moderateScale(20),
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(10),
    },
    checkCircle: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        backgroundColor: '#e8f8f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(12),
    },
    permissionText: {
        fontSize: moderateScale(13),
        color: '#555',
        fontWeight: '500',
        flex: 1,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: moderateScale(12),
        marginBottom: moderateScale(16),
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: moderateScale(12),
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    cancelButtonText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#666',
    },
    allowButtonWrapper: {
        flex: 1,
        borderRadius: moderateScale(12),
        overflow: 'hidden',
    },
    allowButton: {
        flexDirection: 'row',
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(8),
    },
    allowButtonText: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#fff',
    },
    footerText: {
        fontSize: moderateScale(11),
        color: '#999',
        textAlign: 'center',
        lineHeight: moderateScale(16),
        fontStyle: 'italic',
    },
});
