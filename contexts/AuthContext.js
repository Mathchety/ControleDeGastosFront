import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import httpClient from '../services/httpClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Inicializa a autenticação verificando se há token salvo
   * Se houver, valida o token chamando GET /me
   */
  const initializeAuth = async () => {
    try {
      // Inicializa o httpClient (carrega o token do AsyncStorage)
      await httpClient.init();
      
      const token = httpClient.getToken();
      
      if (token) {
        // Token existe, vamos validá-lo
        console.log('[Auth] Token encontrado, validando...');
        await validateToken();
      } else {
        console.log('[Auth] Nenhum token encontrado');
      }
    } catch (error) {
      console.error('[Auth] Erro na inicialização:', error);
      await logout(); // Se falhar, faz logout
    } finally {
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
      
      console.log('[Auth] Resposta do /me:', JSON.stringify(response).substring(0, 400));

      // Suporta várias formas que a API pode retornar:
      //  - { user: {...} }
      //  - { data: {...} }
      //  - { id: ..., name: ... } (direto)
      const userData = response.user || response.data || response;

      console.log('[Auth] userData extraído do /me:', JSON.stringify(userData).substring(0, 400));

      if (userData && userData.id) {
        setUser(userData);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log('[Auth] Token válido, usuário autenticado:', userData.name);
      } else {
        throw new Error('Resposta inválida do /me');
      }
    } catch (error) {
      console.error('[Auth] Token inválido:', error.message);
      await logout();
      throw error;
    }
  };

  /**
   * Login do usuário
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Faz login (não requer autenticação)
      const response = await httpClient.post('/login', { email, password }, false);
      
      if (!response || !response.token) {
        throw new Error('Token não recebido do servidor');
      }

      // Salva o token no httpClient e AsyncStorage
      httpClient.setToken(response.token);
      
      // Salva os dados do usuário
      setUser(response.user);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('[Auth] Login bem-sucedido:', response.user.name);
      return response;
      
    } catch (error) {
      console.error('[Auth] Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registro de novo usuário
   */
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      
      // Faz registro (não requer autenticação)
      const response = await httpClient.post('/register', { name, email, password }, false);
      
      if (!response || !response.token) {
        throw new Error('Token não recebido do servidor');
      }

      // Salva o token no httpClient e AsyncStorage
      httpClient.setToken(response.token);
      
      // Salva os dados do usuário
      setUser(response.user);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('[Auth] Registro bem-sucedido:', response.user.name);
      return response;
      
    } catch (error) {
      console.error('[Auth] Erro no registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout do usuário
   */
  const logout = async () => {
    try {
      // Chama a API para invalidar o token no backend
      try {
        await httpClient.post('/logout');
        console.log('[Auth] Token invalidado no backend');
      } catch (apiError) {
        console.warn('[Auth] Erro ao invalidar token na API:', apiError);
        // Continua com o logout local mesmo se a API falhar
      }
      
      // Limpa o token
      httpClient.setToken(null);
      
      // Limpa o AsyncStorage
      await AsyncStorage.removeItem('user');
      
      // Limpa o estado
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('[Auth] Logout realizado');
    } catch (error) {
      console.error('[Auth] Erro no logout:', error);
    }
  };

  /**
   * Esqueci minha senha - Envia código de recuperação
   */
  const forgotPassword = async (email) => {
    try {
      // ❌ NÃO usa setLoading aqui (causa re-render do AppNavigator)
      const response = await httpClient.post('/auth/forgot-password', { email }, false);
      console.log('[Auth] Código de recuperação enviado para:', email);
      return response;
    } catch (error) {
      console.error('[Auth] Erro ao solicitar recuperação:', error);
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
      console.log('[Auth] Senha resetada com sucesso para:', email);
      return response;
    } catch (error) {
      console.error('[Auth] Erro ao resetar senha:', error);
      throw error;
    }
  };

  /**
   * Atualizar nome do usuário
   */
  const updateProfile = async (name) => {
    try {
      setLoading(true);
      const response = await httpClient.patch('/user/profile', { name });
      
      // Atualiza o usuário localmente
      const updatedUser = response.user || { ...user, name };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('[Auth] Perfil atualizado:', name);
      return response;
    } catch (error) {
      console.error('[Auth] Erro ao atualizar perfil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Solicitar troca de email - Envia código para novo email
   */
  const requestEmailChange = async (newEmail) => {
    try {
      setLoading(true);
      const response = await httpClient.post('/user/request-email-change', { newEmail });
      console.log('[Auth] Código de verificação enviado para:', newEmail);
      return response;
    } catch (error) {
      console.error('[Auth] Erro ao solicitar troca de email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirmar troca de email com código
   */
  const confirmEmailChange = async (newEmail, token) => {
    try {
      setLoading(true);
      const response = await httpClient.post('/user/confirm-email-change', { 
        newEmail, 
        token 
      });
      
      // Atualiza o email do usuário localmente
      const updatedUser = response.user || { ...user, email: newEmail };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('[Auth] Email atualizado para:', newEmail);
      return response;
    } catch (error) {
      console.error('[Auth] Erro ao confirmar troca de email:', error);
      throw error;
    } finally {
      setLoading(false);
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
      console.log('[Auth] Senha alterada com sucesso');
      return response;
    } catch (error) {
      console.error('[Auth] Erro ao alterar senha:', error);
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
