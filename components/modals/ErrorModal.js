import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale, fontScale } from '../../utils/responsive';

const { width } = Dimensions.get('window');

/**
 * 🎨 Modal Bonito para Exibir Erros
 * 
 * @param {boolean} visible - Se o modal está visível
 * @param {string} title - Título do erro
 * @param {string} message - Mensagem detalhada do erro
 * @param {string} icon - Nome do ícone (Ionicons)
 * @param {function} onClose - Callback ao fechar
 * @param {string} iconColor - Cor do ícone (opcional)
 */
export default function ErrorModal({
    visible,
    title = 'Erro',
    message = 'Ocorreu um erro inesperado.',
    icon = 'alert-circle',
    onClose,
    iconColor = '#ff6b6b',
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <BlurView intensity={90} style={styles.overlay}>
                <View style={styles.container}>
                    {/* Card do Modal */}
                    <View style={styles.modalCard}>
                        {/* Ícone com Gradiente */}
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={[iconColor, `${iconColor}99`]}
                                style={styles.iconGradient}
                            >
                                <Ionicons name={icon} size={48} color="#fff" />
                            </LinearGradient>
                        </View>

                        {/* Título */}
                        <Text style={styles.title}>{title}</Text>

                        {/* Mensagem */}
                        <Text style={styles.message}>{message}</Text>

                        {/* Botão OK */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Entendi</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
        maxWidth: 400,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(24),
        padding: moderateScale(30),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: moderateScale(20),
    },
    iconGradient: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ff6b6b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: fontScale(22),
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: moderateScale(12),
    },
    message: {
        fontSize: fontScale(15),
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: moderateScale(24),
    },
    button: {
        width: '100%',
        borderRadius: moderateScale(15),
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonGradient: {
        paddingVertical: moderateScale(16),
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: fontScale(17),
        fontWeight: '700',
    },
});
