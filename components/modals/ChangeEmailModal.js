import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const ChangeEmailModal = ({ visible, onClose, onRequestChange, onConfirmChange, currentEmail }) => {
    // 🔒 SEGURANÇA: 3 steps - novo email → código atual → código novo
    const [step, setStep] = useState(1); // 1 = Digite novo email, 2 = Código email ATUAL, 3 = Código email NOVO
    const [newEmail, setNewEmail] = useState('');
    const [tokenOldEmail, setTokenOldEmail] = useState(''); // 🔒 Código do email ATUAL
    const [tokenNewEmail, setTokenNewEmail] = useState(''); // 🔒 Código do email NOVO
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setStep(1);
            setNewEmail('');
            setTokenOldEmail('');
            setTokenNewEmail('');
        }
    }, [visible]);

    const handleRequestChange = async () => {
        if (!newEmail.trim()) {
            Alert.alert('Erro', 'Por favor, digite o novo email');
            return;
        }

        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail.trim())) {
            Alert.alert('Erro', 'Por favor, digite um email válido');
            return;
        }

        if (newEmail.trim().toLowerCase() === currentEmail?.toLowerCase()) {
            Alert.alert('Aviso', 'O email não foi alterado');
            return;
        }

        try {
            setLoading(true);
            await onRequestChange(newEmail.trim());
            Alert.alert(
                '🔒 Códigos de Verificação Enviados',
                `2 códigos foram enviados:\n\n` +
                `📧 Código 1: Enviado para seu email ATUAL (${currentEmail})\n\n` +
                `🆕 Código 2: Enviado para o NOVO email (${newEmail})\n\n` +
                `Você precisará inserir AMBOS os códigos para confirmar a troca.`,
                [{ text: 'Continuar', onPress: () => setStep(2) }]
            );
        } catch (error) {
            Alert.alert('Erro', error.message || 'Não foi possível solicitar a troca de email');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmChange = async () => {
        if (!tokenOldEmail.trim() || !tokenNewEmail.trim()) {
            Alert.alert('Erro', 'Por favor, digite ambos os códigos de verificação');
            return;
        }

        try {
            setLoading(true);
            await onConfirmChange(newEmail.trim(), tokenOldEmail.trim(), tokenNewEmail.trim());
            Alert.alert('✅ Sucesso', 'Email atualizado com sucesso! Ambos os códigos foram validados.');
            handleClose();
        } catch (error) {
            // Mensagens de erro específicas por código
            const errorMsg = error.message || 'Código inválido ou expirado';
            Alert.alert('Erro', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setNewEmail('');
        setTokenOldEmail('');
        setTokenNewEmail('');
        setLoading(false);
        onClose();
    };

    const handleBack = () => {
        if (step === 3) {
            setStep(2);
            setTokenNewEmail('');
        } else if (step === 2) {
            setStep(1);
            setTokenOldEmail('');
            setTokenNewEmail('');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.header}
                    >
                        <Ionicons name="mail" size={moderateScale(32)} color="#fff" />
                        <Text style={styles.title}>
                            {step === 1 && 'Alterar Email'}
                            {step === 2 && '🔒 Verificar Email Atual'}
                            {step === 3 && '🆕 Verificar Novo Email'}
                        </Text>
                        {step === 2 && (
                            <Text style={styles.subtitle}>
                                Código enviado para {currentEmail}
                            </Text>
                        )}
                        {step === 3 && (
                            <Text style={styles.subtitle}>
                                Código enviado para {newEmail}
                            </Text>
                        )}
                    </LinearGradient>

                    {/* Body */}
                    <View style={styles.body}>
                        {step === 1 ? (
                            <>
                                <Text style={styles.label}>Email Atual</Text>
                                <View style={styles.currentEmailContainer}>
                                    <Text style={styles.currentEmail}>{currentEmail}</Text>
                                </View>

                                <Text style={styles.label}>Novo Email <Text style={styles.requiredAsterisk}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Digite o novo email"
                                    value={newEmail}
                                    onChangeText={setNewEmail}
                                    maxLength={254}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />

                                <View style={styles.securityWarning}>
                                    <Ionicons name="shield-checkmark" size={moderateScale(20)} color="#667eea" />
                                    <Text style={styles.securityWarningText}>
                                        Por segurança, você receberá 2 códigos: um no seu email atual e outro no novo email.
                                    </Text>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={handleClose}
                                        disabled={loading}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                                        onPress={handleRequestChange}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.submitButtonText}>Continuar</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : step === 2 ? (
                            <>
                                <View style={styles.securityAlert}>
                                    <Ionicons name="alert-circle" size={moderateScale(24)} color="#f59e0b" />
                                    <Text style={styles.securityAlertText}>
                                        Verifique seu email ATUAL ({currentEmail}) e insira o código recebido.
                                    </Text>
                                </View>

                                <Text style={styles.infoText}>
                                    Digite o código de 6 dígitos enviado para seu email atual
                                </Text>

                                <Text style={styles.label}>Código de Verificação (Email Atual) <Text style={styles.requiredAsterisk}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, styles.codeInput]}
                                    placeholder="000000"
                                    value={tokenOldEmail}
                                    onChangeText={setTokenOldEmail}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    editable={!loading}
                                />

                                <TouchableOpacity
                                    style={styles.resendButton}
                                    onPress={handleRequestChange}
                                    disabled={loading}
                                >
                                    <Text style={styles.resendButtonText}>Reenviar códigos</Text>
                                </TouchableOpacity>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={handleBack}
                                        disabled={loading}
                                    >
                                        <Text style={styles.cancelButtonText}>Voltar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                                        onPress={() => setStep(3)}
                                        disabled={loading || tokenOldEmail.length !== 6}
                                    >
                                        <Text style={styles.submitButtonText}>Próximo</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.securityAlert}>
                                    <Ionicons name="checkmark-circle" size={moderateScale(24)} color="#10b981" />
                                    <Text style={styles.securityAlertText}>
                                        Email atual verificado! ✅ Agora verifique o código do NOVO email ({newEmail}).
                                    </Text>
                                </View>

                                <Text style={styles.infoText}>
                                    Digite o código de 6 dígitos enviado para seu novo email
                                </Text>

                                <Text style={styles.label}>Código de Verificação (Novo Email) <Text style={styles.requiredAsterisk}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, styles.codeInput]}
                                    placeholder="000000"
                                    value={tokenNewEmail}
                                    onChangeText={setTokenNewEmail}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    editable={!loading}
                                />

                                <TouchableOpacity
                                    style={styles.resendButton}
                                    onPress={handleRequestChange}
                                    disabled={loading}
                                >
                                    <Text style={styles.resendButtonText}>Reenviar códigos</Text>
                                </TouchableOpacity>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={handleBack}
                                        disabled={loading}
                                    >
                                        <Text style={styles.cancelButtonText}>Voltar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                                        onPress={handleConfirmChange}
                                        disabled={loading || tokenNewEmail.length !== 6}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.submitButtonText}>Confirmar</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        width: '85%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    header: {
        padding: moderateScale(24),
        alignItems: 'center',
        gap: moderateScale(8),
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#fff',
    },
    subtitle: {
        fontSize: moderateScale(13),
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    body: {
        padding: moderateScale(24),
        gap: moderateScale(16),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: moderateScale(8),
    },
    requiredAsterisk: {
        color: theme.colors.danger,
        fontWeight: '700',
        marginLeft: moderateScale(4),
    },
    currentEmailContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    currentEmail: {
        fontSize: moderateScale(16),
        color: '#666',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        fontSize: moderateScale(16),
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    codeInput: {
        textAlign: 'center',
        fontSize: moderateScale(24),
        letterSpacing: 2,
        fontWeight: '600',
    },
    infoText: {
        fontSize: moderateScale(14),
        color: '#666',
        textAlign: 'center',
        lineHeight: moderateScale(20),
    },
    resendButton: {
        alignSelf: 'center',
        padding: moderateScale(8),
    },
    resendButtonText: {
        fontSize: moderateScale(14),
        color: '#667eea',
        fontWeight: '600',
    },
    securityWarning: {
        flexDirection: 'row',
        backgroundColor: '#eff6ff',
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        gap: moderateScale(10),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    securityWarningText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#1e40af',
        lineHeight: moderateScale(18),
    },
    securityAlert: {
        flexDirection: 'row',
        backgroundColor: '#fffbeb',
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        gap: moderateScale(10),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    securityAlertText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#92400e',
        lineHeight: moderateScale(18),
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: moderateScale(12),
        marginTop: moderateScale(8),
    },
    button: {
        flex: 1,
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    cancelButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#667eea',
    },
    submitButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
