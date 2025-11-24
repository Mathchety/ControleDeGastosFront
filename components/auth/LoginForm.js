import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Keyboard } from 'react-native';
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
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);

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

    // Detecta a altura do teclado - funciona melhor em iOS e Android
    useEffect(() => {
        const keyboardDidShow = (e) => {
            // Apenas scroll automático quando teclado abre
            scrollRef.current?.scrollToEnd({ animated: true });
        };

        // iOS: usar keyboardWillShow para melhor timing
        const eventNames = Platform.OS === 'ios' 
            ? ['keyboardWillShow', 'keyboardWillHide']
            : ['keyboardDidShow', 'keyboardDidHide'];

        const showSubscription = Keyboard.addListener(eventNames[0], keyboardDidShow);

        return () => {
            showSubscription.remove();
        };
    }, []);

    const scrollToBottom = () => {
        // Scroll apenas o suficiente para manter o input visível
        // Não faz scroll excessivo se já está acima do teclado
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
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
                            onFocus={scrollToBottom}
                            returnKeyType="next"
                            onSubmitEditing={() => passwordInputRef.current?.focus()}
                            blurOnSubmit={false}
                            required
                        />

                        <Input
                            ref={passwordInputRef}
                            icon="lock-closed-outline"
                            placeholder="Senha"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            onFocus={scrollToBottom}
                            returnKeyType="go"
                            onSubmitEditing={handleLogin}
                            required
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
        paddingHorizontal: moderateScale(16),
        paddingTop: isSmallDevice ? moderateScale(8) : moderateScale(20),
        paddingBottom: isSmallDevice ? moderateScale(250) : moderateScale(300),
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: isSmallDevice ? moderateScale(10) : moderateScale(16),
        marginBottom: moderateScale(10),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    iconContainer: {
        alignSelf: 'center',
        marginBottom: isSmallDevice ? moderateScale(5) : moderateScale(10),
    },
    formTitle: {
        fontSize: isSmallDevice ? moderateScale(16) : moderateScale(22),
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: isSmallDevice ? moderateScale(2) : moderateScale(4),
    },
    formSubtitle: {
        fontSize: isSmallDevice ? moderateScale(11) : moderateScale(13),
        color: '#666',
        textAlign: 'center',
        marginBottom: isSmallDevice ? moderateScale(10) : moderateScale(15),
    },
    forgotPassword: {
        alignSelf: 'flex-start',
        marginBottom: isSmallDevice ? moderateScale(12) : moderateScale(12),
    },
    forgotPasswordText: {
        color: '#007bff',
        fontSize: isSmallDevice ? moderateScale(12) : moderateScale(13),
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
        borderRadius: 6,
        padding: isSmallDevice ? moderateScale(9) : moderateScale(12),
        marginBottom: isSmallDevice ? moderateScale(10) : moderateScale(15),
        gap: isSmallDevice ? moderateScale(7) : moderateScale(10),
    },
    errorText: {
        flex: 1,
        color: '#991b1b',
        fontSize: isSmallDevice ? moderateScale(12) : moderateScale(13),
        fontWeight: '500',
        lineHeight: isSmallDevice ? 18 : 20,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        padding: isSmallDevice ? moderateScale(10) : moderateScale(12),
        borderRadius: moderateScale(10),
        marginTop: isSmallDevice ? moderateScale(12) : moderateScale(12),
        marginBottom: isSmallDevice ? moderateScale(12) : moderateScale(12),
        borderWidth: 1,
        borderColor: '#d0dff9',
    },
    checkbox: {
        width: isSmallDevice ? moderateScale(20) : moderateScale(22),
        height: isSmallDevice ? moderateScale(20) : moderateScale(22),
        borderRadius: moderateScale(5),
        borderWidth: 1.5,
        borderColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: isSmallDevice ? moderateScale(9) : moderateScale(10),
        backgroundColor: '#fff',
    },
    checkboxActive: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    rememberMeText: {
        fontSize: isSmallDevice ? moderateScale(13) : moderateScale(14),
        color: '#333',
        fontWeight: '600',
    },
});
