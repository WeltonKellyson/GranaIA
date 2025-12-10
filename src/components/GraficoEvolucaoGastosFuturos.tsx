import React from 'react';
import { GastoFuturoResponse } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface GraficoEvolucaoGastosFuturosProps {
  gastosFuturos: GastoFuturoResponse[];
}

const GraficoEvolucaoGastosFuturos: React.FC<GraficoEvolucaoGastosFuturosProps> = ({
  gastosFuturos,
}) => {
  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Calcular projeção dos próximos 12 meses
  const calcularProjecao = () => {
    const hoje = new Date();
    const projecao: Record<string, { pendente: number; total: number }> = {};

    // Inicializar próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const mesAno = data.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short',
      });
      projecao[mesAno] = { pendente: 0, total: 0 };
    }

    // Calcular valores por mês
    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        gasto.parcelas.forEach((parcela) => {
          const dataVencimento = new Date(parcela.data_vencimento);
          const mesAno = dataVencimento.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'short',
          });

          if (projecao[mesAno]) {
            const valor = parseFloat(parcela.valor_parcela);
            projecao[mesAno].total += valor;
            if (parcela.status === 'pendente') {
              projecao[mesAno].pendente += valor;
            }
          }
        });
      }
    });

    // Converter para array para o gráfico
    return Object.entries(projecao).map(([mes, valores]) => ({
      mes,
      pendente: parseFloat(valores.pendente.toFixed(2)),
      pago: parseFloat((valores.total - valores.pendente).toFixed(2)),
      total: parseFloat(valores.total.toFixed(2)),
    }));
  };

  const dados = calcularProjecao();
  const totalProjetado = dados.reduce((acc, d) => acc + d.total, 0);
  const totalPendente = dados.reduce((acc, d) => acc + d.pendente, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Projeção de Gastos Futuros
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Evolução dos próximos 12 meses
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Projetado
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatarMoeda(totalProjetado)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Pendente: {formatarMoeda(totalPendente)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      {dados.some((d) => d.total > 0) ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 12 }}
              className="dark:fill-gray-300"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="dark:fill-gray-300"
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatarMoeda(value)}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
            <Bar
              dataKey="pago"
              name="Já Pago"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="pendente"
              name="Pendente"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ArrowTrendingUpIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sem projeções disponíveis
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Adicione gastos futuros para visualizar a projeção dos próximos
            meses
          </p>
        </div>
      )}

      {/* Resumo por trimestre */}
      {dados.some((d) => d.total > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Resumo por Trimestre
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[0, 3, 6, 9].map((inicio, index) => {
              const trimestre = dados.slice(inicio, inicio + 3);
              const totalTrimestre = trimestre.reduce(
                (acc, d) => acc + d.total,
                0
              );
              const pendenteTrimestre = trimestre.reduce(
                (acc, d) => acc + d.pendente,
                0
              );

              return (
                <div
                  key={inicio}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
                >
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {index + 1}º Trimestre
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatarMoeda(totalTrimestre)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Pendente: {formatarMoeda(pendenteTrimestre)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraficoEvolucaoGastosFuturos;
