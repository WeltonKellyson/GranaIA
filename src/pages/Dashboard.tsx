import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
  TableCellsIcon,
  CalendarIcon,
  ArrowUpCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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

// Novos componentes refatorados
import CardsResumo from '../components/CardsResumo';
import FiltrosTransacoes from '../components/FiltrosTransacoes';
import ComparacaoPeriodos from '../components/ComparacaoPeriodos';
import GraficosFinanceiros from '../components/GraficosFinanceiros';
import TabelaTransacoes from '../components/TabelaTransacoes';
import CalendarioTransacoes from '../components/CalendarioTransacoes';

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
  const { theme, toggleTheme, isDark } = useTheme();
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

  // Estado de visualização (tabela ou calendário)
  const [visualizacao, setVisualizacao] = useState<'tabela' | 'calendario'>('tabela');

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

  // Agrupar despesas por categoria (para MetasGastos)
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 md:p-10 space-y-10 overflow-x-hidden">
      {/* ===== CABEÇALHO ===== */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Dashboard <span className="text-green-600 dark:text-green-400">Financeiro</span>
          </h1>
          <button
            onClick={() => setMostrarAtalhos(!mostrarAtalhos)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mt-1 flex items-center gap-1"
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

          {/* Botão de toggle do tema */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-sm transition"
            title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 text-yellow-500" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Menu do usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm transition"
            >
              <UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="hidden md:inline text-gray-700 dark:text-gray-200">
                {user?.name}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
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
      <CardsResumo
        saldo={saldo}
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        variacaoReceitas={variacaoReceitas}
        variacaoDespesas={variacaoDespesas}
      />

      {/* ===== COMPARAÇÃO ENTRE PERÍODOS ===== */}
      <ComparacaoPeriodos todasTransacoes={todasTransacoes} />

      {/* ===== FILTROS ===== */}
      <FiltrosTransacoes
        filtros={filtros}
        setFiltros={setFiltros}
        todasCategorias={todasCategorias}
        contagemPorCategoria={contagemPorCategoria}
      />

      {/* ===== ESTADO VAZIO GERAL ===== */}
      {todasTransacoes.length === 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
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

      {/* ===== GRÁFICOS ===== */}
      <GraficosFinanceiros transacoesFiltradas={transacoesFiltradas} />

      {/* ===== METAS DE GASTOS ===== */}
      <MetasGastos
        gastosPorCategoria={categoriasGastos}
        mesReferencia={new Date().toISOString().slice(0, 7)}
      />

      {/* ===== TABELA/CALENDÁRIO DE TRANSAÇÕES ===== */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Movimentações Recentes
            </h2>

            {/* Botões de alternância Tabela/Calendário */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setVisualizacao('tabela')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                  visualizacao === 'tabela'
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <TableCellsIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Tabela</span>
              </button>
              <button
                onClick={() => setVisualizacao('calendario')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                  visualizacao === 'calendario'
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Calendário</span>
              </button>
            </div>
          </div>

          {/* Campo de Pesquisa */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={pesquisaDescricao}
              onChange={(e) => setPesquisaDescricao(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition
                placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="🔍 Pesquisar por descrição..."
            />
            {pesquisaDescricao && (
              <button
                onClick={() => setPesquisaDescricao('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
                title="Limpar pesquisa"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Visualização condicional: Tabela ou Calendário */}
        {visualizacao === 'tabela' ? (
          <TabelaTransacoes
            transacoesFiltradas={transacoesFiltradas}
            gastos={gastos}
            receitas={receitas}
            pesquisaDescricao={pesquisaDescricao}
            onEditGasto={handleEditGasto}
            onEditReceita={handleEditReceita}
            onDeleteGasto={handleDeleteGasto}
            onDeleteReceita={handleDeleteReceita}
          />
        ) : (
          <CalendarioTransacoes
            transacoesFiltradas={transacoesFiltradas}
            gastos={gastos}
            receitas={receitas}
            onEditGasto={handleEditGasto}
            onEditReceita={handleEditReceita}
            onDeleteGasto={handleDeleteGasto}
            onDeleteReceita={handleDeleteReceita}
          />
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
