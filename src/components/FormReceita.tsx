import React, { useState, useEffect } from 'react';
import { apiService, ReceitaResponse, ReceitaCreate, ReceitaUpdate } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface FormReceitaProps {
  receita?: ReceitaResponse | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const FormReceita: React.FC<FormReceitaProps> = ({ receita, onSuccess, onCancel }) => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    descricao: receita?.descricao || '',
    valor: receita ? parseFloat(receita.valor) : 0,
    categoria: receita?.categoria || '',
    origem: receita?.origem || '',
    data: receita?.data ? receita.data.split('T')[0] : new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (receita) {
      setFormData({
        descricao: receita.descricao,
        valor: parseFloat(receita.valor),
        categoria: receita.categoria,
        origem: receita.origem || '',
        data: receita.data ? receita.data.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [receita]);

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
      if (receita) {
        // Atualizar receita existente
        const updateData: ReceitaUpdate = {
          descricao: formData.descricao,
          valor: formData.valor,
          categoria: formData.categoria,
          origem: formData.origem || null,
          data: formData.data || null,
        };
        await apiService.updateReceita(receita.id, updateData);
      } else {
        // Criar nova receita
        if (!userProfile?.remotejid) {
          setError('Erro ao identificar usuário');
          return;
        }

        const createData: ReceitaCreate = {
          descricao: formData.descricao,
          valor: formData.valor,
          categoria: formData.categoria,
          origem: formData.origem || null,
          data: formData.data || null,
          usuario: userProfile.remotejid,
        };
        await apiService.createReceita(createData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Erro ao salvar receita:', err);
      setError(err.message || 'Erro ao salvar receita');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    'Salário',
    'Freelance',
    'Investimentos',
    'Vendas',
    'Bonificação',
    'Aluguel',
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
          placeholder="Ex: Salário mensal"
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

      {/* Origem */}
      <div>
        <label htmlFor="origem" className="block text-sm font-medium text-gray-700 mb-1">
          Origem
        </label>
        <input
          type="text"
          id="origem"
          name="origem"
          value={formData.origem}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ex: Empresa XYZ"
        />
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
          {loading ? 'Salvando...' : receita ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};

export default FormReceita;
