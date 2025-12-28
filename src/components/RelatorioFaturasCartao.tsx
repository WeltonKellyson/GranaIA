import React, { useState, useEffect } from 'react';
import {
  apiService,
  CartaoCreditoResponse,
  GastoFuturoResponse,
  ParcelaResponse,
} from '../services/api';
import {
  CreditCardIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import ConfirmDialog from './ConfirmDialog';

interface RelatorioFaturasCartaoProps {
  gastosFuturos: GastoFuturoResponse[];
  onMarcarParcelaComoPaga: (parcelaId: string) => Promise<void>;
}

interface FaturaCartao {
  cartao: CartaoCreditoResponse | null;
  cartaoId: string | null;
  nomeCartao: string;
  parcelas: ParcelaResponse[];
  totalPendente: number;
  quantidadePendente: number;
}

const RelatorioFaturasCartao: React.FC<RelatorioFaturasCartaoProps> = ({
  gastosFuturos,
  onMarcarParcelaComoPaga,
}) => {
  const [cartoes, setCartoes] = useState<CartaoCreditoResponse[]>([]);
  const [expandedCartaoId, setExpandedCartaoId] = useState<string | null>(null);
  const [confirmPagarFatura, setConfirmPagarFatura] = useState<{
    isOpen: boolean;
    cartaoId: string | null;
    nomeCartao: string;
    parcelas: ParcelaResponse[];
  }>({ isOpen: false, cartaoId: null, nomeCartao: '', parcelas: [] });
  const [processandoPagamento, setProcessandoPagamento] = useState(false);

  useEffect(() => {
    loadCartoes();
  }, []);

  const loadCartoes = async () => {
    try {
      const response = await apiService.getCartoesCredito({ page_size: 100 });
      setCartoes(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar cartoes:', error);
    }
  };

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatarData = (data: string): string => {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  // Agrupar parcelas por cartao
  const getFaturasCartao = (): FaturaCartao[] => {
    const faturasPorCartao = new Map<string, FaturaCartao>();

    // Inicializar com todos os cartoes cadastrados
    cartoes.forEach((cartao) => {
      faturasPorCartao.set(cartao.id, {
        cartao,
        cartaoId: cartao.id,
        nomeCartao: cartao.nome_cartao,
        parcelas: [],
        totalPendente: 0,
        quantidadePendente: 0,
      });
    });

    // Adicionar cartao especial "Sem Cartao"
    faturasPorCartao.set('sem_cartao', {
      cartao: null,
      cartaoId: null,
      nomeCartao: 'Sem Cartao',
      parcelas: [],
      totalPendente: 0,
      quantidadePendente: 0,
    });

    // Agrupar parcelas pendentes
    gastosFuturos.forEach((gasto) => {
      if (gasto.status === 'ativo' && gasto.parcelas) {
        const cartaoKey = gasto.cartao_credito_id || 'sem_cartao';

        gasto.parcelas.forEach((parcela) => {
          if (parcela.status === 'pendente') {
            const fatura = faturasPorCartao.get(cartaoKey);
            if (fatura) {
              fatura.parcelas.push(parcela);
              fatura.totalPendente += parseFloat(parcela.valor_parcela);
              fatura.quantidadePendente++;
            } else if (!gasto.cartao_credito_id) {
              // Se nao encontrar o cartao e nao tem cartao_credito_id, adiciona em "sem_cartao"
              const semCartao = faturasPorCartao.get('sem_cartao')!;
              semCartao.parcelas.push(parcela);
              semCartao.totalPendente += parseFloat(parcela.valor_parcela);
              semCartao.quantidadePendente++;
            }
          }
        });
      }
    });

    // Filtrar apenas cartoes com parcelas pendentes e ordenar
    return Array.from(faturasPorCartao.values())
      .filter((fatura) => fatura.quantidadePendente > 0)
      .sort((a, b) => b.totalPendente - a.totalPendente);
  };

  const handlePagarFaturaCartao = (fatura: FaturaCartao) => {
    setConfirmPagarFatura({
      isOpen: true,
      cartaoId: fatura.cartaoId,
      nomeCartao: fatura.nomeCartao,
      parcelas: fatura.parcelas,
    });
  };

  const confirmarPagarFatura = async () => {
    const parcelas = confirmPagarFatura.parcelas;

    setProcessandoPagamento(true);
    setConfirmPagarFatura({
      isOpen: false,
      cartaoId: null,
      nomeCartao: '',
      parcelas: [],
    });

    try {
      for (const parcela of parcelas) {
        try {
          await onMarcarParcelaComoPaga(parcela.id);
        } catch (error) {
          console.error(`Erro ao pagar parcela ${parcela.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao pagar fatura:', error);
    } finally {
      setProcessandoPagamento(false);
    }
  };

  const faturas = getFaturasCartao();
  const totalGeralPendente = faturas.reduce((acc, f) => acc + f.totalPendente, 0);
  const quantidadeGeralPendente = faturas.reduce(
    (acc, f) => acc + f.quantidadePendente,
    0
  );

  return (
    <div className="space-y-6">
      {/* Cabecalho */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <CreditCardIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Relatorio de Faturas por Cartao
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualize e pague faturas de cada cartao separadamente
          </p>
        </div>
      </div>

      {/* Card de Resumo Geral */}
      {faturas.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-500 dark:border-purple-600 rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Total Pendente em Todos os Cartoes
              </h3>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                  {formatarMoeda(totalGeralPendente)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {quantidadeGeralPendente} parcela(s)
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {faturas.length} cartao(oes) com faturas pendentes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de Processamento */}
      {processandoPagamento && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-600 rounded-lg p-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Processando Pagamento da Fatura...
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Aguarde enquanto processamos todas as parcelas do cartao.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Faturas por Cartao */}
      {faturas.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <CreditCardIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma fatura pendente
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Nao ha parcelas pendentes em nenhum cartao de credito no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {faturas.map((fatura) => {
            const isExpanded = expandedCartaoId === (fatura.cartaoId || 'sem_cartao');
            const corCartao = fatura.cartao?.cor || '#6B7280';

            return (
              <div
                key={fatura.cartaoId || 'sem_cartao'}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-l-4"
                style={{ borderLeftColor: corCartao }}
              >
                {/* Header do Cartao */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: `${corCartao}20`,
                        }}
                      >
                        <CreditCardIcon
                          className="w-6 h-6"
                          style={{ color: corCartao }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {fatura.nomeCartao}
                        </h3>
                        {fatura.cartao && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {fatura.cartao.nome_titular}  Vencimento dia{' '}
                            {fatura.cartao.dia_vencimento}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatarMoeda(fatura.totalPendente)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {fatura.quantidadePendente} parcela(s)
                      </p>
                    </div>
                  </div>

                  {/* Botoes de Acao */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePagarFaturaCartao(fatura)}
                      disabled={processandoPagamento}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Pagar Todas ({fatura.quantidadePendente})
                    </button>
                    <button
                      onClick={() =>
                        setExpandedCartaoId(
                          isExpanded ? null : fatura.cartaoId || 'sem_cartao'
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUpIcon className="w-4 h-4" />
                          Ocultar Detalhes
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="w-4 h-4" />
                          Ver Detalhes
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Detalhes das Parcelas */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Parcelas Pendentes ({fatura.parcelas.length})
                    </h4>
                    <div className="space-y-2">
                      {fatura.parcelas
                        .sort(
                          (a, b) =>
                            new Date(a.data_vencimento).getTime() -
                            new Date(b.data_vencimento).getTime()
                        )
                        .map((parcela) => {
                          // Buscar informacao do gasto relacionado
                          const gastoRelacionado = gastosFuturos.find((g) =>
                            g.parcelas.some((p) => p.id === parcela.id)
                          );

                          return (
                            <div
                              key={parcela.id}
                              className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {gastoRelacionado?.descricao || 'Sem descricao'}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  <span>
                                    Parcela {parcela.numero_parcela}/{parcela.total_parcelas}
                                  </span>
                                  <span></span>
                                  <span>{formatarMoeda(parseFloat(parcela.valor_parcela))}</span>
                                  <span></span>
                                  <span>Vence em {formatarData(parcela.data_vencimento)}</span>
                                </div>
                              </div>
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

      {/* Dialog de Confirmacao - Pagar Fatura do Cartao */}
      <ConfirmDialog
        isOpen={confirmPagarFatura.isOpen}
        title={`Pagar Fatura do ${confirmPagarFatura.nomeCartao}?`}
        message={`Voce esta prestes a marcar ${
          confirmPagarFatura.parcelas.length
        } parcela(s) como pagas, no valor total de ${formatarMoeda(
          confirmPagarFatura.parcelas.reduce(
            (acc, p) => acc + parseFloat(p.valor_parcela),
            0
          )
        )}. Gastos normais serao criados e isso impactara seu saldo. Deseja continuar?`}
        confirmLabel={`Sim, pagar ${confirmPagarFatura.parcelas.length} parcela(s)`}
        cancelLabel="Cancelar"
        onConfirm={confirmarPagarFatura}
        onCancel={() =>
          setConfirmPagarFatura({
            isOpen: false,
            cartaoId: null,
            nomeCartao: '',
            parcelas: [],
          })
        }
        type="success"
      />
    </div>
  );
};

export default RelatorioFaturasCartao;
