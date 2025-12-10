import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { apiService, CartaoCreditoResponse } from '../services/api';

interface FiltrosGastosFuturosProps {
  filtros: {
    cartao: string;
    categoria: string;
    status: string;
    dataInicio: string;
    dataFim: string;
  };
  setFiltros: React.Dispatch<
    React.SetStateAction<{
      cartao: string;
      categoria: string;
      status: string;
      dataInicio: string;
      dataFim: string;
    }>
  >;
  todasCategorias: string[];
}

const FiltrosGastosFuturos: React.FC<FiltrosGastosFuturosProps> = ({
  filtros,
  setFiltros,
  todasCategorias,
}) => {
  const [cartoes, setCartoes] = useState<CartaoCreditoResponse[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    loadCartoes();
  }, []);

  const loadCartoes = async () => {
    try {
      const response = await apiService.getCartoesCredito({ page_size: 100 });
      setCartoes(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    }
  };

  const handleLimparFiltros = () => {
    setFiltros({
      cartao: 'todos',
      categoria: 'todas',
      status: 'todos',
      dataInicio: '',
      dataFim: '',
    });
  };

  const temFiltrosAtivos =
    filtros.cartao !== 'todos' ||
    filtros.categoria !== 'todas' ||
    filtros.status !== 'todos' ||
    filtros.dataInicio !== '' ||
    filtros.dataFim !== '';

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      {/* Cabeçalho dos Filtros */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FunnelIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Filtros de Gastos Futuros
          </h2>
          {temFiltrosAtivos && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
              Filtros ativos
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {temFiltrosAtivos && (
            <button
              onClick={handleLimparFiltros}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
            >
              <XMarkIcon className="w-4 h-4" />
              Limpar Filtros
            </button>
          )}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
        </div>
      </div>

      {/* Grid de Filtros */}
      {mostrarFiltros && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Filtro por Cartão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cartão de Crédito
            </label>
            <select
              value={filtros.cartao}
              onChange={(e) =>
                setFiltros({ ...filtros, cartao: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="todos">Todos os Cartões</option>
              <option value="sem_cartao">Sem Cartão</option>
              {cartoes.map((cartao) => (
                <option key={cartao.id} value={cartao.id}>
                  {cartao.nome_cartao}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) =>
                setFiltros({ ...filtros, categoria: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="todas">Todas as Categorias</option>
              {todasCategorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) =>
                setFiltros({ ...filtros, status: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Filtro por Data de Vencimento - Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vencimento a partir de
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) =>
                setFiltros({ ...filtros, dataInicio: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Filtro por Data de Vencimento - Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vencimento até
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) =>
                setFiltros({ ...filtros, dataFim: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>
      )}

      {/* Resumo de Filtros Ativos */}
      {temFiltrosAtivos && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Filtrando por:
            </span>
            {filtros.cartao !== 'todos' && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
                Cartão:{' '}
                {filtros.cartao === 'sem_cartao'
                  ? 'Sem Cartão'
                  : cartoes.find((c) => c.id === filtros.cartao)?.nome_cartao ||
                    filtros.cartao}
              </span>
            )}
            {filtros.categoria !== 'todas' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                Categoria: {filtros.categoria}
              </span>
            )}
            {filtros.status !== 'todos' && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                Status: {filtros.status}
              </span>
            )}
            {filtros.dataInicio && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                A partir de: {new Date(filtros.dataInicio).toLocaleDateString('pt-BR')}
              </span>
            )}
            {filtros.dataFim && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                Até: {new Date(filtros.dataFim).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default FiltrosGastosFuturos;
