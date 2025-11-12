import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { PrimaryButton } from '../buttons';
import { Input } from '../inputs';
import { LoadingModal } from '../modals';
import { moderateScale } from '../../utils/responsive';

/**
 * Formulário de Login
 * @param {function} onSuccess - Callback de sucesso
 */
export const LoginForm = ({ onSuccess }) => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        setErrorMessage(''); // Limpa mensagem de erro anterior
        
        if (!email || !password) {
            setErrorMessage("Por favor, preencha o e-mail e a senha.");
            return;
        }
        
        try {
            setLoading(true);
            await login(email, password);
            onSuccess && onSuccess();
        } catch (error) {
            // Extrai a mensagem de erro do backend
            const backendMessage = error.response?.data?.message || 
                                  error.response?.data?.error ||
                                  error.message;
            
            setErrorMessage(backendMessage || "Não foi possível fazer login. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const scrollRef = useRef(null);

    const scrollToInput = (index) => {
        // Offset maior para garantir que o input fique bem visível acima do teclado
        // Aumentado para compensar o header menor
        const baseOffset = moderateScale(150); // Aumentado de 120 para 150
        const additionalOffset = Platform.OS === 'android' ? 80 : 60; // Aumentado
        const y = Math.max(0, (index * baseOffset) - additionalOffset);
        scrollRef.current?.scrollTo({ y, animated: true });
    };

    return (
        <>
            <LoadingModal visible={loading} message="Entrando..." />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
            >
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="log-in" size={50} color="#007bff" />
                        </View>

                        <Text style={styles.formTitle}>Bem-vindo de Volta!</Text>
                        <Text style={styles.formSubtitle}>Faça login para continuar</Text>

                        {/* Mensagem de Erro */}
                        {errorMessage ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <Input
                            icon="mail-outline"
                            placeholder="E-mail"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => scrollToInput(0)}
                        />

                        <Input
                            icon="lock-closed-outline"
                            placeholder="Senha"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => scrollToInput(1)}
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                        </TouchableOpacity>

                        <PrimaryButton
                            title="Entrar"
                            icon="arrow-forward"
                            onPress={handleLogin}
                            loading={loading}
                            colors={['#007bff', '#0056b3']}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: moderateScale(20),
        paddingVertical: moderateScale(24),
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    iconContainer: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#007bff',
        fontSize: 14,
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        gap: 10,
    },
    errorText: {
        flex: 1,
        color: '#991b1b',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
});
