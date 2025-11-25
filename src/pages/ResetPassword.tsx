import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import logonomegranaia from '../assets/logonomegranaia1.png';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    senha: '',
    confirmSenha: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verifica se tem token na URL
  useEffect(() => {
    if (!token) {
      setError('Token de recuperação não encontrado. Solicite um novo link.');
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.senha || !formData.confirmSenha) {
      setError('Por favor, preencha todos os campos');
      return false;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.senha !== formData.confirmSenha) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Token inválido. Solicite um novo link de recuperação.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://granaiaapi.weltonkellyson.com.br/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: formData.senha,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erro ao redefinir senha');
      }

      // Sucesso
      alert('Senha redefinida com sucesso! Você já pode fazer login com a nova senha.');
      navigate('/login');
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img
              src={logonomegranaia}
              alt="Logo GranaIA"
              className="w-64 md:w-72 mx-auto mb-4 transition-transform duration-300 hover:scale-105"
            />
            <h2 className="text-3xl font-bold text-gray-900">Redefinir Senha</h2>
            <p className="mt-2 text-sm text-gray-600">
              Digite sua nova senha abaixo
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Nova Senha */}
              <div>
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    name="senha"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.senha}
                    onChange={handleChange}
                    disabled={!token}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={!token}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label
                  htmlFor="confirmSenha"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="confirmSenha"
                    name="confirmSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmSenha}
                    onChange={handleChange}
                    disabled={!token}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Digite a senha novamente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={!token}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !token}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  loading || !token
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all`}
              >
                <LockClosedIcon className="h-5 w-5 mr-2" />
                {loading ? 'Redefinindo senha...' : 'Redefinir Senha'}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm text-center">
                <span className="text-gray-600">Lembrou sua senha? </span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-green-600 hover:text-green-500 transition-colors"
                >
                  Voltar para login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ==== LADO DIREITO (INFORMAÇÕES) ==== */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center text-white px-12 bg-gradient-to-br from-emerald-900 via-emerald-700 to-green-600">
        <div className="max-w-lg mx-auto space-y-5">
          <h2 className="text-4xl font-bold leading-snug">
            Recupere o acesso à sua conta
          </h2>
          <p className="text-green-100 text-base">
            Defina uma nova senha segura e volte a gerenciar suas finanças com facilidade.
          </p>

          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Use uma senha forte com pelo menos 6 caracteres</span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Combine letras, números e caracteres especiais</span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Evite usar informações pessoais óbvias</span>
            </li>
          </ul>

          <div className="mt-6 border border-green-300 rounded-lg p-4 text-green-50 text-sm flex items-center justify-center text-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            <span>
              Sua nova senha será criptografada com segurança de nível bancário
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
