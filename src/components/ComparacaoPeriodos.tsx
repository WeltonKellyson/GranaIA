import { useState } from 'react';

interface Transacao {
  tipo: 'Receita' | 'Despesa';
  valor: number;
  data: string;
}

interface ComparacaoPeriodosProps {
  todasTransacoes: Transacao[];
}

const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function ComparacaoPeriodos({
  todasTransacoes,
}: ComparacaoPeriodosProps) {
  const [mostrarComparacao, setMostrarComparacao] = useState(false);

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

  // Dados mês atual
  const dadosMesAtual = todasTransacoes.filter((t) => {
    const data = new Date(t.data);
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  });

  // Dados mês anterior
  const dadosMesAnterior = todasTransacoes.filter((t) => {
    const data = new Date(t.data);
    return (
      data.getMonth() === mesAnterior && data.getFullYear() === anoMesAnterior
    );
  });

  const calcularResumo = (transacoes: Transacao[]) => ({
    receitas: transacoes
      .filter((t) => t.tipo === 'Receita')
      .reduce((acc, t) => acc + t.valor, 0),
    despesas: transacoes
      .filter((t) => t.tipo === 'Despesa')
      .reduce((acc, t) => acc + t.valor, 0),
    saldo:
      transacoes
        .filter((t) => t.tipo === 'Receita')
        .reduce((acc, t) => acc + t.valor, 0) -
      transacoes
        .filter((t) => t.tipo === 'Despesa')
        .reduce((acc, t) => acc + t.valor, 0),
  });

  const resumoAtual = calcularResumo(dadosMesAtual);
  const resumoAnterior = calcularResumo(dadosMesAnterior);

  const meses = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Comparação de Períodos
        </h2>
        <button
          onClick={() => setMostrarComparacao(!mostrarComparacao)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition"
        >
          {mostrarComparacao ? 'Ocultar' : 'Mostrar'} Comparação
        </button>
      </div>

      {mostrarComparacao && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Mês Anterior */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
              {meses[mesAnterior]} {anoMesAnterior}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Receitas:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatarMoeda(resumoAnterior.receitas)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Despesas:
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatarMoeda(resumoAnterior.despesas)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Saldo:
                </span>
                <span
                  className={`font-bold ${
                    resumoAnterior.saldo >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatarMoeda(resumoAnterior.saldo)}
                </span>
              </div>
            </div>
          </div>

          {/* Mês Atual */}
          <div className="border-2 border-green-500 dark:border-green-400 rounded-lg p-4 bg-green-50 dark:bg-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
              {meses[mesAtual]} {anoAtual}{' '}
              <span className="text-xs text-green-600 dark:text-green-400">
                (Atual)
              </span>
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Receitas:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatarMoeda(resumoAtual.receitas)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Despesas:
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatarMoeda(resumoAtual.despesas)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-green-300 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Saldo:
                </span>
                <span
                  className={`font-bold ${
                    resumoAtual.saldo >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatarMoeda(resumoAtual.saldo)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
