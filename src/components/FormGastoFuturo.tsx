import React, { useState, useEffect } from 'react';
import { apiService, GastoFuturoResponse, GastoFuturoCreate, GastoFuturoUpdate, CartaoCreditoResponse } from '../services/api';
import { CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';

interface FormGastoFuturoProps {
  gastoFuturo?: GastoFuturoResponse | null;
  onSuccess: () => void;
  onCancel: () => void;
  onManageCartoes?: () => void;
}

const FormGastoFuturo: React.FC<FormGastoFuturoProps> = ({ gastoFuturo, onSuccess, onCancel, onManageCartoes }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [valorTotalDisplay, setValorTotalDisplay] = useState('');
  const [valorParcelaDisplay, setValorParcelaDisplay] = useState('');
  const [cartoes, setCartoes] = useState<CartaoCreditoResponse[]>([]);
  const [loadingCartoes, setLoadingCartoes] = useState(true);

  const [formData, setFormData] = useState({
    descricao: gastoFuturo?.descricao || '',
    valor_total: gastoFuturo ? parseFloat(gastoFuturo.valor_total) : 0,
    categoria: gastoFuturo?.categoria || '',
    data_compra: gastoFuturo?.data_compra ? gastoFuturo.data_compra.split('T')[0] : new Date().toISOString().split('T')[0],
    data_vencimento: gastoFuturo?.data_vencimento ? gastoFuturo.data_vencimento.split('T')[0] : '',
    cartao_credito_id: gastoFuturo?.cartao_credito_id || '',
    numero_parcelas: gastoFuturo?.numero_parcelas || 1,
    valor_parcela: gastoFuturo?.valor_parcela ? parseFloat(gastoFuturo.valor_parcela) : 0,
    metodo_pagamento: gastoFuturo?.metodo_pagamento || 'credito',
    observacoes: gastoFuturo?.observacoes || '',
  });

  // Formatar valor para exibicao
  const formatarValorDisplay = (valor: number): string => {
    if (valor === 0) return '';
    const valorStr = valor.toFixed(2).replace('.', ',');
    const [inteiro, decimal] = valorStr.split(',');
    const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${inteiroFormatado},${decimal}`;
  };

  // Carregar cartoes de credito
  useEffect(() => {
    const loadCartoes = async () => {
      try {
        setLoadingCartoes(true);
        const response = await apiService.getCartoesCredito({ ativo: true, page_size: 100 });
        setCartoes(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar cartoes:', error);
      } finally {
        setLoadingCartoes(false);
      }
    };
    loadCartoes();
  }, []);

  useEffect(() => {
    if (gastoFuturo) {
      const valorTotalNumerico = parseFloat(gastoFuturo.valor_total);
      const valorParcelaNumerico = gastoFuturo.valor_parcela ? parseFloat(gastoFuturo.valor_parcela) : 0;
      setFormData({
        descricao: gastoFuturo.descricao,
        valor_total: valorTotalNumerico,
        categoria: gastoFuturo.categoria,
        data_compra: gastoFuturo.data_compra ? gastoFuturo.data_compra.split('T')[0] : new Date().toISOString().split('T')[0],
        data_vencimento: gastoFuturo.data_vencimento ? gastoFuturo.data_vencimento.split('T')[0] : '',
        cartao_credito_id: gastoFuturo.cartao_credito_id || '',
        numero_parcelas: gastoFuturo.numero_parcelas || 1,
        valor_parcela: valorParcelaNumerico,
        metodo_pagamento: gastoFuturo.metodo_pagamento,
        observacoes: gastoFuturo.observacoes || '',
      });
      setValorTotalDisplay(formatarValorDisplay(valorTotalNumerico));
      if (valorParcelaNumerico > 0) {
        setValorParcelaDisplay(formatarValorDisplay(valorParcelaNumerico));
      }
    }
  }, [gastoFuturo]);

  // Calcula valor da parcela automaticamente quando muda valor total ou numero de parcelas
  useEffect(() => {
    if (formData.numero_parcelas > 1 && formData.valor_total > 0) {
      const valorParcela = formData.valor_total / formData.numero_parcelas;
      setFormData(prev => ({
        ...prev,
        valor_parcela: valorParcela,
        metodo_pagamento: 'parcelado',
      }));
      setValorParcelaDisplay(formatarValorDisplay(valorParcela));
    } else {
      setFormData(prev => ({
        ...prev,
        valor_parcela: 0,
      }));
      setValorParcelaDisplay('');
    }
  }, [formData.numero_parcelas, formData.valor_total]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'numero_parcelas') {
      const parcelas = parseInt(value) || 1;
      setFormData((prev) => ({
        ...prev,
        numero_parcelas: parcelas,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };

  const handleValorTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Remove tudo exceto numeros e virgula
    input = input.replace(/[^\d,]/g, '');

    // Garante apenas uma virgula
    const parts = input.split(',');
    if (parts.length > 2) {
      input = parts[0] + ',' + parts.slice(1).join('');
    }

    // Limita a 2 casas decimais apos a virgula
    if (parts.length === 2 && parts[1].length > 2) {
      input = parts[0] + ',' + parts[1].slice(0, 2);
    }

    // Formata com separador de milhar na parte inteira
    if (input) {
      const [inteiro, decimal] = input.split(',');
      const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      input = decimal !== undefined ? `${inteiroFormatado},${decimal}` : inteiroFormatado;
    }

    setValorTotalDisplay(input);

    // Converte para numero para salvar no formData
    const valorNumerico = parseFloat(
      input.replace(/\./g, '').replace(',', '.')
    ) || 0;

    setFormData((prev) => ({
      ...prev,
      valor_total: valorNumerico,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validacoes
    if (!formData.descricao || formData.descricao.trim().length === 0) {
      setError('Por favor, informe uma descricao valida');
      return;
    }

    if (formData.descricao.trim().length < 3) {
      setError('A descricao deve ter pelo menos 3 caracteres');
      return;
    }

    if (formData.descricao.trim().length > 500) {
      setError('A descricao deve ter no maximo 500 caracteres');
      return;
    }

    if (!formData.valor_total || formData.valor_total <= 0) {
      setError('O valor total deve ser maior que zero');
      return;
    }

    if (formData.valor_total > 999999999) {
      setError('O valor e muito alto. Maximo permitido: R$ 999.999.999,00');
      return;
    }

    if (!formData.categoria) {
      setError('Por favor, selecione uma categoria');
      return;
    }

    // Validacao: cartao OU data de vencimento deve ser fornecido
    if (!formData.cartao_credito_id && !formData.data_vencimento) {
      setError('Por favor, selecione um cartao de credito OU informe a data de vencimento manualmente');
      return;
    }

    if (formData.numero_parcelas < 1) {
      setError('O numero de parcelas deve ser maior que zero');
      return;
    }

    if (formData.numero_parcelas > 100) {
      setError('O numero de parcelas nao pode ser maior que 100');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (gastoFuturo) {
        // Atualizar gasto futuro existente
        const updateData: GastoFuturoUpdate = {
          descricao: formData.descricao.trim(),
          valor_total: formData.valor_total,
          categoria: formData.categoria,
          data_compra: formData.data_compra || null,
          data_vencimento: formData.data_vencimento || null,
          numero_parcelas: formData.numero_parcelas,
          valor_parcela: formData.numero_parcelas > 1 ? formData.valor_parcela : null,
          metodo_pagamento: formData.metodo_pagamento as 'credito' | 'debito_futuro' | 'parcelado',
          observacoes: formData.observacoes || null,
        };
        await apiService.updateGastoFuturo(gastoFuturo.id, updateData);
      } else {
        // Criar novo gasto futuro
        const createData: GastoFuturoCreate = {
          descricao: formData.descricao.trim(),
          valor_total: formData.valor_total,
          categoria: formData.categoria,
          data_compra: formData.data_compra || null,
          data_vencimento: formData.data_vencimento || null,
          cartao_credito_id: formData.cartao_credito_id || null,
          numero_parcelas: formData.numero_parcelas,
          valor_parcela: formData.numero_parcelas > 1 ? formData.valor_parcela : null,
          metodo_pagamento: formData.metodo_pagamento as 'credito' | 'debito_futuro' | 'parcelado',
          observacoes: formData.observacoes || null,
        };
        await apiService.createGastoFuturo(createData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Erro ao salvar gasto futuro:', err);

      let errorMessage = 'Erro ao salvar gasto futuro. Tente novamente.';

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Sessao expirada. Por favor, faca login novamente.';
        } else if (err.response.status === 403) {
          errorMessage = 'Voce nao tem permissao para realizar esta acao. E necessario ter o premium ativo.';
        } else if (err.response.status === 404) {
          errorMessage = 'Gasto futuro nao encontrado.';
        } else if (err.response.status === 500) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Erro de conexao. Verifique sua internet e tente novamente.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    'Alimentacao',
    'Transporte',
    'Moradia',
    'Saude',
    'Educacao',
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

      {/* Descricao */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descricao <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          type="text"
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Ex: Compra no cartao de credito"
          required
        />
      </div>

      {/* Valor Total */}
      <div>
        <label htmlFor="valor_total" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Valor Total (R$) <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          type="text"
          id="valor_total"
          name="valor_total"
          value={valorTotalDisplay}
          onChange={handleValorTotalChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
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
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Cartao de Credito */}
      <div>
        <label htmlFor="cartao_credito_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <CreditCardIcon className="w-4 h-4 inline mr-1" />
          Cartao de Credito
        </label>
        {loadingCartoes ? (
          <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg">
            Carregando cartoes...
          </div>
        ) : (
          <>
            <select
              id="cartao_credito_id"
              name="cartao_credito_id"
              value={formData.cartao_credito_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Nenhum (informar data de vencimento manual)</option>
              {cartoes.map((cartao) => (
                <option key={cartao.id} value={cartao.id}>
                  {cartao.nome_cartao} - Vence dia {cartao.dia_vencimento}
                </option>
              ))}
            </select>
            {onManageCartoes && (
              <button
                type="button"
                onClick={onManageCartoes}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Gerenciar meus cartoes
              </button>
            )}
          </>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.cartao_credito_id
            ? 'A data de vencimento sera calculada automaticamente baseada no cartao selecionado'
            : 'Se nao selecionar um cartao, vocee deve informar a data de vencimento manualmente abaixo'}
        </p>
      </div>

      {/* Numero de Parcelas */}
      <div>
        <label htmlFor="numero_parcelas" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Numero de Parcelas
        </label>
        <input
          type="number"
          id="numero_parcelas"
          name="numero_parcelas"
          value={formData.numero_parcelas}
          onChange={handleChange}
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          1 = a vista, 2 ou mais = parcelado
        </p>
      </div>

      {/* Valor da Parcela (somente leitura se parcelado) */}
      {formData.numero_parcelas > 1 && (
        <div>
          <label htmlFor="valor_parcela_display" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Valor de Cada Parcela (R$)
          </label>
          <input
            type="text"
            id="valor_parcela_display"
            value={valorParcelaDisplay}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Calculado automaticamente: {formatarValorDisplay(formData.valor_total)}  {formData.numero_parcelas}
          </p>
        </div>
      )}

      {/* Metodo de Pagamento */}
      <div>
        <label htmlFor="metodo_pagamento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Metodo de Pagamento
        </label>
        <select
          id="metodo_pagamento"
          name="metodo_pagamento"
          value={formData.metodo_pagamento}
          onChange={handleChange}
          disabled={formData.numero_parcelas > 1}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formData.numero_parcelas > 1 ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
          }`}
        >
          <option value="credito">Credito</option>
          <option value="debito_futuro">Debito Futuro</option>
          <option value="parcelado">Parcelado</option>
        </select>
        {formData.numero_parcelas > 1 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Automaticamente definido como "Parcelado" quando ha mais de 1 parcela
          </p>
        )}
      </div>

      {/* Data da Compra */}
      <div>
        <label htmlFor="data_compra" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Data da Compra
        </label>
        <input
          type="date"
          id="data_compra"
          name="data_compra"
          value={formData.data_compra}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Data de Vencimento */}
      {!formData.cartao_credito_id && (
        <div>
          <label htmlFor="data_vencimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data de Vencimento <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="date"
            id="data_vencimento"
            name="data_vencimento"
            value={formData.data_vencimento}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.numero_parcelas > 1
              ? 'Data de vencimento da primeira parcela. As demais serao criadas automaticamente mes a mes.'
              : 'Data em que o pagamento vence'}
          </p>
        </div>
      )}

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
          rows={3}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          placeholder="Informacoes adicionais sobre esta compra..."
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.observacoes.length}/1000 caracteres
        </p>
      </div>

      {/* Informacao sobre impacto no saldo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
        <p className="font-medium">i Importante</p>
        <p className="text-xs mt-1">
          Este gasto futuro <strong>nao ira impactar seu saldo imediatamente</strong>. Apenas quando vocee marca-lo como pago e que sera criado um gasto normal que reduzira seu saldo.
        </p>
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
          {loading ? 'Salvando...' : gastoFuturo ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};

export default FormGastoFuturo;
