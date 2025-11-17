import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import logonomegranaia from '../assets/logonomegranaia1.png';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.senha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      // O redirecionamento será feito pelo useEffect quando isAuthenticated mudar
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      setError(err.message || 'Email ou senha incorretos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* ==== LADO ESQUERDO (LOGIN) ==== */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white px-8 md:px-16 lg:px-20">
        {/* Logo */}
        <img
          src={logonomegranaia}
          alt="Logo GranaIA"
          className="w-64 md:w-72 mx-auto mb-4 transition-transform duration-300 hover:scale-105"
        />

        {/* Título */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Gerencie suas finanças
          </h1>
          <p className="text-gray-500 text-sm">
            Faça login ou crie sua conta para continuar
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">Login</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Sua senha"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <LockClosedIcon className="w-5 h-5" />
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Links */}
          <div className="text-center mt-3">
            <a
              href="#"
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Esqueci minha senha
            </a>
          </div>

          {/* Box Novo por aqui */}
          <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg p-4 mt-5 text-center">
            <p className="font-semibold mb-1 text-sm">Novo por aqui?</p>
            <p className="text-sm mb-3">
              Crie sua conta e comece a controlar suas finanças!
            </p>
            <button
              onClick={() => navigate('/register')}
              className="w-full border border-blue-500 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-xs text-gray-400 mt-4">
          Problemas para acessar?{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Entre em contato
          </a>
        </p>
      </div>

      {/* ==== LADO DIREITO (INFORMAÇÕES) ==== */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center text-white px-12 bg-gradient-to-br from-emerald-900 via-emerald-700 to-green-600">
        <div className="max-w-lg mx-auto space-y-5">
          <h2 className="text-3xl font-extrabold leading-snug">
            Controle total das suas finanças
          </h2>
          <p className="text-green-100 text-sm">
            O GranaIA oferece todas as ferramentas que você precisa para
            gerenciar suas finanças de forma simples e eficiente.
          </p>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <ChartBarIcon className="w-5 h-5 text-white" />
              Dashboard intuitivo com resumo das finanças
            </li>
            <li className="flex items-center gap-3">
              <ChartBarIcon className="w-5 h-5 text-white" />
              Relatórios avançados e DRE automático
            </li>
            <li className="flex items-center gap-3">
              <UsersIcon className="w-5 h-5 text-white" />
              Gestão inteligente na palma da sua mão
            </li>
            <li className="flex items-center gap-3">
              <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-white" />
              Integração segura com WhatsApp
            </li>
          </ul>

          <div className="mt-6 border border-green-300 rounded-lg p-4 text-green-50 text-sm flex items-center justify-center text-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            <span>
              Seus dados estão protegidos com criptografia de nível bancário
            </span>
          </div>
          {/* Botão Voltar / Ver Planos */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-1 rounded-lg font-semibold text-green-900 bg-white hover:bg-green-100 shadow-md transition-all duration-300"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
