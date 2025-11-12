import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { moderateScale, fontScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function ForgotPasswordScreen({ navigation }) {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSendCode = async () => {
        setErrorMessage(''); // Limpa mensagem de erro anterior
        
        if (!email.trim()) {
            setErrorMessage('Digite seu e-mail');
            return;
        }

        if (!validateEmail(email)) {
            setErrorMessage('Digite um e-mail válido');
            return;
        }

        try {
            console.log('[ForgotPassword] 1. Iniciando envio de código...');
            setLocalLoading(true);
            
            console.log('[ForgotPassword] 2. Chamando API forgotPassword...');
            // ✅ Integrado com API
            await forgotPassword(email);
            
            console.log('[ForgotPassword] 3. API respondeu com sucesso');
            
            console.log('[ForgotPassword] 4. Navegando IMEDIATAMENTE antes de setLoading(false)');
            
            // ✅ NAVEGA ANTES de desativar o loading
            navigation.push('ResetPassword', { email });
            
            console.log('[ForgotPassword] 5. Navigation.push executado');
            
            // Desativa loading só depois
            setLocalLoading(false);
            
            console.log('[ForgotPassword] 6. Loading desativado');
            
        } catch (error) {
            console.error('[ForgotPassword] ERRO:', error);
            setLocalLoading(false);
            
            // Extrai a mensagem de erro do backend
            const backendMessage = error.response?.data?.message || 
                                  error.response?.data?.error ||
                                  error.message;
            
            setErrorMessage(backendMessage || 'Não foi possível enviar o código. Verifique o e-mail e tente novamente.');
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
                            <Ionicons name="lock-closed" size={60} color="#fff" />
                        </LinearGradient>
                    </View>

                    {/* Título e Descrição */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Esqueceu sua senha?</Text>
                        <Text style={styles.description}>
                            Não se preocupe! Digite seu e-mail e enviaremos um código de verificação para redefinir sua senha.
                        </Text>
                    </View>

                    {/* Mensagem de Erro */}
                    {errorMessage ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color="#ef4444" />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    {/* Formulário */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Seu e-mail"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                maxLength={100}
                            />
                        </View>

                        {/* Botão Enviar Código */}
                        <TouchableOpacity
                            style={[styles.sendButton, localLoading && styles.sendButtonDisabled]}
                            onPress={handleSendCode}
                            disabled={localLoading}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.sendButtonGradient}
                            >
                                {localLoading ? (
                                    <Text style={styles.sendButtonText}>Enviando...</Text>
                                ) : (
                                    <>
                                        <Ionicons name="mail" size={20} color="#fff" />
                                        <Text style={styles.sendButtonText}>Enviar Código</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Link Voltar */}
                        <TouchableOpacity
                            style={styles.backToLogin}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back-circle-outline" size={18} color="#667eea" />
                            <Text style={styles.backToLoginText}>Voltar para o login</Text>
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
        paddingHorizontal: moderateScale(30),
        paddingBottom: Platform.OS === 'android' ? moderateScale(150) : moderateScale(80),
    },
    header: {
        paddingTop: moderateScale(20),
        marginBottom: moderateScale(30),
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: moderateScale(30),
    },
    iconGradient: {
        width: moderateScale(120),
        height: moderateScale(120),
        borderRadius: moderateScale(60),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    textContainer: {
        marginBottom: moderateScale(40),
    },
    title: {
        fontSize: fontScale(28),
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: moderateScale(12),
    },
    description: {
        fontSize: fontScale(15),
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
        borderRadius: moderateScale(10),
        padding: moderateScale(14),
        marginBottom: moderateScale(20),
        marginHorizontal: moderateScale(4),
        gap: 10,
    },
    errorText: {
        flex: 1,
        color: '#991b1b',
        fontSize: fontScale(14),
        fontWeight: '500',
        lineHeight: 20,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(15),
        paddingHorizontal: moderateScale(16),
        marginBottom: moderateScale(20),
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputIcon: {
        marginRight: moderateScale(12),
    },
    input: {
        flex: 1,
        height: moderateScale(56),
        fontSize: fontScale(16),
        color: '#333',
    },
    sendButton: {
        borderRadius: moderateScale(15),
        overflow: 'hidden',
        marginBottom: moderateScale(20),
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(16),
        gap: moderateScale(8),
    },
    sendButtonText: {
        color: '#fff',
        fontSize: fontScale(17),
        fontWeight: '700',
    },
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(8),
        paddingVertical: moderateScale(12),
    },
    backToLoginText: {
        fontSize: fontScale(15),
        color: '#667eea',
        fontWeight: '600',
    },
});
