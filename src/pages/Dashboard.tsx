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
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  apiService,
  GastoResponse,
  ReceitaResponse,
  GastoDashboard,
  ReceitaDashboard,
  GastoFuturoResponse,
  GastoFuturoDashboard,
} from '../services/api';
import Modal from '../components/Modal';
import FormGasto from '../components/FormGasto';
import FormReceita from '../components/FormReceita';
import FormGastoFuturo from '../components/FormGastoFuturo';
import PremiumExpiredModal from '../components/PremiumExpiredModal';
import ExcelExportButton from '../components/ExcelExportButton';
import Toast from '../components/Toast';
// import MetasGastos from '../components/MetasGastos'; // TODO: Implementar mdulo de metas
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import ModalCartoesCredito from '../components/ModalCartoesCredito';

// Novos componentes refatorados
import DashboardContent from '../components/DashboardContent';
import CartoesContent from '../components/CartoesContent';

type TransacaoTipo = 'Receita' | 'Despesa' | 'Gasto Futuro';

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

// Funcao para formatar valores em Real brasileiro
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

  // Verifica se o premium est ativo
  const isPremiumActive = userProfile?.is_premium_active ?? false;

  // Funcao para pegar apenas o primeiro e segundo nome
  const getShortName = (fullName?: string) => {
    if (!fullName) return '';
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0];
    return `${nameParts[0]} ${nameParts[1]}`;
  };

  // Estados dos dados
  const [gastos, setGastos] = useState<GastoResponse[]>([]);
  const [receitas, setReceitas] = useState<ReceitaResponse[]>([]);
  const [gastoDashboard, setGastoDashboard] = useState<GastoDashboard | null>(
    null,
  );
  const [receitaDashboard, setReceitaDashboard] =
    useState<ReceitaDashboard | null>(null);
  const [gastosFuturos, setGastosFuturos] = useState<GastoFuturoResponse[]>([]);
  const [gastoFuturoDashboard, setGastoFuturoDashboard] =
    useState<GastoFuturoDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Estados dos modais
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [showReceitaModal, setShowReceitaModal] = useState(false);
  const [showGastoFuturoModal, setShowGastoFuturoModal] = useState(false);
  const [showCartoesCreditoModal, setShowCartoesCreditoModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState<GastoResponse | null>(null);
  const [editingReceita, setEditingReceita] = useState<ReceitaResponse | null>(
    null,
  );
  const [editingGastoFuturo, setEditingGastoFuturo] = useState<GastoFuturoResponse | null>(null);

  // Estado dos filtros
  const [filtros, setFiltros] = useState<Filtros>({
    mes: '',
    categoria: 'todas',
    tipo: 'todos',
    periodo: 'todos', // todos, ultimos30, ultimos60, ultimos90, anoAtual, mesAtual
  });

  // Estado da pesquisa (separado dos filtros)
  const [pesquisaDescricao, setPesquisaDescricao] = useState('');

  // Estado de comparacao entre periodos
  const [mostrarComparacao, setMostrarComparacao] = useState(false);

  // Estado para confirmacao de exclusao
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string;
    tipo: 'gasto' | 'receita';
  }>({ isOpen: false, id: '', tipo: 'gasto' });

  // Estado de visualizacao (tabela ou calendrio)
  const [visualizacao, setVisualizacao] = useState<'tabela' | 'calendario'>('tabela');

  // Estado da aba ativa
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'cartoes' | 'config' | 'lembretes'>('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadData = async (options?: { showLoading?: boolean }) => {
    const shouldShowLoading = options?.showLoading ?? true;
    if (!userProfile?.remotejid) {
      setLoading(false);
      setHasLoaded(true);
      return;
    }

    // Se o premium nao est ativo, nao carrega os dados
    if (!isPremiumActive) {
      setLoading(false);
      setShowPremiumModal(true);
      setHasLoaded(true);
      return;
    }

    if (shouldShowLoading) {
      setLoading(true);
    }
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

      // Buscar gastos futuros
      const gastosFuturosResponse = await apiService.getGastosFuturos({
        usuario: userProfile.remotejid,
        page_size: 100,
      });
      setGastosFuturos(gastosFuturosResponse.data);

      // Buscar dashboard de gastos futuros
      const gastoFuturoDash = await apiService.getGastosFuturosDashboard();
      setGastoFuturoDashboard(gastoFuturoDash.data);
    } catch (error) {
      setToast({
        message: 'Erro ao carregar dados. Tente novamente.',
        type: 'error',
      });
    } finally {
      setHasLoaded(true);
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.remotejid]);

  // Monitora mudanas no status do premium
  useEffect(() => {
    if (userProfile && !isPremiumActive) {
      setShowPremiumModal(true);
    }
  }, [isPremiumActive, userProfile]);

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
      await loadData({ showLoading: false });
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
    await loadData({ showLoading: false });
    setToast({
      message: isEditing ? 'Gasto atualizado com sucesso!' : 'Gasto criado com sucesso!',
      type: 'success',
    });
  };

  const handleReceitaSuccess = async () => {
    setShowReceitaModal(false);
    const isEditing = editingReceita !== null;
    setEditingReceita(null);
    await loadData({ showLoading: false });
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

  // Handlers para Gastos Futuros
  const handleEditGastoFuturo = (gastoFuturo: GastoFuturoResponse) => {
    setEditingGastoFuturo(gastoFuturo);
    setShowGastoFuturoModal(true);
  };

  const handleDuplicateGastoFuturo = (gastoFuturo: GastoFuturoResponse) => {
    // Criar uma cpia do gasto futuro, removendo o ID para criar um novo
    // e ajustando a data de vencimento para 1 mes a frente
    const hoje = new Date();
    const proximaData = new Date(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());
    const dataFormatada = proximaData.toISOString().split('T')[0];

    const gastoFuturoDuplicado: GastoFuturoResponse = {
      ...gastoFuturo,
      id: '', // Remove o ID para criar um novo
      descricao: `${gastoFuturo.descricao} (Copia)`,
      data_vencimento: dataFormatada,
      status: 'ativo',
      parcelas: [], // Limpar parcelas pois ser recriado
      created_at: '',
      updated_at: '',
    };

    setEditingGastoFuturo(gastoFuturoDuplicado);
    setShowGastoFuturoModal(true);
  };

  const handleGastoFuturoSuccess = async () => {
    setShowGastoFuturoModal(false);
    const isEditing = editingGastoFuturo !== null;
    setEditingGastoFuturo(null);
    await loadData();
    setToast({
      message: isEditing ? 'Gasto futuro atualizado com sucesso!' : 'Gasto futuro criado com sucesso!',
      type: 'success',
    });
  };

  const handleGastoFuturoCancel = () => {
    setShowGastoFuturoModal(false);
    setEditingGastoFuturo(null);
  };

  const handleDeleteGastoFuturo = async (id: string) => {
    try {
      await apiService.deleteGastoFuturo(id);
      setToast({ message: 'Gasto futuro deletado com sucesso!', type: 'success' });
      await loadData();
    } catch (error) {
      setToast({
        message: 'Erro ao deletar gasto futuro. Tente novamente.',
        type: 'error',
      });
    }
  };

  const handleMarcarGastoFuturoComoPago = async (id: string) => {
    try {
      await apiService.marcarGastoFuturoComoPago(id, {
        criar_gasto: true,
      });
      setToast({
        message: 'Gasto futuro marcado como pago e gasto normal criado!',
        type: 'success',
      });
      await loadData();
    } catch (error) {
      setToast({
        message: 'Erro ao marcar gasto futuro como pago. Tente novamente.',
        type: 'error',
      });
    }
  };

  const handleMarcarParcelaComoPaga = async (parcelaId: string) => {
    try {
      await apiService.marcarParcelaComoPaga(parcelaId, {
        criar_gasto: true,
      });
      setToast({
        message: 'Parcela marcada como paga e gasto normal criado!',
        type: 'success',
      });
      await loadData();
    } catch (error) {
      setToast({
        message: 'Erro ao marcar parcela como paga. Tente novamente.',
        type: 'error',
      });
    }
  };

  // Combinar APENAS gastos e receitas (gastos futuros NAO impactam o saldo)
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

  // Lista separada para visualizacao: transacoes + gastos futuros (apenas para exibicao)
  const todasTransacoesComFuturos: Transacao[] = [
    ...todasTransacoes,
    // Adicionar parcelas pendentes de gastos futuros APENAS para visualizacao
    ...gastosFuturos.flatMap((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        return gasto.parcelas
          .filter((parcela) => parcela.status === 'pendente')
          .map((parcela) => ({
            id: `gf-${parcela.id}`, // Prefixo para diferenciar de gastos normais
            data: parcela.data_vencimento,
            descricao: `${gasto.descricao} (${parcela.numero_parcela}/${parcela.total_parcelas})`,
            tipo: 'Gasto Futuro' as TransacaoTipo,
            valor: parseFloat(parcela.valor_parcela),
            categoria: gasto.categoria, // Manter categoria original do gasto
          }));
      }
      return [];
    }),
  ];

  // === APLICAR FILTROS (apenas para gastos e receitas reais) ===
  const transacoesFiltradas = todasTransacoes.filter((t) => {
    const dataTransacao = new Date(t.data);
    const hoje = new Date();
    const anoMes = t.data.slice(0, 7); // pega "2025-03" por exemplo

    // Filtro de mes especifico (se selecionado, tem prioridade sobre periodo)
    const filtroMesOK = filtros.mes ? anoMes === filtros.mes : true;

    // Filtro de periodo customizado
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

  // === APLICAR FILTROS (incluindo gastos futuros para visualizacao) ===
  const transacoesFiltradasComFuturos = todasTransacoesComFuturos.filter((t) => {
    const dataTransacao = new Date(t.data);
    const hoje = new Date();
    const anoMes = t.data.slice(0, 7);

    const filtroMesOK = filtros.mes ? anoMes === filtros.mes : true;

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

  // Calcular resumo com base nas transacoes FILTRADAS (sem gastos futuros)
  const totalReceitas = transacoesFiltradas
    .filter((t) => t.tipo === 'Receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoesFiltradas
    .filter((t) => t.tipo === 'Despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  // === CALCULO DE TENDENCIAS (Mes Atual vs Mes Anterior) ===
  const calcularTendencias = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Transacoes do mes atual
    const transacoesMesAtual = todasTransacoes.filter((t) => {
      const data = new Date(t.data);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });

    // Transacoes do mes anterior
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

    // Calcular percentual de variacao
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

  // === CALCULO DE GASTOS FUTUROS PENDENTES ===
  const calcularGastosFuturos = () => {
    let totalGastosFuturos = 0;
    let quantidadeParcelas = 0;

    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        gasto.parcelas.forEach((parcela) => {
          if (parcela.status === 'pendente') {
            totalGastosFuturos += parseFloat(parcela.valor_parcela);
            quantidadeParcelas++;
          }
        });
      }
    });

    return {
      totalGastosFuturos,
      quantidadeGastosFuturos: quantidadeParcelas,
    };
  };

  const { totalGastosFuturos, quantidadeGastosFuturos } = calcularGastosFuturos();

  // === CALCULO DE PARCELAS ATRASADAS ===
  const calcularParcelasAtrasaidas = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparacao precisa

    let count = 0;

    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        gasto.parcelas.forEach((parcela) => {
          if (parcela.status === 'pendente') {
            const dataVencimento = new Date(parcela.data_vencimento);
            dataVencimento.setHours(0, 0, 0, 0);

            if (dataVencimento < hoje) {
              count++;
            }
          }
        });
      }
    });

    return count;
  };

  const parcelasAtrasaidas = calcularParcelasAtrasaidas();

  // TODO: Descomentar quando implementar o mdulo de metas de gastos
  // Agrupar despesas por categoria (para MetasGastos)
  // const categoriasGastos = (() => {
  //   const categoriaMap: Record<string, number> = {};

  //   transacoesFiltradas
  //     .filter((t) => t.tipo === 'Despesa')
  //     .forEach((t) => {
  //       if (!categoriaMap[t.categoria]) {
  //         categoriaMap[t.categoria] = 0;
  //       }
  //       categoriaMap[t.categoria] += t.valor;
  //     });

  //   return Object.entries(categoriaMap).map(([name, value]) => ({
  //     name,
  //     value,
  //   }));
  // })();

  // Lista completa de categorias do sistema
  const todasCategorias = [
    'Alimentacao',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saude',
    'Educacao',
    'Compras',
    'Viagem',
    'Assinaturas',
    'Salario',
    'Freelance',
    'Investimentos',
    'Bonificacao',
    'Presente',
    'Aluguel',
    'Venda',
    'Outros',
  ];

  // Contar transacoes por categoria (sem filtros aplicados, usa todas as transacoes)
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



  if (loading && !hasLoaded) {
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
            Estamos preparando suas informacoes financeiras...
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
              <span>Gerando graficos</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 md:p-10 space-y-10 overflow-x-hidden">
      {/* ===== CABECALHO ===== */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Controle Financeiro <span className="text-green-600 dark:text-green-400">- {getShortName(user?.name)}</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 w-full md:w-auto">
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

          {/* Botao de toggle do tema */}
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

          {/* Menu do usurio */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm transition"
            >
              <UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="hidden md:inline text-gray-700 dark:text-gray-200">
                {getShortName(user?.name)}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getShortName(user?.name)}
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

                {/* Ja existente - Sair da conta */}
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

      {/* ===== NAVEGACAO POR ABAS ===== */}
      <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center">
          <button
            onClick={() => setAbaAtiva('dashboard')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition border-b-4 ${
              abaAtiva === 'dashboard'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden md:inline min-w-0 truncate">Dashboard</span>
            <span className="sr-only">Dashboard</span>
          </button>
          <button
            onClick={() => setAbaAtiva('cartoes')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition border-b-4 relative ${
              abaAtiva === 'cartoes'
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <CreditCardIcon className="w-5 h-5" />
            <span className="hidden md:inline min-w-0 truncate">Cartoes de Credito</span>
            <span className="sr-only">Cartoes de Credito</span>
            {parcelasAtrasaidas > 0 && (
              <span className="absolute -top-1 -right-1 sm:relative sm:top-0 sm:right-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                {parcelasAtrasaidas}
              </span>
            )}
          </button>
          <button
            onClick={() => setAbaAtiva('config')}
            disabled
            className="flex-1 min-w-0 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition border-b-4 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-transparent cursor-not-allowed opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden md:inline min-w-0 truncate">Configuracoes</span>
            <span className="sr-only">Configuracoes</span>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full">Em breve</span>
          </button>
          <button
            onClick={() => setAbaAtiva('lembretes')}
            disabled
            className="flex-1 min-w-0 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition border-b-4 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-transparent cursor-not-allowed opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="hidden md:inline min-w-0 truncate">Lembretes</span>
            <span className="sr-only">Lembretes</span>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full">Em breve</span>
          </button>
        </div>
      </nav>

      {/* ===== CONTEUDO BASEADO NA ABA ATIVA ===== */}
      {abaAtiva === 'dashboard' ? (
        <DashboardContent
          saldo={saldo}
          totalReceitas={totalReceitas}
          totalDespesas={totalDespesas}
          variacaoReceitas={variacaoReceitas}
          variacaoDespesas={variacaoDespesas}
          totalGastosFuturos={totalGastosFuturos}
          quantidadeGastosFuturos={quantidadeGastosFuturos}
          todasTransacoes={todasTransacoes}
          todasTransacoesComFuturos={todasTransacoesComFuturos}
          transacoesFiltradas={transacoesFiltradasComFuturos}
          gastos={gastos}
          receitas={receitas}
          gastosFuturos={gastosFuturos}
          filtros={filtros}
          setFiltros={setFiltros}
          todasCategorias={todasCategorias}
          contagemPorCategoria={contagemPorCategoria}
          pesquisaDescricao={pesquisaDescricao}
          setPesquisaDescricao={setPesquisaDescricao}
          visualizacao={visualizacao}
          setVisualizacao={setVisualizacao}
          onEditGasto={handleEditGasto}
          onEditReceita={handleEditReceita}
          onDeleteGasto={handleDeleteGasto}
          onDeleteReceita={handleDeleteReceita}
          onNovoGasto={() => {
            setEditingGasto(null);
            setShowGastoModal(true);
          }}
          onNovaReceita={() => {
            setEditingReceita(null);
            setShowReceitaModal(true);
          }}
          isPremiumActive={isPremiumActive}
          onPremiumExpired={() => setShowPremiumModal(true)}
        />
      ) : abaAtiva === 'cartoes' ? (
        <CartoesContent
          gastosFuturos={gastosFuturos}
          gastoFuturoDashboard={gastoFuturoDashboard}
          onNovoGastoFuturo={() => {
            setEditingGastoFuturo(null);
            setShowGastoFuturoModal(true);
          }}
          onMeusCartoes={() => setShowCartoesCreditoModal(true)}
          onEditGastoFuturo={handleEditGastoFuturo}
          onDuplicateGastoFuturo={handleDuplicateGastoFuturo}
          onDeleteGastoFuturo={handleDeleteGastoFuturo}
          onMarcarGastoFuturoComoPago={handleMarcarGastoFuturoComoPago}
          onMarcarParcelaComoPaga={handleMarcarParcelaComoPaga}
          isPremiumActive={isPremiumActive}
          onPremiumExpired={() => setShowPremiumModal(true)}
        />
      ) : null}

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

      <Modal
        isOpen={showGastoFuturoModal}
        onClose={handleGastoFuturoCancel}
        title={editingGastoFuturo ? 'Editar Gasto Futuro' : 'Novo Gasto Futuro'}
      >
        <FormGastoFuturo
          gastoFuturo={editingGastoFuturo}
          onSuccess={handleGastoFuturoSuccess}
          onCancel={handleGastoFuturoCancel}
          onManageCartoes={() => {
            setShowGastoFuturoModal(false);
            setShowCartoesCreditoModal(true);
          }}
        />
      </Modal>

      {/* Modal de Cartoes de Credito */}
      <ModalCartoesCredito
        isOpen={showCartoesCreditoModal}
        onClose={() => setShowCartoesCreditoModal(false)}
      />

      {/* Modal de Premium Expirado */}
      <PremiumExpiredModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        premiumUntil={userProfile?.premium_until}
      />

      {/* Toast de Notificacao */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Dialog de Confirmacao de Exclusao */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title={`Deletar ${confirmDelete.tipo === 'gasto' ? 'Gasto' : 'Receita'}?`}
        message={`Tem certeza que deseja deletar est${confirmDelete.tipo === 'gasto' ? 'e gasto' : 'a receita'}? Esta acao nao pode ser desfeita.`}
        confirmLabel="Sim, deletar"
        cancelLabel="Cancelar"
        onConfirm={confirmarDelete}
        onCancel={cancelarDelete}
        type="danger"
      />
    </div>
  );
}
