import React, { useState, useEffect } from 'react';
import { PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Meta {
  categoria: string;
  valor: number;
}

interface MetasGastosProps {
  gastosPorCategoria: { name: string; value: number }[];
  mesReferencia: string;
}

const MetasGastos: React.FC<MetasGastosProps> = ({ gastosPorCategoria, mesReferencia }) => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null);
  const [valorTemp, setValorTemp] = useState('');
  const [mostrarMetas, setMostrarMetas] = useState(false);

  // Carregar metas do localStorage
  useEffect(() => {
    const metasSalvas = localStorage.getItem('metasGastos');
    if (metasSalvas) {
      setMetas(JSON.parse(metasSalvas));
    }
  }, []);

  // Salvar metas no localStorage
  const salvarMetas = (novasMetas: Meta[]) => {
    setMetas(novasMetas);
    localStorage.setItem('metasGastos', JSON.stringify(novasMetas));
  };

  const iniciarEdicao = (categoria: string) => {
    const metaExistente = metas.find((m) => m.categoria === categoria);
    setEditandoCategoria(categoria);
    setValorTemp(metaExistente ? metaExistente.valor.toString() : '');
  };

  const salvarMeta = (categoria: string) => {
    const valor = parseFloat(valorTemp.replace(/\./g, '').replace(',', '.')) || 0;

    if (valor <= 0) {
      setEditandoCategoria(null);
      return;
    }

    const novasMetas = metas.filter((m) => m.categoria !== categoria);
    novasMetas.push({ categoria, valor });

    salvarMetas(novasMetas);
    setEditandoCategoria(null);
    setValorTemp('');
  };

  const removerMeta = (categoria: string) => {
    const novasMetas = metas.filter((m) => m.categoria !== categoria);
    salvarMetas(novasMetas);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    input = input.replace(/[^\d,]/g, '');
    const parts = input.split(',');
    if (parts.length > 2) {
      input = parts[0] + ',' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      input = parts[0] + ',' + parts[1].slice(0, 2);
    }
    if (input) {
      const [inteiro, decimal] = input.split(',');
      const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      input = decimal !== undefined ? `${inteiroFormatado},${decimal}` : inteiroFormatado;
    }
    setValorTemp(input);
  };

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const calcularPercentual = (gasto: number, meta: number): number => {
    return meta > 0 ? (gasto / meta) * 100 : 0;
  };

  const getCorBarra = (percentual: number): string => {
    if (percentual < 70) return 'bg-green-500';
    if (percentual < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (gastosPorCategoria.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Metas de Gastos</h2>
          <p className="text-xs text-gray-500 mt-1">
            Defina metas mensais para controlar seus gastos por categoria
          </p>
        </div>
        <button
          onClick={() => setMostrarMetas(!mostrarMetas)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition"
        >
          {mostrarMetas ? 'Ocultar' : 'Mostrar'} Metas
        </button>
      </div>

      {mostrarMetas && (
        <div className="space-y-4 mt-4">
          {gastosPorCategoria.map((gasto) => {
            const meta = metas.find((m) => m.categoria === gasto.name);
            const percentual = meta ? calcularPercentual(gasto.value, meta.valor) : 0;
            const isEditando = editandoCategoria === gasto.name;

            return (
              <div key={gasto.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">{gasto.name}</h3>
                  {!isEditando && (
                    <button
                      onClick={() => iniciarEdicao(gasto.name)}
                      className="p-1 hover:bg-gray-100 rounded transition"
                      title="Definir meta"
                    >
                      <PencilSquareIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>

                {isEditando ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={valorTemp}
                      onChange={handleValorChange}
                      placeholder="0,00"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => salvarMeta(gasto.name)}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                      title="Salvar"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditandoCategoria(null)}
                      className="p-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition"
                      title="Cancelar"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : meta ? (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        Gasto: {formatarMoeda(gasto.value)}
                      </span>
                      <span className="text-gray-600">
                        Meta: {formatarMoeda(meta.valor)}
                      </span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getCorBarra(percentual)} transition-all duration-500`}
                        style={{ width: `${Math.min(percentual, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm font-medium ${
                        percentual < 70 ? 'text-green-600' :
                        percentual < 90 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {percentual.toFixed(1)}% da meta
                      </span>
                      <button
                        onClick={() => removerMeta(gasto.name)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remover meta
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Nenhuma meta definida. Clique no ícone para definir.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MetasGastos;
