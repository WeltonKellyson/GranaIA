import React, { useState } from 'react';
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

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login efetuado');
    navigate('/dashboard');
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
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email ou nome de usuário <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="seu@email.com ou nome de usuário"
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
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LockClosedIcon className="w-5 h-5" />
              Entrar
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
              Conheça nossos planos e comece com 7 dias grátis!
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-blue-500 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
            >
              Ver Planos e Criar Conta
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
        </div>
      </div>
    </div>
  );
}
