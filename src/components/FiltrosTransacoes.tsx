interface Filtros {
  mes: string;
  categoria: string;
  tipo: string;
  periodo: string;
}

interface FiltrosTransacoesProps {
  filtros: Filtros;
  setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
  todasCategorias: string[];
  contagemPorCategoria: Record<string, number>;
}

export default function FiltrosTransacoes({
  filtros,
  setFiltros,
  todasCategorias,
  contagemPorCategoria,
}: FiltrosTransacoesProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Filtros
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Período
          </label>
          <select
            value={filtros?.periodo || 'todos'}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                periodo: e.target.value,
                mes: '',
              }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          >
            <option value="todos">Todos os períodos</option>
            <option value="mesAtual">Mês atual</option>
            <option value="ultimos30">Últimos 30 dias</option>
            <option value="ultimos60">Últimos 60 dias</option>
            <option value="ultimos90">Últimos 90 dias</option>
            <option value="anoAtual">Ano atual</option>
          </select>
        </div>

        {/* Filtro de Mês/Data Específico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mês Específico
          </label>
          <input
            type="month"
            value={filtros?.mes || ''}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                mes: e.target.value,
                periodo: 'todos',
              }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* Filtro de Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoria
          </label>
          <select
            value={filtros?.categoria || 'todas'}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                categoria: e.target.value,
              }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          >
            <option value="todas">Todas</option>

            {/* Lista todas as categorias com contagem */}
            {todasCategorias.map((cat) => {
              const quantidade = contagemPorCategoria[cat] || 0;
              return (
                <option key={cat} value={cat}>
                  {cat} {quantidade > 0 ? `(${quantidade})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Filtro de Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo
          </label>
          <select
            value={filtros?.tipo || 'todos'}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, tipo: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          >
            <option value="todos">Todos</option>
            <option value="Receita">Receita</option>
            <option value="Despesa">Despesa</option>
          </select>
        </div>
      </div>

      {/* BOTÃO LIMPAR FILTROS */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() =>
            setFiltros({
              mes: '',
              categoria: 'todas',
              tipo: 'todos',
              periodo: 'todos',
            })
          }
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
            border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
            hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition"
        >
          Limpar Filtros
        </button>
      </div>
    </section>
  );
}
