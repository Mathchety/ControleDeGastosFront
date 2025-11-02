import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { PrimaryButton } from '../buttons';
import { Input } from '../inputs';
import { LoadingModal } from '../modals';

/**
 * Formulário de Login
 * @param {function} onSuccess - Callback de sucesso
 */
export const LoginForm = ({ onSuccess }) => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erro", "Por favor, preencha o e-mail e a senha.");
            return;
        }
        
        try {
            setLoading(true);
            await login(email, password);
            onSuccess && onSuccess();
        } catch (error) {
            Alert.alert("Erro", error.message || "Não foi possível fazer login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LoadingModal visible={loading} message="Entrando..." />
            <View style={styles.formContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="log-in" size={50} color="#007bff" />
                </View>
                
                <Text style={styles.formTitle}>Bem-vindo de Volta!</Text>
                <Text style={styles.formSubtitle}>Faça login para continuar</Text>
                
                <Input
                    icon="mail-outline"
                    placeholder="E-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <Input
                    icon="lock-closed-outline"
                    placeholder="Senha"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
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
        </>
    );
};

const styles = StyleSheet.create({
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
});
