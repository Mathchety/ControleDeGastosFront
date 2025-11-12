import React, { useState, useEffect, useRef } from 'react';
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
import { FinansyncLogo } from '../components/common';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

// Componente de formulário reutilizável
const AnimatedForm = ({ isRegisterView, onSuccess, navigation }) => {
    const { login, register } = useAuth();
    
    // Estado para loading
    const [loading, setLoading] = useState(false);
    
    // Handler para esqueceu a senha
    const handleForgotPassword = () => {
        if (navigation) {
            navigation.navigate('ForgotPassword');
        } else {
            console.error('Navigation prop is undefined');
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
            Alert.alert("Erro", "Por favor, preencha o e-mail e a senha.");
            return;
        }
        
        try {
            setLoading(true);
            await login(emailLogin, passwordLogin);
            onSuccess && onSuccess();
        } catch (error) {
            Alert.alert("Erro", error.message || "Não foi possível fazer login.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * handleRegister - Função integrada com API
     */
    const handleRegister = async () => {
        if (!nameRegister || !emailRegister || !passwordRegister) {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
            return;
        }
        
        if (passwordRegister.length < 6) {
            Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        
        try {
            setLoading(true);
            await register(nameRegister, emailRegister, passwordRegister);
            onSuccess && onSuccess();
        } catch (error) {
            Alert.alert("Erro", error.message || "Não foi possível criar a conta.");
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
};

const AuthScreen = ({ navigation }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const headerHeight = useRef(new Animated.Value(1)).current; // 1 = tamanho normal, 0 = pequeno

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                // Anima o header para tamanho pequeno
                Animated.timing(headerHeight, {
                    toValue: 0,
                    duration: 300,
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
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleSuccess = () => {
        // Não precisa navegar manualmente - o AppNavigator faz isso automaticamente
        // quando isAuthenticated muda para true
    };

    // Interpolações para animar o header
    const headerPaddingTop = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [moderateScale(10), moderateScale(60)], // Reduzido de 20 para 10
    });

    const headerPaddingBottom = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [moderateScale(8), moderateScale(50)], // Reduzido de 15 para 8
    });

    const iconSize = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 60], // Reduzido de 30 para 20
    });

    const titleFontSize = headerHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [14, theme.fonts.h1], // Reduzido de 18 para 14
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
                {/* Header com gradiente - SEMPRE visível, apenas muda tamanho */}
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
                        <Animated.View style={{ transform: [{ scale: headerHeight }] }}>
                            <FinansyncLogo size={80} showCircle={false} />
                        </Animated.View>
                        <Animated.Text 
                            style={[
                                styles.headerTitle,
                                { fontSize: titleFontSize }
                            ]}
                        >
                            Finansync
                        </Animated.Text>
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
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    scrollEnabled={true}
                    keyboardDismissMode="on-drag"
                >
                    <AnimatedForm isRegisterView={isRegister} onSuccess={handleSuccess} navigation={navigation} />

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
        ...theme.shadows.medium,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: theme.fonts.h1,
        fontWeight: '700',
        color: '#fff',
        marginTop: theme.spacing.md,
    },
    headerSubtitle: {
        fontSize: theme.fonts.body,
        color: '#fff',
        opacity: 0.9,
        marginTop: theme.spacing.xs,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'android' ? 200 : 150,
    },
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
