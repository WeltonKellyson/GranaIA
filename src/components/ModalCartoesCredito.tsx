import React, { useState, useEffect } from 'react';
import { apiService, CartaoCreditoResponse, CartaoCreditoComGastos } from '../services/api';
import { CreditCardIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import FormCartaoCredito from './FormCartaoCredito';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';

interface ModalCartoesCreditoProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalCartoesCredito: React.FC<ModalCartoesCreditoProps> = ({ isOpen, onClose }) => {
  const [cartoes, setCartoes] = useState<CartaoCreditoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCartao, setEditingCartao] = useState<CartaoCreditoResponse | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; nome: string }>({
    isOpen: false,
    id: '',
    nome: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const loadCartoes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCartoesCredito({ page_size: 100 });
      setCartoes(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar cartoes:', error);
      setToast({ message: 'Erro ao carregar cartoes. Tente novamente.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCartoes();
    }
  }, [isOpen]);

  const handleAddNew = () => {
    setEditingCartao(null);
    setShowForm(true);
  };

  const handleEdit = (cartao: CartaoCreditoResponse) => {
    setEditingCartao(cartao);
    setShowForm(true);
  };

  const handleDelete = (cartao: CartaoCreditoResponse) => {
    setConfirmDelete({ isOpen: true, id: cartao.id, nome: cartao.nome_cartao });
  };

  const confirmarDelete = async () => {
    try {
      await apiService.deleteCartaoCredito(confirmDelete.id);
      setToast({ message: 'Cartao deletado com sucesso!', type: 'success' });
      await loadCartoes();
    } catch (error: any) {
      console.error('Erro ao deletar cartao:', error);
      setToast({ message: error.message || 'Erro ao deletar cartao. Tente novamente.', type: 'error' });
    } finally {
      setConfirmDelete({ isOpen: false, id: '', nome: '' });
    }
  };

  const cancelarDelete = () => {
    setConfirmDelete({ isOpen: false, id: '', nome: '' });
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingCartao(null);
    const message = editingCartao ? 'Cartao atualizado com sucesso!' : 'Cartao criado com sucesso!';
    setToast({ message, type: 'success' });
    await loadCartoes();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCartao(null);
  };

  const formatarMoeda = (valor: string | null): string => {
    if (!valor) return 'Sem limite';
    const num = parseFloat(valor);
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showForm}
        onClose={onClose}
        title="Meus Cartoes de Credito"
        size="xl"
      >
        <div className="space-y-4">
          {/* Botao Adicionar */}
          <button
            onClick={handleAddNew}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Novo Cartao
          </button>

          {/* Loading */}
          {loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Carregando cartoes...
            </div>
          )}

          {/* Lista de Cartoes */}
          {!loading && cartoes.length === 0 && (
            <div className="text-center py-12">
              <CreditCardIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nenhum cartao cadastrado
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Adicione seu primeiro cartao de credito para comecar
              </p>
            </div>
          )}

          {!loading && cartoes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cartoes.map((cartao) => (
                <div
                  key={cartao.id}
                  className="relative border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition"
                  style={{
                    borderLeftWidth: '6px',
                    borderLeftColor: cartao.cor || '#3B82F6',
                  }}
                >
                  {/* Badge de Status */}
                  {!cartao.ativo && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      Inativo
                    </span>
                  )}

                  {/* Conteudo */}
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {cartao.nome_cartao}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {cartao.nome_titular}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Vencimento:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Todo dia {cartao.dia_vencimento}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Limite:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatarMoeda(cartao.limite)}
                        </span>
                      </div>
                    </div>

                    {cartao.observacoes && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                        {cartao.observacoes}
                      </p>
                    )}
                  </div>

                  {/* Acoes */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEdit(cartao)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cartao)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal do Formulario */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingCartao ? 'Editar Cartao' : 'Novo Cartao'}
      >
        <FormCartaoCredito
          cartao={editingCartao}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Dialog de Confirmacao */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Deletar Cartao?"
        message={`Tem certeza que deseja deletar o cartao "${confirmDelete.nome}"? Os gastos futuros associados a este cartao terao o campo de cartao removido, mas nao serao deletados.`}
        confirmLabel="Sim, deletar"
        cancelLabel="Cancelar"
        onConfirm={confirmarDelete}
        onCancel={cancelarDelete}
        type="danger"
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default ModalCartoesCredito;
