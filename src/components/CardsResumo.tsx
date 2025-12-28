import {
  BanknotesIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface CardsResumoProps {
  saldo: number;
  totalReceitas: number;
  totalDespesas: number;
  variacaoReceitas: number;
  variacaoDespesas: number;
  totalGastosFuturos: number;
  quantidadeGastosFuturos: number;
}

const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function CardsResumo({
  saldo,
  totalReceitas,
  totalDespesas,
  variacaoReceitas,
  variacaoDespesas,
  totalGastosFuturos,
  quantidadeGastosFuturos,
}: CardsResumoProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Saldo */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
        <BanknotesIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Atual</p>
          <h3
            className={`text-2xl font-bold ${
              saldo >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatarMoeda(saldo)}
          </h3>
        </div>
      </div>

      {/* Receitas */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-2">
          <ArrowUpCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Receitas</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatarMoeda(totalReceitas)}
            </h3>
          </div>
        </div>
        {/* Indicador de Tendencia */}
        {variacaoReceitas !== 0 && (
          <div
            className={`flex items-center gap-1 text-sm mt-2 ${
              variacaoReceitas > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {variacaoReceitas > 0 ? (
              <ArrowUpIcon className="w-4 h-4" />
            ) : (
              <ArrowDownIcon className="w-4 h-4" />
            )}
            <span className="font-medium">
              {Math.abs(variacaoReceitas).toFixed(1)}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
              vs mes anterior
            </span>
          </div>
        )}
      </div>

      {/* Despesas */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-2">
          <ArrowDownCircleIcon className="w-10 h-10 text-red-500 dark:text-red-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Despesas</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatarMoeda(totalDespesas)}
            </h3>
          </div>
        </div>
        {/* Indicador de Tendencia */}
        {variacaoDespesas !== 0 && (
          <div
            className={`flex items-center gap-1 text-sm mt-2 ${
              variacaoDespesas > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {variacaoDespesas > 0 ? (
              <ArrowUpIcon className="w-4 h-4" />
            ) : (
              <ArrowDownIcon className="w-4 h-4" />
            )}
            <span className="font-medium">
              {Math.abs(variacaoDespesas).toFixed(1)}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
              vs mes anterior
            </span>
          </div>
        )}
      </div>

      {/* Gastos Futuros */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-2">
          <ClockIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Gastos Futuros</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatarMoeda(totalGastosFuturos)}
            </h3>
          </div>
        </div>
        {/* Quantidade de parcelas pendentes */}
        {quantidadeGastosFuturos > 0 && (
          <div className="flex items-center gap-1 text-sm mt-2 text-blue-600 dark:text-blue-400">
            <span className="font-medium">
              {quantidadeGastosFuturos} parcela{quantidadeGastosFuturos !== 1 ? 's' : ''} pendente{quantidadeGastosFuturos !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
