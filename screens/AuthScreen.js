import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    KeyboardAvoidingView, 
    ScrollView,
    Platform,
    Alert,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    Keyboard,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { PrimaryButton } from '../components/buttons';
import { Input } from '../components/inputs';
import { LoadingModal } from '../components/modals';
import { FinansyncLogoSimple, ErrorMessage, useErrorMessage } from '../components/common';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

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

    // Estado para os campos de Registro
    const [nameRegister, setNameRegister] = useState('');
    const [emailRegister, setEmailRegister] = useState('');
    const [passwordRegister, setPasswordRegister] = useState('');

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
            await login(emailLogin, passwordLogin);
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

    // Garante que a tela começa no topo
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: false });
        }
    }, [isRegister]);

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
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Interpolações para animar o header - OTIMIZADAS para ganhar máximo espaço
    const headerPaddingTop = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [moderateScale(5), moderateScale(60)], // Reduzido de 8 para 5
    });

    const headerPaddingBottom = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [moderateScale(5), moderateScale(30)], // Reduzido de 8 para 5
    });

    const logoScale = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1], // Logo desaparece completamente
    });

    const titleFontSize = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [moderateScale(16), moderateScale(28)], // Reduzido de 18 para 16
    });

    const subtitleOpacity = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <View style={styles.container}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="transparent" 
                translucent={true}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                enabled={true}
            >
                {/* Header com gradiente - Estilo HomeHeader */}
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
                        {/* Logo - Escala suave */}
                        <Animated.View 
                            style={{ 
                                transform: [{ scale: logoScale }],
                                alignItems: 'center',
                                marginBottom: moderateScale(12),
                            }}
                        >
                            <FinansyncLogoSimple size={70} />
                        </Animated.View>
                        
                        {/* Título */}
                        <Animated.Text 
                            style={[
                                styles.headerTitle,
                                { fontSize: titleFontSize }
                            ]}
                        >
                            Finansync
                        </Animated.Text>
                        
                        {/* Subtítulo - Some quando teclado abre */}
                        <Animated.Text
                            style={[
                                styles.headerSubtitle,
                                { opacity: subtitleOpacity }
                            ]}
                        >
                            Sincronize suas finanças com inteligência
                        </Animated.Text>
                    </Animated.View>
                </LinearGradient>

                {/* Formulário */}
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    scrollEnabled={true}
                    keyboardDismissMode="on-drag"
                    automaticallyAdjustContentInsets={false}
                    contentInsetAdjustmentBehavior="never"
                >
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
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
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
    header: {
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
    content: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: moderateScale(20), // Reduzido de 40 para 20
        paddingBottom: Platform.OS === 'android' ? 200 : 150,
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
