import React, { useState } from 'react';
import {
  GastoFuturoResponse,
  GastoFuturoDashboard,
  apiService,
} from '../services/api';
import {
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

interface CardGastosFuturosProps {
  gastosFuturos: GastoFuturoResponse[];
  dashboard: GastoFuturoDashboard | null;
  onEdit: (gastoFuturo: GastoFuturoResponse) => void;
  onDelete: (id: string) => Promise<void>;
  onMarcarComoPago: (id: string) => Promise<void>;
  onMarcarParcelaComoPaga: (parcelaId: string) => Promise<void>;
}

const CardGastosFuturos: React.FC<CardGastosFuturosProps> = ({
  gastosFuturos,
  dashboard,
  onEdit,
  onDelete,
  onMarcarComoPago,
  onMarcarParcelaComoPaga,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmPago, setConfirmPago] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: '' });

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

  const getDiasRestantes = (dataVencimento: string): number => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pago':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'atrasado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const confirmarMarcarComoPago = async () => {
    await onMarcarParcelaComoPaga(confirmPago.id);
    setConfirmPago({ isOpen: false, id: '' });
  };

  const gastosAtivos = gastosFuturos.filter((g) => g.status === 'ativo');
  const gastosVencidos = gastosAtivos.filter((g) => {
    const diasRestantes = getDiasRestantes(g.data_vencimento);
    return diasRestantes < 0;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <CreditCardIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gastos Futuros
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerenciamento de cartão de crédito e compras parceladas
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total de Gastos Futuros */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total de Gastos Ativos
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatarMoeda(dashboard.resumo.total_valor)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {dashboard.resumo.quantidade_total} gasto(s)
            </p>
          </div>

          {/* Gastos Vencidos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Gastos Vencidos
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatarMoeda(dashboard.resumo.valor_vencido)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {dashboard.resumo.quantidade_vencidos} vencido(s)
            </p>
          </div>

          {/* Gastos do Mês Atual */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Vencimentos do Mês
            </p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatarMoeda(dashboard.resumo.valor_mes_atual)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {dashboard.resumo.quantidade_mes_atual} vencimento(s)
            </p>
          </div>
        </div>
      )}

      {/* Próximos Vencimentos */}
      {dashboard && dashboard.proximos_vencimentos.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
              Próximos Vencimentos (7 dias)
            </h3>
          </div>
          <div className="space-y-2">
            {dashboard.proximos_vencimentos.map((gasto) => {
              const diasRestantes = gasto.dias_para_vencimento;
              const isVencido = diasRestantes < 0;
              const isHoje = diasRestantes === 0;

              return (
                <div
                  key={gasto.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {gasto.descricao}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatarData(gasto.data_vencimento)} •{' '}
                      {formatarMoeda(gasto.valor_total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isVencido ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-medium">
                        {Math.abs(diasRestantes)} dia(s) atrasado
                      </span>
                    ) : isHoje ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full text-xs font-medium">
                        Vence hoje!
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                        {diasRestantes} dia(s)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Gastos Futuros */}
      {gastosAtivos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <CreditCardIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum gasto futuro cadastrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Clique em "Novo Gasto Futuro" para começar a gerenciar seus gastos
            futuros
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Todos os Gastos Futuros ({gastosAtivos.length})
          </h3>
          {gastosAtivos.map((gasto) => {
            const isExpanded = expandedId === gasto.id;
            const diasRestantes = getDiasRestantes(gasto.data_vencimento);
            const isVencido = diasRestantes < 0;
            const isParcelado = gasto.numero_parcelas > 1;

            return (
              <div
                key={gasto.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                {/* Header do Card */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {gasto.descricao}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gasto.status)}`}
                        >
                          {gasto.status}
                        </span>
                        {isParcelado && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-medium">
                            {gasto.numero_parcelas}x
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Valor Total
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatarMoeda(gasto.valor_total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Categoria
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {gasto.categoria}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Vencimento
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatarData(gasto.data_vencimento)}
                            {isVencido && (
                              <span className="ml-2 text-red-600 dark:text-red-400 text-xs">
                                (Atrasado)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {gasto.observacoes && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">
                          {gasto.observacoes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onEdit(gasto)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Editar
                    </button>
                    {isParcelado && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : gasto.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        {isExpanded ? 'Ocultar' : 'Ver'} Parcelas ({gasto.parcelas.length})
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(gasto.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Deletar
                    </button>
                  </div>
                </div>

                {/* Parcelas (se expandido) */}
                {isExpanded && isParcelado && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Parcelas ({gasto.parcelas.length})
                    </h5>
                    <div className="space-y-2">
                      {gasto.parcelas.map((parcela) => {
                        const parcelaDias = getDiasRestantes(parcela.data_vencimento);
                        const parcelaVencida = parcelaDias < 0;

                        return (
                          <div
                            key={parcela.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  Parcela {parcela.numero_parcela}/{parcela.total_parcelas}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcela.status)}`}
                                >
                                  {parcela.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <span>
                                  {formatarMoeda(parcela.valor_parcela)}
                                </span>
                                <span>•</span>
                                <span>
                                  Vence em {formatarData(parcela.data_vencimento)}
                                </span>
                                {parcelaVencida && parcela.status === 'pendente' && (
                                  <span className="text-red-600 dark:text-red-400 font-medium">
                                    (Atrasada)
                                  </span>
                                )}
                              </div>
                            </div>
                            {parcela.status === 'pendente' && (
                              <button
                                onClick={() => {
                                  setConfirmPago({
                                    isOpen: true,
                                    id: parcela.id,
                                  });
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                Pagar
                              </button>
                            )}
                            {parcela.status === 'pago' && parcela.data_pagamento && (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                Pago em {formatarData(parcela.data_pagamento)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog de Confirmação de Pagamento */}
      <ConfirmDialog
        isOpen={confirmPago.isOpen}
        title="Marcar Parcela como Paga?"
        message="Confirma o pagamento desta parcela? Um gasto normal será criado e impactará seu saldo."
        confirmLabel="Sim, marcar como pago"
        cancelLabel="Cancelar"
        onConfirm={confirmarMarcarComoPago}
        onCancel={() => setConfirmPago({ isOpen: false, id: '' })}
        type="success"
      />
    </div>
  );
};

export default CardGastosFuturos;
