import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

/**
 * Hook para detectar e mostrar avisos de rate limit
 * Mostra avisos com base nos headers de rate limit do servidor e mensagens de erro 429
 */
export const useRateLimitWarning = () => {
    const rateLimitAlertShown = useRef(false);

    /**
     * Processa erro 429 (Too Many Requests) com a mensagem do servidor
     */
    const handleRateLimitError = (error, endpoint) => {
        if (error.statusCode === 429) {
            let title = '⏳ Limite de tentativas atingido';
            let message = error.message || 'Você atingiu o limite de tentativas. Por favor, aguarde alguns instantes e tente novamente';

            // Identifica qual tipo de rate limit foi atingido para customizar mensagem
            if (endpoint.includes('/login')) {
                title = '🔐 Muitas tentativas de login';
                message = message === 'Você atingiu o limite de tentativas. Por favor, aguarde alguns instantes e tente novamente'
                    ? `${message}\n\nLimite: 6 tentativas por minuto`
                    : message;
            } else if (endpoint.includes('/register')) {
                title = '👤 Limite de cadastros atingido';
                message = message === 'Você atingiu o limite de tentativas. Por favor, aguarde alguns instantes e tente novamente'
                    ? `${message}\n\nLimite: 2 cadastros por minuto`
                    : message;
            } else if (endpoint.includes('/forgot-password')) {
                title = '🔑 Limite de recuperação de senha atingido';
                message = message === 'Você atingiu o limite de tentativas. Por favor, aguarde alguns instantes e tente novamente'
                    ? `${message}\n\nLimite: 5 tentativas por hora`
                    : message;
            }

            // Evita mostrar múltiplos alertas do mesmo erro
            if (!rateLimitAlertShown.current) {
                rateLimitAlertShown.current = true;
                Alert.alert(title, message, [
                    {
                        text: 'OK',
                        onPress: () => {
                            rateLimitAlertShown.current = false;
                        }
                    }
                ]);
            }

            return true; // Indica que foi bloqueado
        }

        return false; // Não foi rate limit
    };

    /**
     * Processa headers de rate limit da resposta
     * Formatos esperados:
     * - X-RateLimit-Limit: Total de requisições permitidas
     * - X-RateLimit-Remaining: Requisições restantes
     * - X-RateLimit-Reset: Timestamp de quando o limite reseta
     * - X-RateLimit-RetryAfter: Segundos até poder tentar novamente (em caso de bloqueio)
     */
    const handleRateLimitHeaders = (headers, endpoint) => {
        const limit = headers['x-ratelimit-limit'];
        const remaining = headers['x-ratelimit-remaining'];
        const reset = headers['x-ratelimit-reset'];
        const retryAfter = headers['x-ratelimit-retryafter'];

        // Se bloqueado (429 ou retryAfter), mostra alerta
        if (retryAfter) {
            const seconds = parseInt(retryAfter, 10);
            const minutes = Math.ceil(seconds / 60);

            let message = '';
            let title = '⏳ Limite de tentativas atingido';

            // Identifica qual tipo de rate limit foi atingido
            if (endpoint.includes('/login')) {
                title = '🔐 Muitas tentativas de login';
                message = `Você atingiu o limite de tentativas. Aguarde ${minutes} minuto${minutes > 1 ? 's' : ''} e tente novamente.\n\nLimite: 6 tentativas por minuto`;
            } else if (endpoint.includes('/register')) {
                title = '👤 Limite de cadastros atingido';
                message = `Você atingiu o limite de tentativas. Aguarde ${minutes} minuto${minutes > 1 ? 's' : ''} e tente novamente.\n\nLimite: 2 cadastros por minuto`;
            } else if (endpoint.includes('/forgot-password')) {
                title = '🔑 Limite de recuperação de senha atingido';
                message = `Você atingiu o limite de tentativas. Aguarde ${minutes} minuto${minutes > 1 ? 's' : ''} e tente novamente.\n\nLimite: 5 tentativas por hora`;
            } else {
                message = `Muitas requisições. Tente novamente em ${minutes} minuto${minutes > 1 ? 's' : ''}.`;
            }

            // Evita mostrar múltiplos alertas do mesmo erro
            if (!rateLimitAlertShown.current) {
                rateLimitAlertShown.current = true;
                Alert.alert(title, message, [
                    {
                        text: 'OK',
                        onPress: () => {
                            rateLimitAlertShown.current = false;
                        }
                    }
                ]);
            }

            return true; // Indica que foi bloqueado
        }

        // Se perto do limite, mostra aviso (quando faltam poucas tentativas)
        if (remaining && limit) {
            const remainingNum = parseInt(remaining, 10);
            const limitNum = parseInt(limit, 10);

            // Se faltam 2 ou menos tentativas, avisa
            if (remainingNum > 0 && remainingNum <= 2) {
                let warningMessage = '';
                let title = '⚠️ Cuidado';

                if (endpoint.includes('/login')) {
                    title = '⚠️ Limite de login se aproximando';
                    warningMessage = `Você tem apenas ${remainingNum} tentativa${remainingNum > 1 ? 's' : ''} restante${remainingNum > 1 ? 's' : ''}.\n\nLimite: 6 tentativas por minuto`;
                } else if (endpoint.includes('/register')) {
                    title = '⚠️ Limite de cadastro se aproximando';
                    warningMessage = `Você tem apenas ${remainingNum} cadastro${remainingNum > 1 ? 's' : ''} restante${remainingNum > 1 ? 's' : ''}.\n\nLimite: 2 cadastros por minuto`;
                } else if (endpoint.includes('/forgot-password')) {
                    title = '⚠️ Limite de recuperação se aproximando';
                    warningMessage = `Você tem apenas ${remainingNum} tentativa${remainingNum > 1 ? 's' : ''} restante${remainingNum > 1 ? 's' : ''}.\n\nLimite: 5 tentativas por hora`;
                }

                if (warningMessage) {
                    // Mostra apenas uma vez por intervalo (não fica mostrando em cada requisição)
                    if (!rateLimitAlertShown.current) {
                        rateLimitAlertShown.current = true;
                        Alert.alert(title, warningMessage, [
                            {
                                text: 'Entendi',
                                onPress: () => {
                                    rateLimitAlertShown.current = false;
                                }
                            }
                        ]);
                    }
                }
            }
        }

        return false; // Não foi bloqueado
    };

    /**
     * Reseta a flag de alerta (útil quando o usuário muda de tela)
     */
    const resetAlert = () => {
        rateLimitAlertShown.current = false;
    };

    return {
        handleRateLimitError,
        handleRateLimitHeaders,
        resetAlert
    };
};

export default useRateLimitWarning;

