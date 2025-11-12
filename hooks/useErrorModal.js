import { useState, useCallback } from 'react';
import { getErrorMessage, getErrorTitle, getErrorIcon, getErrorIconColor } from '../utils/errorMessages';

/**
 * 🎨 Hook para gerenciar ErrorModal de forma centralizada
 * 
 * Uso:
 * const { ErrorModalComponent, showError } = useErrorModal();
 * 
 * // Em algum lugar do código:
 * try {
 *   await fetchData();
 * } catch (error) {
 *   showError(error);
 * }
 * 
 * // No render:
 * return (
 *   <>
 *     {ErrorModalComponent}
 *     {...outros componentes}
 *   </>
 * );
 */
export default function useErrorModal() {
    const [errorState, setErrorState] = useState({
        visible: false,
        title: '',
        message: '',
        icon: 'alert-circle',
        iconColor: '#ff6b6b',
    });

    /**
     * Mostra o modal de erro com base no erro da API
     * @param {Error} error - Erro da API
     * @param {string} defaultMessage - Mensagem padrão opcional
     */
    const showError = useCallback((error, defaultMessage) => {
        const title = getErrorTitle(error);
        const message = getErrorMessage(error, defaultMessage);
        const icon = getErrorIcon(error);
        const iconColor = getErrorIconColor(error);

        setErrorState({
            visible: true,
            title,
            message,
            icon,
            iconColor,
        });
    }, []);

    /**
     * Fecha o modal de erro
     */
    const hideError = useCallback(() => {
        setErrorState((prev) => ({ ...prev, visible: false }));
    }, []);

    return {
        errorState,
        showError,
        hideError,
    };
}
