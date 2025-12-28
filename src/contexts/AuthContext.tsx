import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, LoginData, RegisterData, UserProfile } from '../services/api';

interface AuthContextData {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Registrar listener para logout automatico quando o token expirar
    const handleAutoLogout = () => {
      console.log('[AuthContext] Sessao expirada - fazendo logout automatico');
      setUser(null);
      setUserProfile(null);
      // Forcar navegacao para login sera feita pelo PrivateRoute
    };

    apiService.onUnauthorized(handleAutoLogout);

    // Verifica se ha um token salvo ao carregar a aplicacao
    const initAuth = async () => {
      console.log('[AuthContext] Iniciando autenticacao...');
      try {
        const isAuth = apiService.isAuthenticated();
        console.log('[AuthContext] isAuthenticated:', isAuth);

        if (isAuth) {
          const userData = apiService.getUserData();
          console.log('[AuthContext] userData:', userData);

          if (userData) {
            setUser(userData);

            // Tenta buscar o perfil completo do usuario
            try {
              console.log('[AuthContext] Buscando perfil completo...');
              const response = await apiService.getCurrentUser();
              console.log('[AuthContext] Response getCurrentUser:', response);

              if (response.success && response.data) {
                console.log('[AuthContext] UserProfile recebido:', response.data);
                setUserProfile(response.data);
              } else {
                console.warn('[AuthContext] API /auth/me nao disponivel, usando dados do localStorage');
                // WORKAROUND: Cria um userProfile temporario usando localStorage
                const phone = localStorage.getItem('user_phone');
                const remotejid = localStorage.getItem('user_remotejid') || phone || '';

                if (remotejid) {
                  const tempProfile: UserProfile = {
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    phone: phone,
                    remotejid: remotejid,
                    tipo_premium: null,
                    premium_until: null,
                    is_premium_active: false,
                  };
                  console.log('[AuthContext] UserProfile temporario criado:', tempProfile);
                  setUserProfile(tempProfile);
                }
              }
            } catch (error) {
              console.error('[AuthContext] Erro ao buscar perfil:', error);
              // WORKAROUND: Mesmo com erro, tenta criar perfil temporario
              const phone = localStorage.getItem('user_phone');
              const remotejid = localStorage.getItem('user_remotejid') || phone || '';

              if (remotejid) {
                const tempProfile: UserProfile = {
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  phone: phone,
                  remotejid: remotejid,
                  tipo_premium: null,
                  premium_until: null,
                  is_premium_active: false,
                };
                console.log('[AuthContext] UserProfile temporario criado (fallback):', tempProfile);
                setUserProfile(tempProfile);
              }
            }
          }
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao inicializar autenticacao:', error);
      } finally {
        console.log('[AuthContext] Finalizando loading...');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    console.log('[AuthContext] Fazendo login...');
    setLoading(true);
    try {
      const response = await apiService.login(data);
      console.log('[AuthContext] Response login:', response);

      if (response.success && response.data) {
        const userData = {
          id: response.data.user_id,
          email: response.data.email,
          name: response.data.name,
        };
        console.log('[AuthContext] Setando user:', userData);
        setUser(userData);

        // Tenta buscar o perfil completo
        console.log('[AuthContext] Chamando refreshUserProfile...');
        try {
          await refreshUserProfile();
        } catch (error) {
          console.warn('[AuthContext] Erro ao buscar perfil apos login, criando temporario');
          // WORKAROUND: Cria perfil temporario se a API falhar
          const phone = localStorage.getItem('user_phone');
          const remotejid = response.data.remotejid || localStorage.getItem('user_remotejid') || phone || '';

          if (remotejid) {
            const tempProfile: UserProfile = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: phone,
              remotejid: remotejid,
              tipo_premium: null,
              premium_until: null,
              is_premium_active: false,
            };
            console.log('[AuthContext] UserProfile temporario criado apos login:', tempProfile);
            setUserProfile(tempProfile);
          }
        }
      } else {
        throw new Error(response.message || 'Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await apiService.register(data);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao cadastrar usuario');
      }
      // Apos cadastrar, nao faz login automatico
      // O usuario precisa fazer login manualmente
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setUserProfile(null);
  };

  const refreshUserProfile = async () => {
    console.log('[AuthContext] refreshUserProfile iniciado');
    try {
      console.log('[AuthContext] Chamando getCurrentUser...');
      const response = await apiService.getCurrentUser();
      console.log('[AuthContext] Response getCurrentUser:', response);

      if (response.success && response.data) {
        console.log('[AuthContext] UserProfile recebido:', response.data);
        console.log('[AuthContext] remotejid:', response.data.remotejid);
        setUserProfile(response.data);
      } else {
        console.warn('[AuthContext] getCurrentUser falhou, criando perfil temporario');
        // WORKAROUND: Cria perfil temporario se a API falhar
        const userData = apiService.getUserData();
        if (userData) {
          const phone = localStorage.getItem('user_phone');
          const remotejid = localStorage.getItem('user_remotejid') || phone || '';

          if (remotejid) {
            const tempProfile: UserProfile = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: phone,
              remotejid: remotejid,
              tipo_premium: null,
              premium_until: null,
              is_premium_active: false,
            };
            console.log('[AuthContext] UserProfile temporario criado em refreshUserProfile:', tempProfile);
            setUserProfile(tempProfile);
          }
        }
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao atualizar perfil:', error);
      // WORKAROUND: Mesmo com erro, cria perfil temporario
      const userData = apiService.getUserData();
      if (userData) {
        const phone = localStorage.getItem('user_phone');
        const remotejid = localStorage.getItem('user_remotejid') || phone || '';

        if (remotejid) {
          const tempProfile: UserProfile = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: phone,
            remotejid: remotejid,
            tipo_premium: null,
            premium_until: null,
            is_premium_active: false,
          };
          console.log('[AuthContext] UserProfile temporario criado (erro):', tempProfile);
          setUserProfile(tempProfile);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
