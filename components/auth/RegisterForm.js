import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Keyboard, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { PrimaryButton } from '../buttons';
import { Input } from '../inputs';
import { LoadingModal } from '../modals';
import { moderateScale } from '../../utils/responsive';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700; // iPhone SE, iPhone 8, etc.

/**
 * Formulário de Registro
 * @param {function} onSuccess - Callback de sucesso
 */
export const RegisterForm = ({ onSuccess }) => {
    const { register } = useAuth();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const scrollRef = useRef(null);

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
        // Scroll para o final com cálculo baseado na altura do teclado
        setTimeout(() => {
            // Scroll animado
            scrollRef.current?.scrollToEnd({ animated: true });
            
            // Força um segundo scroll instantâneo com margem extra acima do teclado
            setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: false });
                // Scroll adicional para garantir espaço acima do teclado
                if (keyboardHeight > 0) {
                    scrollRef.current?.scrollTo({ 
                        y: keyboardHeight + moderateScale(80), 
                        animated: false 
                    });
                }
            }, 300);
        }, 100);
    };

    const handleRegister = async () => {
        setErrorMessage(''); // Limpa mensagem de erro anterior
        // Validação do aceite dos termos (LGPD)
        if (!termsAccepted) {
            setErrorMessage('Para criar a conta é necessário aceitar os Termos de Uso e a Política de Privacidade.');
            return;
        }
        
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
                keyboardVerticalOffset={Platform.OS === 'ios' ? (isSmallDevice ? 80 : 0) : 24}
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
                            onFocus={scrollToBottom}
                            required
                        />

                        <Input
                            icon="mail-outline"
                            placeholder="E-mail"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={scrollToBottom}
                            required
                        />

                        <Input
                            icon="lock-closed-outline"
                            placeholder="Senha (mín. 6 caracteres)"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            onFocus={scrollToBottom}
                            required
                        />

                        <View style={{ marginTop: moderateScale(8) }}>
                            <View style={styles.termsBlock}>
                                <View style={styles.termsTopRow}>
                                    <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)} style={styles.checkboxLarge}>
                                        {termsAccepted ? (
                                            <Ionicons name="checkbox" size={22} color="#007bff" />
                                        ) : (
                                            <Ionicons name="square-outline" size={22} color="#666" />
                                        )}
                                    </TouchableOpacity>
                                    <View style={styles.termsTextRow}>
                                        <Text style={styles.termsText}>Li e aceito os </Text>
                                        <Text style={styles.termsLink} onPress={() => navigation.navigate('Terms')}>Termos de Uso e Política de Privacidade</Text>
                                    </View>
                                </View>

                            </View>

                            <PrimaryButton
                                title="Registrar"
                                icon="arrow-forward"
                                onPress={handleRegister}
                                loading={loading}
                                disabled={!termsAccepted || loading}
                                colors={termsAccepted ? ['#007bff', '#0056b3'] : ['#e6e9ef', '#cbd5e1']}
                            />
                        </View>

                        {/* Term details moved to separate screen (Terms). */}
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
        // Menor paddingBottom em telas pequenas para evitar que o conteúdo seja empurrado para fora da tela
        paddingBottom: isSmallDevice ? moderateScale(120) : moderateScale(300),
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
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(12),
    },
    checkbox: {
        marginRight: moderateScale(8),
    },
    checkboxLarge: {
        marginRight: moderateScale(10),
        justifyContent: 'center',
        alignItems: 'center',
        width: moderateScale(32),
        height: moderateScale(32),
    },
    emptyBox: {
        justifyContent: 'center',
        alignItems: 'center',
        width: moderateScale(28),
        height: moderateScale(28),
        borderRadius: moderateScale(4),
        borderWidth: 0,
    },
    termsTextRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    termsBlock: {
        width: '100%',
    },
    termsTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    termsText: {
        flex: 1,
        color: '#333',
        fontSize: isSmallDevice ? moderateScale(12) : moderateScale(13),
    },
    termsLink: {
        color: '#007bff',
        textDecorationLine: 'underline',
    },
    termsContainer: {
        padding: moderateScale(16),
        backgroundColor: '#fff',
        paddingBottom: moderateScale(40),
    },
    termsTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        marginBottom: moderateScale(12),
    },
    termsBody: {
        color: '#333',
        fontSize: moderateScale(14),
        marginBottom: moderateScale(10),
        lineHeight: 20,
    },
    termsClose: {
        marginTop: moderateScale(12),
        alignSelf: 'center',
        paddingVertical: moderateScale(10),
        paddingHorizontal: moderateScale(20),
        backgroundColor: '#007bff',
        borderRadius: 8,
    },
    termsCloseText: {
        color: '#fff',
        fontWeight: '600',
    },
});
