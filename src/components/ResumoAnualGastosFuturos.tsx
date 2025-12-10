import React from 'react';
import { GastoFuturoResponse } from '../services/api';
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface ResumoAnualGastosFuturosProps {
  gastosFuturos: GastoFuturoResponse[];
}

const ResumoAnualGastosFuturos: React.FC<ResumoAnualGastosFuturosProps> = ({
  gastosFuturos,
}) => {
  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Calcular projeção dos próximos 12 meses
  const calcularResumoAnual = () => {
    const hoje = new Date();
    const meses: Array<{
      mes: string;
      mesAno: string;
      total: number;
      pendente: number;
      pago: number;
      quantidadeParcelas: number;
    }> = [];

    // Inicializar próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const mesAno = data.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
      });
      const mesAnoKey = data.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short',
      });

      meses.push({
        mes: mesAno,
        mesAno: mesAnoKey,
        total: 0,
        pendente: 0,
        pago: 0,
        quantidadeParcelas: 0,
      });
    }

    // Calcular valores por mês
    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        gasto.parcelas.forEach((parcela) => {
          const dataVencimento = new Date(parcela.data_vencimento);
          const mesIndex = Math.floor(
            (dataVencimento.getFullYear() - hoje.getFullYear()) * 12 +
              dataVencimento.getMonth() -
              hoje.getMonth()
          );

          if (mesIndex >= 0 && mesIndex < 12) {
            const valor = parseFloat(parcela.valor_parcela);
            meses[mesIndex].total += valor;
            meses[mesIndex].quantidadeParcelas++;

            if (parcela.status === 'pendente') {
              meses[mesIndex].pendente += valor;
            } else if (parcela.status === 'pago') {
              meses[mesIndex].pago += valor;
            }
          }
        });
      }
    });

    return meses;
  };

  // Calcular estatísticas anuais
  const calcularEstatisticas = (
    meses: ReturnType<typeof calcularResumoAnual>
  ) => {
    const totalAnual = meses.reduce((acc, m) => acc + m.total, 0);
    const totalPendente = meses.reduce((acc, m) => acc + m.pendente, 0);
    const mediaMensal = totalAnual / 12;

    const mesesComGastos = meses.filter((m) => m.total > 0);
    const mesComMaiorGasto = mesesComGastos.reduce(
      (max, m) => (m.total > max.total ? m : max),
      mesesComGastos[0] || { mes: '-', total: 0 }
    );
    const mesComMenorGasto = mesesComGastos.reduce(
      (min, m) => (m.total < min.total ? m : min),
      mesesComGastos[0] || { mes: '-', total: 0 }
    );

    return {
      totalAnual,
      totalPendente,
      mediaMensal,
      mesComMaiorGasto,
      mesComMenorGasto,
      mesesComGastos: mesesComGastos.length,
    };
  };

  const resumoMensal = calcularResumoAnual();
  const estatisticas = calcularEstatisticas(resumoMensal);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <CalendarDaysIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resumo Anual de Gastos Futuros
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visão geral dos próximos 12 meses
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Anual */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollarIcon className="w-5 h-5" />
            <p className="text-sm font-medium opacity-90">Total Anual Projetado</p>
          </div>
          <p className="text-2xl font-bold">{formatarMoeda(estatisticas.totalAnual)}</p>
          <p className="text-xs opacity-75 mt-1">
            {estatisticas.mesesComGastos} meses com gastos
          </p>
        </div>

        {/* Total Pendente */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5" />
            <p className="text-sm font-medium opacity-90">Ainda Pendente</p>
          </div>
          <p className="text-2xl font-bold">{formatarMoeda(estatisticas.totalPendente)}</p>
          <p className="text-xs opacity-75 mt-1">
            {((estatisticas.totalPendente / estatisticas.totalAnual) * 100).toFixed(1)}% do total
          </p>
        </div>

        {/* Média Mensal */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="w-5 h-5" />
            <p className="text-sm font-medium opacity-90">Média Mensal</p>
          </div>
          <p className="text-2xl font-bold">{formatarMoeda(estatisticas.mediaMensal)}</p>
          <p className="text-xs opacity-75 mt-1">
            Projeção de gasto por mês
          </p>
        </div>

        {/* Maior Mês */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDaysIcon className="w-5 h-5" />
            <p className="text-sm font-medium opacity-90">Mês com Maior Gasto</p>
          </div>
          <p className="text-2xl font-bold">
            {formatarMoeda(estatisticas.mesComMaiorGasto.total)}
          </p>
          <p className="text-xs opacity-75 mt-1 capitalize">
            {estatisticas.mesComMaiorGasto.mes}
          </p>
        </div>
      </div>

      {/* Resumo Mensal Detalhado */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detalhamento Mensal
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Valores projetados para cada mês
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Mês
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Pendente
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Parcelas
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  % do Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {resumoMensal.map((mes, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                    mes.total === 0 ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {mes.mes}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                    {formatarMoeda(mes.total)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400">
                    {formatarMoeda(mes.pendente)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                    {formatarMoeda(mes.pago)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    {mes.quantidadeParcelas}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                    {estatisticas.totalAnual > 0
                      ? ((mes.total / estatisticas.totalAnual) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-300 dark:border-gray-600">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                  TOTAL
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-gray-900 dark:text-white">
                  {formatarMoeda(estatisticas.totalAnual)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-blue-600 dark:text-blue-400">
                  {formatarMoeda(estatisticas.totalPendente)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400">
                  {formatarMoeda(estatisticas.totalAnual - estatisticas.totalPendente)}
                </td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-600 dark:text-gray-400">
                  {resumoMensal.reduce((acc, m) => acc + m.quantidadeParcelas, 0)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-gray-600 dark:text-gray-400">
                  100.0%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Insights */}
      {estatisticas.mesesComGastos > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <SparklesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Insights e Análises
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  <span>
                    Você tem gastos projetados em{' '}
                    <strong>{estatisticas.mesesComGastos} meses</strong> nos próximos 12 meses.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  <span>
                    Seu mês com maior gasto será{' '}
                    <strong className="capitalize">{estatisticas.mesComMaiorGasto.mes}</strong> com{' '}
                    <strong>{formatarMoeda(estatisticas.mesComMaiorGasto.total)}</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  <span>
                    A média de gastos por mês é de{' '}
                    <strong>{formatarMoeda(estatisticas.mediaMensal)}</strong>.
                  </span>
                </li>
                {estatisticas.totalPendente > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>
                      Você ainda tem{' '}
                      <strong className="text-blue-600 dark:text-blue-400">
                        {formatarMoeda(estatisticas.totalPendente)}
                      </strong>{' '}
                      em parcelas pendentes de pagamento.
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {estatisticas.mesesComGastos === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <CalendarDaysIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sem projeções anuais
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Adicione gastos futuros para visualizar o resumo anual dos próximos 12 meses
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumoAnualGastosFuturos;
