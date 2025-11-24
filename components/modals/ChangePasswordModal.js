import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const ChangePasswordModal = ({ visible, onClose, onSuccess }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateForm = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres');
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return false;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Erro', 'A nova senha deve ser diferente da senha atual');
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onSuccess({
                currentPassword,
                newPassword
            });
            
            Alert.alert(
                'Sucesso!',
                'Sua senha foi alterada com sucesso',
                [{ text: 'OK', onPress: handleClose }]
            );
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                'Erro ao alterar senha. Tente novamente.';
            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <BlurView intensity={90} style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalCard}>
                        {/* Header */}
                        <View style={styles.header}>
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.iconContainer}
                            >
                                <Ionicons name="lock-closed" size={32} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.title}>Alterar Senha</Text>
                            <Text style={styles.subtitle}>
                                Digite sua senha atual e escolha uma nova senha
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Senha Atual */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Senha Atual <Text style={styles.requiredAsterisk}>*</Text></Text>
                                <View style={styles.passwordInputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        placeholder="Digite sua senha atual"
                                        placeholderTextColor="#999"
                                        secureTextEntry={!showCurrentPassword}
                                        autoCapitalize="none"
                                        editable={!loading}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        <Ionicons
                                            name={showCurrentPassword ? "eye-off" : "eye"}
                                            size={22}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Nova Senha */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Nova Senha <Text style={styles.requiredAsterisk}>*</Text></Text>
                                <View style={styles.passwordInputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="Digite sua nova senha (mín. 6 caracteres)"
                                        placeholderTextColor="#999"
                                        secureTextEntry={!showNewPassword}
                                        autoCapitalize="none"
                                        editable={!loading}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        <Ionicons
                                            name={showNewPassword ? "eye-off" : "eye"}
                                            size={22}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirmar Nova Senha */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Confirmar Nova Senha <Text style={styles.requiredAsterisk}>*</Text></Text>
                                <View style={styles.passwordInputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Digite novamente sua nova senha"
                                        placeholderTextColor="#999"
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        editable={!loading}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off" : "eye"}
                                            size={22}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleChangePassword}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={loading ? ['#999', '#999'] : ['#667eea', '#764ba2']}
                                    style={styles.gradientButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Alterar Senha</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </BlurView>
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
    modalContainer: {
        width: '90%',
        maxWidth: 450,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(24),
        ...theme.shadows.large,
    },
    header: {
        alignItems: 'center',
        marginBottom: moderateScale(24),
    },
    iconContainer: {
        width: moderateScale(70),
        height: moderateScale(70),
        borderRadius: moderateScale(35),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: moderateScale(16),
        ...theme.shadows.medium,
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: moderateScale(8),
    },
    subtitle: {
        fontSize: moderateScale(14),
        color: '#666',
        textAlign: 'center',
        lineHeight: moderateScale(20),
    },
    form: {
        marginBottom: moderateScale(24),
    },
    inputContainer: {
        marginBottom: moderateScale(20),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: moderateScale(8),
    },
    requiredAsterisk: {
        color: theme.colors.danger,
        fontWeight: '700',
        marginLeft: moderateScale(4),
    },
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    passwordInput: {
        flex: 1,
        height: moderateScale(50),
        paddingHorizontal: moderateScale(16),
        fontSize: moderateScale(15),
        color: '#1a1a1a',
    },
    eyeButton: {
        padding: moderateScale(12),
    },
    buttons: {
        flexDirection: 'row',
        gap: moderateScale(12),
    },
    button: {
        flex: 1,
        height: moderateScale(50),
        borderRadius: moderateScale(12),
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#666',
    },
    gradientButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: moderateScale(12),
    },
    buttonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
