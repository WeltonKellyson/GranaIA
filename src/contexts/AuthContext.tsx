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
    // Verifica se há um token salvo ao carregar a aplicação
    const initAuth = async () => {
      console.log('[AuthContext] Iniciando autenticação...');
      try {
        const isAuth = apiService.isAuthenticated();
        console.log('[AuthContext] isAuthenticated:', isAuth);

        if (isAuth) {
          const userData = apiService.getUserData();
          console.log('[AuthContext] userData:', userData);

          if (userData) {
            setUser(userData);

            // Tenta buscar o perfil completo do usuário
            try {
              console.log('[AuthContext] Buscando perfil completo...');
              const response = await apiService.getCurrentUser();
              console.log('[AuthContext] Response getCurrentUser:', response);

              if (response.success && response.data) {
                console.log('[AuthContext] UserProfile recebido:', response.data);
                setUserProfile(response.data);
              } else {
                console.warn('[AuthContext] API /auth/me não disponível, usando dados do localStorage');
                // WORKAROUND: Cria um userProfile temporário usando localStorage
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
                  console.log('[AuthContext] UserProfile temporário criado:', tempProfile);
                  setUserProfile(tempProfile);
                }
              }
            } catch (error) {
              console.error('[AuthContext] Erro ao buscar perfil:', error);
              // WORKAROUND: Mesmo com erro, tenta criar perfil temporário
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
                console.log('[AuthContext] UserProfile temporário criado (fallback):', tempProfile);
                setUserProfile(tempProfile);
              }
            }
          }
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao inicializar autenticação:', error);
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
          console.warn('[AuthContext] Erro ao buscar perfil após login, criando temporário');
          // WORKAROUND: Cria perfil temporário se a API falhar
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
            console.log('[AuthContext] UserProfile temporário criado após login:', tempProfile);
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
        throw new Error(response.message || 'Erro ao cadastrar usuário');
      }
      // Após cadastrar, não faz login automático
      // O usuário precisa fazer login manualmente
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
        console.warn('[AuthContext] getCurrentUser falhou, criando perfil temporário');
        // WORKAROUND: Cria perfil temporário se a API falhar
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
            console.log('[AuthContext] UserProfile temporário criado em refreshUserProfile:', tempProfile);
            setUserProfile(tempProfile);
          }
        }
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao atualizar perfil:', error);
      // WORKAROUND: Mesmo com erro, cria perfil temporário
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
          console.log('[AuthContext] UserProfile temporário criado (erro):', tempProfile);
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
