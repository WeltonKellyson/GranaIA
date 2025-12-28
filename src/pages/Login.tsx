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
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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

  // Estados para a modal de esqueci senha
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    phone: '',
    confirmPhone: '',
  });
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Redireciona se ja estiver autenticado
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
      // O redirecionamento sera feito pelo useEffect quando isAuthenticated mudar
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      setError(err.message || 'Email ou senha incorretos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');

    // Validacao dos campos
    if (!forgotPasswordData.phone || !forgotPasswordData.confirmPhone) {
      setForgotPasswordError('Por favor, preencha ambos os campos de telefone');
      return;
    }

    // Valida se os telefones sao brasileiros (13 digitos: 55 + 11 digitos)
    const phone = forgotPasswordData.phone.replace(/\D/g, '');
    const confirmPhone = forgotPasswordData.confirmPhone.replace(/\D/g, '');

    if (!phone.startsWith('55') || phone.length !== 13) {
      setForgotPasswordError('Por favor, insira um numero de telefone brasileiro valido (DDD + 9 digitos)');
      return;
    }

    if (!confirmPhone.startsWith('55') || confirmPhone.length !== 13) {
      setForgotPasswordError('Por favor, confirme com um numero de telefone brasileiro valido');
      return;
    }

    // Verifica se os numeros sao iguais
    if (phone !== confirmPhone) {
      setForgotPasswordError('Os numeros de telefone nao coincidem');
      return;
    }

    setIsSendingReset(true);

    try {
      // Envia para o webhook
      const response = await fetch('https://n8n.weltonkellyson.com.br/webhook/eff233a6-b1e1-4bee-8388-4ff297a8cd1f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar solicitacao');
      }

      // Sucesso
      alert('Solicitacao de recuperacao enviada com sucesso! Voce recebera instrucoes em breve.');
      setShowForgotPasswordModal(false);
      setForgotPasswordData({ phone: '', confirmPhone: '' });
    } catch (err: any) {
      console.error('Erro ao enviar recuperacao:', err);
      setForgotPasswordError('Erro ao enviar solicitacao. Tente novamente.');
    } finally {
      setIsSendingReset(false);
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

        {/* Titulo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Gerencie suas financas
          </h1>
          <p className="text-gray-500 text-sm">
            Faca login ou crie sua conta para continuar
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

            {/* Botao Entrar */}
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
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Esqueci minha senha
            </button>
          </div>

          {/* Box Novo por aqui */}
          <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg p-4 mt-5 text-center">
            <p className="font-semibold mb-1 text-sm">Novo por aqui?</p>
            <p className="text-sm mb-3">
              Crie sua conta e comece a controlar suas financas!
            </p>
            <button
              onClick={() => navigate('/register')}
              className="w-full border border-blue-500 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Rodape */}
        <p className="text-xs text-gray-400 mt-4">
          Problemas para acessar?{' '}
          <a 
            href="https://chat.whatsapp.com/CicoYlY9JAv3SgpCRIz8Bk"
            target="_blank"
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline">
            Entre em contato
          </a>
        </p>
      </div>

      {/* ==== LADO DIREITO (INFORMACOES) ==== */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center text-white px-12 bg-gradient-to-br from-emerald-900 via-emerald-700 to-green-600">
        <div className="max-w-lg mx-auto space-y-5">
          <h2 className="text-3xl font-extrabold leading-snug">
            Controle total das suas financas
          </h2>
          <p className="text-green-100 text-sm">
            O GranaIA oferece todas as ferramentas que vocee precisa para
            gerenciar suas financas de forma simples e eficiente.
          </p>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <ChartBarIcon className="w-5 h-5 text-white" />
              Dashboard intuitivo com resumo das financas
            </li>
            <li className="flex items-center gap-3">
              <ChartBarIcon className="w-5 h-5 text-white" />
              Relatorios avancados e DRE automatico
            </li>
            <li className="flex items-center gap-3">
              <UsersIcon className="w-5 h-5 text-white" />
              Gestao inteligente na palma da sua mao
            </li>
            <li className="flex items-center gap-3">
              <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-white" />
              Integracao segura com WhatsApp
            </li>
          </ul>

          <div className="mt-6 border border-green-300 rounded-lg p-4 text-green-50 text-sm flex items-center justify-center text-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            <span>
              Seus dados estao protegidos com criptografia de nivel bancario
            </span>
          </div>
          {/* Botao Voltar / Ver Planos */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded-lg font-semibold text-green-900 bg-white hover:bg-green-100 shadow-md transition-all duration-300"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Esqueci Minha Senha */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Recuperar Senha</h3>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordData({ phone: '', confirmPhone: '' });
                  setForgotPasswordError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Digite seu numero de telefone para recuperar sua senha. Voce recebera instrucoes via WhatsApp.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              {forgotPasswordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {forgotPasswordError}
                </div>
              )}

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero de Telefone (com DDD) <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country={'br'}
                  value={forgotPasswordData.phone}
                  onChange={(value) => {
                    setForgotPasswordData({ ...forgotPasswordData, phone: value });
                    setForgotPasswordError('');
                  }}
                  inputProps={{
                    name: 'phone',
                    required: true,
                  }}
                  containerClass="w-full"
                  inputClass="w-full"
                  buttonClass="border-gray-300"
                  containerStyle={{
                    width: '100%',
                  }}
                  inputStyle={{
                    width: '100%',
                    height: '42px',
                    fontSize: '14px',
                    paddingLeft: '48px',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                  }}
                  buttonStyle={{
                    borderRadius: '0.5rem 0 0 0.5rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                  }}
                  dropdownStyle={{
                    borderRadius: '0.5rem',
                  }}
                  preferredCountries={['br', 'us', 'pt']}
                  enableSearch={true}
                  searchPlaceholder="Buscar pais..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Digite 11 digitos: DDD + numero (ex: (11) 987654321)
                </p>
              </div>

              {/* Confirmar Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Numero de Telefone <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country={'br'}
                  value={forgotPasswordData.confirmPhone}
                  onChange={(value) => {
                    setForgotPasswordData({ ...forgotPasswordData, confirmPhone: value });
                    setForgotPasswordError('');
                  }}
                  inputProps={{
                    name: 'confirmPhone',
                    required: true,
                  }}
                  containerClass="w-full"
                  inputClass="w-full"
                  buttonClass="border-gray-300"
                  containerStyle={{
                    width: '100%',
                  }}
                  inputStyle={{
                    width: '100%',
                    height: '42px',
                    fontSize: '14px',
                    paddingLeft: '48px',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                  }}
                  buttonStyle={{
                    borderRadius: '0.5rem 0 0 0.5rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                  }}
                  dropdownStyle={{
                    borderRadius: '0.5rem',
                  }}
                  preferredCountries={['br', 'us', 'pt']}
                  enableSearch={true}
                  searchPlaceholder="Buscar pais..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Digite o mesmo numero novamente
                </p>
              </div>

              {/* Botoes */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setForgotPasswordData({ phone: '', confirmPhone: '' });
                    setForgotPasswordError('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className={`flex-1 font-semibold py-2 rounded-lg transition ${
                    isSendingReset
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSendingReset ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
