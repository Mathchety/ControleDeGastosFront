import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { PrimaryButton } from '../buttons';
import { Input } from '../inputs';
import { LoadingModal } from '../modals';

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

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
            return;
        }
        
        if (password.length < 6) {
            Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        
        try {
            setLoading(true);
            await register(name, email, password);
            onSuccess && onSuccess();
        } catch (error) {
            Alert.alert("Erro", error.message || "Não foi possível criar a conta.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LoadingModal visible={loading} message="Criando conta..." />
            <View style={styles.formContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="person-add" size={50} color="#007bff" />
                </View>
                
                <Text style={styles.formTitle}>Criar Conta</Text>
                <Text style={styles.formSubtitle}>Junte-se a nós hoje!</Text>
                
                <Input
                    icon="person-outline"
                    placeholder="Nome completo"
                    value={name}
                    onChangeText={setName}
                />

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
                    placeholder="Senha (mín. 6 caracteres)"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <PrimaryButton
                    title="Registrar"
                    icon="arrow-forward"
                    onPress={handleRegister}
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
});
