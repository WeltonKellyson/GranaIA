import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PremiumExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  premiumUntil?: string | null;
}

const PremiumExpiredModal: React.FC<PremiumExpiredModalProps> = ({ isOpen, onClose, premiumUntil }) => {
  if (!isOpen) return null;

  const handleGoToPlans = () => {
    // Redireciona para a página inicial onde estão os planos
    window.location.href = '/';
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Plano Expirado
          </h2>

          {/* Description */}
          <div className="text-center text-gray-600 mb-6 space-y-2">
            <p>
              Seu acesso ao <strong>GranaIA</strong> expirou em{' '}
              <span className="font-semibold text-gray-900">{formatDate(premiumUntil)}</span>.
            </p>
            <p className="text-sm">
              Para continuar usando o sistema e ter acesso a:
            </p>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Registro de gastos e receitas</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Visualização de dados financeiros</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Dashboard com gráficos e relatórios</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Assistente de IA (planos IA)</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button
              onClick={handleGoToPlans}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Ver Planos e Assinar
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Fechar
            </button>
          </div>

          {/* Additional info */}
          <p className="text-xs text-center text-gray-500 mt-4">
            Escolha o plano ideal para suas necessidades e continue gerenciando suas finanças!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumExpiredModal;
