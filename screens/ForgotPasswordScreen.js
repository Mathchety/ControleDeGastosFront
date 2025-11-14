import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { moderateScale, fontScale } from '../utils/responsive';
import { Input } from '../components/inputs';
import { theme } from '../utils/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

export default function ForgotPasswordScreen({ navigation }) {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const scrollRef = useRef(null);

    // Detecta a altura do teclado - funciona melhor em iOS e Android
    useEffect(() => {
        // Não fazemos scroll automático aqui, deixamos o usuario controlar
        // apenas o scroll manual quando clica no input via onFocus
        return () => {};
    }, []);

    const scrollToBottom = () => {
        // Scroll suave apenas quando o usuario clica no input
        // Sem scroll excessivo
        return;
    };

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
            setLocalLoading(true);
            
            // ✅ Integrado com API
            await forgotPassword(email);
            
            
            
            // ✅ NAVEGA ANTES de desativar o loading
            navigation.push('ResetPassword', { email });
            
            
            // Desativa loading só depois
            setLocalLoading(false);
            
            
        } catch (error) {
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
                    ref={scrollRef}
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
                            <Ionicons name="lock-closed" size={isSmallDevice ? 40 : 50} color="#fff" />
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
                        <View style={styles.inputWrapper}>
                            <Input
                                icon="mail-outline"
                                placeholder="Seu e-mail"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                maxLength={100}
                                onFocus={scrollToBottom}
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
        paddingHorizontal: moderateScale(isSmallDevice ? 14 : 20),
        paddingTop: moderateScale(isSmallDevice ? 60 : 80),
        paddingBottom: Platform.OS === 'android' ? moderateScale(200) : moderateScale(150),
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: moderateScale(isSmallDevice ? 8 : 12),
        paddingLeft: moderateScale(isSmallDevice ? 14 : 20),
        zIndex: 10,
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
        width: '100%',
        maxWidth: 500,
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
        width: '100%',
        maxWidth: 500,
        alignItems: 'center',
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
        width: '100%',
        maxWidth: 450,
    },
    errorText: {
        flex: 1,
        color: '#991b1b',
        fontSize: moderateScale(isSmallDevice ? 12 : 13),
        fontWeight: '500',
        lineHeight: isSmallDevice ? 18 : 20,
    },
    form: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        width: '100%',
        maxWidth: 450,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(12),
        marginBottom: moderateScale(isSmallDevice ? 12 : 16),
        borderWidth: 1,
        borderColor: '#e0e0e0',
        width: '100%',
        maxWidth: 450,
    },
    inputIcon: {
        marginRight: moderateScale(10),
    },
    input: {
        flex: 1,
        height: moderateScale(isSmallDevice ? 44 : 48),
        fontSize: moderateScale(14),
        color: '#333',
    },
    sendButton: {
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        marginBottom: moderateScale(isSmallDevice ? 12 : 14),
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
        marginTop: moderateScale(isSmallDevice ? 12 : 8),
        width: '100%',
        maxWidth: 450,
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(isSmallDevice ? 12 : 14),
        gap: moderateScale(isSmallDevice ? 6 : 8),
    },
    sendButtonText: {
        color: '#fff',
        fontSize: moderateScale(isSmallDevice ? 13 : 15),
        fontWeight: '700',
    },
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(6),
        paddingVertical: moderateScale(isSmallDevice ? 8 : 10),
        width: '100%',
        maxWidth: 450,
    },
    backToLoginText: {
        fontSize: moderateScale(isSmallDevice ? 12 : 13),
        color: '#667eea',
        fontWeight: '600',
    },
});
