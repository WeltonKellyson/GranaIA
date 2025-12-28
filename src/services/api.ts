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

// Tipos para Gasto Futuro (Cartao de Credito)
export interface ParcelaResponse {
  id: string;
  gasto_futuro_id: string;
  numero_parcela: number;
  total_parcelas: number;
  valor_parcela: string;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'atrasado';
  gasto_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GastoFuturoCreate {
  descricao: string;
  valor_total: number | string;
  categoria: string;
  data_compra?: string | null;
  data_vencimento?: string | null;
  cartao_credito_id?: string | null;
  numero_parcelas?: number;
  valor_parcela?: number | string | null;
  metodo_pagamento?: 'credito' | 'debito_futuro' | 'parcelado';
  observacoes?: string | null;
}

export interface GastoFuturoUpdate {
  descricao?: string | null;
  valor_total?: number | string | null;
  categoria?: string | null;
  data_compra?: string | null;
  data_vencimento?: string | null;
  numero_parcelas?: number | null;
  valor_parcela?: number | string | null;
  status?: 'ativo' | 'pago' | 'cancelado' | null;
  metodo_pagamento?: 'credito' | 'debito_futuro' | 'parcelado' | null;
  observacoes?: string | null;
}

export interface GastoFuturoResponse {
  id: string;
  usuario: string;
  descricao: string;
  valor_total: string;
  categoria: string;
  data_compra: string;
  data_vencimento: string;
  data_pagamento: string | null;
  cartao_credito_id: string | null;
  numero_parcelas: number;
  valor_parcela: string | null;
  status: 'ativo' | 'pago' | 'cancelado';
  metodo_pagamento: 'credito' | 'debito_futuro' | 'parcelado';
  observacoes: string | null;
  gasto_id: string | null;
  parcelas: ParcelaResponse[];
  created_at: string;
  updated_at: string;
}

export interface GastoFuturoResumo {
  total_valor: string;
  quantidade_total: number;
  quantidade_vencidos: number;
  valor_vencido: string;
  quantidade_mes_atual: number;
  valor_mes_atual: string;
}

export interface GastoFuturoProximosVencimentos {
  id: string;
  descricao: string;
  valor_total: string;
  data_vencimento: string;
  dias_para_vencimento: number;
  status: string;
}

export interface GastoFuturoDashboard {
  resumo: GastoFuturoResumo;
  proximos_vencimentos: GastoFuturoProximosVencimentos[];
}

export interface MarcarComoPagoRequest {
  data_pagamento?: string | null;
  criar_gasto?: boolean;
}

// Tipos para Cartao de Credito
export interface CartaoCreditoCreate {
  nome_cartao: string;
  nome_titular: string;
  dia_vencimento: number;
  limite?: number | null;
  cor?: string | null;
  ativo?: boolean;
  observacoes?: string | null;
}

export interface CartaoCreditoUpdate {
  nome_cartao?: string | null;
  nome_titular?: string | null;
  dia_vencimento?: number | null;
  limite?: number | null;
  cor?: string | null;
  ativo?: boolean | null;
  observacoes?: string | null;
}

export interface CartaoCreditoResponse {
  id: string;
  usuario: string;
  nome_cartao: string;
  nome_titular: string;
  dia_vencimento: number;
  limite: string | null;
  cor: string | null;
  ativo: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartaoCreditoComGastos extends CartaoCreditoResponse {
  total_gastos_ativos: number;
  valor_total_pendente: string;
  proxima_fatura: string | null;
}

export interface FaturaMensal {
  cartao_id: string;
  nome_cartao: string;
  mes_referencia: string;
  dia_vencimento: number;
  total_compras: number;
  total_parcelas: number;
  valor_pendente: string;
  valor_pago: string;
  valor_atrasado: string;
  valor_total_fatura: string;
}

export interface PagarFaturaRequest {
  mes_referencia: string;
  data_pagamento?: string | null;
  criar_gasto?: boolean;
}

class ApiService {
  // Event emitter para logout automatico
  private onUnauthorizedCallbacks: Array<() => void> = [];

  // Registrar callback para ser chamado quando houver 401
  onUnauthorized(callback: () => void) {
    this.onUnauthorizedCallbacks.push(callback);
  }

  // Metodo centralizado para tratar erro 401
  private handleUnauthorized() {
    console.log('[API] Token expirado - fazendo logout automatico');
    this.logout();
    // Notificar todos os listeners
    this.onUnauthorizedCallbacks.forEach(callback => callback());
  }

  // Metodo centralizado para verificar resposta e tratar 401
  private async handleResponse(response: Response, errorMessage: string) {
    if (!response.ok) {
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('Sessao expirada. Faa login novamente.');
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
          errorData?.detail || errorData?.message || 'Erro ao cadastrar usurio'
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
          // Token invlido ou expirado
          this.logout();
          throw new Error('Sessao expirada. Faa login novamente.');
        }
        // Retorna a resposta mesmo com erro para o workaround funcionar
        return jsonResponse;
      }

