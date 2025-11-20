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

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Tipos para Gasto
export interface GastoCreate {
  descricao: string;
  valor: number | string;
  categoria: string;
  data?: string | null;
}

export interface GastoUpdate {
  descricao?: string | null;
  valor?: number | string | null;
  categoria?: string | null;
  data?: string | null;
}

export interface GastoResponse {
  id: string;
  descricao: string;
  valor: string;
  categoria: string;
  data: string | null;
  usuario: string;
  created_at: string;
  updated_at: string;
}

export interface GastoDashboard {
  total_geral: string;
  quantidade_total: number;
  por_categoria: Array<{
    categoria: string;
    total: string;
    quantidade: number;
  }>;
  periodo_inicio: string | null;
  periodo_fim: string | null;
}

// Tipos para Receita
export interface ReceitaCreate {
  descricao: string;
  valor: number | string;
  categoria: string;
  origem?: string | null;
  data?: string | null;
}

export interface ReceitaUpdate {
  descricao?: string | null;
  valor?: number | string | null;
  categoria?: string | null;
  origem?: string | null;
  data?: string | null;
}

export interface ReceitaResponse {
  id: string;
  descricao: string;
  valor: string;
  categoria: string;
  origem: string | null;
  data: string | null;
  usuario: string;
  created_at: string;
  updated_at: string;
}

export interface ReceitaDashboard {
  total_geral: string;
  quantidade_total: number;
  por_categoria: Array<{
    categoria: string;
    total: string;
    quantidade: number;
  }>;
  periodo_inicio: string | null;
  periodo_fim: string | null;
}

class ApiService {
  // Event emitter para logout automático
  private onUnauthorizedCallbacks: Array<() => void> = [];

  // Registrar callback para ser chamado quando houver 401
  onUnauthorized(callback: () => void) {
    this.onUnauthorizedCallbacks.push(callback);
  }

  // Método centralizado para tratar erro 401
  private handleUnauthorized() {
    console.log('[API] Token expirado - fazendo logout automático');
    this.logout();
    // Notificar todos os listeners
    this.onUnauthorizedCallbacks.forEach(callback => callback());
  }

  // Método centralizado para verificar resposta e tratar 401
  private async handleResponse(response: Response, errorMessage: string) {
    if (!response.ok) {
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || errorData?.message || errorMessage);
    }
    return response;
  }

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
        // Salva o remotejid se vier da API
        if (result.data.remotejid) {
          localStorage.setItem('user_remotejid', result.data.remotejid);
        }
      }

      return result;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    try {
      const headers = this.getAuthHeader();
      const token = localStorage.getItem('access_token');
      console.log('[API] Chamando /auth/me');
      console.log('[API] Token presente:', !!token);
      console.log('[API] Headers:', headers);

      const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: headers,
      });

      console.log('[API] Status da resposta:', response.status);
      const jsonResponse = await response.json();
      console.log('[API] Response JSON:', jsonResponse);

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido ou expirado
          this.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        // Retorna a resposta mesmo com erro para o workaround funcionar
        return jsonResponse;
      }

      return jsonResponse;
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
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_remotejid');
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

  // ============ GASTOS ============

  async getGastos(params?: {
    usuario?: string;
    categoria?: string;
    data_inicio?: string;
    data_fim?: string;
    valor_min?: number;
    valor_max?: number;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<GastoResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.usuario) queryParams.append('usuario', params.usuario);
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
      if (params?.data_fim) queryParams.append('data_fim', params.data_fim);
      if (params?.valor_min) queryParams.append('valor_min', params.valor_min.toString());
      if (params?.valor_max) queryParams.append('valor_max', params.valor_max.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `${API_URL}/api/v1/gastos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao buscar gastos');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar gastos:', error);
      throw error;
    }
  }

  async createGasto(data: GastoCreate): Promise<ApiResponse<GastoResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/gastos`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao criar gasto');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar gasto:', error);
      throw error;
    }
  }

  async updateGasto(id: string, data: GastoUpdate): Promise<ApiResponse<GastoResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/gastos/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao atualizar gasto');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar gasto:', error);
      throw error;
    }
  }

  async deleteGasto(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/v1/gastos/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao deletar gasto');
    } catch (error) {
      console.error('Erro ao deletar gasto:', error);
      throw error;
    }
  }

  async getGastosDashboard(params?: {
    usuario?: string;
    data_inicio?: string;
    data_fim?: string;
  }): Promise<ApiResponse<GastoDashboard>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.usuario) queryParams.append('usuario', params.usuario);
      if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
      if (params?.data_fim) queryParams.append('data_fim', params.data_fim);

      const url = `${API_URL}/api/v1/gastos/dashboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao buscar dashboard de gastos');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dashboard de gastos:', error);
      throw error;
    }
  }

  // ============ RECEITAS ============

  async getReceitas(params?: {
    usuario?: string;
    categoria?: string;
    data_inicio?: string;
    data_fim?: string;
    valor_min?: number;
    valor_max?: number;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<ReceitaResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.usuario) queryParams.append('usuario', params.usuario);
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
      if (params?.data_fim) queryParams.append('data_fim', params.data_fim);
      if (params?.valor_min) queryParams.append('valor_min', params.valor_min.toString());
      if (params?.valor_max) queryParams.append('valor_max', params.valor_max.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `${API_URL}/api/v1/receitas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao buscar receitas');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      throw error;
    }
  }

  async createReceita(data: ReceitaCreate): Promise<ApiResponse<ReceitaResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/receitas`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao criar receita');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      throw error;
    }
  }

  async updateReceita(id: string, data: ReceitaUpdate): Promise<ApiResponse<ReceitaResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/receitas/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao atualizar receita');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      throw error;
    }
  }

  async deleteReceita(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/v1/receitas/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao deletar receita');
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      throw error;
    }
  }

  async getReceitasDashboard(params?: {
    usuario?: string;
    data_inicio?: string;
    data_fim?: string;
  }): Promise<ApiResponse<ReceitaDashboard>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.usuario) queryParams.append('usuario', params.usuario);
      if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
      if (params?.data_fim) queryParams.append('data_fim', params.data_fim);

      const url = `${API_URL}/api/v1/receitas/dashboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao buscar dashboard de receitas');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dashboard de receitas:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
