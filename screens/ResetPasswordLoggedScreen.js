import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { moderateScale, fontScale } from '../utils/responsive';
import { theme } from '../utils/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

export default function ResetPasswordLoggedScreen({ navigation, route }) {
    const { email } = route.params || {};
    const { resetPassword, forgotPassword, logout } = useAuth();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Refs para os inputs do código
    const codeInputs = useRef([]);

    const handleCodeChange = (text, index) => {
        // Remove caracteres não numéricos
        const numericText = text.replace(/[^0-9]/g, '');
        
        if (numericText.length > 1) {
            // Se colar múltiplos dígitos, distribui entre os campos
            const digits = numericText.split('').slice(0, 6);
            const newCode = [...code];
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newCode[index + i] = digit;
                }
            });
            setCode(newCode);
            
            // Foca no último campo preenchido ou no próximo vazio
            const nextIndex = Math.min(index + digits.length, 5);
            codeInputs.current[nextIndex]?.focus();
        } else {
            // Atualiza apenas o campo atual
            const newCode = [...code];
            newCode[index] = numericText;
            setCode(newCode);
            
            // Avança para o próximo campo se digitou algo
            if (numericText && index < 5) {
                codeInputs.current[index + 1]?.focus();
            }
        }
    };

    const handleCodeKeyPress = (e, index) => {
        // Volta para o campo anterior ao deletar
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            codeInputs.current[index - 1]?.focus();
        }
    };

    const handleResetPassword = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        
        const verificationCode = code.join('');
        
        if (verificationCode.length !== 6) {
            setErrorMessage('Digite o código de 6 dígitos');
            return;
        }

        if (!newPassword.trim()) {
            setErrorMessage('Digite a nova senha');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('As senhas não coincidem');
            return;
        }

        try {
            setLoading(true);
            
            await resetPassword(email, verificationCode, newPassword);
            
            setLoading(false);
            setSuccessMessage('Senha alterada com sucesso!');
            
            // Alert para confirmar logout
            Alert.alert(
                'Senha Alterada!',
                'Sua senha foi alterada com sucesso. Você será desconectado para fazer login com a nova senha.',
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                            await logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Auth' }],
                            });
                        }
                    }
                ],
                { cancelable: false }
            );
        } catch (error) {
            setLoading(false);
            
            const backendMessage = error.response?.data?.message || 
                                  error.response?.data?.error ||
                                  error.message;
            
            setErrorMessage(backendMessage || 'Não foi possível redefinir a senha. Verifique o código e tente novamente.');
        }
    };

    const handleResendCode = async () => {
        try {
            setLoading(true);
            
            await forgotPassword(email);
            
            setLoading(false);
            Alert.alert(
                'Código Reenviado',
                'Um novo código de verificação foi enviado para seu e-mail.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            setLoading(false);
            const errorMessage = error.message || 'Não foi possível reenviar o código. Tente novamente.';
            Alert.alert('Erro', errorMessage);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* Ícone */}
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.iconGradient}
                        >
                            <Ionicons name="key" size={isSmallDevice ? 40 : 50} color="#fff" />
                        </LinearGradient>
                    </View>

                    {/* Título e Descrição */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Redefinir Senha</Text>
                        <Text style={styles.description}>
                            Digite o código de 6 dígitos enviado para{'\n'}
                            <Text style={styles.email}>{email}</Text>
                        </Text>
                        <Text style={styles.logoutWarning}>
                            Após redefinir a senha, você será desconectado para fazer login com a nova senha.
                        </Text>
                    </View>

                    {/* Mensagem de Erro */}
                    {errorMessage ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color="#ef4444" />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    {/* Mensagem de Sucesso */}
                    {successMessage ? (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <Text style={styles.successText}>{successMessage}</Text>
                        </View>
                    ) : null}

                    {/* Formulário */}
                    <View style={styles.form}>
                        {/* Código de Verificação */}
                        <Text style={styles.label}>Código de Verificação</Text>
                        <View style={styles.codeContainer}>
                            {code.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (codeInputs.current[index] = ref)}
                                    style={[
                                        styles.codeInput,
                                        digit && styles.codeInputFilled,
                                    ]}
                                    value={digit}
                                    onChangeText={(text) => handleCodeChange(text, index)}
                                    onKeyPress={(e) => handleCodeKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {/* Link Reenviar Código */}
                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResendCode}
                        >
                            <Text style={styles.resendText}>Não recebeu o código? </Text>
                            <Text style={styles.resendLink}>Reenviar</Text>
                        </TouchableOpacity>

                        {/* Nova Senha */}
                        <Text style={styles.label}>Nova Senha</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mínimo 6 caracteres"
                                placeholderTextColor="#999"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                                maxLength={50}
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                <Ionicons
                                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Confirmar Senha */}
                        <Text style={styles.label}>Confirmar Senha</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Digite a senha novamente"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                maxLength={50}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Botão Redefinir */}
                        <TouchableOpacity
                            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.resetButtonGradient}
                            >
                                {loading ? (
                                    <Text style={styles.resetButtonText}>Redefinindo...</Text>
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                        <Text style={styles.resetButtonText}>Redefinir Senha</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: moderateScale(isSmallDevice ? 14 : 20),
        paddingBottom: Platform.OS === 'android' ? moderateScale(180) : moderateScale(120),
    },
    header: {
        paddingTop: moderateScale(isSmallDevice ? 8 : 12),
        marginBottom: moderateScale(isSmallDevice ? 12 : 18),
    },
    backButton: {
        width: moderateScale(isSmallDevice ? 36 : 40),
        height: moderateScale(isSmallDevice ? 36 : 40),
        borderRadius: moderateScale(18),
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: moderateScale(isSmallDevice ? 14 : 20),
    },
    iconGradient: {
        width: moderateScale(isSmallDevice ? 80 : 100),
        height: moderateScale(isSmallDevice ? 80 : 100),
        borderRadius: moderateScale(isSmallDevice ? 40 : 50),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    textContainer: {
        marginBottom: moderateScale(isSmallDevice ? 16 : 24),
    },
    title: {
        fontSize: moderateScale(isSmallDevice ? 18 : 24),
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: moderateScale(isSmallDevice ? 6 : 10),
    },
    description: {
        fontSize: moderateScale(isSmallDevice ? 12 : 14),
        color: '#666',
        textAlign: 'center',
        lineHeight: isSmallDevice ? 18 : 22,
        marginBottom: moderateScale(8),
    },
    email: {
        fontWeight: '600',
        color: '#667eea',
    },
    logoutWarning: {
        fontSize: moderateScale(isSmallDevice ? 11 : 12),
        color: '#f59e0b',
        textAlign: 'center',
        fontWeight: '500',
        fontStyle: 'italic',
        marginTop: moderateScale(8),
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
        borderRadius: moderateScale(8),
        padding: moderateScale(isSmallDevice ? 9 : 12),
        marginBottom: moderateScale(isSmallDevice ? 12 : 16),
        marginHorizontal: moderateScale(2),
        gap: moderateScale(isSmallDevice ? 7 : 10),
    },
    errorText: {
        flex: 1,
        color: '#991b1b',
        fontSize: moderateScale(isSmallDevice ? 12 : 13),
        fontWeight: '500',
        lineHeight: isSmallDevice ? 18 : 20,
    },
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d1fae5',
        borderLeftWidth: 3,
        borderLeftColor: '#10b981',
        borderRadius: moderateScale(8),
        padding: moderateScale(isSmallDevice ? 9 : 12),
        marginBottom: moderateScale(isSmallDevice ? 12 : 16),
        marginHorizontal: moderateScale(2),
        gap: moderateScale(isSmallDevice ? 7 : 10),
    },
    successText: {
        flex: 1,
        color: '#065f46',
        fontSize: moderateScale(isSmallDevice ? 12 : 13),
        fontWeight: '500',
        lineHeight: isSmallDevice ? 18 : 20,
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: moderateScale(isSmallDevice ? 12 : 13),
        fontWeight: '600',
        color: '#333',
        marginBottom: moderateScale(isSmallDevice ? 6 : 8),
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: moderateScale(isSmallDevice ? 10 : 14),
        gap: moderateScale(4),
    },
    codeInput: {
        flex: 1,
        height: moderateScale(isSmallDevice ? 42 : 48),
        borderRadius: moderateScale(10),
        backgroundColor: '#f8f9fa',
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        textAlign: 'center',
        fontSize: moderateScale(isSmallDevice ? 18 : 20),
        fontWeight: '700',
        color: '#333',
    },
    codeInputFilled: {
        borderColor: '#667eea',
        backgroundColor: '#f0f4ff',
    },
    resendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(isSmallDevice ? 8 : 10),
        marginBottom: moderateScale(isSmallDevice ? 14 : 18),
    },
    resendText: {
        fontSize: moderateScale(isSmallDevice ? 11 : 12),
        color: '#666',
    },
    resendLink: {
        fontSize: moderateScale(isSmallDevice ? 11 : 12),
        color: '#667eea',
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(12),
        marginBottom: moderateScale(isSmallDevice ? 12 : 14),
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginTop: moderateScale(isSmallDevice ? 8 : 4),
    },
    inputIcon: {
        marginRight: moderateScale(10),
    },
    input: {
        flex: 1,
        height: moderateScale(isSmallDevice ? 44 : 48),
        fontSize: moderateScale(13),
        color: '#333',
    },
    resetButton: {
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        marginTop: moderateScale(isSmallDevice ? 12 : 10),
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    resetButtonDisabled: {
        opacity: 0.6,
    },
    resetButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(isSmallDevice ? 11 : 13),
        gap: moderateScale(isSmallDevice ? 5 : 7),
    },
    resetButtonText: {
        color: '#fff',
        fontSize: moderateScale(isSmallDevice ? 13 : 15),
        fontWeight: '700',
    },
});
