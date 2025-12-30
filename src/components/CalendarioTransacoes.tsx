import { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { GastoResponse, ReceitaResponse } from '../services/api';

interface Transacao {
  id: string;
  data: string;
  descricao: string;
  tipo: 'Receita' | 'Despesa' | 'Gasto Futuro';
  valor: number;
  categoria: string;
}

interface CalendarioTransacoesProps {
  transacoesFiltradas: Transacao[];
  gastos: GastoResponse[];
  receitas: ReceitaResponse[];
  onEditGasto: (gasto: GastoResponse) => void;
  onEditReceita: (receita: ReceitaResponse) => void;
  onDeleteGasto: (id: string) => void;
  onDeleteReceita: (id: string) => void;
}

const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function CalendarioTransacoes({
  transacoesFiltradas,
  gastos,
  receitas,
  onEditGasto,
  onEditReceita,
  onDeleteGasto,
  onDeleteReceita,
}: CalendarioTransacoesProps) {
  const [mesCalendario, setMesCalendario] = useState<Date>(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [seletorMesAberto, setSeletorMesAberto] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState<'mensal' | 'semanal' | 'diario'>('mensal');
  const [dataFoco, setDataFoco] = useState<Date>(new Date());
  const [seletorDataAberto, setSeletorDataAberto] = useState(false);
  const corIndicadorPorTipo: Record<Transacao['tipo'], string> = {
    Receita: 'bg-green-500',
    Despesa: 'bg-red-500',
    'Gasto Futuro': 'bg-blue-500',
  };

  // Agrupar transacoes por dia
  const transacoesPorDia = (() => {
    const mapa: Record<string, Transacao[]> = {};

    transacoesFiltradas.forEach((t) => {
      const dataStr = t.data.split('T')[0]; // "YYYY-MM-DD"
      if (!mapa[dataStr]) {
        mapa[dataStr] = [];
      }
      mapa[dataStr].push(t);
    });

    return mapa;
  })();

  const formatarDataCompleta = (data: Date) =>
    data
      .toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
      .replace(/^\w/, (c) => c.toUpperCase());

  const getInicioSemana = (data: Date) => {
    const inicio = new Date(data);
    const diaSemana = inicio.getDay();
    inicio.setDate(inicio.getDate() - diaSemana);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  };

  const criarDiaInfo = (data: Date, mesAtual: boolean) => {
    const dataStr = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(
      data.getDate(),
    ).padStart(2, '0')}`;
    const transacoesDia = transacoesPorDia[dataStr] || [];
    const totalReceitas = transacoesDia
      .filter((t) => t.tipo === 'Receita')
      .reduce((acc, t) => acc + t.valor, 0);
    const totalDespesas = transacoesDia
      .filter((t) => t.tipo === 'Despesa')
      .reduce((acc, t) => acc + t.valor, 0);
    const totalGastosFuturos = transacoesDia
      .filter((t) => t.tipo === 'Gasto Futuro')
      .reduce((acc, t) => acc + t.valor, 0);

    return {
      data: dataStr,
      dia: data.getDate(),
      mesAtual,
      transacoes: transacoesDia,
      totalReceitas,
      totalDespesas,
      totalGastosFuturos,
    };
  };

  // Gerar dias do calendario
  const gerarDiasCalendario = () => {
    const ano = mesCalendario.getFullYear();
    const mes = mesCalendario.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    const diasAnteriores = primeiroDia.getDay(); // 0 = domingo
    const diasNoMes = ultimoDia.getDate();

    const dias: Array<{
      data: string;
      dia: number;
      mesAtual: boolean;
      transacoes: Transacao[];
      totalReceitas: number;
      totalDespesas: number;
      totalGastosFuturos: number;
    }> = [];

    // Dias do mes anterior
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diasAnteriores - 1; i >= 0; i--) {
      const dia = ultimoDiaMesAnterior - i;
      const mesAnterior = mes === 0 ? 11 : mes - 1;
      const anoAnterior = mes === 0 ? ano - 1 : ano;
      const dataStr = `${anoAnterior}-${String(mesAnterior + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      const transacoesDia = transacoesPorDia[dataStr] || [];
      const totalReceitas = transacoesDia
        .filter((t) => t.tipo === 'Receita')
        .reduce((acc, t) => acc + t.valor, 0);
      const totalDespesas = transacoesDia
        .filter((t) => t.tipo === 'Despesa')
        .reduce((acc, t) => acc + t.valor, 0);
      const totalGastosFuturos = transacoesDia
        .filter((t) => t.tipo === 'Gasto Futuro')
        .reduce((acc, t) => acc + t.valor, 0);

      dias.push({
        data: dataStr,
        dia,
        mesAtual: false,
        transacoes: transacoesDia,
        totalReceitas,
        totalDespesas,
        totalGastosFuturos,
      });
    }

    // Dias do mes atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      const transacoesDia = transacoesPorDia[dataStr] || [];
      const totalReceitas = transacoesDia
        .filter((t) => t.tipo === 'Receita')
        .reduce((acc, t) => acc + t.valor, 0);
      const totalDespesas = transacoesDia
        .filter((t) => t.tipo === 'Despesa')
        .reduce((acc, t) => acc + t.valor, 0);
      const totalGastosFuturos = transacoesDia
        .filter((t) => t.tipo === 'Gasto Futuro')
        .reduce((acc, t) => acc + t.valor, 0);

      dias.push({
        data: dataStr,
        dia,
        mesAtual: true,
        transacoes: transacoesDia,
        totalReceitas,
        totalDespesas,
        totalGastosFuturos,
      });
    }

    // Dias do proximo mes (para completar a grade)
    const diasRestantes = 42 - dias.length; // 6 semanas  7 dias
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const proximoMes = mes === 11 ? 0 : mes + 1;
      const proximoAno = mes === 11 ? ano + 1 : ano;
      const dataStr = `${proximoAno}-${String(proximoMes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      const transacoesDia = transacoesPorDia[dataStr] || [];
      const totalReceitas = transacoesDia
        .filter((t) => t.tipo === 'Receita')
        .reduce((acc, t) => acc + t.valor, 0);
      const totalDespesas = transacoesDia
        .filter((t) => t.tipo === 'Despesa')
        .reduce((acc, t) => acc + t.valor, 0);
      const totalGastosFuturos = transacoesDia
        .filter((t) => t.tipo === 'Gasto Futuro')
        .reduce((acc, t) => acc + t.valor, 0);

      dias.push({
        data: dataStr,
        dia,
        mesAtual: false,
        transacoes: transacoesDia,
        totalReceitas,
        totalDespesas,
        totalGastosFuturos,
      });
    }

    return dias;
  };

  const gerarDiasSemana = () => {
    const inicioSemana = getInicioSemana(dataFoco);
    return Array.from({ length: 7 }, (_, index) => {
      const data = new Date(inicioSemana);
      data.setDate(inicioSemana.getDate() + index);
      return criarDiaInfo(data, true);
    });
  };

  const gerarDiaUnico = () => [criarDiaInfo(dataFoco, true)];

  const diasCalendario =
    modoVisualizacao === 'mensal'
      ? gerarDiasCalendario()
      : modoVisualizacao === 'semanal'
      ? gerarDiasSemana()
      : gerarDiaUnico();

  const tituloCalendario = (() => {
    if (modoVisualizacao === 'mensal') {
      return mesCalendario
        .toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })
        .replace(/^\w/, (c) => c.toUpperCase());
    }

    if (modoVisualizacao === 'semanal') {
      const inicioSemana = getInicioSemana(dataFoco);
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      const mesmoMes =
        inicioSemana.getMonth() === fimSemana.getMonth() &&
        inicioSemana.getFullYear() === fimSemana.getFullYear();

      if (mesmoMes) {
        return `${inicioSemana.getDate()} a ${fimSemana.getDate()} de ${fimSemana
          .toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
          })
          .replace(/^\w/, (c) => c.toUpperCase())}`;
      }

      return `${inicioSemana
        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        .replace('.', '')} a ${fimSemana
        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        .replace('.', '')}`;
    }

    return formatarDataCompleta(dataFoco);
  })();

  const cabecalhoDias =
    modoVisualizacao === 'mensal'
      ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
      : diasCalendario.map((diaInfo) =>
          new Date(diaInfo.data + 'T00:00:00')
            .toLocaleDateString('pt-BR', { weekday: 'short' })
            .replace('.', '')
            .replace(/^\w/, (c) => c.toUpperCase()),
        );

  const colunasGrid = modoVisualizacao === 'diario' ? 'grid-cols-1' : 'grid-cols-7';

  const handleMudarModo = (modo: 'mensal' | 'semanal' | 'diario') => {
    setModoVisualizacao(modo);
    setSeletorMesAberto(false);
    setSeletorDataAberto(false);
    const base = diaSelecionado ? new Date(diaSelecionado) : new Date();
    if (modo === 'mensal') {
      setMesCalendario(new Date(base.getFullYear(), base.getMonth(), 1));
    } else {
      setDataFoco(base);
    }
  };

  const handleAnterior = () => {
    if (modoVisualizacao === 'mensal') {
      const novoMes = new Date(mesCalendario);
      novoMes.setMonth(novoMes.getMonth() - 1);
      setMesCalendario(novoMes);
      return;
    }

    const novaData = new Date(dataFoco);
    novaData.setDate(novaData.getDate() - (modoVisualizacao === 'semanal' ? 7 : 1));
    setDataFoco(novaData);
  };

  const handleProximo = () => {
    if (modoVisualizacao === 'mensal') {
      const novoMes = new Date(mesCalendario);
      novoMes.setMonth(novoMes.getMonth() + 1);
      setMesCalendario(novoMes);
      return;
    }

    const novaData = new Date(dataFoco);
    novaData.setDate(novaData.getDate() + (modoVisualizacao === 'semanal' ? 7 : 1));
    setDataFoco(novaData);
  };

  // Transacoes do dia selecionado
  const transacoesDiaSelecionado = diaSelecionado
    ? transacoesPorDia[diaSelecionado] || []
    : [];

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => handleMudarModo('mensal')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                modoVisualizacao === 'mensal'
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => handleMudarModo('semanal')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                modoVisualizacao === 'semanal'
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => handleMudarModo('diario')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                modoVisualizacao === 'diario'
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => {
                const hoje = new Date();
                if (modoVisualizacao === 'mensal') {
                  setMesCalendario(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
                } else {
                  setDataFoco(hoje);
                }
                setDiaSelecionado(hoje.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 dark:hover:border-green-500 transition"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Navegacao do calendario */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleAnterior}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Titulo do mes (clicavel) com seletor */}
          <div className="relative">
            {modoVisualizacao === 'mensal' ? (
              <button
                onClick={() => setSeletorMesAberto(!seletorMesAberto)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tituloCalendario}
                </h3>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${
                    seletorMesAberto ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ) : (
              <button
                onClick={() => setSeletorDataAberto(!seletorDataAberto)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tituloCalendario}
                </h3>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${
                    seletorDataAberto ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}

            {/* Dropdown de selecao rapida de mes/ano */}
            {modoVisualizacao === 'mensal' && seletorMesAberto && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 p-4 w-80">
                {/* Seletor de Ano */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      const novoMes = new Date(mesCalendario);
                      novoMes.setFullYear(novoMes.getFullYear() - 1);
                      setMesCalendario(novoMes);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                  >
                    <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>

                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {mesCalendario.getFullYear()}
                  </span>

                  <button
                    onClick={() => {
                      const novoMes = new Date(mesCalendario);
                      novoMes.setFullYear(novoMes.getFullYear() + 1);
                      setMesCalendario(novoMes);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                  >
                    <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                {/* Grid de Meses */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'Jan',
                    'Fev',
                    'Mar',
                    'Abr',
                    'Mai',
                    'Jun',
                    'Jul',
                    'Ago',
                    'Set',
                    'Out',
                    'Nov',
                    'Dez',
                  ].map((mes, index) => {
                    const ehMesAtual = mesCalendario.getMonth() === index;
                    const hoje = new Date();
                    const ehMesHoje =
                      hoje.getMonth() === index &&
                      hoje.getFullYear() === mesCalendario.getFullYear();

                    return (
                      <button
                        key={mes}
                        onClick={() => {
                          const novoMes = new Date(mesCalendario);
                          novoMes.setMonth(index);
                          setMesCalendario(novoMes);
                          setSeletorMesAberto(false);
                        }}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all
                          ${
                            ehMesAtual
                              ? 'bg-green-600 text-white shadow-md'
                              : ehMesHoje
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        {mes}
                      </button>
                    );
                  })}
                </div>

                {/* Botao "Hoje" */}
                <button
                  onClick={() => {
                    setMesCalendario(new Date());
                    setSeletorMesAberto(false);
                  }}
                  className="w-full mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition"
                >
                  Ir para hoje
                </button>
              </div>
            )}

            {modoVisualizacao !== 'mensal' && seletorDataAberto && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 p-4 w-72">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecionar data
                </label>
                <input
                  type="date"
                  value={dataFoco.toISOString().split('T')[0]}
                  onChange={(e) => {
                    setDataFoco(new Date(e.target.value + 'T00:00:00'));
                    setSeletorDataAberto(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
                <button
                  onClick={() => {
                    setDataFoco(new Date());
                    setSeletorDataAberto(false);
                  }}
                  className="w-full mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition"
                >
                  Ir para hoje
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleProximo}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Grade do calendario */}
      <div className={`grid ${colunasGrid} gap-1.5 md:gap-2`}>
        {/* Cabecalho dos dias da semana */}
        {cabecalhoDias.map((dia) => (
          <div
            key={dia}
            className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
          >
            {dia}
          </div>
        ))}

        {/* Dias do calendario */}
        {diasCalendario.map((diaInfo, index) => {
          const temTransacoes = diaInfo.transacoes.length > 0;
          const hoje = new Date().toISOString().split('T')[0];
          const ehHoje = diaInfo.data === hoje;
          const indicadoresMobile = diaInfo.transacoes.slice(0, 4);
          const possuiExcedenteMobile = diaInfo.transacoes.length > 4;
          const quantidadeTransacoesDesktop = Math.min(diaInfo.transacoes.length, 3);
          const possuiMaisTransacoesDesktop = diaInfo.transacoes.length > 3;

          return (
            <div
              key={index}
              onClick={() => {
                if (!temTransacoes) return;
                setDiaSelecionado((prev) => (prev === diaInfo.data ? null : diaInfo.data));
              }}
              className={`
                min-h-[100px] sm:min-h-[120px] p-2.5 rounded-lg border transition-all overflow-hidden
                ${
                  !diaInfo.mesAtual
                    ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }
                ${temTransacoes ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
                ${
                  ehHoje
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                    : 'border-gray-200 dark:border-gray-600'
                }
                ${
                  diaSelecionado === diaInfo.data
                    ? 'ring-2 ring-green-500 dark:ring-green-400 shadow-md'
                    : ''
                }
              `}
            >
              <div className="flex flex-col items-center text-center text-[10px] md:text-xs leading-tight text-gray-700 dark:text-gray-200 gap-1">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold">{diaInfo.dia}</span>
                  {ehHoje && (
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      Hoje
                    </span>
                  )}
                </div>

                {temTransacoes && (
                  <>
                    {/* Mobile: indicadores por tipo e excedente */}
                    <div className="md:hidden flex flex-col items-center gap-1">
                      <div className="flex flex-col items-center gap-1">
                        {indicadoresMobile.map((transacao, indicadorIndex) => (
                          <span
                            key={`${diaInfo.data}-indicador-${indicadorIndex}`}
                            className={`h-1 w-6 rounded-full ${corIndicadorPorTipo[transacao.tipo]}`}
                          />
                        ))}
                        {possuiExcedenteMobile && (
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            +
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop/tablet: valores detalhados */}
                    <div className="hidden md:block space-y-1 text-[11px] leading-tight text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        {diaInfo.totalReceitas > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-200 font-semibold">
                            +{formatarMoeda(diaInfo.totalReceitas)}
                          </span>
                        )}
                        {diaInfo.totalDespesas > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 font-semibold">
                            -{formatarMoeda(diaInfo.totalDespesas)}
                          </span>
                        )}
                        {diaInfo.totalGastosFuturos > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 font-semibold">
                            {formatarMoeda(diaInfo.totalGastosFuturos)}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 pt-0.5 truncate">
                        {quantidadeTransacoesDesktop}{possuiMaisTransacoesDesktop ? '+' : ''}{' '}
                        {quantidadeTransacoesDesktop === 1 ? 'transacao' : 'transacoes'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {diaSelecionado && transacoesDiaSelecionado.length > 0 && (
        <div className="flex justify-center py-3">
          <svg
            className="w-6 h-6 text-gray-500 dark:text-gray-400 animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v12" />
            <path d="M7 12l5 5 5-5" />
          </svg>
        </div>
      )}

      {/* Detalhes do dia selecionado */}
      {diaSelecionado && transacoesDiaSelecionado.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transacoes de{' '}
              {new Date(diaSelecionado + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </h4>
            <button
              onClick={() => setDiaSelecionado(null)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              
            </button>
          </div>

          {/* Resumo do dia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">Receitas</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                {formatarMoeda(
                  transacoesDiaSelecionado
                    .filter((t) => t.tipo === 'Receita')
                    .reduce((acc, t) => acc + t.valor, 0)
                )}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 mb-1">Despesas</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-300">
                {formatarMoeda(
                  transacoesDiaSelecionado
                    .filter((t) => t.tipo === 'Despesa')
                    .reduce((acc, t) => acc + t.valor, 0)
                )}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Gastos Futuros</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {formatarMoeda(
                  transacoesDiaSelecionado
                    .filter((t) => t.tipo === 'Gasto Futuro')
                    .reduce((acc, t) => acc + t.valor, 0)
                )}
              </p>
            </div>
          </div>

          {/* Lista de transacoes */}
          <div className="space-y-2">
            {transacoesDiaSelecionado.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row sm:justify-between items-start gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        t.tipo === 'Receita'
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : t.tipo === 'Gasto Futuro'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {t.tipo}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t.categoria}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                    {t.descricao}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-2 min-w-[140px] w-full sm:w-auto">
                  <span
                    className={`text-lg font-bold text-right sm:text-left ${
                      t.tipo === 'Receita'
                        ? 'text-green-600 dark:text-green-400'
                        : t.tipo === 'Gasto Futuro'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(t.valor)}
                  </span>
                  {t.tipo === 'Gasto Futuro' ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400 italic text-right sm:text-left">
                      Gerenciar em Cartoes
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 flex-wrap justify-end sm:justify-start">
                      <button
                        onClick={() => {
                          if (t.tipo === 'Despesa') {
                            const gasto = gastos.find((g) => g.id === t.id);
                            if (gasto) onEditGasto(gasto);
                          } else {
                            const receita = receitas.find((r) => r.id === t.id);
                            if (receita) onEditReceita(receita);
                          }
                        }}
                        className="p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                        title="Editar"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (t.tipo === 'Despesa') {
                            onDeleteGasto(t.id);
                          } else {
                            onDeleteReceita(t.id);
                          }
                        }}
                        className="p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                        title="Deletar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
