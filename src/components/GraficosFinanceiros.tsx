import { useState } from 'react';
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
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Transacao {
  tipo: 'Receita' | 'Despesa';
  valor: number;
  categoria: string;
  data: string;
}

interface ParcelaGastoFuturo {
  id: string;
  status: string;
  valor_parcela: string;
  data_vencimento: string;
}

interface GastoFuturo {
  id: string;
  status: string;
  categoria: string;
  parcelas: ParcelaGastoFuturo[];
}

interface GraficosFinanceirosProps {
  transacoesFiltradas: Transacao[];
  gastosFuturos?: GastoFuturo[];
}

const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function GraficosFinanceiros({
  transacoesFiltradas,
  gastosFuturos = [],
}: GraficosFinanceirosProps) {
  const [mostrarDetalhesDespesas, setMostrarDetalhesDespesas] = useState(false);
  const [mostrarDetalhesReceitas, setMostrarDetalhesReceitas] = useState(false);

  // Cores mais diferenciadas e vibrantes
  const coresReceitas = [
    '#10b981', // Emerald 500
    '#3b82f6', // Blue 500
    '#8b5cf6', // Violet 500
    '#ec4899', // Pink 500
    '#f59e0b', // Amber 500
    '#06b6d4', // Cyan 500
    '#84cc16', // Lime 500
    '#a855f7', // Purple 500
    '#14b8a6', // Teal 500
    '#f97316', // Orange 500
  ];
  const coresDespesas = [
    '#ef4444', // Red 500
    '#f97316', // Orange 500
    '#f59e0b', // Amber 500
    '#eab308', // Yellow 500
    '#84cc16', // Lime 500
    '#22c55e', // Green 500
    '#14b8a6', // Teal 500
    '#06b6d4', // Cyan 500
    '#3b82f6', // Blue 500
    '#8b5cf6', // Violet 500
  ];

  // === AGRUPAMENTO POR MES PARA O GRAFICO DE LINHA ===
  const fluxoMensal = (() => {
    const mapa: Record<string, { receitas: number; despesas: number; gastosFuturos: number; data: Date }> = {};

    // Adicionar transacoes normais (receitas e despesas)
    transacoesFiltradas.forEach((t) => {
      const data = new Date(t.data);
      if (isNaN(data.getTime())) return;

      // Chave unica com ano e mes: "2025-12"
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

      if (!mapa[chave]) {
        mapa[chave] = { receitas: 0, despesas: 0, gastosFuturos: 0, data: new Date(data.getFullYear(), data.getMonth(), 1) };
      }

      if (t.tipo === 'Receita') {
        mapa[chave].receitas += t.valor;
      } else if (t.tipo === 'Despesa') {
        mapa[chave].despesas += t.valor;
      }
    });

    // Adicionar gastos futuros pendentes por mes
    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        gasto.parcelas.forEach((parcela) => {
          if (parcela.status === 'pendente') {
            const data = new Date(parcela.data_vencimento);
            if (isNaN(data.getTime())) return;

            const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

            if (!mapa[chave]) {
              mapa[chave] = { receitas: 0, despesas: 0, gastosFuturos: 0, data: new Date(data.getFullYear(), data.getMonth(), 1) };
            }

            mapa[chave].gastosFuturos += parseFloat(parcela.valor_parcela);
          }
        });
      }
    });

    // Converter o mapa em array e ordenar cronologicamente
    return Object.entries(mapa)
      .map(([chave, valores]) => ({
        mes: valores.data.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', ''),
        receitas: valores.receitas > 0 ? valores.receitas : null,
        despesas: valores.despesas > 0 ? valores.despesas : null,
        gastosFuturos: valores.gastosFuturos > 0 ? valores.gastosFuturos : null,
        ordem: valores.data.getTime(), // Para ordenacao
      }))
      .sort((a, b) => a.ordem - b.ordem) // Ordenar cronologicamente
      .map(({ mes, receitas, despesas, gastosFuturos }) => ({
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        receitas,
        despesas,
        gastosFuturos,
      }));
  })();

  // Agrupar despesas por categoria (SEM gastos futuros)
  const categoriasGastos = (() => {
    const categoriaMap: Record<string, number> = {};

    // Adicionar APENAS despesas normais (nao incluir gastos futuros)
    transacoesFiltradas
      .filter((t) => t.tipo === 'Despesa')
      .forEach((t) => {
        if (!categoriaMap[t.categoria]) {
          categoriaMap[t.categoria] = 0;
        }
        categoriaMap[t.categoria] += t.valor;
      });

    return Object.entries(categoriaMap)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value); // Ordenar para cores consistentes
  })();

  // Criar mapeamento de cores fixas para despesas (agora ja ordenado)
  const coresMapDespesas = categoriasGastos.reduce((acc, categoria, index) => {
    acc[categoria.name] = coresDespesas[index % coresDespesas.length];
    return acc;
  }, {} as Record<string, string>);

  // Agrupar gastos futuros por categoria (separado)
  const categoriasGastosFuturos = (() => {
    const categoriaMap: Record<string, number> = {};

    // Adicionar gastos futuros pendentes por categoria
    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        gasto.parcelas.forEach((parcela) => {
          if (parcela.status === 'pendente') {
            const categoria = gasto.categoria;
            if (!categoriaMap[categoria]) {
              categoriaMap[categoria] = 0;
            }
            categoriaMap[categoria] += parseFloat(parcela.valor_parcela);
          }
        });
      }
    });

    return Object.entries(categoriaMap).map(([name, value]) => ({
      name,
      value,
    }));
  })();

  // Agrupar receitas por categoria
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

    return Object.entries(categoriaMap)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value); // Ordenar para cores consistentes
  })();

  // Criar mapeamento de cores fixas para receitas (agora ja ordenado)
  const coresMapReceitas = categoriasReceitas.reduce((acc, categoria, index) => {
    acc[categoria.name] = coresReceitas[index % coresReceitas.length];
    return acc;
  }, {} as Record<string, string>);

  return (
    <>
      {/* ===== GRAFICO: FLUXO DE CAIXA MENSAL ===== */}
      {fluxoMensal.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Fluxo de Caixa Mensal
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fluxoMensal} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />

              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis
                stroke="#6b7280"
                tickFormatter={(value: number) => {
                  return value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  });
                }}
              />

              <Tooltip
                formatter={(value: number) => formatarMoeda(value)}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="receitas"
                stroke="#16a34a"
                strokeWidth={3}
                name="Receitas"
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="despesas"
                stroke="#ef4444"
                strokeWidth={3}
                name="Despesas"
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="gastosFuturos"
                stroke="#2563eb"
                strokeWidth={3}
                name="Gastos Futuros"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* ===== GRAFICOS DE PIZZA ===== */}
      {(categoriasGastos.length > 0 || categoriasReceitas.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grafico de Despesas */}
          {categoriasGastos.length > 0 && (
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all duration-500 ease-in-out ${
                categoriasReceitas.length === 0 ? 'lg:col-span-2' : ''
              } overflow-hidden`}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Distribuicao de Despesas por Categoria
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoriasGastos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriasGastos.map((entry, index) => (
                      <Cell
                        key={`cell-despesa-${index}`}
                        fill={coresMapDespesas[entry.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatarMoeda(value)}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Botao para mostrar/ocultar detalhes */}
              <div className="mt-4">
                <button
                  onClick={() => setMostrarDetalhesDespesas(!mostrarDetalhesDespesas)}
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {mostrarDetalhesDespesas ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                  </span>
                  {mostrarDetalhesDespesas ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  )}
                </button>
              </div>

              {/* Lista detalhada de categorias */}
              {mostrarDetalhesDespesas && (
                <div className="mt-4 space-y-2 max-h-[280px] overflow-y-auto pr-2">
                  {categoriasGastos
                    .sort((a, b) => b.value - a.value)
                    .map((categoria, index) => {
                      const total = categoriasGastos.reduce((acc, c) => acc + c.value, 0);
                      const percentual = ((categoria.value / total) * 100).toFixed(1);
                      return (
                        <div
                          key={`despesa-detail-${index}`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: coresMapDespesas[categoria.name] }}
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {categoria.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {percentual}%
                            </span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                              {formatarMoeda(categoria.value)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Grafico de Receitas */}
          {categoriasReceitas.length > 0 && (
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all duration-500 ease-in-out ${
                categoriasGastos.length === 0 ? 'lg:col-span-2' : ''
              } overflow-hidden`}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Distribuicao de Receitas por Categoria
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoriasReceitas}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriasReceitas.map((entry, index) => (
                      <Cell
                        key={`cell-receita-${index}`}
                        fill={coresMapReceitas[entry.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatarMoeda(value)}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Botao para mostrar/ocultar detalhes */}
              <div className="mt-4">
                <button
                  onClick={() => setMostrarDetalhesReceitas(!mostrarDetalhesReceitas)}
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {mostrarDetalhesReceitas ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                  </span>
                  {mostrarDetalhesReceitas ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  )}
                </button>
              </div>

              {/* Lista detalhada de categorias */}
              {mostrarDetalhesReceitas && (
                <div className="mt-4 space-y-2 max-h-[280px] overflow-y-auto pr-2">
                  {categoriasReceitas
                    .sort((a, b) => b.value - a.value)
                    .map((categoria, index) => {
                      const total = categoriasReceitas.reduce((acc, c) => acc + c.value, 0);
                      const percentual = ((categoria.value / total) * 100).toFixed(1);
                      return (
                        <div
                          key={`receita-detail-${index}`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: coresMapReceitas[categoria.name] }}
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {categoria.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {percentual}%
                            </span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {formatarMoeda(categoria.value)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </>
  );
}
