import { useState } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { GastoResponse, ReceitaResponse } from '../services/api';
import EmptyState from './EmptyState';

interface Transacao {
  id: string;
  data: string;
  descricao: string;
  tipo: 'Receita' | 'Despesa' | 'Gasto Futuro';
  valor: number;
  categoria: string;
}

interface TabelaTransacoesProps {
  transacoesFiltradas: Transacao[];
  gastos: GastoResponse[];
  receitas: ReceitaResponse[];
  pesquisaDescricao: string;
  onEditGasto: (gasto: GastoResponse) => void;
  onEditReceita: (receita: ReceitaResponse) => void;
  onDeleteGasto: (id: string) => void;
  onDeleteReceita: (id: string) => void;
}

const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function TabelaTransacoes({
  transacoesFiltradas,
  gastos,
  receitas,
  pesquisaDescricao,
  onEditGasto,
  onEditReceita,
  onDeleteGasto,
  onDeleteReceita,
}: TabelaTransacoesProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [ordenacao, setOrdenacao] = useState<{
    campo: 'data' | 'tipo';
    ordem: 'asc' | 'desc';
  }>({
    campo: 'data',
    ordem: 'desc',
  });

  const alternarOrdenacao = (campo: 'data' | 'tipo') => {
    if (ordenacao.campo === campo) {
      setOrdenacao({
        campo,
        ordem: ordenacao.ordem === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setOrdenacao({ campo, ordem: 'desc' });
    }
  };

  // Ordenar transacoes
  const transacoesOrdenadas = [...transacoesFiltradas].sort((a, b) => {
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

  // Paginacao
  const totalPaginas = Math.ceil(transacoesOrdenadas.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const transacoesPaginadas = transacoesOrdenadas.slice(
    indiceInicial,
    indiceInicial + itensPorPagina
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <tr>
              <th
                className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
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
              <th className="py-3 px-4 text-left">Descricao</th>
              <th className="py-3 px-4 text-left">Categoria</th>
              <th
                className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
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
              <th className="py-3 px-4 text-center">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {transacoesPaginadas.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <EmptyState
                    title="Nenhuma transacao encontrada"
                    message={
                      pesquisaDescricao
                        ? `Nao encontramos transacoes com "${pesquisaDescricao}". Tente ajustar sua pesquisa ou filtros.`
                        : 'Nao h transacoes para os filtros selecionados. Tente ajustar os filtros ou adicionar novas transacoes.'
                    }
                    icon={
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    }
                  />
                </td>
              </tr>
            ) : (
              transacoesPaginadas.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {new Date(t.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {t.descricao}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {t.categoria}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        t.tipo === 'Receita'
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : t.tipo === 'Gasto Futuro'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {t.tipo}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${
                      t.tipo === 'Receita'
                        ? 'text-green-600 dark:text-green-400'
                        : t.tipo === 'Gasto Futuro'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(t.valor)}
                  </td>
                  <td className="py-3 px-4">
                    {t.tipo === 'Gasto Futuro' ? (
                      <div className="flex items-center justify-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          Gerenciar em Cartoes
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (t.tipo === 'Despesa') {
                              const gasto = gastos.find((g) => g.id === t.id);
                              if (gasto) onEditGasto(gasto);
                            } else {
                              const receita = receitas.find((r) => r.id === t.id);
                              if (receita) onEditReceita(receita);
                            }
                          }}
                          className="p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (t.tipo === 'Despesa') {
                              onDeleteGasto(t.id);
                            } else {
                              onDeleteReceita(t.id);
                            }
                          }}
                          className="p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                          title="Deletar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINACAO ===== */}
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-700 dark:text-gray-300">
          {/* Texto "mostrando XY" */}
          <span>
            Mostrando {indiceInicial + 1}
            {Math.min(indiceInicial + itensPorPagina, transacoesOrdenadas.length)}{' '}
            de {transacoesOrdenadas.length}
          </span>

          {/* Botoes */}
          <div className="flex gap-2">
            {/* Botao Anterior */}
            <button
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className="px-3 py-1 border rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:text-gray-400 dark:disabled:text-gray-500 transition"
            >
              Anterior
            </button>

            {/* Botoes numerados */}
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => setPaginaAtual(i + 1)}
                className={`px-3 py-1 border rounded-lg font-medium transition ${
                  paginaAtual === i + 1
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Botao Proximo */}
            <button
              onClick={() =>
                setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
              }
              disabled={paginaAtual === totalPaginas}
              className="px-3 py-1 border rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:text-gray-400 dark:disabled:text-gray-500 transition"
            >
              Proximo
            </button>
          </div>
        </div>
      )}
    </>
  );
}
