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
      try {
        if (apiService.isAuthenticated()) {
          const userData = apiService.getUserData();
          if (userData) {
            setUser(userData);
            // Busca o perfil completo do usuário
            try {
              const response = await apiService.getCurrentUser();
              if (response.success && response.data) {
                setUserProfile(response.data);
              }
            } catch (error) {
              console.error('Erro ao buscar perfil:', error);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    setLoading(true);
    try {
      const response = await apiService.login(data);
      if (response.success && response.data) {
        setUser({
          id: response.data.user_id,
          email: response.data.email,
          name: response.data.name,
        });
        // Busca o perfil completo
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
    try {
      const response = await apiService.getCurrentUser();
      console.log('Response getCurrentUser:', response);
      if (response.success && response.data) {
        console.log('UserProfile recebido:', response.data);
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
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
