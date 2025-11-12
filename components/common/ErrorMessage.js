import React, { useEffect } from 'react';
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
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        console.log('[ErrorMessage] Props:', { visible, message, type });
        
        if (visible) {
            console.log('[ErrorMessage] Mostrando mensagem de erro');
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

    if (!visible && fadeAnim._value === 0) {
        console.log('[ErrorMessage] Não renderizando (visible=false)');
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
            
            <Text style={[styles.message, { color: config.textColor }]} numberOfLines={3}>
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
    const getErrorMessage = (error) => {
        // Se já vier com mensagem customizada
        if (error?.message && typeof error.message === 'string') {
            return {
                message: error.message,
                type: getErrorType(error.statusCode)
            };
        }

        const statusCode = error?.statusCode || error?.status || 500;
        
        const messages = {
            400: 'Por favor, verifique os dados informados e tente novamente.',
            401: 'Sua sessão expirou. Faça login novamente.',
            403: 'Você não tem permissão para realizar esta ação.',
            404: 'Recurso não encontrado. Verifique se o item ainda existe.',
            409: 'Este recurso já existe. Por favor, use outro.',
            422: 'Dados inválidos. Verifique os campos e tente novamente.',
            429: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
            500: 'Erro temporário no servidor. Tente novamente em alguns instantes.',
            503: 'Serviço temporariamente indisponível. Tente novamente em breve.',
        };

        return {
            message: messages[statusCode] || 'Ocorreu um erro inesperado. Tente novamente.',
            type: getErrorType(statusCode)
        };
    };

    const getErrorType = (statusCode) => {
        if (statusCode >= 500) return 'error';
        if (statusCode === 401) return 'warning';
        if (statusCode === 404 || statusCode === 409) return 'info';
        return 'error';
    };

    return { getErrorMessage };
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(16),
        borderRadius: moderateScale(12),
        marginVertical: moderateScale(8),
        marginHorizontal: moderateScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: moderateScale(32),
        height: moderateScale(32),
        borderRadius: moderateScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(12),
    },
    message: {
        flex: 1,
        fontSize: theme.fonts.body,
        lineHeight: moderateScale(20),
    },
    closeButton: {
        padding: moderateScale(4),
        marginLeft: moderateScale(8),
    },
});
