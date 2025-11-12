import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale, fontScale } from '../utils/responsive';
import { theme } from '../utils/theme';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSendCode = async () => {
        if (!email.trim()) {
            Alert.alert('Atenção', 'Digite seu e-mail');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Atenção', 'Digite um e-mail válido');
            return;
        }

        try {
            setLoading(true);
            
            // TODO: Integrar com API quando estiver pronta
            // await authService.sendPasswordResetCode(email);
            
            // Simulação de envio
            setTimeout(() => {
                setLoading(false);
                Alert.alert(
                    'Código Enviado',
                    'Enviamos um código de verificação para seu e-mail.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('ResetPassword', { email }),
                        },
                    ]
                );
            }, 1500);
        } catch (error) {
            setLoading(false);
            Alert.alert('Erro', 'Não foi possível enviar o código. Tente novamente.');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
                            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                            onPress={handleSendCode}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.sendButtonGradient}
                            >
                                {loading ? (
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
