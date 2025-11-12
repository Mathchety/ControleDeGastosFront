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
        await validateToken();
      }
    } catch (error) {
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
   * Login do usuário
   */
  const login = async (email, password) => {
    try {
      // ❌ NÃO usa setLoading(true) aqui - causa navegação prematura
      // O loading local do LoginForm é suficiente
      
      // Faz login (não requer autenticação)
      const response = await httpClient.post('/login', { email, password }, false);
      
      if (!response || !response.token) {
        throw new Error('Token não recebido do servidor');
      }

      // Salva o token no httpClient e AsyncStorage
      httpClient.setToken(response.token);
      
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
      
      if (!response || !response.token) {
        throw new Error('Token não recebido do servidor');
      }

      // Salva o token no httpClient e AsyncStorage
      httpClient.setToken(response.token);
      
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
      // Chama a API para invalidar o token no backend
      try {
        await httpClient.post('/logout');
      } catch (apiError) {
        // Continua com o logout local mesmo se a API falhar
      }
      
      // Limpa o token
      httpClient.setToken(null);
      
      // Limpa o AsyncStorage
      await AsyncStorage.removeItem('user');
      
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
   * Confirmar troca de email com código
   */
  const confirmEmailChange = async (newEmail, token) => {
    try {
      // ❌ NÃO usa setLoading(true) aqui - deixa o componente gerenciar
      const response = await httpClient.post('/user/confirm-email-change', { 
        newEmail, 
        token 
      });
      
      // ✅ Só atualiza localmente DEPOIS do sucesso da API
      const updatedUser = response.user || { ...user, email: newEmail };
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
