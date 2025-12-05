import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  BanknotesIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import {
  apiService,
  GastoResponse,
  ReceitaResponse,
  GastoDashboard,
  ReceitaDashboard,
} from '../services/api';
import Modal from '../components/Modal';
import FormGasto from '../components/FormGasto';
import FormReceita from '../components/FormReceita';
import PremiumExpiredModal from '../components/PremiumExpiredModal';
import ExcelExportButton from '../components/ExcelExportButton';
import Toast from '../components/Toast';
import MetasGastos from '../components/MetasGastos';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

type TransacaoTipo = 'Receita' | 'Despesa';

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

// Função para formatar valores em Real brasileiro
const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

interface Transacao {
  id: string;
  data: string;
  descricao: string;
  tipo: TransacaoTipo;
  valor: number;
  categoria: string;
}

interface Filtros {
  mes: string;
  categoria: string;
  tipo: string;
  periodo: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Verifica se o premium está ativo
  const isPremiumActive = userProfile?.is_premium_active ?? false;

  // Estados dos dados
  const [gastos, setGastos] = useState<GastoResponse[]>([]);
  const [receitas, setReceitas] = useState<ReceitaResponse[]>([]);
  const [gastoDashboard, setGastoDashboard] = useState<GastoDashboard | null>(
    null,
  );
  const [receitaDashboard, setReceitaDashboard] =
    useState<ReceitaDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados dos modais
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [showReceitaModal, setShowReceitaModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState<GastoResponse | null>(null);
  const [editingReceita, setEditingReceita] = useState<ReceitaResponse | null>(
    null,
  );

  // Estado dos filtros
  const [filtros, setFiltros] = useState<Filtros>({
    mes: '',
    categoria: 'todas',
    tipo: 'todos',
    periodo: 'todos', // todos, ultimos30, ultimos60, ultimos90, anoAtual, mesAtual
  });

  // Estado da pesquisa (separado dos filtros)
  const [pesquisaDescricao, setPesquisaDescricao] = useState('');

  // Estado de comparação entre períodos
  const [mostrarComparacao, setMostrarComparacao] = useState(false);

  // Estado para mostrar atalhos
  const [mostrarAtalhos, setMostrarAtalhos] = useState(false);

  // Estado para confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string;
    tipo: 'gasto' | 'receita';
  }>({ isOpen: false, id: '', tipo: 'gasto' });

