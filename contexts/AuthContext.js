import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import httpClient from '../services/httpClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimerRef = React.useRef(null); // 🔒 Timer para auto-refresh
  const refreshFailCountRef = React.useRef(0); // Conta falhas de refresh (0 = nenhum, 1 = já falhou uma vez)
  const isInitializingRef = React.useRef(false); // 🚀 Previne múltiplas inicializações
  const showingAuthAlertRef = React.useRef(false); // evita múltiplos alerts de login

  // Handler único para falha no refresh - registrado no httpClient
  const handleRefreshFail = async (err) => {
    try {
      console.warn('[AuthContext] handleRefreshFail chamado:', err?.message || err);
      // Se já estivermos exibindo um alerta, ignora chamadas subsequentes
      if (showingAuthAlertRef.current) {
        console.warn('[AuthContext] alerta de auth já visível — ignorando chamada adicional');
        return;
      }
      // Se já houve uma falha automática antes, exibimos apenas a opção de fazer login
      if (refreshFailCountRef.current >= 1) {
        showingAuthAlertRef.current = true;
        Alert.alert(
          'Sessão expirada',
          'Sua sessão expirou. Faça login novamente para continuar.',
          [
            {
              text: 'Fazer login',
              onPress: async () => {
                if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
                await logout();
                showingAuthAlertRef.current = false;
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }

      // Primeira falha: pergunta ao usuário se quer tentar novamente
      refreshFailCountRef.current = 1;
      showingAuthAlertRef.current = true;
      Alert.alert(
        'Erro de renovação',
        'Falha ao renovar a sessão. Deseja tentar novamente agora?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              // permite futuros alerts
              showingAuthAlertRef.current = false;
            },
          },
          {
            text: 'Tentar novamente',
            onPress: async () => {
              try {
                // Forçamos uma nova tentativa imediata
                const retried = await httpClient.refreshAccessToken();
                if (retried) {
                  await AsyncStorage.setItem('loginTimestamp', Date.now().toString());
                  refreshFailCountRef.current = 0;
                  showingAuthAlertRef.current = false;
                  return;
                }
              } catch (retryErr) {
                // Se falhar, mostramos a opção de fazer login (não tentamos mais retries automáticos)
                showingAuthAlertRef.current = true;
                Alert.alert(
                  'Sessão expirada',
                  'Não foi possível renovar a sessão. Faça login novamente para continuar.',
                  [
                    {
                      text: 'Fazer login',
                      onPress: async () => {
                        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
                        await logout();
                        showingAuthAlertRef.current = false;
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (handlerErr) {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      await logout();
    }
  };

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

  // Registra o handler de falha do refresh assim que o AuthProvider montar
  useEffect(() => {
    console.debug('[AuthContext] Registrando handler de refresh failure no httpClient');
    httpClient.setOnRefreshFail(handleRefreshFail);
    return () => {
      console.debug('[AuthContext] Limpando handler de refresh failure no httpClient (unmount)');
      httpClient.setOnRefreshFail(null);
    };
  }, []);

  // 🔒 Sempre configura auto-refresh do token enquanto o app está aberto
  const setupAutoRefresh = async () => {
    // Limpa timer anterior
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    // ⚡ Renova token automaticamente a cada 6 horas (INFINITO)
    refreshTimerRef.current = setInterval(async () => {
      try {
        const refreshToken = httpClient.getRefreshToken();
        if (refreshToken) {
          // 🔄 Renova silenciosamente
          const newToken = await httpClient.refreshAccessToken();
          if (newToken) {
            // Atualiza timestamp do login
            await AsyncStorage.setItem('loginTimestamp', Date.now().toString());
            // reset fail count on success
            refreshFailCountRef.current = 0;
          }
        }
      } catch (error) {
        // O httpClient notificará o AuthContext via setOnRefreshFail; aqui apenas logamos
        console.warn('[AuthContext] setupAutoRefresh: falha ao renovar token (delegado ao handler)');
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
      // handler de refresh é registrado globalmente na montagem do provider
      const token = httpClient.getToken();
      const refreshToken = httpClient.getRefreshToken();
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      if (token || refreshToken) {
        try {
          // Durante a inicialização do app não tentamos renovar automaticamente
          // o token ao receber 401. Passamos allowAutoRefresh=false para que
          // o httpClient não tente refresh nessa fase.
          await validateToken(false);
          await setupAutoRefresh();
        } catch (tokenError) {
          if (rememberMe === 'true') {
            await tryAutoLogin();
          } else {
            // nothing else
          }
        }
      } else if (rememberMe === 'true') {
        await tryAutoLogin();
      } else {
        // nothing else
      }
    } catch (error) {
      // Silencioso: nunca mostra nada para o usuário
      await logout();
    } finally {
      // Garantir que não fiquemos presos na tela de splash — sempre
      // definimos loading como false quando a inicialização terminar
      // (sucesso ou falha). tryAutoLogin e logout já definem loading
      // como false, mas reforçamos aqui para cobrir condições de corrida.
      try {
        setLoading(false);
      } catch (e) {
        // ignore
      }
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
        try {
          await login(savedEmail, savedPassword, true);
        } catch (loginError) {
          // Falha no login automático: faz logout e finaliza loading
          await logout();
        }
        setLoading(false);
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
  const validateToken = async (allowAutoRefresh = true) => {
    try {
      const response = await httpClient.get('/me', true, allowAutoRefresh);

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
      // Não desloga automaticamente aqui: se o token expirou tentaremos
      // um fluxo de auto-login (rememberMe) no inicializador. Logout só
      // deve ocorrer se não for possível renovar com refresh token.
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
      console.log('[AuthContext] 📝 Login response:', {
        hasAccessToken: !!response?.accessToken,
        hasRefreshToken: !!response?.refreshToken,
        hasToken: !!response?.token,
      });

      if (!response || !response.accessToken) {
        // Fallback para token único (compatibilidade com backend antigo)
        if (response.token) {
          console.log('[AuthContext] ⚠️ Usando sistema antigo (token único)');
          httpClient.setToken(response.token);
        } else {
          throw new Error('Token não recebido do servidor');
        }
      } else {
        // Novo sistema com access + refresh tokens
        console.log('[AuthContext] ✅ Salvando access token e refresh token');
        httpClient.setTokens(response.accessToken, response.refreshToken);
        // Re-registra o handler de falha do refresh após um novo login para garantir
        // que o AuthContext receba notificações caso o httpClient tenha sido
        // limpo anteriormente (ex: logout deixou handler nulo).
        try {
          console.debug('[AuthContext] Re-registrando onRefreshFail após login');
          httpClient.setOnRefreshFail(handleRefreshFail);
        } catch (e) {
          console.warn('[AuthContext] Falha ao re-registrar onRefreshFail:', e);
        }
      }

      // Salva email/senha se lembrarMe estiver ativo
      if (rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true');
        await AsyncStorage.setItem('saved_email', email);
        await SecureStore.setItemAsync('saved_password', password);
      } else {
        await AsyncStorage.removeItem('rememberMe');
        await AsyncStorage.removeItem('saved_email');
        await SecureStore.deleteItemAsync('saved_password');
      }

      // Sempre configura auto-refresh
      await setupAutoRefresh();

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
        // Re-registra handler após registro também
        try {
          console.debug('[AuthContext] Re-registrando onRefreshFail após register');
          httpClient.setOnRefreshFail(handleRefreshFail);
        } catch (e) {
          console.warn('[AuthContext] Falha ao re-registrar onRefreshFail (register):', e);
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
      // Reseta flags internas do httpClient relacionadas a refresh
      try {
        httpClient.setOnRefreshFail(null);
        // Garante que qualquer sinalização de notificação também seja limpa
        try {
          httpClient._notifiedRefreshFail = false;
        } catch (e) {
          // ignore se não existir
        }
      } catch (e) {
        // ignore
      }
      
      // Limpa o AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('rememberMe');
      await AsyncStorage.removeItem('loginTimestamp');
      
      // Limpa o estado
      setUser(null);
      setIsAuthenticated(false);
      // Se estivermos no fluxo de inicialização, garante que loading seja false
      setLoading(false);
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
