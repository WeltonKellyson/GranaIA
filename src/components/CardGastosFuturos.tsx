import React, { useState } from 'react';
import {
  GastoFuturoResponse,
  GastoFuturoDashboard,
  ParcelaResponse,
  apiService,
} from '../services/api';
import {
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import FiltrosGastosFuturos from './FiltrosGastosFuturos';
import RelatorioFaturasCartao from './RelatorioFaturasCartao';
import HistoricoParcelasPagas from './HistoricoParcelasPagas';
import ResumoAnualGastosFuturos from './ResumoAnualGastosFuturos';

interface CardGastosFuturosProps {
  gastosFuturos: GastoFuturoResponse[];
  dashboard: GastoFuturoDashboard | null;
  onEdit: (gastoFuturo: GastoFuturoResponse) => void;
  onDuplicate: (gastoFuturo: GastoFuturoResponse) => void;
  onDelete: (id: string) => Promise<void>;
  onMarcarComoPago: (id: string) => Promise<void>;
  onMarcarParcelaComoPaga: (parcelaId: string) => Promise<void>;
}

const CardGastosFuturos: React.FC<CardGastosFuturosProps> = ({
  gastosFuturos,
  dashboard,
  onEdit,
  onDuplicate,
  onDelete,
  onMarcarComoPago,
  onMarcarParcelaComoPaga,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmPago, setConfirmPago] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: '' });

  const [confirmPagarTodasMes, setConfirmPagarTodasMes] = useState<{
    isOpen: boolean;
    parcelas: ParcelaResponse[];
  }>({ isOpen: false, parcelas: [] });

  const [processandoPagamentos, setProcessandoPagamentos] = useState(false);

  const [filtros, setFiltros] = useState({
    cartao: 'todos',
    categoria: 'todas',
    status: 'todos',
    dataInicio: '',
    dataFim: '',
  });

  const [pesquisa, setPesquisa] = useState('');

  const [abaAtiva, setAbaAtiva] = useState<'gastos' | 'faturas' | 'historico' | 'resumo'>('gastos');

  const [ordenacao, setOrdenacao] = useState<string>('data_venc_asc');

  const formatarMoeda = (valor: string | number): string => {
    const valorNum = typeof valor === 'string' ? parseFloat(valor) : valor;
    return valorNum.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatarData = (data: string): string => {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  const getDiasRestantes = (dataVencimento: string): number => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Obter a proxima parcela pendente de um gasto
  const getProximaParcelaPendente = (gasto: GastoFuturoResponse) => {
    if (!gasto.parcelas || gasto.parcelas.length === 0) {
      return null;
    }

    const parcelasPendentes = gasto.parcelas
      .filter((p) => p.status === 'pendente')
      .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

    return parcelasPendentes.length > 0 ? parcelasPendentes[0] : null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pago':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'atrasado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const confirmarMarcarComoPago = async () => {
    await onMarcarParcelaComoPaga(confirmPago.id);
    setConfirmPago({ isOpen: false, id: '' });
  };

  // Funcao para obter todas as parcelas pendentes do mes atual
  const getParcelasPendentesMesAtual = (): ParcelaResponse[] => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const parcelasPendentes: ParcelaResponse[] = [];

    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        gasto.parcelas.forEach((parcela) => {
          if (parcela.status === 'pendente') {
            const dataVencimento = new Date(parcela.data_vencimento);
            if (
              dataVencimento.getMonth() === mesAtual &&
              dataVencimento.getFullYear() === anoAtual
            ) {
              parcelasPendentes.push(parcela);
            }
          }
        });
      }
    });

    return parcelasPendentes;
  };

  const confirmarPagarTodasMes = async () => {
    const parcelas = confirmPagarTodasMes.parcelas;

    setProcessandoPagamentos(true);
    setConfirmPagarTodasMes({ isOpen: false, parcelas: [] });

    let sucessos = 0;
    let falhas = 0;

    try {
      // Pagar todas as parcelas sequencialmente
      for (const parcela of parcelas) {
        try {
          await onMarcarParcelaComoPaga(parcela.id);
          sucessos++;
        } catch (error) {
          console.error(`Erro ao pagar parcela ${parcela.id}:`, error);
          falhas++;
        }
      }
    } catch (error) {
      console.error('Erro ao pagar parcelas:', error);
    } finally {
      setProcessandoPagamentos(false);

      // A mensagem de sucesso/erro ser exibida pelo Dashboard
      // que ja tem o sistema de Toast configurado
    }
  };

  // Aplicar filtros
  const gastosFiltrados = gastosFuturos.filter((gasto) => {
    // Filtro por status
    const filtroStatusOk =
      filtros.status === 'todos' ? true : gasto.status === filtros.status;

    // Filtro por cartao
    const filtroCartaoOk =
      filtros.cartao === 'todos'
        ? true
        : filtros.cartao === 'sem_cartao'
        ? !gasto.cartao_credito_id
        : gasto.cartao_credito_id === filtros.cartao;

    // Filtro por categoria
    const filtroCategoriaOk =
      filtros.categoria === 'todas' ? true : gasto.categoria === filtros.categoria;

    // Filtro por data de vencimento - incio
    const filtroDataInicioOk = filtros.dataInicio
      ? new Date(gasto.data_vencimento) >= new Date(filtros.dataInicio)
      : true;

    // Filtro por data de vencimento - fim
    const filtroDataFimOk = filtros.dataFim
      ? new Date(gasto.data_vencimento) <= new Date(filtros.dataFim)
      : true;

    // Filtro por pesquisa de descricao
    const filtroPesquisaOk = pesquisa
      ? gasto.descricao.toLowerCase().includes(pesquisa.toLowerCase())
      : true;

    return (
      filtroStatusOk &&
      filtroCartaoOk &&
      filtroCategoriaOk &&
      filtroDataInicioOk &&
      filtroDataFimOk &&
      filtroPesquisaOk
    );
  });

  // Aplicar ordenacao
  const gastosOrdenados = [...gastosFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case 'data_venc_asc':
        return new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime();
      case 'data_venc_desc':
        return new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime();
      case 'valor_asc':
        return parseFloat(a.valor_total) - parseFloat(b.valor_total);
      case 'valor_desc':
        return parseFloat(b.valor_total) - parseFloat(a.valor_total);
      case 'descricao_asc':
        return a.descricao.localeCompare(b.descricao);
      case 'descricao_desc':
        return b.descricao.localeCompare(a.descricao);
      case 'categoria':
        return a.categoria.localeCompare(b.categoria);
      default:
        return 0;
    }
  });

  const gastosAtivos = gastosOrdenados.filter((g) => g.status === 'ativo');
  const gastosVencidos = gastosAtivos.filter((g) => {
    const diasRestantes = getDiasRestantes(g.data_vencimento);
    return diasRestantes < 0;
  });

  // Calcular parcelas e valor do mes atual (usando gastos futuros completos, sem filtros)
  const parcelasMesAtual = getParcelasPendentesMesAtual();
  const totalParcelasMesAtual = parcelasMesAtual.reduce(
    (acc, parcela) => acc + parseFloat(parcela.valor_parcela),
    0
  );

  // Calcular resumo correto baseado em parcelas pendentes
  const calcularResumoCorreto = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let totalPendente = 0;
    let valorVencido = 0;
    let valorMesAtual = 0;
    let quantidadeVencidos = 0;
    let quantidadeMesAtual = 0;
    const gastosUnicos = new Set<string>();

    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        let temParcelaPendente = false;

        gasto.parcelas.forEach((parcela) => {
          if (parcela.status === 'pendente') {
            const dataVencimento = new Date(parcela.data_vencimento);
            dataVencimento.setHours(0, 0, 0, 0);
            const valor = parseFloat(parcela.valor_parcela);

            totalPendente += valor;
            temParcelaPendente = true;

            // Verificar se est vencido
            if (dataVencimento < hoje) {
              valorVencido += valor;
            }

            // Verificar se  do mes atual
            if (
              dataVencimento.getMonth() === hoje.getMonth() &&
              dataVencimento.getFullYear() === hoje.getFullYear()
            ) {
              valorMesAtual += valor;
            }
          }
        });

        if (temParcelaPendente) {
          gastosUnicos.add(gasto.id);
        }
      }
    });

    // Contar gastos vencidos (gastos que tm pelo menos uma parcela vencida)
    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        const temParcelaVencida = gasto.parcelas.some((parcela) => {
          if (parcela.status === 'pendente') {
            const dataVencimento = new Date(parcela.data_vencimento);
            dataVencimento.setHours(0, 0, 0, 0);
            return dataVencimento < hoje;
          }
          return false;
        });

        if (temParcelaVencida) {
          quantidadeVencidos++;
        }
      }
    });

    // Contar gastos do mes atual
    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        const temParcelaMesAtual = gasto.parcelas.some((parcela) => {
          if (parcela.status === 'pendente') {
            const dataVencimento = new Date(parcela.data_vencimento);
            dataVencimento.setHours(0, 0, 0, 0);
            return (
              dataVencimento.getMonth() === hoje.getMonth() &&
              dataVencimento.getFullYear() === hoje.getFullYear()
            );
          }
          return false;
        });

        if (temParcelaMesAtual) {
          quantidadeMesAtual++;
        }
      }
    });

    return {
      totalPendente,
      valorVencido,
      valorMesAtual,
      quantidadeTotal: gastosUnicos.size,
      quantidadeVencidos,
      quantidadeMesAtual,
    };
  };

  const resumoCorreto = calcularResumoCorreto();

  // Lista de categorias Unicas
  const todasCategorias = Array.from(
    new Set(gastosFuturos.map((g) => g.categoria))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Cabealho */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <CreditCardIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gastos Futuros
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerenciamento de cartao de credito e compras parceladas
          </p>
        </div>
      </div>

      {/* Abas de Navegacao */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto w-full max-w-full">
        <button
          onClick={() => setAbaAtiva('gastos')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition whitespace-nowrap ${
            abaAtiva === 'gastos'
              ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm font-medium'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="font-medium hidden md:inline">Todos os Gastos</span>
          <span className="font-medium md:hidden">Gastos</span>
        </button>
        <button
          onClick={() => setAbaAtiva('faturas')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition whitespace-nowrap ${
            abaAtiva === 'faturas'
              ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm font-medium'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CreditCardIcon className="w-5 h-5" />
          <span className="font-medium hidden md:inline">Faturas por Cartao</span>
          <span className="font-medium md:hidden">Faturas</span>
        </button>
        <button
          onClick={() => setAbaAtiva('historico')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition whitespace-nowrap ${
            abaAtiva === 'historico'
              ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm font-medium'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CheckCircleIcon className="w-5 h-5" />
          <span className="font-medium hidden md:inline">Historico</span>
          <span className="font-medium md:hidden">Historico</span>
        </button>
        <button
          onClick={() => setAbaAtiva('resumo')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition whitespace-nowrap ${
            abaAtiva === 'resumo'
              ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm font-medium'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ClockIcon className="w-5 h-5" />
          <span className="font-medium hidden md:inline">Resumo Anual</span>
          <span className="font-medium md:hidden">Resumo</span>
        </button>
      </div>

      {/* Contedo baseado na aba ativa */}
      {abaAtiva === 'gastos' ? (
        <>
          {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total de Gastos Futuros Pendentes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Pendente
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatarMoeda(resumoCorreto.totalPendente)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {resumoCorreto.quantidadeTotal} gasto(s) com parcelas pendentes
          </p>
        </div>

        {/* Parcelas Vencidas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Parcelas Vencidas
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatarMoeda(resumoCorreto.valorVencido)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {resumoCorreto.quantidadeVencidos} gasto(s) com parcelas atrasaidas
          </p>
        </div>

        {/* Parcelas do Mes Atual */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Parcelas do Mes Atual
          </p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatarMoeda(resumoCorreto.valorMesAtual)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {resumoCorreto.quantidadeMesAtual} gasto(s) com vencimento este mes
          </p>
        </div>
      </div>

      {/* Indicador de Processamento */}
      {processandoPagamentos && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-600 rounded-lg p-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Processando Pagamentos...
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Aguarde enquanto marcamos todas as parcelas como pagas. Isso pode levar alguns segundos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <FiltrosGastosFuturos
        filtros={filtros}
        setFiltros={setFiltros}
        todasCategorias={todasCategorias}
      />

      {/* Campo de Pesquisa e Ordenacao */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo de Pesquisa */}
          <div className="relative">
            <img
              src="https://img.icons8.com/?size=100&id=7695&format=png&color=000000"
              alt="Icone de pesquisa"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
            />
            <input
              type="text"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Pesquisar gasto futuro por descricao..."
            />
            {pesquisa && (
              <button
                onClick={() => setPesquisa('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
                title="Limpar pesquisa"
              >
                X
              </button>
            )}
          </div>

          {/* Seletor de Ordenacao */}
          <div className="relative">
            <div className="flex items-center gap-2 min-w-0 w-full">
              <ArrowsUpDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="flex-1 min-w-0 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                  text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                  cursor-pointer"
              >
                <option value="data_venc_asc">Data de Vencimento (Mais proximo)</option>
                <option value="data_venc_desc">Data de Vencimento (Mais distante)</option>
                <option value="valor_asc">Valor (Menor primeiro)</option>
                <option value="valor_desc">Valor (Maior primeiro)</option>
                <option value="descricao_asc">Descricao (A-Z)</option>
                <option value="descricao_desc">Descricao (Z-A)</option>
                <option value="categoria">Categoria (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Botao para Pagar Todas as Parcelas do Mes */}
      {!processandoPagamentos && parcelasMesAtual.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg p-5 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Pagar Todas as Parcelas do Mes
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Voce tem {parcelasMesAtual.length} parcela(s) pendente(s) para pagar neste mes no valor total de{' '}
                <span className="font-bold text-green-700 dark:text-green-400">
                  {formatarMoeda(totalParcelasMesAtual)}
                </span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Clique no botao ao lado para marcar todas como pagas de uma vez
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmPagarTodasMes({
                  isOpen: true,
                  parcelas: parcelasMesAtual,
                });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition transform hover:scale-105"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Pagar Todas ({parcelasMesAtual.length})
            </button>
          </div>
        </div>
      )}

      {/* Proximos Vencimentos */}
      {dashboard && dashboard.proximos_vencimentos.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
              Proximos Vencimentos (7 dias)
            </h3>
          </div>
          <div className="space-y-2">
            {dashboard.proximos_vencimentos.map((gasto) => {
              const diasRestantes = gasto.dias_para_vencimento;
              const isVencido = diasRestantes < 0;
              const isHoje = diasRestantes === 0;

              return (
                <div
                  key={gasto.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {gasto.descricao}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatarData(gasto.data_vencimento)} "{' '}
                      {formatarMoeda(gasto.valor_total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isVencido ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-medium">
                        {Math.abs(diasRestantes)} dia(s) atrasado
                      </span>
                    ) : isHoje ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                        Vence hoje!
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                        {diasRestantes} dia(s)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Gastos Futuros */}
      {gastosFuturos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <CreditCardIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum gasto futuro cadastrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Clique em "Novo Gasto Futuro" para comear a gerenciar seus gastos
            futuros
          </p>
        </div>
      ) : gastosAtivos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <FunnelIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nao encontramos gastos futuros que correspondam aos filtros aplicados.
          </p>
          <button
            onClick={() => {
              setFiltros({
                cartao: 'todos',
                categoria: 'todas',
                status: 'todos',
                dataInicio: '',
                dataFim: '',
              });
              setPesquisa('');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gastos Futuros ({gastosAtivos.length})
            </h3>
            {(filtros.cartao !== 'todos' ||
              filtros.categoria !== 'todas' ||
              filtros.status !== 'todos' ||
              filtros.dataInicio ||
              filtros.dataFim ||
              pesquisa) && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {gastosAtivos.length} de {gastosFuturos.filter(g => g.status === 'ativo').length} resultados
              </span>
            )}
          </div>
          {gastosAtivos.map((gasto) => {
            const isExpanded = expandedId === gasto.id;
            const isParcelado = gasto.numero_parcelas > 1;

            // Obter a proxima parcela pendente
            const proximaParcela = getProximaParcelaPendente(gasto);
            const dataVencimentoAtual = proximaParcela ? proximaParcela.data_vencimento : gasto.data_vencimento;
            const diasRestantes = getDiasRestantes(dataVencimentoAtual);
            const isVencido = diasRestantes < 0;
            const todasPagas = !proximaParcela && isParcelado;

            return (
              <div
                key={gasto.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                {/* Header do Card */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {gasto.descricao}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gasto.status)}`}
                        >
                          {gasto.status}
                        </span>
                        {isParcelado && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-medium">
                            {gasto.numero_parcelas}x
                          </span>
                        )}
                        {todasPagas && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-medium">
                            Todas pagas
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Valor Total
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatarMoeda(gasto.valor_total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Categoria
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {gasto.categoria}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {proximaParcela ? 'Proximo Vencimento' : 'Vencimento'}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {todasPagas ? (
                              <span className="text-green-600 dark:text-green-400">Todas as parcelas pagas</span>
                            ) : (
                              <>
                                {formatarData(dataVencimentoAtual)}
                                {proximaParcela && isParcelado && (
                                  <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                                    ({proximaParcela.numero_parcela}/{proximaParcela.total_parcelas})
                                  </span>
                                )}
                                {isVencido && (
                                  <span className="ml-2 text-red-600 dark:text-red-400 text-xs">
                                    (Atrasado)
                                  </span>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {gasto.observacoes && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">
                          {gasto.observacoes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acoes */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => onEdit(gasto)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => onDuplicate(gasto)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                      title="Criar uma cpia deste gasto"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      Duplicar
                    </button>
                    {isParcelado && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : gasto.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        {isExpanded ? 'Ocultar' : 'Ver'} Parcelas ({gasto.parcelas.length})
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(gasto.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Deletar
                    </button>
                  </div>
                </div>

                {/* Parcelas (se expandido) */}
                {isExpanded && isParcelado && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Parcelas ({gasto.parcelas.length})
                    </h5>
                    <div className="space-y-2">
                      {gasto.parcelas.map((parcela) => {
                        const parcelaDias = getDiasRestantes(parcela.data_vencimento);
                        const parcelaVencida = parcelaDias < 0;

                        return (
                          <div
                            key={parcela.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  Parcela {parcela.numero_parcela}/{parcela.total_parcelas}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcela.status)}`}
                                >
                                  {parcela.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <span>
                                  {formatarMoeda(parcela.valor_parcela)}
                                </span>
                                <span>"</span>
                                <span>
                                  Vence em {formatarData(parcela.data_vencimento)}
                                </span>
                                {parcelaVencida && parcela.status === 'pendente' && (
                                  <span className="text-red-600 dark:text-red-400 font-medium">
                                    (Atrasada)
                                  </span>
                                )}
                              </div>
                            </div>
                            {parcela.status === 'pendente' && (
                              <button
                                onClick={() => {
                                  setConfirmPago({
                                    isOpen: true,
                                    id: parcela.id,
                                  });
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                Pagar
                              </button>
                            )}
                            {parcela.status === 'pago' && parcela.data_pagamento && (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                Pago em {formatarData(parcela.data_pagamento)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
        </>
      ) : abaAtiva === 'faturas' ? (
        /* Aba de Faturas por Cartao */
        <RelatorioFaturasCartao
          gastosFuturos={gastosFuturos}
          onMarcarParcelaComoPaga={onMarcarParcelaComoPaga}
        />
      ) : abaAtiva === 'historico' ? (
        /* Aba de Historico de Parcelas Pagas */
        <HistoricoParcelasPagas gastosFuturos={gastosFuturos} />
      ) : (
        /* Aba de Resumo Anual */
        <ResumoAnualGastosFuturos gastosFuturos={gastosFuturos} />
      )}

      {/* Dialog de Confirmacao de Pagamento */}
      <ConfirmDialog
        isOpen={confirmPago.isOpen}
        title="Marcar Parcela como Paga?"
        message="Confirma o pagamento desta parcela? Um gasto normal ser criado e impactar seu saldo."
        confirmLabel="Sim, marcar como pago"
        cancelLabel="Cancelar"
        onConfirm={confirmarMarcarComoPago}
        onCancel={() => setConfirmPago({ isOpen: false, id: '' })}
        type="success"
      />

      {/* Dialog de Confirmacao - Pagar Todas as Parcelas do Mes */}
      <ConfirmDialog
        isOpen={confirmPagarTodasMes.isOpen}
        title={`Pagar ${confirmPagarTodasMes.parcelas.length} Parcela(s) do Mes?`}
        message={`Voce est prestes a marcar ${confirmPagarTodasMes.parcelas.length} parcela(s) como pagas, no valor total de ${formatarMoeda(
          confirmPagarTodasMes.parcelas.reduce(
            (acc, p) => acc + parseFloat(p.valor_parcela),
            0
          )
        )}. Gastos normais serao criados e isso impactar seu saldo. Deseja continuar?`}
        confirmLabel={`Sim, pagar ${confirmPagarTodasMes.parcelas.length} parcela(s)`}
        cancelLabel="Cancelar"
        onConfirm={confirmarPagarTodasMes}
        onCancel={() => setConfirmPagarTodasMes({ isOpen: false, parcelas: [] })}
        type="success"
      />
    </div>
  );
};

export default CardGastosFuturos;