  // Estados da tabela
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [ordenacao, setOrdenacao] = useState<{
    campo: 'data' | 'tipo';
    ordem: 'asc' | 'desc';
  }>({
    campo: 'data',
    ordem: 'desc',
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadData = async () => {
    if (!userProfile?.remotejid) {
      setLoading(false);
      return;
    }

    // Se o premium não está ativo, não carrega os dados
    if (!isPremiumActive) {
      setLoading(false);
      setShowPremiumModal(true);
      return;
    }

    setLoading(true);
    try {
      // Buscar gastos
      const gastosResponse = await apiService.getGastos({
        usuario: userProfile.remotejid,
        page_size: 100,
      });
      setGastos(gastosResponse.data);

      // Buscar receitas
      const receitasResponse = await apiService.getReceitas({
        usuario: userProfile.remotejid,
        page_size: 100,
      });
      setReceitas(receitasResponse.data);

      // Buscar dashboard de gastos
      const gastoDash = await apiService.getGastosDashboard({
        usuario: userProfile.remotejid,
      });
      setGastoDashboard(gastoDash.data);

      // Buscar dashboard de receitas
      const receitaDash = await apiService.getReceitasDashboard({
        usuario: userProfile.remotejid,
      });
      setReceitaDashboard(receitaDash.data);
    } catch (error) {
      setToast({
        message: 'Erro ao carregar dados. Tente novamente.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.remotejid]);

  // Monitora mudanças no status do premium
  useEffect(() => {
    if (userProfile && !isPremiumActive) {
      setShowPremiumModal(true);
    }
  }, [isPremiumActive, userProfile]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em um input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + D = Nova Despesa
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (isPremiumActive) {
          setEditingGasto(null);
          setShowGastoModal(true);
        }
      }

      // Ctrl/Cmd + R = Nova Receita
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        if (isPremiumActive) {
          setEditingReceita(null);
          setShowReceitaModal(true);
        }
      }

      // Ctrl/Cmd + L = Limpar Filtros
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setFiltros({
          mes: '',
          categoria: 'todas',
          tipo: 'todos',
          periodo: 'todos',
        });
        setPesquisaDescricao('');
      }

      // Ctrl/Cmd + F = Focar na pesquisa
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Pesquisar"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // ESC = Fechar modais
      if (e.key === 'Escape') {
        if (showGastoModal) {
          setShowGastoModal(false);
          setEditingGasto(null);
        }
        if (showReceitaModal) {
          setShowReceitaModal(false);
          setEditingReceita(null);
        }
        if (showUserMenu) {
          setShowUserMenu(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPremiumActive, showGastoModal, showReceitaModal, showUserMenu]);

  const handleDeleteGasto = async (id: string) => {
    setConfirmDelete({ isOpen: true, id, tipo: 'gasto' });
  };

  const handleDeleteReceita = async (id: string) => {
    setConfirmDelete({ isOpen: true, id, tipo: 'receita' });
  };

  const confirmarDelete = async () => {
    try {
      if (confirmDelete.tipo === 'gasto') {
        await apiService.deleteGasto(confirmDelete.id);
        setToast({ message: 'Gasto deletado com sucesso!', type: 'success' });
      } else {
        await apiService.deleteReceita(confirmDelete.id);
        setToast({ message: 'Receita deletada com sucesso!', type: 'success' });
      }
      await loadData();
    } catch (error) {
      setToast({
        message: `Erro ao deletar ${confirmDelete.tipo}. Tente novamente.`,
        type: 'error',
      });
    } finally {
      setConfirmDelete({ isOpen: false, id: '', tipo: 'gasto' });
    }
  };

  const cancelarDelete = () => {
    setConfirmDelete({ isOpen: false, id: '', tipo: 'gasto' });
  };

  const handleEditGasto = (gasto: GastoResponse) => {
    setEditingGasto(gasto);
    setShowGastoModal(true);
  };

  const handleEditReceita = (receita: ReceitaResponse) => {
    setEditingReceita(receita);
    setShowReceitaModal(true);
  };

  const handleGastoSuccess = async () => {
    setShowGastoModal(false);
    const isEditing = editingGasto !== null;
    setEditingGasto(null);
    await loadData();
    setToast({
      message: isEditing ? 'Gasto atualizado com sucesso!' : 'Gasto criado com sucesso!',
      type: 'success',
    });
  };

  const handleReceitaSuccess = async () => {
    setShowReceitaModal(false);
    const isEditing = editingReceita !== null;
    setEditingReceita(null);
    await loadData();
    setToast({
      message: isEditing ? 'Receita atualizada com sucesso!' : 'Receita criada com sucesso!',
      type: 'success',
    });
  };

  const handleGastoCancel = () => {
    setShowGastoModal(false);
    setEditingGasto(null);
  };

  const handleReceitaCancel = () => {
    setShowReceitaModal(false);
    setEditingReceita(null);
  };

  // Combinar gastos e receitas em transações
  const todasTransacoes: Transacao[] = [
    ...gastos.map((g) => ({
      id: g.id,
      data: g.data || g.created_at,
      descricao: g.descricao,
      tipo: 'Despesa' as TransacaoTipo,
      valor: parseFloat(g.valor),
      categoria: g.categoria,
    })),
    ...receitas.map((r) => ({
      id: r.id,
      data: r.data || r.created_at,
      descricao: r.descricao,
      tipo: 'Receita' as TransacaoTipo,
      valor: parseFloat(r.valor),
      categoria: r.categoria,
    })),
  ];

  // === APLICAR FILTROS ===
  const transacoesFiltradas = todasTransacoes.filter((t) => {
    const dataTransacao = new Date(t.data);
    const hoje = new Date();
    const anoMes = t.data.slice(0, 7); // pega "2025-03" por exemplo

    // Filtro de mês específico (se selecionado, tem prioridade sobre período)
    const filtroMesOK = filtros.mes ? anoMes === filtros.mes : true;

    // Filtro de período customizado
    let filtroPeriodoOK = true;
    if (!filtros.mes && filtros.periodo !== 'todos') {
      const diffTime = hoje.getTime() - dataTransacao.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filtros.periodo) {
        case 'ultimos30':
          filtroPeriodoOK = diffDays <= 30;
          break;
        case 'ultimos60':
          filtroPeriodoOK = diffDays <= 60;
          break;
        case 'ultimos90':
          filtroPeriodoOK = diffDays <= 90;
          break;
        case 'anoAtual':
          filtroPeriodoOK = dataTransacao.getFullYear() === hoje.getFullYear();
          break;
        case 'mesAtual':
          filtroPeriodoOK =
            dataTransacao.getFullYear() === hoje.getFullYear() &&
            dataTransacao.getMonth() === hoje.getMonth();
          break;
        default:
          filtroPeriodoOK = true;
      }
    }

    const filtroCategoriaOK =
      filtros.categoria === 'todas' ? true : t.categoria === filtros.categoria;

    const filtroTipoOK =
      filtros.tipo === 'todos' ? true : t.tipo === filtros.tipo;

    const filtroDescricaoOK = pesquisaDescricao
      ? t.descricao.toLowerCase().includes(pesquisaDescricao.toLowerCase())
      : true;

    return filtroMesOK && filtroPeriodoOK && filtroCategoriaOK && filtroTipoOK && filtroDescricaoOK;
  });

  // === AGRUPAMENTO POR MÊS PARA O GRÁFICO DE LINHA ===
  const fluxoMensal = (() => {
    const mapa: Record<string, { receitas: number; despesas: number }> = {};

    transacoesFiltradas.forEach((t) => {
      const data = new Date(t.data);
      if (isNaN(data.getTime())) return;

      // Nome do mês em PT-BR abreviado
      const mes = data
        .toLocaleString('pt-BR', { month: 'short' })
        .replace('.', '');

      if (!mapa[mes]) {
        mapa[mes] = { receitas: 0, despesas: 0 };
      }

      if (t.tipo === 'Receita') {
        mapa[mes].receitas += t.valor;
      } else {
        mapa[mes].despesas += t.valor;
      }
    });

    // Converter o mapa em array
    return Object.entries(mapa).map(([mes, valores]) => ({
      mes: mes.charAt(0).toUpperCase() + mes.slice(1), // Jan, Fev, Mar…
      receitas: valores.receitas,
      despesas: valores.despesas,
    }));
  })();

  // Ordenar transações
  const transacoesOrdenadas = [...transacoesFiltradas].sort((a, b) => {
    if (ordenacao.campo === 'data') {
      const dataA = new Date(a.data).getTime();
      const dataB = new Date(b.data).getTime();
      return ordenacao.ordem === 'asc' ? dataA - dataB : dataB - dataA;
    } else {
      return ordenacao.ordem === 'asc'
        ? a.tipo.localeCompare(b.tipo)
        : b.tipo.localeCompare(a.tipo);
    }
  });

  // Paginação
  const totalPaginas = Math.ceil(transacoesOrdenadas.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const transacoesPaginadas = transacoesOrdenadas.slice(
    indiceInicial,
    indiceInicial + itensPorPagina,
  );

  // Calcular resumo com base nas transações FILTRADAS
  const totalReceitas = transacoesFiltradas
    .filter((t) => t.tipo === 'Receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoesFiltradas
    .filter((t) => t.tipo === 'Despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  // === CÁLCULO DE TENDÊNCIAS (Mês Atual vs Mês Anterior) ===
  const calcularTendencias = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Transações do mês atual
    const transacoesMesAtual = todasTransacoes.filter((t) => {
      const data = new Date(t.data);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });

    // Transações do mês anterior
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    const transacoesMesAnterior = todasTransacoes.filter((t) => {
      const data = new Date(t.data);
      return data.getMonth() === mesAnterior && data.getFullYear() === anoMesAnterior;
    });

    const receitasMesAtual = transacoesMesAtual
      .filter((t) => t.tipo === 'Receita')
      .reduce((acc, t) => acc + t.valor, 0);

    const receitasMesAnterior = transacoesMesAnterior
      .filter((t) => t.tipo === 'Receita')
      .reduce((acc, t) => acc + t.valor, 0);

    const despesasMesAtual = transacoesMesAtual
      .filter((t) => t.tipo === 'Despesa')
      .reduce((acc, t) => acc + t.valor, 0);

    const despesasMesAnterior = transacoesMesAnterior
      .filter((t) => t.tipo === 'Despesa')
      .reduce((acc, t) => acc + t.valor, 0);

    // Calcular percentual de variação
    const variacaoReceitas = receitasMesAnterior > 0
      ? ((receitasMesAtual - receitasMesAnterior) / receitasMesAnterior) * 100
      : receitasMesAtual > 0 ? 100 : 0;

    const variacaoDespesas = despesasMesAnterior > 0
      ? ((despesasMesAtual - despesasMesAnterior) / despesasMesAnterior) * 100
      : despesasMesAtual > 0 ? 100 : 0;

    return {
      variacaoReceitas,
      variacaoDespesas,
    };
  };

  const { variacaoReceitas, variacaoDespesas } = calcularTendencias();

  // Dados para gráficos - com base nas transações FILTRADAS
  const coresReceitas = ['#22c55e', '#16a34a', '#059669', '#047857', '#065f46', '#064e3b'];
  const coresDespesas = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#6b1414'];

  // Agrupar despesas por categoria das transações filtradas
  const categoriasGastos = (() => {
    const categoriaMap: Record<string, number> = {};

    transacoesFiltradas
      .filter((t) => t.tipo === 'Despesa')
      .forEach((t) => {
        if (!categoriaMap[t.categoria]) {
          categoriaMap[t.categoria] = 0;
        }
        categoriaMap[t.categoria] += t.valor;
      });

    return Object.entries(categoriaMap).map(([name, value]) => ({
      name,
      value,
    }));
  })();

  // Agrupar receitas por categoria das transações filtradas
  const categoriasReceitas = (() => {
    const categoriaMap: Record<string, number> = {};

    transacoesFiltradas
      .filter((t) => t.tipo === 'Receita')
      .forEach((t) => {
        if (!categoriaMap[t.categoria]) {
          categoriaMap[t.categoria] = 0;
        }
        categoriaMap[t.categoria] += t.valor;
      });

    return Object.entries(categoriaMap).map(([name, value]) => ({
      name,
      value,
    }));
  })();

  // Lista completa de categorias do sistema
  const todasCategorias = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saúde',
    'Educação',
    'Compras',
    'Viagem',
    'Assinaturas',
    'Salário',
    'Freelance',
    'Investimentos',
    'Bonificação',
    'Presente',
    'Aluguel',
    'Venda',
    'Outros',
  ];

  // Contar transações por categoria (sem filtros aplicados, usa todas as transações)
  const contagemPorCategoria = (() => {
    const contagem: Record<string, number> = {};
    todasTransacoes.forEach((t) => {
      if (!contagem[t.categoria]) {
        contagem[t.categoria] = 0;
      }
      contagem[t.categoria]++;
    });
    return contagem;
  })();


  const alternarOrdenacao = (campo: 'data' | 'tipo') => {
    if (ordenacao.campo === campo) {
      setOrdenacao({
        campo,
        ordem: ordenacao.ordem === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setOrdenacao({ campo, ordem: 'desc' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Spinner animado */}
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-green-100 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Mensagem principal */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Carregando seu Dashboard
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Estamos preparando suas informações financeiras...
          </p>

          {/* Indicadores de progresso */}
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Carregando receitas e despesas</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
              <span>Processando categorias</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
              <span>Gerando gráficos</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 md:p-10 space-y-10 overflow-x-hidden">
      {/* ===== CABEÇALHO ===== */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Dashboard <span className="text-green-600">Financeiro</span>
          </h1>
          <button
            onClick={() => setMostrarAtalhos(!mostrarAtalhos)}
            className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {mostrarAtalhos ? 'Ocultar' : 'Ver'} atalhos de teclado
          </button>
        </div>

        <div className="flex items-center gap-4">
          <ExcelExportButton
            gastos={gastos}
            receitas={receitas}
            gastoDashboard={gastoDashboard}
            receitaDashboard={receitaDashboard}
            totalReceitas={totalReceitas}
            totalDespesas={totalDespesas}
            saldo={saldo}
            transacoesFiltradas={transacoesFiltradas}
            filtros={filtros}
          />

          {/* Menu do usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm transition"
            >
              <UserCircleIcon className="w-5 h-5 text-gray-600" />
              <span className="hidden md:inline text-gray-700">
                {user?.name}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                </div>

                {/* Novo item - Suporte */}
                <a
                  href="https://chat.whatsapp.com/CicoYlY9JAv3SgpCRIz8Bk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-green-600 hover:bg-green-50 transition"
                >
                  <ArrowUpCircleIcon className="w-5 h-5" />
                  Suporte
                </a>

                {/* Novo item - GranaIA (bot) */}
                <a
                  href="https://wa.me/qr/ZHYAJF2VX2MWI1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  GranaIA pelo WhatsApp
                </a>

                {/* Já existente - Sair da conta */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== ATALHOS DE TECLADO ===== */}
      {mostrarAtalhos && (
        <section className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Atalhos de Teclado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono">Ctrl+D</kbd>
              <span>Nova Despesa</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono">Ctrl+R</kbd>
              <span>Nova Receita</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono">Ctrl+L</kbd>
              <span>Limpar Filtros</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono">Ctrl+F</kbd>
              <span>Buscar</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono">ESC</kbd>
              <span>Fechar Modais</span>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-3 italic">
            💡 Use <kbd className="px-1 bg-white rounded border border-blue-300 font-mono text-xs">Cmd</kbd> no Mac ao invés de Ctrl
          </p>
        </section>
      )}

      {/* ===== BOTÕES DE AÇÃO ===== */}
      <section className="flex flex-wrap gap-3 justify-center md:justify-start">
        <button
          onClick={() => {
            if (!isPremiumActive) {
              setShowPremiumModal(true);
              return;
            }
            setEditingGasto(null);
            setShowGastoModal(true);
          }}
          disabled={!isPremiumActive}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium shadow-md transition ${
            isPremiumActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <PlusIcon className="w-5 h-5" />
          Novo Gasto
        </button>
        <button
          onClick={() => {
            if (!isPremiumActive) {
              setShowPremiumModal(true);
              return;
            }
            setEditingReceita(null);
            setShowReceitaModal(true);
          }}
          disabled={!isPremiumActive}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium shadow-md transition ${
            isPremiumActive
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <PlusIcon className="w-5 h-5" />
          Nova Receita
        </button>
      </section>

      {/* ===== CARDS DE RESUMO ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo */}
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 border border-gray-100">
          <BanknotesIcon className="w-10 h-10 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Saldo Atual</p>
            <h3
              className={`text-2xl font-bold ${
                saldo >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(saldo)}
            </h3>
          </div>
        </div>

        {/* Receitas */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <ArrowUpCircleIcon className="w-10 h-10 text-green-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Receitas</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatarMoeda(totalReceitas)}
              </h3>
            </div>
          </div>
          {/* Indicador de Tendência */}
          {variacaoReceitas !== 0 && (
            <div className={`flex items-center gap-1 text-sm mt-2 ${
              variacaoReceitas > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {variacaoReceitas > 0 ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span className="font-medium">
                {Math.abs(variacaoReceitas).toFixed(1)}%
              </span>
              <span className="text-gray-500 text-xs ml-1">vs mês anterior</span>
            </div>
          )}
        </div>

        {/* Despesas */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <ArrowDownCircleIcon className="w-10 h-10 text-red-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Despesas</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatarMoeda(totalDespesas)}
              </h3>
            </div>
          </div>
          {/* Indicador de Tendência */}
          {variacaoDespesas !== 0 && (
            <div className={`flex items-center gap-1 text-sm mt-2 ${
              variacaoDespesas > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {variacaoDespesas > 0 ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span className="font-medium">
                {Math.abs(variacaoDespesas).toFixed(1)}%
              </span>
              <span className="text-gray-500 text-xs ml-1">vs mês anterior</span>
            </div>
          )}
        </div>
      </section>

      {/* ===== COMPARAÇÃO ENTRE PERÍODOS ===== */}
      <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Comparação de Períodos
          </h2>
          <button
            onClick={() => setMostrarComparacao(!mostrarComparacao)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition"
          >
            {mostrarComparacao ? 'Ocultar' : 'Mostrar'} Comparação
          </button>
        </div>

        {mostrarComparacao && (() => {
          const hoje = new Date();
          const mesAtual = hoje.getMonth();
          const anoAtual = hoje.getFullYear();
          const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
          const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

          // Dados mês atual
          const dadosMesAtual = todasTransacoes.filter((t) => {
            const data = new Date(t.data);
            return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
          });

          // Dados mês anterior
          const dadosMesAnterior = todasTransacoes.filter((t) => {
            const data = new Date(t.data);
            return data.getMonth() === mesAnterior && data.getFullYear() === anoMesAnterior;
          });

          const calcularResumo = (transacoes: Transacao[]) => ({
            receitas: transacoes.filter(t => t.tipo === 'Receita').reduce((acc, t) => acc + t.valor, 0),
            despesas: transacoes.filter(t => t.tipo === 'Despesa').reduce((acc, t) => acc + t.valor, 0),
            saldo: transacoes.filter(t => t.tipo === 'Receita').reduce((acc, t) => acc + t.valor, 0) -
                   transacoes.filter(t => t.tipo === 'Despesa').reduce((acc, t) => acc + t.valor, 0),
          });

          const resumoAtual = calcularResumo(dadosMesAtual);
          const resumoAnterior = calcularResumo(dadosMesAnterior);

          const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Mês Anterior */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  {meses[mesAnterior]} {anoMesAnterior}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receitas:</span>
                    <span className="font-medium text-green-600">{formatarMoeda(resumoAnterior.receitas)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Despesas:</span>
                    <span className="font-medium text-red-600">{formatarMoeda(resumoAnterior.despesas)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-700 font-medium">Saldo:</span>
                    <span className={`font-bold ${resumoAnterior.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarMoeda(resumoAnterior.saldo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mês Atual */}
              <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-gray-700 mb-3">
                  {meses[mesAtual]} {anoAtual} <span className="text-xs text-green-600">(Atual)</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receitas:</span>
                    <span className="font-medium text-green-600">{formatarMoeda(resumoAtual.receitas)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Despesas:</span>
                    <span className="font-medium text-red-600">{formatarMoeda(resumoAtual.despesas)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-300">
                    <span className="text-gray-700 font-medium">Saldo:</span>
                    <span className={`font-bold ${resumoAtual.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarMoeda(resumoAtual.saldo)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ===== FILTROS ===== */}
      <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro de Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={filtros?.periodo || 'todos'}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, periodo: e.target.value, mes: '' }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white
        text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            >
              <option value="todos">Todos os períodos</option>
              <option value="mesAtual">Mês atual</option>
              <option value="ultimos30">Últimos 30 dias</option>
              <option value="ultimos60">Últimos 60 dias</option>
              <option value="ultimos90">Últimos 90 dias</option>
              <option value="anoAtual">Ano atual</option>
            </select>
          </div>

          {/* Filtro de Mês/Data Específico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mês Específico
            </label>
            <input
              type="month"
              value={filtros?.mes || ''}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, mes: e.target.value, periodo: 'todos' }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white
        text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Filtro de Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filtros?.categoria || 'todas'}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  categoria: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white
        text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            >
              <option value="todas">Todas</option>

              {/* Lista todas as categorias com contagem */}
              {todasCategorias.map((cat) => {
                const quantidade = contagemPorCategoria[cat] || 0;
                return (
                  <option key={cat} value={cat}>
                    {cat} {quantidade > 0 ? `(${quantidade})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filtros?.tipo || 'todos'}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, tipo: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white
        text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            >
              <option value="todos">Todos</option>
              <option value="Receita">Receita</option>
              <option value="Despesa">Despesa</option>
            </select>
          </div>
        </div>

        {/* BOTÃO LIMPAR FILTROS */}
        <div className="flex justify-end mt-4">
          <button
            onClick={() =>
              setFiltros({
                mes: '',
                categoria: 'todas',
                tipo: 'todos',
                periodo: 'todos',
              })
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
      border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition"
          >
            Limpar Filtros
          </button>
        </div>
      </section>

      {/* ===== ESTADO VAZIO GERAL ===== */}
      {todasTransacoes.length === 0 && (
        <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <EmptyState
            title="Nenhuma transação cadastrada"
            message="Comece adicionando suas primeiras receitas e despesas para visualizar seu dashboard financeiro completo com gráficos, tendências e análises."
            icon={
              <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            action={{
              label: 'Adicionar primeira transação',
              onClick: () => setShowGastoModal(true),
            }}
          />
        </section>
      )}

      {/* ===== GRÁFICO: FLUXO DE CAIXA MENSAL ===== */}
      {fluxoMensal.length > 0 && (
        <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Fluxo de Caixa Mensal
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fluxoMensal}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="mes" />
              <YAxis />

              <Tooltip
                formatter={(value: number) => formatarMoeda(value)}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="receitas"
                stroke="#16a34a"
                strokeWidth={3}
                name="Receitas"
              />

              <Line
                type="monotone"
                dataKey="despesas"
                stroke="#ef4444"
                strokeWidth={3}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* ===== GRÁFICOS DE PIZZA ===== */}
      {(categoriasGastos.length > 0 || categoriasReceitas.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Despesas */}
          {categoriasGastos.length > 0 && (
            <div
              className={`bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 ease-in-out ${
                categoriasReceitas.length === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Distribuição de Despesas por Categoria
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriasGastos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatarMoeda(entry.value)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriasGastos.map((entry, index) => (
                      <Cell
                        key={`cell-despesa-${index}`}
                        fill={coresDespesas[index % coresDespesas.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatarMoeda(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Receitas */}
          {categoriasReceitas.length > 0 && (
            <div
              className={`bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-500 ease-in-out ${
                categoriasGastos.length === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Distribuição de Receitas por Categoria
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriasReceitas}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatarMoeda(entry.value)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriasReceitas.map((entry, index) => (
                      <Cell
                        key={`cell-receita-${index}`}
                        fill={coresReceitas[index % coresReceitas.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatarMoeda(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}

      {/* ===== METAS DE GASTOS ===== */}
      <MetasGastos
        gastosPorCategoria={categoriasGastos}
        mesReferencia={new Date().toISOString().slice(0, 7)}
      />

      {/* ===== TABELA DE TRANSAÇÕES ===== */}
      <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Movimentações Recentes
          </h2>

          {/* Campo de Pesquisa */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={pesquisaDescricao}
              onChange={(e) => setPesquisaDescricao(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white
                text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition
                placeholder-gray-400"
              placeholder="🔍 Pesquisar por descrição..."
            />
            {pesquisaDescricao && (
              <button
                onClick={() => setPesquisaDescricao('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                title="Limpar pesquisa"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => alternarOrdenacao('data')}
                >
                  Data{' '}
                  {ordenacao.campo === 'data' &&
                    (ordenacao.ordem === 'asc' ? (
                      <ArrowUpIcon className="inline w-4 h-4" />
                    ) : (
                      <ArrowDownIcon className="inline w-4 h-4" />
                    ))}
                </th>
                <th className="py-3 px-4 text-left">Descrição</th>
                <th className="py-3 px-4 text-left">Categoria</th>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => alternarOrdenacao('tipo')}
                >
                  Tipo{' '}
                  {ordenacao.campo === 'tipo' &&
                    (ordenacao.ordem === 'asc' ? (
                      <ArrowUpIcon className="inline w-4 h-4" />
                    ) : (
                      <ArrowDownIcon className="inline w-4 h-4" />
                    ))}
                </th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transacoesPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      title="Nenhuma transação encontrada"
                      message={pesquisaDescricao
                        ? `Não encontramos transações com "${pesquisaDescricao}". Tente ajustar sua pesquisa ou filtros.`
                        : "Não há transações para os filtros selecionados. Tente ajustar os filtros ou adicionar novas transações."}
                      icon={
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      }
                    />
                  </td>
                </tr>
              ) : (
                transacoesPaginadas.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      {new Date(t.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">{t.descricao}</td>
                    <td className="py-3 px-4">{t.categoria}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          t.tipo === 'Receita'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {t.tipo}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${
                        t.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatarMoeda(t.valor)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                        onClick={() => {
                          if (t.tipo === 'Despesa') {
                            const gasto = gastos.find((g) => g.id === t.id);
                            if (gasto) handleEditGasto(gasto);
                          } else {
                            const receita = receitas.find((r) => r.id === t.id);
                            if (receita) handleEditReceita(receita);
                          }
                        }}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                        title="Editar"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>

                      {/* Botão Deletar */}
                      <button
                        onClick={() => {
                          if (t.tipo === 'Despesa') {
                            handleDeleteGasto(t.id);
                          } else {
                            handleDeleteReceita(t.id);
                          }
                        }}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                        title="Deletar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINAÇÃO ===== */}
        {totalPaginas > 1 && (
          <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
            {/* Texto "mostrando X–Y" */}
            <span>
              Mostrando {indiceInicial + 1}–
              {Math.min(
                indiceInicial + itensPorPagina,
                transacoesOrdenadas.length,
              )}{' '}
              de {transacoesOrdenadas.length}
            </span>

            {/* Botões */}
            <div className="flex gap-2">
              {/* Botão Anterior */}
              <button
                onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
                className="px-3 py-1 border rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:text-gray-400 transition"
              >
                Anterior
              </button>

              {/* Botões numerados */}
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPaginaAtual(i + 1)}
                  className={`px-3 py-1 border rounded-lg font-medium transition ${
                    paginaAtual === i + 1
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              {/* Botão Próximo */}
              <button
                onClick={() =>
                  setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={paginaAtual === totalPaginas}
                className="px-3 py-1 border rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:text-gray-400 transition"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Botão Flutuante do WhatsApp 
      <a
        href="https://wa.me/5581991189612?text=Olá!%20Gostaria%20de%20falar%20com%20o%20suporte."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50"
      >
        <img
          src="https://img.icons8.com/?size=100&id=964RahB4l606&format=png&color=25D366"
          alt="Ícone do WhatsApp"
          className="w-20 h-20 md:w-22 md:h-22 hover:scale-110 transition-transform duration-200"
        />
      </a>*/}

      {/* ===== MODAIS ===== */}
      <Modal
        isOpen={showGastoModal}
        onClose={handleGastoCancel}
        title={editingGasto ? 'Editar Gasto' : 'Novo Gasto'}
      >
        <FormGasto
          gasto={editingGasto}
          onSuccess={handleGastoSuccess}
          onCancel={handleGastoCancel}
        />
      </Modal>

      <Modal
        isOpen={showReceitaModal}
        onClose={handleReceitaCancel}
        title={editingReceita ? 'Editar Receita' : 'Nova Receita'}
      >
        <FormReceita
          receita={editingReceita}
          onSuccess={handleReceitaSuccess}
          onCancel={handleReceitaCancel}
        />
      </Modal>

      {/* Modal de Premium Expirado */}
      <PremiumExpiredModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        premiumUntil={userProfile?.premium_until}
      />

      {/* Toast de Notificação */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title={`Deletar ${confirmDelete.tipo === 'gasto' ? 'Gasto' : 'Receita'}?`}
        message={`Tem certeza que deseja deletar est${confirmDelete.tipo === 'gasto' ? 'e gasto' : 'a receita'}? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, deletar"
        cancelLabel="Cancelar"
        onConfirm={confirmarDelete}
        onCancel={cancelarDelete}
        type="danger"
      />
    </div>
  );
}
