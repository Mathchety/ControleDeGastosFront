import React, { useState, useRef } from 'react';
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

export default function ResetPasswordScreen({ navigation, route }) {
    const { email } = route.params || {};
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
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
        const verificationCode = code.join('');
        
        if (verificationCode.length !== 6) {
            Alert.alert('Atenção', 'Digite o código de 6 dígitos');
            return;
        }

        if (!newPassword.trim()) {
            Alert.alert('Atenção', 'Digite a nova senha');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Atenção', 'As senhas não coincidem');
            return;
        }

        try {
            setLoading(true);
            
            // TODO: Integrar com API quando estiver pronta
            // await authService.resetPassword(email, verificationCode, newPassword);
            
            // Simulação de redefinição
            setTimeout(() => {
                setLoading(false);
                Alert.alert(
                    'Sucesso!',
                    'Sua senha foi redefinida com sucesso. Faça login com sua nova senha.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Auth'),
                        },
                    ]
                );
            }, 1500);
        } catch (error) {
            setLoading(false);
            Alert.alert('Erro', 'Não foi possível redefinir a senha. Verifique o código e tente novamente.');
        }
    };

    const handleResendCode = () => {
        Alert.alert(
            'Reenviar Código',
            'Um novo código foi enviado para seu e-mail.',
            [{ text: 'OK' }]
        );
        // TODO: Integrar com API
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
                            <Ionicons name="key" size={60} color="#fff" />
                        </LinearGradient>
                    </View>

                    {/* Título e Descrição */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Redefinir Senha</Text>
                        <Text style={styles.description}>
                            Digite o código de 6 dígitos enviado para{'\n'}
                            <Text style={styles.email}>{email}</Text>
                        </Text>
                    </View>

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
    email: {
        fontWeight: '600',
        color: '#667eea',
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: moderateScale(10),
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: moderateScale(16),
    },
    codeInput: {
        width: moderateScale(48),
        height: moderateScale(56),
        borderRadius: moderateScale(12),
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        textAlign: 'center',
        fontSize: fontScale(24),
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
        paddingVertical: moderateScale(12),
        marginBottom: moderateScale(30),
    },
    resendText: {
        fontSize: fontScale(14),
        color: '#666',
    },
    resendLink: {
        fontSize: fontScale(14),
        color: '#667eea',
        fontWeight: '600',
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
    resetButton: {
        borderRadius: moderateScale(15),
        overflow: 'hidden',
        marginTop: moderateScale(10),
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    resetButtonDisabled: {
        opacity: 0.6,
    },
    resetButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(16),
        gap: moderateScale(8),
    },
    resetButtonText: {
        color: '#fff',
        fontSize: fontScale(17),
        fontWeight: '700',
    },
});
