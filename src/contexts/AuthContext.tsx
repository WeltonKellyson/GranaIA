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
            // Busca o perfil completo do usuário
            try {
              console.log('[AuthContext] Buscando perfil completo...');
              const response = await apiService.getCurrentUser();
              console.log('[AuthContext] Response getCurrentUser:', response);

              if (response.success && response.data) {
                console.log('[AuthContext] UserProfile recebido:', response.data);
                setUserProfile(response.data);
              } else {
                console.error('[AuthContext] getCurrentUser não teve sucesso:', response);
              }
            } catch (error) {
              console.error('[AuthContext] Erro ao buscar perfil:', error);
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

        // Busca o perfil completo
        console.log('[AuthContext] Chamando refreshUserProfile...');
        await refreshUserProfile();
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
        console.error('[AuthContext] getCurrentUser falhou:', response);
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao atualizar perfil:', error);
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
