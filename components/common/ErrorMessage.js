import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

/**
 * Componente de mensagem de erro com diferentes níveis de severidade
 * 
 * @param {Object} props
 * @param {string} props.message - Mensagem de erro a ser exibida
 * @param {string} props.type - Tipo de erro: 'error', 'warning', 'info'
 * @param {boolean} props.visible - Controla visibilidade
 * @param {function} props.onDismiss - Callback ao fechar
 * @param {number} props.autoDismiss - Tempo em ms para fechar automaticamente (0 = não fecha)
 * @param {boolean} props.showIcon - Mostrar ícone (padrão: true)
 */
export const ErrorMessage = ({ 
    message, 
    type = 'error', 
    visible = false,
    onDismiss,
    autoDismiss = 0,
    showIcon = true
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            if (autoDismiss > 0 && onDismiss) {
                const timer = setTimeout(() => {
                    handleDismiss();
                }, autoDismiss);
                return () => clearTimeout(timer);
            }
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, autoDismiss]);

    const handleDismiss = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            if (onDismiss) onDismiss();
        });
    };

    if (!visible) {
        return null;
    }

    const config = getTypeConfig(type);

    return (
        <Animated.View 
            style={[
                styles.container, 
                { 
                    backgroundColor: config.backgroundColor,
                    opacity: fadeAnim,
                    transform: [{
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                        })
                    }]
                }
            ]}
        >
            {showIcon && (
                <View style={[styles.iconContainer, { backgroundColor: config.iconBackground }]}>
                    <Ionicons name={config.icon} size={moderateScale(20)} color={config.iconColor} />
                </View>
            )}
            
            <Text 
                style={[styles.message, { color: config.textColor }]}
                numberOfLines={0}
            >
                {message}
            </Text>

            {onDismiss && (
                <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={handleDismiss}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={moderateScale(18)} color={config.textColor} />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

/**
 * Configurações de estilo por tipo de erro
 */
const getTypeConfig = (type) => {
    const configs = {
        error: {
            backgroundColor: '#FEE2E2',
            iconBackground: '#DC2626',
            iconColor: '#FFFFFF',
            textColor: '#991B1B',
            icon: 'alert-circle',
        },
        warning: {
            backgroundColor: '#FEF3C7',
            iconBackground: '#F59E0B',
            iconColor: '#FFFFFF',
            textColor: '#92400E',
            icon: 'warning',
        },
        info: {
            backgroundColor: '#DBEAFE',
            iconBackground: '#3B82F6',
            iconColor: '#FFFFFF',
            textColor: '#1E40AF',
            icon: 'information-circle',
        },
        success: {
            backgroundColor: '#D1FAE5',
            iconBackground: '#10B981',
            iconColor: '#FFFFFF',
            textColor: '#065F46',
            icon: 'checkmark-circle',
        },
    };

    return configs[type] || configs.error;
};

/**
 * Hook para mapear código HTTP para mensagem amigável
 */
export const useErrorMessage = () => {
    /**
     * Determina o tipo de erro baseado no código de status
     */
    const getErrorType = useCallback((statusCode) => {
        if (statusCode >= 500) return 'error';
        if (statusCode === 401) return 'warning';
        if (statusCode === 404 || statusCode === 409) return 'info';
        return 'error';
    }, []);

    /**
     * Converte um erro em uma mensagem amigável
     */
    const getErrorMessage = useCallback((error) => {
        // Se já vier com mensagem customizada
        if (error?.message && typeof error.message === 'string') {
            return {
                message: error.message,
                type: getErrorType(error.statusCode)
            };
        }

        const statusCode = error?.statusCode || error?.status || 500;
        
        // Mensagens específicas por código de status e contexto
        const messages = {
            // Validação
            400: 'Por favor, verifique os dados informados e tente novamente.',
            422: 'Dados inválidos. Verifique os campos e tente novamente.',
            
            // Autenticação
            401: 'Sua sessão expirou. Faça login novamente.',
            403: 'Você não tem permissão para realizar esta ação.',
            
            // Recursos
            404: 'Recurso não encontrado. Verifique se o item ainda existe.',
            409: 'Este recurso já existe. Por favor, use outro.',
            410: 'Este recurso não está mais disponível.',
            
            // Rate limiting
            429: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
            
            // Servidor
            500: 'Erro temporário no servidor. Tente novamente em alguns instantes.',
            502: 'Servidor temporariamente indisponível. Tente novamente.',
            503: 'Serviço em manutenção. Tente novamente em breve.',
            504: 'O servidor demorou para responder. Tente novamente.',
        };

        // Mensagens específicas para erros de autenticação
        const authMessages = {
            'user_not_found': 'Usuário não encontrado. Verifique o e-mail digitado.',
            'invalid_credentials': 'E-mail ou senha incorretos. Tente novamente.',
            'email_already_exists': 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.',
            'password_too_short': 'A senha deve ter no mínimo 6 caracteres.',
            'token_expired': 'Código de verificação expirado. Solicite um novo código.',
            'invalid_token': 'Código de verificação inválido. Verifique e tente novamente.',
            'too_many_attempts': 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.',
        };

        // Verifica se há código de erro específico
        const errorCode = error?.code || error?.errorCode;
        if (errorCode && authMessages[errorCode]) {
            return {
                message: authMessages[errorCode],
                type: getErrorType(statusCode)
            };
        }

        return {
            message: messages[statusCode] || 'Ocorreu um erro inesperado. Tente novamente.',
            type: getErrorType(statusCode)
        };
    }, [getErrorType]);

    return useMemo(() => ({ getErrorMessage }), [getErrorMessage]);
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(12),
        borderRadius: moderateScale(10),
        marginVertical: moderateScale(6),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minHeight: moderateScale(45),
        maxWidth: '100%',
        zIndex: 1000,
    },
    iconContainer: {
        width: moderateScale(28),
        height: moderateScale(28),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(10),
        marginTop: moderateScale(2),
    },
    message: {
        flex: 1,
        fontSize: moderateScale(13),
        lineHeight: moderateScale(19),
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    closeButton: {
        padding: moderateScale(4),
        marginLeft: moderateScale(6),
        marginTop: moderateScale(2),
        alignSelf: 'flex-start',
    },
});
