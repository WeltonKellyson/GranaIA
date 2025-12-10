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

  // Agrupar transações por dia
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

  // Gerar dias do calendário
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

    // Dias do mês anterior
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

    // Dias do mês atual
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

    // Dias do próximo mês (para completar a grade)
    const diasRestantes = 42 - dias.length; // 6 semanas × 7 dias
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

  const diasCalendario = gerarDiasCalendario();

  // Transações do dia selecionado
  const transacoesDiaSelecionado = diaSelecionado
    ? transacoesPorDia[diaSelecionado] || []
    : [];

  return (
    <div>
      {/* Navegação do calendário */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            const novoMes = new Date(mesCalendario);
            novoMes.setMonth(novoMes.getMonth() - 1);
            setMesCalendario(novoMes);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Título do mês (clicável) com seletor */}
        <div className="relative">
          <button
            onClick={() => setSeletorMesAberto(!seletorMesAberto)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mesCalendario
                .toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })
                .replace(/^\w/, (c) => c.toUpperCase())}
            </h3>
            <ChevronDownIcon
              className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${
                seletorMesAberto ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown de seleção rápida de mês/ano */}
          {seletorMesAberto && (
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

              {/* Botão "Hoje" */}
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
        </div>

        <button
          onClick={() => {
            const novoMes = new Date(mesCalendario);
            novoMes.setMonth(novoMes.getMonth() + 1);
            setMesCalendario(novoMes);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7 gap-2">
        {/* Cabeçalho dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
          <div
            key={dia}
            className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
          >
            {dia}
          </div>
        ))}

        {/* Dias do calendário */}
        {diasCalendario.map((diaInfo, index) => {
          const temTransacoes = diaInfo.transacoes.length > 0;
          const hoje = new Date().toISOString().split('T')[0];
          const ehHoje = diaInfo.data === hoje;

          return (
            <div
              key={index}
              onClick={() => {
                if (temTransacoes) {
                  setDiaSelecionado(diaInfo.data);
                }
              }}
              className={`
                min-h-[100px] p-2 rounded-lg border transition-all
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
              <div className="text-sm font-medium mb-1">
                {diaInfo.dia}
                {ehHoje && (
                  <span className="ml-1 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Hoje
                  </span>
                )}
              </div>

              {temTransacoes && (
                <div className="space-y-1 text-xs">
                  {diaInfo.totalReceitas > 0 && (
                    <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded font-medium">
                      +{formatarMoeda(diaInfo.totalReceitas)}
                    </div>
                  )}
                  {diaInfo.totalDespesas > 0 && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded font-medium">
                      -{formatarMoeda(diaInfo.totalDespesas)}
                    </div>
                  )}
                  {diaInfo.totalGastosFuturos > 0 && (
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-medium">
                      {formatarMoeda(diaInfo.totalGastosFuturos)}
                    </div>
                  )}
                  <div className="text-gray-500 dark:text-gray-400 text-center pt-1">
                    {diaInfo.transacoes.length}{' '}
                    {diaInfo.transacoes.length === 1 ? 'transação' : 'transações'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detalhes do dia selecionado */}
      {diaSelecionado && transacoesDiaSelecionado.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transações de{' '}
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
              ✕
            </button>
          </div>

          {/* Resumo do dia */}
          <div className="grid grid-cols-3 gap-4 mb-4">
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

          {/* Lista de transações */}
          <div className="space-y-2">
            {transacoesDiaSelecionado.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 flex justify-between items-start"
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
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t.descricao}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-bold ${
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
                    <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Gerenciar em Cartões
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
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
