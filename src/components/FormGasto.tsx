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
  const [valorDisplay, setValorDisplay] = useState('');

  const [formData, setFormData] = useState({
    descricao: gasto?.descricao || '',
    valor: gasto ? parseFloat(gasto.valor) : 0,
    categoria: gasto?.categoria || '',
    data: gasto?.data ? gasto.data.split('T')[0] : new Date().toISOString().split('T')[0],
  });

  // Formatar valor para exibição
  const formatarValorDisplay = (valor: number): string => {
    if (valor === 0) return '';
    const valorStr = valor.toFixed(2).replace('.', ',');
    const [inteiro, decimal] = valorStr.split(',');
    const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${inteiroFormatado},${decimal}`;
  };

  useEffect(() => {
    if (gasto) {
      const valorNumerico = parseFloat(gasto.valor);
      setFormData({
        descricao: gasto.descricao,
        valor: valorNumerico,
        categoria: gasto.categoria,
        data: gasto.data ? gasto.data.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      setValorDisplay(formatarValorDisplay(valorNumerico));
    }
  }, [gasto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Remove tudo exceto números e vírgula
    input = input.replace(/[^\d,]/g, '');

    // Garante apenas uma vírgula
    const parts = input.split(',');
    if (parts.length > 2) {
      input = parts[0] + ',' + parts.slice(1).join('');
    }

    // Limita a 2 casas decimais após a vírgula
    if (parts.length === 2 && parts[1].length > 2) {
      input = parts[0] + ',' + parts[1].slice(0, 2);
    }

    // Formata com separador de milhar na parte inteira
    if (input) {
      const [inteiro, decimal] = input.split(',');
      const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      input = decimal !== undefined ? `${inteiroFormatado},${decimal}` : inteiroFormatado;
    }

    setValorDisplay(input);

    // Converte para número para salvar no formData
    const valorNumerico = parseFloat(
      input.replace(/\./g, '').replace(',', '.')
    ) || 0;

    setFormData((prev) => ({
      ...prev,
      valor: valorNumerico,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações mais robustas
    if (!formData.descricao || formData.descricao.trim().length === 0) {
      setError('Por favor, informe uma descrição válida');
      return;
    }

    if (formData.descricao.trim().length < 3) {
      setError('A descrição deve ter pelo menos 3 caracteres');
      return;
    }

    if (formData.descricao.trim().length > 200) {
      setError('A descrição deve ter no máximo 200 caracteres');
      return;
    }

    if (!formData.valor || formData.valor <= 0) {
      setError('O valor deve ser maior que zero');
      return;
    }

    if (formData.valor > 999999999) {
      setError('O valor é muito alto. Máximo permitido: R$ 999.999.999,00');
      return;
    }

    if (!formData.categoria) {
      setError('Por favor, selecione uma categoria');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (gasto) {
        // Atualizar gasto existente
        const updateData: GastoUpdate = {
          descricao: formData.descricao.trim(),
          valor: formData.valor,
          categoria: formData.categoria,
          data: formData.data || null,
        };
        await apiService.updateGasto(gasto.id, updateData);
      } else {
        // Criar novo gasto
        const createData: GastoCreate = {
          descricao: formData.descricao.trim(),
          valor: formData.valor,
          categoria: formData.categoria,
          data: formData.data || null,
        };
        await apiService.createGasto(createData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Erro ao salvar gasto:', err);

      // Tratamento de erros mais específico
      let errorMessage = 'Erro ao salvar gasto. Tente novamente.';

      if (err.response) {
        // Erro da API
        if (err.response.status === 401) {
          errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
        } else if (err.response.status === 403) {
          errorMessage = 'Você não tem permissão para realizar esta ação.';
        } else if (err.response.status === 404) {
          errorMessage = 'Gasto não encontrado.';
        } else if (err.response.status === 500) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }

      setError(errorMessage);
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
    'Viagem',
    'Assinaturas',
    'Outros',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-3 animate-shake">
          <svg
            className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="font-medium">Erro</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrição <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          type="text"
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Ex: Conta de luz"
          required
        />
      </div>

      {/* Valor */}
      <div>
        <label htmlFor="valor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Valor (R$) <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          type="text"
          id="valor"
          name="valor"
          value={valorDisplay}
          onChange={handleValorChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="0,00"
          required
        />
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Categoria <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <select
          id="categoria"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
        <label htmlFor="data" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Data
        </label>
        <input
          type="date"
          id="data"
          name="data"
          value={formData.data}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Botões */}
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
              : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
          }`}
        >
          {loading ? 'Salvando...' : gasto ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};

export default FormGasto;
