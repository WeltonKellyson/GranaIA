import React, { useState, useEffect } from 'react';
import { apiService, GastoResponse, GastoCreate, GastoUpdate } from '../services/api';

interface FormGastoProps {
  gasto?: GastoResponse | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const FormGasto: React.FC<FormGastoProps> = ({ gasto, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    descricao: gasto?.descricao || '',
    valor: gasto ? parseFloat(gasto.valor) : 0,
    categoria: gasto?.categoria || '',
    data: gasto?.data ? gasto.data.split('T')[0] : new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (gasto) {
      setFormData({
        descricao: gasto.descricao,
        valor: parseFloat(gasto.valor),
        categoria: gasto.categoria,
        data: gasto.data ? gasto.data.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [gasto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) || 0 : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descricao || !formData.valor || !formData.categoria) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.valor <= 0) {
      setError('O valor deve ser maior que zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (gasto) {
        // Atualizar gasto existente
        const updateData: GastoUpdate = {
          descricao: formData.descricao,
          valor: formData.valor,
          categoria: formData.categoria,
          data: formData.data || null,
        };
        await apiService.updateGasto(gasto.id, updateData);
      } else {
        // Criar novo gasto
        const createData: GastoCreate = {
          descricao: formData.descricao,
          valor: formData.valor,
          categoria: formData.categoria,
          data: formData.data || null,
        };
        await apiService.createGasto(createData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Erro ao salvar gasto:', err);
      setError(err.message || 'Erro ao salvar gasto');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Outros',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ex: Conta de luz"
          required
        />
      </div>

      {/* Valor */}
      <div>
        <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
          Valor (R$) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="valor"
          name="valor"
          value={formData.valor}
          onChange={handleChange}
          step="0.01"
          min="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="0.00"
          required
        />
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
          Categoria <span className="text-red-500">*</span>
        </label>
        <select
          id="categoria"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Data */}
      <div>
        <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
          Data
        </label>
        <input
          type="date"
          id="data"
          name="data"
          value={formData.data}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 px-4 py-2 rounded-lg text-white transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Salvando...' : gasto ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};

export default FormGasto;
