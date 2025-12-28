import React, { useState, useEffect } from 'react';
import { apiService, CartaoCreditoResponse, CartaoCreditoCreate, CartaoCreditoUpdate } from '../services/api';

interface FormCartaoCreditoProps {
  cartao?: CartaoCreditoResponse | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const FormCartaoCredito: React.FC<FormCartaoCreditoProps> = ({ cartao, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nome_cartao: cartao?.nome_cartao || '',
    nome_titular: cartao?.nome_titular || '',
    dia_vencimento: cartao?.dia_vencimento || 10,
    limite: cartao?.limite ? parseFloat(cartao.limite) : '',
    cor: cartao?.cor || '#3B82F6',
    ativo: cartao?.ativo ?? true,
    observacoes: cartao?.observacoes || '',
  });

  useEffect(() => {
    if (cartao) {
      setFormData({
        nome_cartao: cartao.nome_cartao,
        nome_titular: cartao.nome_titular,
        dia_vencimento: cartao.dia_vencimento,
        limite: cartao.limite ? parseFloat(cartao.limite) : '',
        cor: cartao.cor || '#3B82F6',
        ativo: cartao.ativo,
        observacoes: cartao.observacoes || '',
      });
    }
  }, [cartao]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'dia_vencimento') {
      setFormData((prev) => ({
        ...prev,
        dia_vencimento: parseInt(value) || 1,
      }));
    } else if (name === 'limite') {
      setFormData((prev) => ({
        ...prev,
        limite: value === '' ? '' : parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validacoes
    if (!formData.nome_cartao || formData.nome_cartao.trim().length < 2) {
      setError('O nome do cartao deve ter pelo menos 2 caracteres');
      return;
    }

    if (!formData.nome_titular || formData.nome_titular.trim().length < 3) {
      setError('O nome do titular deve ter pelo menos 3 caracteres');
      return;
    }

    if (formData.dia_vencimento < 1 || formData.dia_vencimento > 31) {
      setError('O dia de vencimento deve estar entre 1 e 31');
      return;
    }

    if (formData.limite && formData.limite < 0) {
      setError('O limite nao pode ser negativo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (cartao) {
        // Atualizar cartao existente
        const updateData: CartaoCreditoUpdate = {
          nome_cartao: formData.nome_cartao.trim(),
          nome_titular: formData.nome_titular.trim(),
          dia_vencimento: formData.dia_vencimento,
          limite: formData.limite === '' ? null : formData.limite,
          cor: formData.cor || null,
          ativo: formData.ativo,
          observacoes: formData.observacoes || null,
        };
        await apiService.updateCartaoCredito(cartao.id, updateData);
      } else {
        // Criar novo cartao
        const createData: CartaoCreditoCreate = {
          nome_cartao: formData.nome_cartao.trim(),
          nome_titular: formData.nome_titular.trim(),
          dia_vencimento: formData.dia_vencimento,
          limite: formData.limite === '' ? null : formData.limite,
          cor: formData.cor || null,
          ativo: formData.ativo,
          observacoes: formData.observacoes || null,
        };
        await apiService.createCartaoCredito(createData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Erro ao salvar cartao:', err);

      let errorMessage = 'Erro ao salvar cartao. Tente novamente.';

      if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const coresPopulares = [
    { nome: 'Azul', valor: '#3B82F6' },
    { nome: 'Verde', valor: '#10B981' },
    { nome: 'Vermelho', valor: '#EF4444' },
    { nome: 'Roxo', valor: '#8B5CF6' },
    { nome: 'Laranja', valor: '#F59E0B' },
    { nome: 'Rosa', valor: '#EC4899' },
    { nome: 'Cinza', valor: '#6B7280' },
    { nome: 'Preto', valor: '#1F2937' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          <p className="font-medium">Erro</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Nome do Cartao */}
      <div>
        <label htmlFor="nome_cartao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nome do Cartao <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nome_cartao"
          name="nome_cartao"
          value={formData.nome_cartao}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Nubank, Inter, C6 Bank"
          required
        />
      </div>

      {/* Nome do Titular */}
      <div>
        <label htmlFor="nome_titular" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nome do Titular <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nome_titular"
          name="nome_titular"
          value={formData.nome_titular}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Seu nome completo"
          required
        />
      </div>

      {/* Dia de Vencimento */}
      <div>
        <label htmlFor="dia_vencimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dia de Vencimento <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="dia_vencimento"
          name="dia_vencimento"
          value={formData.dia_vencimento}
          onChange={handleChange}
          min="1"
          max="31"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Dia do mes em que a fatura vence (1-31)
        </p>
      </div>

      {/* Limite */}
      <div>
        <label htmlFor="limite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Limite (R$) <span className="text-gray-500 text-xs">(opcional)</span>
        </label>
        <input
          type="number"
          id="limite"
          name="limite"
          value={formData.limite}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
      </div>

      {/* Cor */}
      <div>
        <label htmlFor="cor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cor do Cartao
        </label>
        <div className="flex gap-2 mb-2">
          {coresPopulares.map((cor) => (
            <button
              key={cor.valor}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, cor: cor.valor }))}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.cor === cor.valor ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600'
              } transition-transform`}
              style={{ backgroundColor: cor.valor }}
              title={cor.nome}
            />
          ))}
        </div>
        <input
          type="color"
          id="cor"
          name="cor"
          value={formData.cor}
          onChange={handleChange}
          className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
        />
      </div>

      {/* Ativo */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="ativo"
          name="ativo"
          checked={formData.ativo}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="ativo" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Cartao ativo
        </label>
      </div>

      {/* Observacoes */}
      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Observacoes
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          rows={2}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Informacoes adicionais..."
        />
      </div>

      {/* Botoes */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 px-4 py-2 rounded-lg text-white transition ${
            loading
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
          }`}
        >
          {loading ? 'Salvando...' : cartao ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};

export default FormCartaoCredito;
