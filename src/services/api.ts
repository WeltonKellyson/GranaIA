const API_URL = 'https://granaiaapi.weltonkellyson.com.br';

// Tipos baseados na API OpenAPI
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  senha: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  name: string;
  remotejid?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  remotejid: string;
  tipo_premium?: string | null;
  premium_until?: string | null;
  is_premium_active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

class ApiService {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async register(data: RegisterData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || errorData?.message || 'Erro ao cadastrar usuário'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<ApiResponse<TokenResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || errorData?.message || 'Erro ao fazer login'
        );
      }

      const result: ApiResponse<TokenResponse> = await response.json();

      // Salva o token no localStorage
      if (result.success && result.data?.access_token) {
        localStorage.setItem('access_token', result.data.access_token);
        localStorage.setItem('user_id', result.data.user_id);
        localStorage.setItem('user_email', result.data.email);
        localStorage.setItem('user_name', result.data.name);
      }

      return result;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido ou expirado
          this.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error('Erro ao obter dados do usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserData(): { id: string; email: string; name: string } | null {
    const id = localStorage.getItem('user_id');
    const email = localStorage.getItem('user_email');
    const name = localStorage.getItem('user_name');

    if (id && email && name) {
      return { id, email, name };
    }
    return null;
  }
}

export const apiService = new ApiService();
