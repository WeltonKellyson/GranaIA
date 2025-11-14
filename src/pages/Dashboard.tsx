import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  BanknotesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { saveAs } from 'file-saver';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function Dashboard() {
  // ===== MOCK DE DADOS =====
  const resumo = {
    saldo: 2850.45,
    receitas: 5200.0,
    despesas: 2350.55,
  };

  const fluxoMensal = [
    { mes: 'Jan', receitas: 4200, despesas: 3000 },
    { mes: 'Fev', receitas: 3800, despesas: 2900 },
    { mes: 'Mar', receitas: 4700, despesas: 3300 },
    { mes: 'Abr', receitas: 5200, despesas: 4000 },
    { mes: 'Mai', receitas: 4900, despesas: 3700 },
  ];

  const categorias = [
    { name: 'Moradia', value: 850 },
    { name: 'Alimentação', value: 650 },
    { name: 'Transporte', value: 420 },
    { name: 'Lazer', value: 280 },
    { name: 'Outros', value: 150 },
  ];

  const cores = ['#22c55e', '#16a34a', '#059669', '#047857', '#064e3b'];

  const transacoes = [
    {
      data: '10/11/2025',
      descricao: 'Pagamento cliente A',
      tipo: 'Receita',
      valor: 950,
    },
    {
      data: '09/11/2025',
      descricao: 'Conta de luz',
      tipo: 'Despesa',
      valor: 220,
    },
    {
      data: '08/11/2025',
      descricao: 'Compra de materiais',
      tipo: 'Despesa',
      valor: 410,
    },
    {
      data: '06/11/2025',
      descricao: 'Serviço prestado',
      tipo: 'Receita',
      valor: 1200,
    },
    { data: '05/11/2025', descricao: 'Internet', tipo: 'Despesa', valor: 150 },
    {
      data: '03/11/2025',
      descricao: 'Venda de produto',
      tipo: 'Receita',
      valor: 780,
    },
  ];

  // ===== PAGINAÇÃO =====
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const totalPaginas = Math.ceil(transacoes.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const transacoesPaginadas = transacoes.slice(inicio, fim);

  const [ordenacao, setOrdenacao] = useState<{
    campo: string;
    direcao: 'asc' | 'desc';
  }>({
    campo: 'data',
    direcao: 'desc',
  });

  const handleOrdenar = (campo: string) => {
    setOrdenacao((prev) => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc',
    }));
  };

  const transacoesOrdenadas = useMemo(() => {
    return [...transacoes].sort((a, b) => {
      if (ordenacao.campo === 'data') {
        const dateA = new Date(a.data.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.data.split('/').reverse().join('-')).getTime();
        return ordenacao.direcao === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (ordenacao.campo === 'tipo') {
        return ordenacao.direcao === 'asc'
          ? a.tipo.localeCompare(b.tipo)
          : b.tipo.localeCompare(a.tipo);
      }
      return 0;
    });
  }, [ordenacao, transacoes]);

  // ===== EXPORTAR RELATÓRIO =====
  const exportToCSV = () => {
    const csv = [
      ['Data', 'Descrição', 'Tipo', 'Valor'],
      ...transacoes.map((t) => [
        t.data,
        t.descricao,
        t.tipo,
        `R$ ${t.valor.toFixed(2)}`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'relatorio-financeiro.csv');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 md:p-10 space-y-10">
      {/* ===== CABEÇALHO ===== */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Dashboard <span className="text-green-600">Financeiro</span>
        </h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Exportar Relatório
        </button>
      </header>

      {/* ===== CARDS DE RESUMO ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo */}
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 border border-gray-100">
          <BanknotesIcon className="w-10 h-10 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Saldo Atual</p>
            <h3 className="text-2xl font-bold text-gray-900">
              R$ {resumo.saldo.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Receitas */}
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 border border-gray-100">
          <ArrowUpCircleIcon className="w-10 h-10 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Receitas</p>
            <h3 className="text-2xl font-bold text-gray-900">
              R$ {resumo.receitas.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 border border-gray-100">
          <ArrowDownCircleIcon className="w-10 h-10 text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Despesas</p>
            <h3 className="text-2xl font-bold text-gray-900">
              R$ {resumo.despesas.toFixed(2)}
            </h3>
          </div>
        </div>
      </section>

      {/* ===== GRÁFICOS ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Fluxo Mensal */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Fluxo de Caixa Mensal
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fluxoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="#16a34a"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="#ef4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Categorias */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Distribuição de Despesas
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorias}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {categorias.map((_, i) => (
                  <Cell key={i} fill={cores[i % cores.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ===== TABELA DE MOVIMENTAÇÕES ===== */}
      <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Últimas Movimentações
          </h2>
          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
            Ver todas →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleOrdenar('data')}
                >
                  <div className="flex items-center gap-1">
                    Data
                    {ordenacao.campo === 'data' &&
                      (ordenacao.direcao === 'asc' ? (
                        <ArrowUpIcon className="w-3 h-3 text-gray-700 transition-transform duration-200" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3 text-gray-700 transition-transform duration-200" />
                      ))}
                  </div>
                </th>

                <th className="px-4 py-2 text-left">Descrição</th>

                <th
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleOrdenar('tipo')}
                >
                  <div className="flex items-center gap-1">
                    Tipo
                    {ordenacao.campo === 'tipo' &&
                      (ordenacao.direcao === 'asc' ? (
                        <ArrowUpIcon className="w-3 h-3 text-gray-700 transition-transform duration-200" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3 text-gray-700 transition-transform duration-200" />
                      ))}
                  </div>
                </th>

                <th className="px-4 py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((t, i) => (
                <tr
                  key={i}
                  className="border-t hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-4 py-2">{t.data}</td>
                  <td className="px-4 py-2">{t.descricao}</td>
                  <td
                    className={`px-4 py-2 font-medium ${
                      t.tipo === 'Receita' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {t.tipo}
                  </td>
                  <td className="px-4 py-2 text-right">
                    R$ {t.valor.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span>
              Mostrando {inicio + 1}–{Math.min(fim, transacoes.length)} de{' '}
              {transacoes.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
                className="px-3 py-1 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPaginaAtual(i + 1)}
                  className={`px-3 py-1 border rounded-lg transition ${
                    paginaAtual === i + 1
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={paginaAtual === totalPaginas}
                className="px-3 py-1 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
