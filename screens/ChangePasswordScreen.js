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
import { useAuth } from '../contexts/AuthContext';
import { moderateScale, fontScale } from '../utils/responsive';
import { theme } from '../utils/theme';
import { GradientHeader } from '../components/common';

export default function ChangePasswordScreen({ navigation }) {
    const { changePassword, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword.trim()) {
            Alert.alert('Atenção', 'Digite sua senha atual');
            return;
        }

        if (!newPassword.trim()) {
            Alert.alert('Atenção', 'Digite a nova senha');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Atenção', 'A nova senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Atenção', 'As senhas não coincidem');
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Atenção', 'A nova senha deve ser diferente da atual');
            return;
        }

        try {
            setLoading(true);
            
            await changePassword(currentPassword, newPassword);
            
            setLoading(false);
            
            Alert.alert(
                'Sucesso!',
                'Sua senha foi alterada com sucesso. Por segurança, você será desconectado.',
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                            await logout();
                        },
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            setLoading(false);
            const errorMessage = error.response?.data?.message || error.message || 'Não foi possível alterar a senha. Verifique sua senha atual e tente novamente.';
            Alert.alert('Erro', errorMessage);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <GradientHeader 
                icon="lock-closed-outline" 
                title="Alterar Senha"
                subtitle="Mantenha sua conta segura"
                leftButton={
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Formulário */}
                    <View style={styles.form}>
                        {/* Senha Atual */}
                        <Text style={styles.label}>Senha Atual</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Digite sua senha atual"
                                placeholderTextColor="#999"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrentPassword}
                                autoCapitalize="none"
                                maxLength={50}
                            />
                            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                <Ionicons
                                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>

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

                        {/* Confirmar Nova Senha */}
                        <Text style={styles.label}>Confirmar Nova Senha</Text>
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

                        {/* Dica de Segurança */}
                        <View style={styles.securityTip}>
                            <Ionicons name="information-circle-outline" size={20} color="#667eea" />
                            <Text style={styles.securityTipText}>
                                Use uma senha forte com letras, números e caracteres especiais
                            </Text>
                        </View>

                        {/* Botão Alterar Senha */}
                        <TouchableOpacity
                            style={[styles.changeButton, loading && styles.changeButtonDisabled]}
                            onPress={handleChangePassword}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.changeButtonGradient}
                            >
                                {loading ? (
                                    <Text style={styles.changeButtonText}>Alterando...</Text>
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                        <Text style={styles.changeButtonText}>Alterar Senha</Text>
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
        backgroundColor: '#f8f9fa',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: moderateScale(20),
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    label: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: moderateScale(10),
        marginTop: moderateScale(10),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(15),
        paddingHorizontal: moderateScale(16),
        marginBottom: moderateScale(10),
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
    securityTip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        padding: moderateScale(12),
        borderRadius: moderateScale(12),
        marginTop: moderateScale(10),
        marginBottom: moderateScale(20),
        gap: moderateScale(10),
    },
    securityTipText: {
        flex: 1,
        fontSize: fontScale(13),
        color: '#667eea',
        lineHeight: 18,
    },
    changeButton: {
        borderRadius: moderateScale(15),
        overflow: 'hidden',
        marginTop: moderateScale(10),
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    changeButtonDisabled: {
        opacity: 0.6,
    },
    changeButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(16),
        gap: moderateScale(8),
    },
    changeButtonText: {
        color: '#fff',
        fontSize: fontScale(17),
        fontWeight: '700',
    },
});
