import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import httpClient from '../services/httpClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimerRef = React.useRef(null); // 🔒 Timer para auto-refresh
  const isInitializingRef = React.useRef(false); // 🚀 Previne múltiplas inicializações

  useEffect(() => {
    // Previne múltiplas chamadas de initializeAuth
    if (!isInitializingRef.current) {
      isInitializingRef.current = true;
      initializeAuth();
    }
    
    // 🧹 Cleanup: limpa timer ao desmontar
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // 🔒 Configura auto-refresh do refresh token (antes de expirar 7 dias)
  const setupAutoRefresh = async (rememberMe) => {
    // Limpa timer anterior
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    if (!rememberMe) return; // Não configura se não quer lembrar
    
    // Salva flag de rememberMe
    await AsyncStorage.setItem('rememberMe', 'true');
    await AsyncStorage.setItem('loginTimestamp', Date.now().toString());
    
    // ⚡ Renova token automaticamente a cada 6 horas (INFINITO - sem limite de 7 dias)
    refreshTimerRef.current = setInterval(async () => {
      try {
        const refreshToken = httpClient.getRefreshToken();
        if (refreshToken) {
          // 🔄 Renova silenciosamente
          const newToken = await httpClient.refreshAccessToken();
          if (newToken) {
            // Atualiza timestamp do login
            await AsyncStorage.setItem('loginTimestamp', Date.now().toString());
          }
        }
      } catch (error) {
        // Se falhar, limpa tudo e desloga
        clearInterval(refreshTimerRef.current);
        await logout();
      }
    }, 6 * 60 * 60 * 1000); // A cada 6 horas
  };

  /**
   * Inicializa a autenticação verificando se há token salvo
   * Se houver, valida o token chamando GET /me
   * Se tiver "Lembrar-me" ativo e credenciais salvas, faz login automático
   */
  const initializeAuth = async () => {
    try {
      await httpClient.init();
      const token = httpClient.getToken();
      const refreshToken = httpClient.getRefreshToken();
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      if (token || refreshToken) {
        try {
          await validateToken();
          setLoading(false);
          if (rememberMe === 'true') {
            await setupAutoRefresh(true);
          }
        } catch (tokenError) {
          if (rememberMe === 'true') {
            await tryAutoLogin();
          } else {
            setLoading(false);
          }
        }
      } else if (rememberMe === 'true') {
        await tryAutoLogin();
      } else {
        setLoading(false);
      }
    } catch (error) {
      // Silencioso: nunca mostra nada para o usuário
      await logout();
      setLoading(false);
    }
  };

  /**
   * 🔐 Tenta fazer login automático com credenciais salvas
   * Usado quando rememberMe está ativo mas token expirou
   * ⚠️ NÃO chama setLoading aqui - mantém a tela de splash visível
   */
  const tryAutoLogin = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('saved_email');
      const savedPassword = await SecureStore.getItemAsync('saved_password');
      if (savedEmail && savedPassword) {
        await login(savedEmail, savedPassword, true);
      } else {
        setLoading(false);
      }
    } catch (autoLoginError) {
      // Silencioso: nunca mostra nada para o usuário
      await logout();
      setLoading(false);
    }
  };

  /**
   * Valida o token atual chamando GET /me
   * Se falhar (401), o token é inválido/expirado
   */
  const validateToken = async () => {
    try {
      const response = await httpClient.get('/me');

      // Suporta várias formas que a API pode retornar:
      //  - { user: {...} }
      //  - { data: {...} }
      //  - { id: ..., name: ... } (direto)
      const userData = response.user || response.data || response;

      if (userData && userData.id) {
        setUser(userData);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Resposta inválida do /me');
      }
    } catch (error) {
      await logout();
      throw error;
    }
  };

  /**
   * 🔒 Login do usuário com opção de "Lembrar-me"
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {boolean} rememberMe - Se true, renova token automaticamente por 7 dias
   */
  const login = async (email, password, rememberMe = false) => {
    try {
      // ❌ NÃO usa setLoading(true) aqui - causa navegação prematura
      // O loading local do LoginForm é suficiente
      
      // Faz login (não requer autenticação)
      const response = await httpClient.post('/login', { email, password }, false);
      
      // Verifica se recebeu access token e refresh token
      if (!response || !response.accessToken) {
        // Fallback para token único (compatibilidade com backend antigo)
        if (response.token) {
          httpClient.setToken(response.token);
        } else {
          throw new Error('Token não recebido do servidor');
        }
      } else {
        // Novo sistema com access + refresh tokens
        httpClient.setTokens(response.accessToken, response.refreshToken);
        
        // 🔒 Configura auto-refresh se "Lembrar-me" estiver ativo
        if (rememberMe) {
          await setupAutoRefresh(true);
        }
      }
      
      // ✅ Só seta isAuthenticated DEPOIS que tudo deu certo
      setUser(response.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      setIsAuthenticated(true); // Navegação só acontece aqui
      
      return response;
      
    } catch (error) {
      throw error;
    }
  };

  /**
   * Registro de novo usuário
   */
  const register = async (name, email, password) => {
    try {
      // ❌ NÃO usa setLoading(true) aqui - causa navegação prematura
      // O loading local do RegisterForm é suficiente
      
      // Faz registro (não requer autenticação)
      const response = await httpClient.post('/register', { name, email, password }, false);
      
      // Verifica se recebeu access token e refresh token
      if (!response || !response.accessToken) {
        // Fallback para token único (compatibilidade com backend antigo)
        if (response.token) {
          httpClient.setToken(response.token);
        } else {
          throw new Error('Token não recebido do servidor');
        }
      } else {
        // Novo sistema com access + refresh tokens
        httpClient.setTokens(response.accessToken, response.refreshToken);
      }
      
      // ✅ Só seta isAuthenticated DEPOIS que tudo deu certo
      setUser(response.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      setIsAuthenticated(true); // Navegação só acontece aqui
      
      return response;
      
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout do usuário
   */
  const logout = async () => {
    try {
      // 🔒 Limpa timer de auto-refresh
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      
      // Chama a API para invalidar o token no backend
      try {
        await httpClient.post('/logout');
      } catch (apiError) {
        // Continua com o logout local mesmo se a API falhar
      }
      
      // Limpa ambos os tokens
      httpClient.setTokens(null, null);
      
      // Limpa o AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('rememberMe');
      await AsyncStorage.removeItem('loginTimestamp');
      
      // Limpa o estado
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Silencioso
    }
  };

  /**
   * Esqueci minha senha - Envia código de recuperação
   */
  const forgotPassword = async (email) => {
    try {
      // ❌ NÃO usa setLoading aqui (causa re-render do AppNavigator)
      const response = await httpClient.post('/auth/forgot-password', { email }, false);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Resetar senha com código de verificação
   */
  const resetPassword = async (email, token, newPassword) => {
    try {
      // ❌ NÃO usa setLoading aqui (causa re-render do AppNavigator)
      const response = await httpClient.post('/auth/reset-password', { 
        email, 
        token, 
        newPassword 
      }, false);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Atualizar nome do usuário
   */
  const updateProfile = async (name) => {
    try {
      // ❌ NÃO usa setLoading(true) aqui - deixa o componente gerenciar
      const response = await httpClient.patch('/user/profile', { name });
      
      // ✅ Só atualiza localmente DEPOIS do sucesso da API
      const updatedUser = response.user || { ...user, name };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Solicitar troca de email - Envia código para novo email
   */
  const requestEmailChange = async (newEmail) => {
    try {
      // ❌ NÃO usa setLoading(true) aqui - deixa o componente gerenciar
      const response = await httpClient.post('/user/request-email-change', { newEmail });
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * 🔒 Confirmar troca de email com validação dupla (2FA)
   * @param {string} newEmail - Novo endereço de email
   * @param {string} tokenOldEmail - Código de verificação enviado para o email ATUAL
   * @param {string} tokenNewEmail - Código de verificação enviado para o NOVO email
   * @returns {Promise} Response da API com user atualizado
   * 
   * SEGURANÇA: Requer confirmação de AMBOS emails para prevenir account takeover
   * - Token 1: Prova que o usuário possui acesso ao email atual (é o dono da conta)
   * - Token 2: Prova que o usuário possui acesso ao novo email
   */
  const confirmEmailChange = async (newEmail, tokenOldEmail, tokenNewEmail) => {
    try {
      // ❌ NÃO usa setLoading(true) aqui - deixa o componente gerenciar
      const response = await httpClient.post('/user/confirm-email-change', { 
        newEmail,
        tokenOldEmail, // 🔒 Código do email ATUAL
        tokenNewEmail  // 🔒 Código do NOVO email
      });
      
      // ✅ Atualiza localmente DEPOIS do sucesso da API
      const updatedUser = response.user || { ...user, email: newEmail };
      
      console.log('🔄 Email alterado:', {
        emailAntigo: user?.email,
        emailNovo: newEmail,
        userAtualizado: updatedUser
      });
      
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Alterar senha do usuário
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await httpClient.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        validateToken,
        forgotPassword,
        resetPassword,
        updateProfile,
        requestEmailChange,
        confirmEmailChange,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
