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

interface Transacao {
  tipo: 'Receita' | 'Despesa';
  valor: number;
  categoria: string;
  data: string;
}

interface GraficosFinanceirosProps {
  transacoesFiltradas: Transacao[];
}

const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function GraficosFinanceiros({
  transacoesFiltradas,
}: GraficosFinanceirosProps) {
  // Cores
  const coresReceitas = [
    '#22c55e',
    '#16a34a',
    '#059669',
    '#047857',
    '#065f46',
    '#064e3b',
  ];
  const coresDespesas = [
    '#ef4444',
    '#dc2626',
    '#b91c1c',
    '#991b1b',
    '#7f1d1d',
    '#6b1414',
  ];

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

  // Agrupar despesas por categoria
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

    return Object.entries(categoriaMap).map(([name, value]) => ({
      name,
      value,
    }));
  })();

  return (
    <>
      {/* ===== GRÁFICO: FLUXO DE CAIXA MENSAL ===== */}
      {fluxoMensal.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Fluxo de Caixa Mensal
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fluxoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />

              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />

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
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all duration-500 ease-in-out ${
                categoriasReceitas.length === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
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
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Receitas */}
          {categoriasReceitas.length > 0 && (
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all duration-500 ease-in-out ${
                categoriasGastos.length === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
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
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}
    </>
  );
}
