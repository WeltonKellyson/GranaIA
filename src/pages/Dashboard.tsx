import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  BanknotesIcon,
  ArrowPathIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { saveAs } from 'file-saver';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import {
  apiService,
  GastoResponse,
  ReceitaResponse,
  GastoDashboard,
  ReceitaDashboard,
} from '../services/api';
import Modal from '../components/Modal';
import FormGasto from '../components/FormGasto';
import FormReceita from '../components/FormReceita';

type TransacaoTipo = 'Receita' | 'Despesa';

interface Transacao {
  id: string;
  data: string;
  descricao: string;
  tipo: TransacaoTipo;
  valor: number;
  categoria: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Estados dos dados
  const [gastos, setGastos] = useState<GastoResponse[]>([]);
  const [receitas, setReceitas] = useState<ReceitaResponse[]>([]);
  const [gastoDashboard, setGastoDashboard] = useState<GastoDashboard | null>(null);
  const [receitaDashboard, setReceitaDashboard] = useState<ReceitaDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados dos modais
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [showReceitaModal, setShowReceitaModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState<GastoResponse | null>(null);
  const [editingReceita, setEditingReceita] = useState<ReceitaResponse | null>(null);

  // Estados da tabela
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [ordenacao, setOrdenacao] = useState<{ campo: 'data' | 'tipo'; ordem: 'asc' | 'desc' }>({
    campo: 'data',
    ordem: 'desc',
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadData = async () => {
    if (!userProfile?.remotejid) return;

    setLoading(true);
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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const handleDeleteGasto = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este gasto?')) return;

    try {
      await apiService.deleteGasto(id);
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar gasto:', error);
      alert('Erro ao deletar gasto');
    }
  };

  const handleDeleteReceita = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta receita?')) return;

    try {
      await apiService.deleteReceita(id);
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      alert('Erro ao deletar receita');
    }
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
    setEditingGasto(null);
    await loadData();
  };

  const handleReceitaSuccess = async () => {
    setShowReceitaModal(false);
    setEditingReceita(null);
    await loadData();
  };

  const handleGastoCancel = () => {
    setShowGastoModal(false);
    setEditingGasto(null);
  };

  const handleReceitaCancel = () => {
    setShowReceitaModal(false);
    setEditingReceita(null);
  };

  // Combinar gastos e receitas em transações
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

  // Ordenar transações
  const transacoesOrdenadas = [...todasTransacoes].sort((a, b) => {
    if (ordenacao.campo === 'data') {
      const dataA = new Date(a.data).getTime();
      const dataB = new Date(b.data).getTime();
      return ordenacao.ordem === 'asc' ? dataA - dataB : dataB - dataA;
    } else {
      return ordenacao.ordem === 'asc'
        ? a.tipo.localeCompare(b.tipo)
        : b.tipo.localeCompare(a.tipo);
    }
  });

  // Paginação
  const totalPaginas = Math.ceil(transacoesOrdenadas.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const transacoesPaginadas = transacoesOrdenadas.slice(
    indiceInicial,
    indiceInicial + itensPorPagina
  );

  // Calcular resumo
  const totalReceitas = parseFloat(receitaDashboard?.total_geral || '0');
  const totalDespesas = parseFloat(gastoDashboard?.total_geral || '0');
  const saldo = totalReceitas - totalDespesas;

  // Dados para gráficos
  const cores = ['#22c55e', '#16a34a', '#059669', '#047857', '#064e3b'];

  const categoriasGastos =
    gastoDashboard?.por_categoria.map((cat) => ({
      name: cat.categoria,
      value: parseFloat(cat.total),
    })) || [];

  // Exportar CSV
  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'];
    const rows = transacoesOrdenadas.map((t) => [
      new Date(t.data).toLocaleDateString('pt-BR'),
      t.descricao,
      t.tipo,
      t.categoria,
      `R$ ${t.valor.toFixed(2)}`,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'relatorio-financeiro.csv');
  };

  const alternarOrdenacao = (campo: 'data' | 'tipo') => {
    if (ordenacao.campo === campo) {
      setOrdenacao({ campo, ordem: ordenacao.ordem === 'asc' ? 'desc' : 'asc' });
    } else {
      setOrdenacao({ campo, ordem: 'desc' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 md:p-10 space-y-10 overflow-x-hidden">
      {/* ===== CABEÇALHO ===== */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Dashboard <span className="text-green-600">Financeiro</span>
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Exportar Relatório
          </button>

          {/* Menu do usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm transition"
            >
              <UserCircleIcon className="w-5 h-5 text-gray-600" />
              <span className="hidden md:inline text-gray-700">{user?.name}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                </div>
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

      {/* ===== BOTÕES DE AÇÃO ===== */}
      <section className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setEditingGasto(null);
            setShowGastoModal(true);
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition"
        >
          <PlusIcon className="w-5 h-5" />
          Novo Gasto
        </button>
        <button
          onClick={() => {
            setEditingReceita(null);
            setShowReceitaModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition"
        >
          <PlusIcon className="w-5 h-5" />
          Nova Receita
        </button>
      </section>

      {/* ===== CARDS DE RESUMO ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo */}
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 border border-gray-100">
          <BanknotesIcon className="w-10 h-10 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Saldo Atual</p>
            <h3 className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldo.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Receitas */}
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 border border-gray-100">
          <ArrowUpCircleIcon className="w-10 h-10 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Receitas</p>
            <h3 className="text-2xl font-bold text-gray-900">R$ {totalReceitas.toFixed(2)}</h3>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 border border-gray-100">
          <ArrowDownCircleIcon className="w-10 h-10 text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Despesas</p>
            <h3 className="text-2xl font-bold text-gray-900">R$ {totalDespesas.toFixed(2)}</h3>
          </div>
        </div>
      </section>

      {/* ===== GRÁFICOS ===== */}
      {categoriasGastos.length > 0 && (
        <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Distribuição de Despesas por Categoria
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriasGastos}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: R$ ${entry.value.toFixed(2)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoriasGastos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* ===== TABELA DE TRANSAÇÕES ===== */}
      <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Movimentações Recentes</h2>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => alternarOrdenacao('data')}
                >
                  Data{' '}
                  {ordenacao.campo === 'data' &&
                    (ordenacao.ordem === 'asc' ? (
                      <ArrowUpIcon className="inline w-4 h-4" />
                    ) : (
                      <ArrowDownIcon className="inline w-4 h-4" />
                    ))}
                </th>
                <th className="py-3 px-4 text-left">Descrição</th>
                <th className="py-3 px-4 text-left">Categoria</th>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => alternarOrdenacao('tipo')}
                >
                  Tipo{' '}
                  {ordenacao.campo === 'tipo' &&
                    (ordenacao.ordem === 'asc' ? (
                      <ArrowUpIcon className="inline w-4 h-4" />
                    ) : (
                      <ArrowDownIcon className="inline w-4 h-4" />
                    ))}
                </th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transacoesPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                transacoesPaginadas.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(t.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">{t.descricao}</td>
                    <td className="py-3 px-4">{t.categoria}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          t.tipo === 'Receita'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {t.tipo}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${
                        t.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      R$ {t.valor.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (t.tipo === 'Despesa') {
                              const gasto = gastos.find((g) => g.id === t.id);
                              if (gasto) handleEditGasto(gasto);
                            } else {
                              const receita = receitas.find((r) => r.id === t.id);
                              if (receita) handleEditReceita(receita);
                            }
                          }}
                          className="text-yellow-600 hover:text-yellow-700 transition"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (t.tipo === 'Despesa') {
                              handleDeleteGasto(t.id);
                            } else {
                              handleDeleteReceita(t.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 transition"
                          title="Deletar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Mostrando {indiceInicial + 1} a{' '}
              {Math.min(indiceInicial + itensPorPagina, transacoesOrdenadas.length)} de{' '}
              {transacoesOrdenadas.length} transações
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaAtual(paginaAtual - 1)}
                disabled={paginaAtual === 1}
                className={`px-4 py-2 rounded-lg ${
                  paginaAtual === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Anterior
              </button>
              <span className="px-4 py-2 bg-gray-100 rounded-lg">
                {paginaAtual} / {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaAtual(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
                className={`px-4 py-2 rounded-lg ${
                  paginaAtual === totalPaginas
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </section>

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
    </div>
  );
}
