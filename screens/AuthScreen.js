import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    Keyboard,
    Animated,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; // 🔐 Armazenamento seguro
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { PrimaryButton } from '../components/buttons';
import { Input } from '../components/inputs';
import { LoadingModal } from '../components/modals';
import { FinansyncLogoSimple, ErrorMessage, useErrorMessage } from '../components/common';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

// Componente de formulário reutilizável
const AnimatedForm = React.memo(({ isRegisterView, onSuccess, navigation }) => {
    const { login, register } = useAuth();
    const { getErrorMessage } = useErrorMessage();
    
    // Estado para loading e erro
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ visible: false, message: '', type: 'error' });
    
    // Handler para esqueceu a senha
    const handleForgotPassword = () => {
        if (navigation) {
            navigation.navigate('ForgotPassword');
        }
    };
    
    // Estado para os campos de Login
    const [emailLogin, setEmailLogin] = useState('');
    const [passwordLogin, setPasswordLogin] = useState('');
    const [rememberMe, setRememberMe] = useState(true); // 🔒 Lembrar-me

    // Estado para os campos de Registro
    const [nameRegister, setNameRegister] = useState('');
    const [emailRegister, setEmailRegister] = useState('');
    const [passwordRegister, setPasswordRegister] = useState('');

    // 🔐 Carrega credenciais salvas de forma segura
    useEffect(() => {
        const loadSavedCredentials = async () => {
            try {
                // Email no AsyncStorage (não é sensível)
                const savedEmail = await AsyncStorage.getItem('saved_email');
                
                // 🔐 Senha no SecureStore (criptografado com hardware)
                const savedPassword = await SecureStore.getItemAsync('saved_password');
                
                if (savedEmail && !isRegisterView) {
                    setEmailLogin(savedEmail);
                }
                
                if (savedPassword && !isRegisterView) {
                    setPasswordLogin(savedPassword);
                }
            } catch (error) {
                console.log('Erro ao carregar credenciais:', error);
            }
        };
        loadSavedCredentials();
    }, [isRegisterView]);

    /**
     * handleLogin - Função integrada com API
     */
    const handleLogin = async () => {
        if (!emailLogin || !passwordLogin) {
            setError({
                visible: true,
                message: "Por favor, preencha o e-mail e a senha.",
                type: 'warning'
            });
            return;
        }
        
        try {
            setLoading(true);
            setError({ visible: false, message: '', type: 'error' });
            await login(emailLogin, passwordLogin, rememberMe); // 🔒 Passa rememberMe
            
            // 🔐 Salva credenciais de forma segura
            if (rememberMe) {
                // Email no AsyncStorage (não é sensível)
                await AsyncStorage.setItem('saved_email', emailLogin);
                // 🔐 Senha no SecureStore (criptografado com hardware)
                await SecureStore.setItemAsync('saved_password', passwordLogin);
            } else {
                await AsyncStorage.removeItem('saved_email');
                await SecureStore.deleteItemAsync('saved_password');
            }
            
            onSuccess && onSuccess();
        } catch (err) {
            const errorInfo = getErrorMessage(err);
            
            setError({
                visible: true,
                message: errorInfo.message,
                type: errorInfo.type
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * handleRegister - Função integrada com API
     */
    const handleRegister = async () => {
        if (!nameRegister || !emailRegister || !passwordRegister) {
            setError({
                visible: true,
                message: "Por favor, preencha todos os campos.",
                type: 'warning'
            });
            return;
        }
        
        if (passwordRegister.length < 6) {
            setError({
                visible: true,
                message: "A senha deve ter pelo menos 6 caracteres.",
                type: 'warning'
            });
            return;
        }
        
        try {
            setLoading(true);
            setError({ visible: false, message: '', type: 'error' });
            await register(nameRegister, emailRegister, passwordRegister);
            onSuccess && onSuccess();
        } catch (err) {
            const errorInfo = getErrorMessage(err);
            setError({
                visible: true,
                message: errorInfo.message,
                type: errorInfo.type
            });
        } finally {
            setLoading(false);
        }
    };

    if (isRegisterView) {
        // FORMULÁRIO DE REGISTRO
        return (
            <>
                <LoadingModal visible={loading} message="Criando conta..." />
                <View style={styles.formContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="person-add" size={50} color="#007bff" />
                    </View>
                    
                    <Text style={styles.formTitle}>Criar Conta</Text>
                    <Text style={styles.formSubtitle}>Junte-se a nós hoje!</Text>
                    
                    <ErrorMessage
                        visible={error.visible}
                        message={error.message}
                        type={error.type}
                        onDismiss={() => setError({ ...error, visible: false })}
                        autoDismiss={5000}
                    />
                    
                    <Input
                        icon="person-outline"
                        placeholder="Nome completo"
                        value={nameRegister}
                        onChangeText={setNameRegister}
                    />

                    <Input
                        icon="mail-outline"
                        placeholder="E-mail"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={emailRegister}
                        onChangeText={setEmailRegister}
                    />

                    <Input
                        icon="lock-closed-outline"
                        placeholder="Senha (mín. 6 caracteres)"
                        secureTextEntry
                        value={passwordRegister}
                        onChangeText={setPasswordRegister}
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
    }

    // FORMULÁRIO DE LOGIN
    return (
        <>
            <LoadingModal visible={loading} message="Entrando..." />
            <View style={styles.formContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="log-in" size={50} color="#007bff" />
                </View>
                
                <Text style={styles.formTitle}>Bem-vindo de Volta!</Text>
                <Text style={styles.formSubtitle}>Faça login para continuar</Text>
                
                <ErrorMessage
                    visible={error.visible}
                    message={error.message}
                    type={error.type}
                    onDismiss={() => setError({ ...error, visible: false })}
                    autoDismiss={5000}
                />
                
                <Input
                    icon="mail-outline"
                    placeholder="E-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={emailLogin}
                    onChangeText={setEmailLogin}
                />

                <Input
                    icon="lock-closed-outline"
                    placeholder="Senha"
                    secureTextEntry
                    value={passwordLogin}
                    onChangeText={setPasswordLogin}
                />

                {/* 🔒 Checkbox Lembrar-me */}
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

                <TouchableOpacity 
                    style={styles.forgotPassword}
                    onPress={handleForgotPassword}
                >
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
});

const AuthScreen = ({ navigation }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const headerHeight = useRef(new Animated.Value(1)).current; // 1 = tamanho normal, 0 = pequeno
    const scrollViewRef = useRef(null);

    const handleSuccess = useCallback(() => {
        // Não precisa navegar manualmente - o AppNavigator faz isso automaticamente
        // quando isAuthenticated muda para true
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                // Anima o header para tamanho pequeno
                Animated.timing(headerHeight, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false,
                }).start();
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
                // Anima o header para tamanho normal
                Animated.timing(headerHeight, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: false,
                }).start();
                // Apenas no iOS volta para o topo
                if (Platform.OS === 'ios') {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Interpolações para animar o header - Ajustado para dispositivos pequenos
    const headerPaddingTop = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [moderateScale(0), moderateScale(isSmallDevice ? 30 : 60)], // Reduzido em dispositivos pequenos
    });

    const headerPaddingBottom = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [moderateScale(0), moderateScale(isSmallDevice ? 15 : 30)], // Reduzido em dispositivos pequenos
    });

    const logoOpacity = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1], // Logo desaparece completamente
    });

    const titleOpacity = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1], // ✨ Título SEMPRE visível
    });

    const subtitleOpacity = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const headerMinHeight = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [moderateScale(20), moderateScale(isSmallDevice ? 140 : 200)], // Header menor em dispositivos pequenos
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="transparent"
                translucent={true}
            />
            <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                enabled={Platform.OS === 'ios'}
            >
                {/* Header com gradiente - Comprime quando teclado abre */}
                <Animated.View style={{ minHeight: headerMinHeight }}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.header}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Animated.View
                            style={[
                                styles.headerContent,
                                {
                                    paddingTop: headerPaddingTop,
                                    paddingBottom: headerPaddingBottom,
                                }
                            ]}
                        >
                            {/* Logo - Some completamente */}
                            <Animated.View 
                                style={{ 
                                    opacity: logoOpacity,
                                    alignItems: 'center',
                                    marginBottom: moderateScale(isSmallDevice ? 6 : 12),
                                }}
                            >
                                <FinansyncLogoSimple size={isSmallDevice ? 50 : 70} />
                            </Animated.View>
                            
                            {/* Título - Some completamente */}
                            <Animated.Text 
                                style={[
                                    styles.headerTitle,
                                    { 
                                        opacity: titleOpacity,
                                        fontSize: moderateScale(isSmallDevice ? 24 : 32),
                                    }
                                ]}
                            >
                                Finansync
                            </Animated.Text>
                            
                            {/* Subtítulo - Some quando teclado abre */}
                            <Animated.Text
                                style={[
                                    styles.headerSubtitle,
                                    { 
                                        opacity: subtitleOpacity,
                                        fontSize: moderateScale(isSmallDevice ? 12 : 14),
                                        marginTop: moderateScale(isSmallDevice ? 3 : 6),
                                    }
                                ]}
                            >
                                Sincronize suas finanças com inteligência
                            </Animated.Text>
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>

                {/* Formulário - Agora com ScrollView */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={Platform.OS === 'ios'}
                    overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
                    nestedScrollEnabled={true}
                >
                    <View style={styles.formWrapper}>
                        <AnimatedForm 
                            key={isRegister ? 'register' : 'login'} 
                            isRegisterView={isRegister} 
                            onSuccess={handleSuccess} 
                            navigation={navigation} 
                        />

                        {/* Toggle entre Login e Registro */}
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleText}>
                                {isRegister ? "Já tem uma conta?" : "Não tem uma conta?"}
                            </Text>
                            <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
                                <Text style={styles.toggleButton}>
                                    {isRegister ? "Entrar" : "Registrar-se"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#667eea', // Cor roxa do gradiente para a barra de status
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: moderateScale(20),
        paddingBottom: Platform.OS === 'android' 
            ? moderateScale(80) // Mais espaço no Android para evitar sobreposição
            : moderateScale(isSmallDevice ? 40 : 60),
    },
    formWrapper: {
        // Removido flex: 1 e justifyContent para evitar espaço branco
    },
    formContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: moderateScale(20),
        paddingBottom: moderateScale(100), // Espaço extra para os botões de toggle
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0, // Espaço para StatusBar translúcida
        paddingHorizontal: theme.spacing.lg,
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: moderateScale(14),
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginTop: moderateScale(6),
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'visible',
    },
    iconContainer: {
        alignSelf: 'center',
        marginBottom: moderateScale(16),
    },
    formTitle: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: moderateScale(6),
    },
    formSubtitle: {
        fontSize: moderateScale(14),
        color: '#666',
        textAlign: 'center',
        marginBottom: moderateScale(20),
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        padding: moderateScale(14),
        borderRadius: moderateScale(12),
        marginTop: moderateScale(16),
        marginBottom: moderateScale(12),
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#007bff',
        fontSize: 14,
        fontWeight: '600',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
        gap: 5,
    },
    toggleText: {
        fontSize: 15,
        color: '#666',
    },
    toggleButton: {
        fontSize: 15,
        color: '#007bff',
        fontWeight: '700',
    },
});

export default AuthScreen;
