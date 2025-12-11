import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CardsResumo from './CardsResumo';
import FiltrosTransacoes from './FiltrosTransacoes';
import ComparacaoPeriodos from './ComparacaoPeriodos';
import GraficosFinanceiros from './GraficosFinanceiros';
import TabelaTransacoes from './TabelaTransacoes';
import CalendarioTransacoes from './CalendarioTransacoes';
import EmptyState from './EmptyState';

interface DashboardContentProps {
  // Props para resumo
  saldo: number;
  totalReceitas: number;
  totalDespesas: number;
  variacaoReceitas: number;
  variacaoDespesas: number;
  totalGastosFuturos: number;
  quantidadeGastosFuturos: number;

  // Props para transações
  todasTransacoes: any[]; // Apenas gastos e receitas (para cálculos)
  todasTransacoesComFuturos: any[]; // Inclui gastos futuros (apenas visualização)
  transacoesFiltradas: any[];
  gastos: any[];
  receitas: any[];
  gastosFuturos: any[];

  // Props para filtros
  filtros: any;
  setFiltros: any;
  todasCategorias: string[];
  contagemPorCategoria: Record<string, number>;

  // Props para pesquisa e visualização
  pesquisaDescricao: string;
  setPesquisaDescricao: (value: string) => void;
  visualizacao: 'tabela' | 'calendario';
  setVisualizacao: (value: 'tabela' | 'calendario') => void;

  // Handlers
  onEditGasto: (gasto: any) => void;
  onEditReceita: (receita: any) => void;
  onDeleteGasto: (id: string) => void;
  onDeleteReceita: (id: string) => void;
  onNovoGasto: () => void;
  onNovaReceita: () => void;

  // Premium
  isPremiumActive: boolean;
  onPremiumExpired: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  saldo,
  totalReceitas,
  totalDespesas,
  variacaoReceitas,
  variacaoDespesas,
  totalGastosFuturos,
  quantidadeGastosFuturos,
  todasTransacoes,
  todasTransacoesComFuturos,
  transacoesFiltradas,
  gastos,
  receitas,
  gastosFuturos,
  filtros,
  setFiltros,
  todasCategorias,
  contagemPorCategoria,
  pesquisaDescricao,
  setPesquisaDescricao,
  visualizacao,
  setVisualizacao,
  onEditGasto,
  onEditReceita,
  onDeleteGasto,
  onDeleteReceita,
  onNovoGasto,
  onNovaReceita,
  isPremiumActive,
  onPremiumExpired,
}) => {
  return (
    <div className="space-y-10">
      {/* ===== BOTÕES DE AÇÃO ===== */}
      <section className="flex flex-wrap gap-3 justify-center md:justify-start">
        <button
          onClick={() => {
            if (!isPremiumActive) {
              onPremiumExpired();
              return;
            }
            onNovoGasto();
          }}
          disabled={!isPremiumActive}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium shadow-md transition ${
            isPremiumActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <PlusIcon className="w-5 h-5" />
          Novo Gasto
        </button>
        <button
          onClick={() => {
            if (!isPremiumActive) {
              onPremiumExpired();
              return;
            }
            onNovaReceita();
          }}
          disabled={!isPremiumActive}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium shadow-md transition ${
            isPremiumActive
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <PlusIcon className="w-5 h-5" />
          Nova Receita
        </button>
      </section>

      {/* ===== CARDS DE RESUMO ===== */}
      <CardsResumo
        saldo={saldo}
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        variacaoReceitas={variacaoReceitas}
        variacaoDespesas={variacaoDespesas}
        totalGastosFuturos={totalGastosFuturos}
        quantidadeGastosFuturos={quantidadeGastosFuturos}
      />

      {/* ===== COMPARAÇÃO ENTRE PERÍODOS ===== */}
      <ComparacaoPeriodos todasTransacoes={todasTransacoes} />

      {/* ===== FILTROS ===== */}
      <FiltrosTransacoes
        filtros={filtros}
        setFiltros={setFiltros}
        todasCategorias={todasCategorias}
        contagemPorCategoria={contagemPorCategoria}
      />

      {/* ===== ESTADO VAZIO GERAL ===== */}
      {todasTransacoes.length === 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <EmptyState
            title="Nenhuma transação cadastrada"
            message="Comece adicionando suas primeiras receitas e despesas para visualizar seu dashboard financeiro completo com gráficos, tendências e análises."
            icon={
              <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            action={{
              label: 'Adicionar primeira transação',
              onClick: onNovoGasto,
            }}
          />
        </section>
      )}

      {/* ===== GRÁFICOS ===== */}
      <GraficosFinanceiros
        transacoesFiltradas={transacoesFiltradas}
        gastosFuturos={gastosFuturos}
      />

      {/* ===== TABELA/CALENDÁRIO DE TRANSAÇÕES ===== */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Movimentações Recentes
            </h2>

            {/* Botões de alternância Tabela/Calendário */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setVisualizacao('tabela')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                  visualizacao === 'tabela'
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline text-sm font-medium">Tabela</span>
                <span className="sr-only">Tabela</span>
              </button>
              <button
                onClick={() => setVisualizacao('calendario')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                  visualizacao === 'calendario'
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline text-sm font-medium">Calendário</span>
                <span className="sr-only">Calendário</span>
              </button>
            </div>
          </div>

          {/* Campo de Pesquisa */}
          <div className="w-full md:w-80 relative">
            <img
              src="https://img.icons8.com/?size=100&id=DZe3wFKTc8IK&format=png&color=ffffff"
              alt="Ícone de pesquisa"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
            />
            <input
              type="text"
              value={pesquisaDescricao}
              onChange={(e) => setPesquisaDescricao(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition
                placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Pesquisar por descrição..."
            />
            {pesquisaDescricao && (
              <button
                onClick={() => setPesquisaDescricao('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
                title="Limpar pesquisa"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Visualização condicional: Tabela ou Calendário */}
        {visualizacao === 'tabela' ? (
          <TabelaTransacoes
            transacoesFiltradas={transacoesFiltradas}
            gastos={gastos}
            receitas={receitas}
            pesquisaDescricao={pesquisaDescricao}
            onEditGasto={onEditGasto}
            onEditReceita={onEditReceita}
            onDeleteGasto={onDeleteGasto}
            onDeleteReceita={onDeleteReceita}
          />
        ) : (
          <CalendarioTransacoes
            transacoesFiltradas={transacoesFiltradas}
            gastos={gastos}
            receitas={receitas}
            onEditGasto={onEditGasto}
            onEditReceita={onEditReceita}
            onDeleteGasto={onDeleteGasto}
            onDeleteReceita={onDeleteReceita}
          />
        )}
      </section>
    </div>
  );
};

export default DashboardContent;
