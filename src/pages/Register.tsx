import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import logonomegranaia from '../assets/logonomegranaia1.png';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    senha: '',
    confirmSenha: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handlePhoneChange = (value: string) => {
    setFormData({
      ...formData,
      phone: value,
    });
    setError('');
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.senha ||
      !formData.confirmSenha
    ) {
      setError('Por favor, preencha todos os campos');
      return false;
    }

    // Valida se o telefone brasileiro tem 13 dígitos (55 + 11 dígitos)
    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (!phoneNumbers.startsWith('55') || phoneNumbers.length !== 13) {
      setError('Por favor, insira um número de telefone brasileiro válido (DDD + 9 dígitos)');
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Remove formatação do telefone (já vem com código do país da biblioteca)
      const phoneNumbers = formData.phone.replace(/\D/g, '');

      await register({
        name: formData.name,
        email: formData.email,
        phone: phoneNumbers,
        senha: formData.senha,
      });

      // Salva o phone no localStorage
      localStorage.setItem('user_phone', phoneNumbers);

      // Cadastro realizado com sucesso, redireciona para login
      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      setError(err.message || 'Erro ao cadastrar. Tente novamente.');
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
            <h2 className="text-3xl font-bold text-gray-900">Criar conta</h2>
            <p className="mt-2 text-sm text-gray-600">
              Gerencie suas finanças de forma inteligente
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Digite seu nome completo"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Telefone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Telefone (com DDD)
                </label>
                <PhoneInput
                  country={'br'}
                  value={formData.phone}
                  onChange={handlePhoneChange}
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
                  searchPlaceholder="Buscar país..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Digite 11 dígitos: DDD + número (ex: (11) 987654321)
                </p>
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    name="senha"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.senha}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label
                  htmlFor="confirmSenha"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    id="confirmSenha"
                    name="confirmSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmSenha}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Digite a senha novamente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all`}
              >
                {loading ? 'Cadastrando...' : 'Criar conta'}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm text-center">
                <span className="text-gray-600">Já tem uma conta? </span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-green-600 hover:text-green-500 transition-colors"
                >
                  Fazer login
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
            Controle total das suas finanças
          </h2>
          <p className="text-green-100 text-base">
            O GranaIA oferece todas as ferramentas que você precisa para
            gerenciar suas finanças de forma simples e eficiente.
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
              <span>Registre gastos e receitas via WhatsApp</span>
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
              <span>Visualize relatórios detalhados em tempo real</span>
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
              <span>Receba insights e análises automáticas</span>
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
              <span>Alcance suas metas financeiras</span>
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
              className="px-6 py-2 rounded-lg font-semibold text-green-900 bg-white hover:bg-green-100 shadow-md transition-all duration-300"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
