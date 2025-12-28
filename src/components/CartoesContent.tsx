import React from 'react';
import { PlusIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import CardGastosFuturos from './CardGastosFuturos';
import GraficoEvolucaoGastosFuturos from './GraficoEvolucaoGastosFuturos';
import { GastoFuturoResponse, GastoFuturoDashboard } from '../services/api';

interface CartoesContentProps {
  // Dados
  gastosFuturos: GastoFuturoResponse[];
  gastoFuturoDashboard: GastoFuturoDashboard | null;

  // Handlers
  onNovoGastoFuturo: () => void;
  onMeusCartoes: () => void;
  onEditGastoFuturo: (gastoFuturo: GastoFuturoResponse) => void;
  onDuplicateGastoFuturo: (gastoFuturo: GastoFuturoResponse) => void;
  onDeleteGastoFuturo: (id: string) => Promise<void>;
  onMarcarGastoFuturoComoPago: (id: string) => Promise<void>;
  onMarcarParcelaComoPaga: (parcelaId: string) => Promise<void>;

  // Premium
  isPremiumActive: boolean;
  onPremiumExpired: () => void;
}

const CartoesContent: React.FC<CartoesContentProps> = ({
  gastosFuturos,
  gastoFuturoDashboard,
  onNovoGastoFuturo,
  onMeusCartoes,
  onEditGastoFuturo,
  onDuplicateGastoFuturo,
  onDeleteGastoFuturo,
  onMarcarGastoFuturoComoPago,
  onMarcarParcelaComoPaga,
  isPremiumActive,
  onPremiumExpired,
}) => {
  return (
    <div className="space-y-10">
      {/* ===== BOTOES DE ACAO ===== */}
      <section className="flex flex-wrap gap-3 justify-center md:justify-start">
        <button
          onClick={() => {
            if (!isPremiumActive) {
              onPremiumExpired();
              return;
            }
            onNovoGastoFuturo();
          }}
          disabled={!isPremiumActive}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium shadow-md transition ${
            isPremiumActive
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <PlusIcon className="w-5 h-5" />
          Novo Gasto Futuro
        </button>
        <button
          onClick={() => {
            if (!isPremiumActive) {
              onPremiumExpired();
              return;
            }
            onMeusCartoes();
          }}
          disabled={!isPremiumActive}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium shadow-md transition ${
            isPremiumActive
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CreditCardIcon className="w-5 h-5" />
          Meus Cartoes
        </button>
      </section>

      {/* ===== GRAFICO DE EVOLUCAO ===== */}
      <GraficoEvolucaoGastosFuturos gastosFuturos={gastosFuturos} />

      {/* ===== GASTOS FUTUROS ===== */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <CardGastosFuturos
          gastosFuturos={gastosFuturos}
          dashboard={gastoFuturoDashboard}
          onEdit={onEditGastoFuturo}
          onDuplicate={onDuplicateGastoFuturo}
          onDelete={onDeleteGastoFuturo}
          onMarcarComoPago={onMarcarGastoFuturoComoPago}
          onMarcarParcelaComoPaga={onMarcarParcelaComoPaga}
        />
      </section>
    </div>
  );
};

export default CartoesContent;
