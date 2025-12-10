import React, { useState } from 'react';
import { GastoFuturoResponse, ParcelaResponse } from '../services/api';
import {
  CheckCircleIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface HistoricoParcelasPagasProps {
  gastosFuturos: GastoFuturoResponse[];
}

const HistoricoParcelasPagas: React.FC<HistoricoParcelasPagasProps> = ({
  gastosFuturos,
}) => {
  const [filtroMes, setFiltroMes] = useState('todos');
  const [ordenacao, setOrdenacao] = useState<'data_desc' | 'data_asc' | 'valor_desc' | 'valor_asc'>('data_desc');

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

  const formatarMesAno = (data: string): string => {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
  };

  // Coletar todas as parcelas pagas
  interface ParcelaPagaComGasto extends ParcelaResponse {
    gastoDescricao: string;
    gastoCategoria: string;
  }

  const getParcelasPagas = (): ParcelaPagaComGasto[] => {
    const parcelas: ParcelaPagaComGasto[] = [];

    gastosFuturos.forEach((gasto) => {
      if (gasto.parcelas) {
        gasto.parcelas.forEach((parcela) => {
          if (parcela.status === 'pago' && parcela.data_pagamento) {
            parcelas.push({
              ...parcela,
              gastoDescricao: gasto.descricao,
              gastoCategoria: gasto.categoria,
            });
          }
        });
      }
    });

    return parcelas;
  };

  const parcelasPagas = getParcelasPagas();

  // Aplicar filtros
  const parcelasFiltradas = parcelasPagas.filter((parcela) => {
    if (filtroMes === 'todos') return true;

    const dataPagamento = new Date(parcela.data_pagamento!);
    const mesAnoPagamento = `${dataPagamento.getFullYear()}-${String(
      dataPagamento.getMonth() + 1
    ).padStart(2, '0')}`;

    return mesAnoPagamento === filtroMes;
  });

  // Aplicar ordenação
  const parcelasOrdenadas = [...parcelasFiltradas].sort((a, b) => {
    switch (ordenacao) {
      case 'data_desc':
        return (
          new Date(b.data_pagamento!).getTime() -
          new Date(a.data_pagamento!).getTime()
        );
      case 'data_asc':
        return (
          new Date(a.data_pagamento!).getTime() -
          new Date(b.data_pagamento!).getTime()
        );
      case 'valor_desc':
        return parseFloat(b.valor_parcela) - parseFloat(a.valor_parcela);
      case 'valor_asc':
        return parseFloat(a.valor_parcela) - parseFloat(b.valor_parcela);
      default:
        return 0;
    }
  });

  // Obter lista de meses disponíveis
  const mesesDisponiveis = Array.from(
    new Set(
      parcelasPagas.map((p) => {
        const data = new Date(p.data_pagamento!);
        return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(
          2,
          '0'
        )}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a));

  // Calcular totais
  const totalPago = parcelasOrdenadas.reduce(
    (acc, p) => acc + parseFloat(p.valor_parcela),
    0
  );

  // Agrupar por mês para exibição
  const parcelasPorMes = parcelasOrdenadas.reduce((acc, parcela) => {
    const mesAno = formatarMesAno(parcela.data_pagamento!);
    if (!acc[mesAno]) {
      acc[mesAno] = [];
    }
    acc[mesAno].push(parcela);
    return acc;
  }, {} as Record<string, ParcelaPagaComGasto[]>);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Histórico de Parcelas Pagas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Confira todas as parcelas que já foram pagas
          </p>
        </div>
      </div>

      {/* Card de Resumo */}
      {parcelasPagas.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg p-5 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Pago {filtroMes !== 'todos' ? 'no Período' : 'Geral'}
              </h3>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                {formatarMoeda(totalPago)}
              </p>
            </div>
            <div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Parcelas Pagas
              </h3>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                {parcelasOrdenadas.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros e Ordenação */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filtro por Mês */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FunnelIcon className="w-4 h-4 inline mr-1" />
              Filtrar por Mês
            </label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            >
              <option value="todos">Todos os Meses</option>
              {mesesDisponiveis.map((mes) => {
                const [ano, mesNum] = mes.split('-');
                const data = new Date(parseInt(ano), parseInt(mesNum) - 1);
                return (
                  <option key={mes} value={mes}>
                    {data.toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Ordenar por
            </label>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            >
              <option value="data_desc">Mais Recentes</option>
              <option value="data_asc">Mais Antigas</option>
              <option value="valor_desc">Maior Valor</option>
              <option value="valor_asc">Menor Valor</option>
            </select>
          </div>

          {/* Botão Limpar Filtros */}
          {filtroMes !== 'todos' && (
            <div className="flex items-end">
              <button
                onClick={() => setFiltroMes('todos')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition h-[42px]"
              >
                <XMarkIcon className="w-4 h-4" />
                Limpar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Parcelas Pagas */}
      {parcelasPagas.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma parcela paga ainda
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Quando você marcar parcelas como pagas, elas aparecerão aqui.
          </p>
        </div>
      ) : parcelasOrdenadas.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <FunnelIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma parcela encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Não há parcelas pagas no período selecionado.
          </p>
          <button
            onClick={() => setFiltroMes('todos')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
          >
            Ver Todas as Parcelas
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(parcelasPorMes).map(([mesAno, parcelas]) => {
            const totalMes = parcelas.reduce(
              (acc, p) => acc + parseFloat(p.valor_parcela),
              0
            );

            return (
              <div key={mesAno} className="space-y-3">
                {/* Cabeçalho do Mês */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {mesAno}
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {parcelas.length} parcela(s)
                    </p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatarMoeda(totalMes)}
                    </p>
                  </div>
                </div>

                {/* Lista de Parcelas do Mês */}
                <div className="space-y-2">
                  {parcelas.map((parcela) => (
                    <div
                      key={parcela.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {parcela.gastoDescricao}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              Parcela {parcela.numero_parcela}/{parcela.total_parcelas}
                            </span>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                              {parcela.gastoCategoria}
                            </span>
                            <span>•</span>
                            <span>Pago em {formatarData(parcela.data_pagamento!)}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatarMoeda(parcela.valor_parcela)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoricoParcelasPagas;
