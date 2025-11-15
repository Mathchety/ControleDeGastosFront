import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * 🌐 Hook de Detectação de Conectividade
 * Monitora a conexão de internet do usuário
 * 
 * @returns {object} { isConnected, isLoading }
 */
export const useConnectivity = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verifica estado inicial de conectividade
        const checkConnection = async () => {
            try {
                const state = await NetInfo.fetch();
                setIsConnected(state.isConnected && state.isInternetReachable);
            } catch (error) {
                console.error('Erro ao verificar conectividade:', error);
                setIsConnected(true); // Assume conectado em caso de erro
            } finally {
                setIsLoading(false);
            }
        };

        checkConnection();

        // Monitora mudanças de conectividade
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected && state.isInternetReachable);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { isConnected, isLoading };
};
