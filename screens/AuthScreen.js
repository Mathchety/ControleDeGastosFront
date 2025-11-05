import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    KeyboardAvoidingView, 
    Platform,
    Alert,
    Dimensions,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { PrimaryButton } from '../components/buttons';
import { Input } from '../components/inputs';
import { LoadingModal } from '../components/modals';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

// Componente de formulário reutilizável
const AnimatedForm = ({ isRegisterView, onSuccess }) => {
    const { login, register } = useAuth();
    
    // Estado para loading
    const [loading, setLoading] = useState(false);
    
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

const AuthScreen = ({ navigation }) => {
    const [isRegister, setIsRegister] = useState(false);

    const handleSuccess = () => {
        // Não precisa navegar manualmente - o AppNavigator faz isso automaticamente
        // quando isAuthenticated muda para true
    };

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
            >
                {/* Header com gradiente */}
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="wallet" size={60} color="#fff" />
                    <Text style={styles.headerTitle}>Controle de Gastos</Text>
                    <Text style={styles.headerSubtitle}>Gerencie suas finanças com facilidade</Text>
                </LinearGradient>

                {/* Formulário */}
                <View style={styles.content}>
                    <AnimatedForm isRegisterView={isRegister} onSuccess={handleSuccess} />

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
    header: {
        paddingTop: moderateScale(60),
        paddingBottom: moderateScale(50),
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
        ...theme.shadows.medium,
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
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
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
