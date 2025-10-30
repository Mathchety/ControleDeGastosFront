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
      
      console.log('[Auth] Resposta do /me:', JSON.stringify(response).substring(0, 200));
      
      // A API pode retornar {user: {...}} ou diretamente {...}
      const userData = response.user || response;
      
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