      return jsonResponse;
    } catch (error) {
      console.error('Erro ao obter usurio:', error);
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

  // ============ PASSWORD RESET ============

  async requestPasswordReset(phone: string): Promise<ApiResponse<{ token: string; expires_in_minutes: number }>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || errorData?.message || 'Erro ao solicitar recuperacao de senha'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao solicitar recuperacao:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || errorData?.message || 'Erro ao redefinir senha'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
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

  // ============ GASTOS FUTUROS (CARTO DE CREDITO) ============

  async getGastosFuturos(params?: {
    usuario?: string;
    status?: string;
    categoria?: string;
    data_vencimento_inicio?: string;
    data_vencimento_fim?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<GastoFuturoResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.usuario) queryParams.append('usuario', params.usuario);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.data_vencimento_inicio) queryParams.append('data_vencimento_inicio', params.data_vencimento_inicio);
      if (params?.data_vencimento_fim) queryParams.append('data_vencimento_fim', params.data_vencimento_fim);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `${API_URL}/api/v1/gastos-futuros${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao buscar gastos futuros');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar gastos futuros:', error);
      throw error;
    }
  }

  async createGastoFuturo(data: GastoFuturoCreate): Promise<ApiResponse<GastoFuturoResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/gastos-futuros`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao criar gasto futuro');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar gasto futuro:', error);
      throw error;
    }
  }

  async updateGastoFuturo(id: string, data: GastoFuturoUpdate): Promise<ApiResponse<GastoFuturoResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/gastos-futuros/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao atualizar gasto futuro');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar gasto futuro:', error);
      throw error;
    }
  }

  async deleteGastoFuturo(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/v1/gastos-futuros/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao deletar gasto futuro');
    } catch (error) {
      console.error('Erro ao deletar gasto futuro:', error);
      throw error;
    }
  }

  async getGastosFuturosDashboard(): Promise<ApiResponse<GastoFuturoDashboard>> {
    try {
      const url = `${API_URL}/api/v1/gastos-futuros/dashboard`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao buscar dashboard de gastos futuros');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dashboard de gastos futuros:', error);
      throw error;
    }
  }

  async marcarGastoFuturoComoPago(id: string, data: MarcarComoPagoRequest): Promise<ApiResponse<GastoFuturoResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/gastos-futuros/${id}/pagar`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao marcar gasto futuro como pago');
      return await response.json();
    } catch (error) {
      console.error('Erro ao marcar gasto futuro como pago:', error);
      throw error;
    }
  }

  async marcarParcelaComoPaga(parcelaId: string, data: MarcarComoPagoRequest): Promise<ApiResponse<ParcelaResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/gastos-futuros/parcelas/${parcelaId}/pagar`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao marcar parcela como paga');
      return await response.json();
    } catch (error) {
      console.error('Erro ao marcar parcela como paga:', error);
      throw error;
    }
  }

  // ============ CARTOES DE CREDITO ============

  async getCartoesCredito(params?: {
    usuario?: string;
    ativo?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<CartaoCreditoResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.usuario) queryParams.append('usuario', params.usuario);
      if (params?.ativo !== undefined) queryParams.append('ativo', params.ativo.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `${API_URL}/api/v1/cartoes-credito${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao buscar cartoes de credito');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cartoes de credito:', error);
      throw error;
    }
  }

  async getCartaoCredito(id: string): Promise<ApiResponse<CartaoCreditoComGastos>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/cartoes-credito/${id}`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao buscar cartao de credito');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cartao de credito:', error);
      throw error;
    }
  }

  async createCartaoCredito(data: CartaoCreditoCreate): Promise<ApiResponse<CartaoCreditoResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/cartoes-credito`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao criar cartao de credito');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar cartao de credito:', error);
      throw error;
    }
  }

  async updateCartaoCredito(id: string, data: CartaoCreditoUpdate): Promise<ApiResponse<CartaoCreditoResponse>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/cartoes-credito/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao atualizar cartao de credito');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar cartao de credito:', error);
      throw error;
    }
  }

  async deleteCartaoCredito(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/v1/cartoes-credito/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao deletar cartao de credito');
    } catch (error) {
      console.error('Erro ao deletar cartao de credito:', error);
      throw error;
    }
  }

  async getFaturasMensais(
    cartaoId: string,
    params?: {
      mes_inicio?: string;
      mes_fim?: string;
    }
  ): Promise<ApiResponse<FaturaMensal[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.mes_inicio) queryParams.append('mes_inicio', params.mes_inicio);
      if (params?.mes_fim) queryParams.append('mes_fim', params.mes_fim);

      const url = `${API_URL}/api/v1/cartoes-credito/${cartaoId}/faturas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      await this.handleResponse(response, 'Erro ao buscar faturas mensais');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar faturas mensais:', error);
      throw error;
    }
  }

  async pagarFaturaMensal(
    cartaoId: string,
    data: PagarFaturaRequest
  ): Promise<ApiResponse<{ parcelas_pagas: number; valor_total: string; gasto_id: string | null }>> {
    try {
      const response = await fetch(`${API_URL}/api/v1/cartoes-credito/${cartaoId}/pagar-fatura`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(data),
      });

      await this.handleResponse(response, 'Erro ao pagar fatura mensal');
      return await response.json();
    } catch (error) {
      console.error('Erro ao pagar fatura mensal:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
