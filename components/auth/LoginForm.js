import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../contexts/AuthContext';
import { PrimaryButton } from '../buttons';
import { Input } from '../inputs';
import { LoadingModal } from '../modals';
import { moderateScale } from '../../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

/**
 * Formulário de Login
 * @param {function} onSuccess - Callback de sucesso
 * @param {function} onForgotPassword - Callback para esqueceu senha
 */
export const LoginForm = ({ onSuccess, onForgotPassword }) => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    const scrollRef = useRef(null);

    useEffect(() => {
        const loadSavedCredentials = async () => {
            try {
                const savedEmail = await AsyncStorage.getItem('saved_email');
                const savedPassword = await SecureStore.getItemAsync('saved_password');
                
                if (savedEmail) {
                    setEmail(savedEmail);
                }
                
                if (savedPassword) {
                    setPassword(savedPassword);
                }
            } catch (error) {
                console.log('Erro ao carregar credenciais:', error);
            }
        };
        loadSavedCredentials();
    }, []);

    const scrollToInput = (index) => {
        const baseOffset = moderateScale(150);
        const additionalOffset = Platform.OS === 'android' ? 80 : 60;
        const y = Math.max(0, (index * baseOffset) - additionalOffset);
        scrollRef.current?.scrollTo({ y, animated: true });
    };

    const handleLogin = async () => {
        setErrorMessage('');
        
        if (!email || !password) {
            setErrorMessage("Por favor, preencha o e-mail e a senha.");
            return;
        }
        
        try {
            setLoading(true);
            await login(email, password, rememberMe);
            
            if (rememberMe) {
                await AsyncStorage.setItem('saved_email', email);
                await SecureStore.setItemAsync('saved_password', password);
            } else {
                await AsyncStorage.removeItem('saved_email');
                await SecureStore.deleteItemAsync('saved_password');
            }
            
            onSuccess && onSuccess();
        } catch (error) {
            const backendMessage = error.response?.data?.message || 
                                  error.response?.data?.error ||
                                  error.message;
            
            setErrorMessage(backendMessage || "Não foi possível fazer login. Tente novamente.");
        } finally {
            setLoading(false);
        }
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
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                >
                    <View style={styles.formContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="log-in" size={isSmallDevice ? 40 : 50} color="#007bff" />
                        </View>

                        <Text style={styles.formTitle}>Bem-vindo de Volta!</Text>
                        <Text style={styles.formSubtitle}>Faça login para continuar</Text>

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

                        <TouchableOpacity 
                            style={styles.rememberMeContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                                {rememberMe && (
                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                )}
                            </View>
                            <Text style={styles.rememberMeText}>Lembrar-me</Text>
                        </TouchableOpacity>

                        {onForgotPassword && (
                            <TouchableOpacity 
                                style={styles.forgotPassword}
                                onPress={onForgotPassword}
                            >
                                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                            </TouchableOpacity>
                        )}

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
        paddingHorizontal: moderateScale(20),
        paddingTop: isSmallDevice ? moderateScale(20) : moderateScale(40),
        paddingBottom: isSmallDevice ? moderateScale(100) : moderateScale(200),
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: isSmallDevice ? moderateScale(15) : moderateScale(25),
        marginBottom: moderateScale(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    iconContainer: {
        alignSelf: 'center',
        marginBottom: isSmallDevice ? moderateScale(12) : moderateScale(20),
    },
    formTitle: {
        fontSize: isSmallDevice ? moderateScale(22) : moderateScale(26),
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: isSmallDevice ? moderateScale(6) : moderateScale(8),
    },
    formSubtitle: {
        fontSize: isSmallDevice ? moderateScale(14) : moderateScale(16),
        color: '#666',
        textAlign: 'center',
        marginBottom: isSmallDevice ? moderateScale(18) : moderateScale(25),
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: isSmallDevice ? moderateScale(15) : moderateScale(20),
    },
    forgotPasswordText: {
        color: '#007bff',
        fontSize: isSmallDevice ? moderateScale(13) : moderateScale(14),
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
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        padding: moderateScale(14),
        borderRadius: moderateScale(12),
        marginTop: moderateScale(16),
        marginBottom: moderateScale(16),
        borderWidth: 1,
        borderColor: '#d0dff9',
    },
    checkbox: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(6),
        borderWidth: 2,
        borderColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(12),
        backgroundColor: '#fff',
    },
    checkboxActive: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    rememberMeText: {
        fontSize: moderateScale(15),
        color: '#333',
        fontWeight: '600',
    },
});
