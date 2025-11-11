import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Hook reutilizável para fade-in de telas
 * Garante que a animação sempre reseta ao entrar na tela
 * e funciona corretamente após erros ou navegações
 * 
 * @param {number} duration - Duração da animação em ms (default: 250)
 * @param {boolean} enabled - Se false, não aplica animação (default: true)
 * @returns {Animated.Value} - Valor animado para usar no opacity
 */
export const useScreenFade = (duration = 250, enabled = true) => {
    const fadeAnim = useRef(new Animated.Value(enabled ? 0 : 1)).current;

    // Reseta e inicia a animação quando a tela ganha foco
    useFocusEffect(() => {
        if (!enabled) {
            // Se desabilitado, mantém opacidade total
            fadeAnim.setValue(1);
            return;
        }

        // Reset para 0
        fadeAnim.setValue(0);
        
        // Inicia fade-in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        }).start();
        
        // Cleanup: reseta ao sair
        return () => {
            fadeAnim.setValue(0);
        };
    });

    return fadeAnim;
};

/**
 * Hook para adicionar delay progressivo em requisições
 * Previne sobrecarga quando usuário abre tela múltiplas vezes rapidamente
 * 
 * @param {string} screenName - Nome único da tela para controle
 * @returns {Object} - { shouldDelay, getDelay, resetCount }
 */
export const useRequestThrottle = (screenName) => {
    const openCountRef = useRef(0);
    const lastOpenTimeRef = useRef(0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Reseta contador após 5 segundos de inatividade
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const incrementCount = () => {
        const now = Date.now();
        const timeSinceLastOpen = now - lastOpenTimeRef.current;

        // Se passou mais de 5 segundos, reseta o contador
        if (timeSinceLastOpen > 5000) {
            openCountRef.current = 1;
        } else {
            openCountRef.current += 1;
        }

        lastOpenTimeRef.current = now;

        // Agenda reset do contador
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            openCountRef.current = 0;
        }, 5000);

        return openCountRef.current;
    };

    const getDelay = () => {
        const count = incrementCount();
        
        // Primeira e segunda vez: sem delay
        if (count <= 2) {
            return 0;
        }
        
        // Terceira vez em diante: adiciona delay progressivo
        // 3ª = 300ms, 4ª = 600ms, 5ª = 900ms, etc.
        return (count - 2) * 300;
    };

    const resetCount = () => {
        openCountRef.current = 0;
        lastOpenTimeRef.current = 0;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    return { getDelay, resetCount, openCount: openCountRef.current };
};
