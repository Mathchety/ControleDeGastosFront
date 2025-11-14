import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { PrimaryButton } from '../buttons';
import { Input } from '../inputs';
import { LoadingModal } from '../modals';
import { moderateScale } from '../../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700; // iPhone SE, iPhone 8, etc.

/**
 * Formulário de Registro
 * @param {function} onSuccess - Callback de sucesso
 */
export const RegisterForm = ({ onSuccess }) => {
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const scrollRef = useRef(null);

    const scrollToInput = (index) => {
        // Offset maior para garantir que o input fique bem visível acima do teclado
        // Aumentado para compensar o header menor
        const baseOffset = moderateScale(150); // Aumentado de 120 para 150
        const additionalOffset = Platform.OS === 'android' ? 80 : 60; // Aumentado
        const y = Math.max(0, (index * baseOffset) - additionalOffset);
        scrollRef.current?.scrollTo({ y, animated: true });
    };

    const handleRegister = async () => {
        setErrorMessage(''); // Limpa mensagem de erro anterior
        
        if (!name || !email || !password) {
            setErrorMessage("Por favor, preencha todos os campos.");
            return;
        }
        
        if (password.length < 6) {
            setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        
        try {
            setLoading(true);
            await register(name, email, password);
            onSuccess && onSuccess();
        } catch (error) {
            // Extrai a mensagem de erro do backend
            const backendMessage = error.response?.data?.message || 
                                  error.response?.data?.error ||
                                  error.message;
            
            setErrorMessage(backendMessage || "Não foi possível criar a conta. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LoadingModal visible={loading} message="Criando conta..." />

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
                            <Ionicons name="person-add" size={isSmallDevice ? 40 : 50} color="#007bff" />
                        </View>

                        <Text style={styles.formTitle}>Criar Conta</Text>
                        <Text style={styles.formSubtitle}>Junte-se a nós hoje!</Text>

                        {/* Mensagem de Erro */}
                        {errorMessage ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <Input
                            icon="person-outline"
                            placeholder="Nome completo"
                            value={name}
                            onChangeText={setName}
                            onFocus={() => scrollToInput(0)}
                        />

                        <Input
                            icon="mail-outline"
                            placeholder="E-mail"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => scrollToInput(1)}
                        />

                        <Input
                            icon="lock-closed-outline"
                            placeholder="Senha (mín. 6 caracteres)"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => scrollToInput(2)}
                        />

                        <PrimaryButton
                            title="Registrar"
                            icon="arrow-forward"
                            onPress={handleRegister}
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
