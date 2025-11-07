import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);
  return (
    <div className="bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 max-w-7xl mx-auto">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Controle suas finanças com a <span className="text-blue-600">GranaIA</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            A inteligência que ajuda você a gerenciar seu dinheiro de forma simples, 
            automática e pelo WhatsApp.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Começar agora – grátis por 7 dias
          </button>
        </div>
        <div className="flex-1 mt-10 md:mt-0 flex justify-center">
          <img
            src="/assets/whats.png"
            alt="Demonstração GranaIA"
            className="rounded-lg shadow-lg w-80 md:w-96"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 px-10 text-center">
        <h2 className="text-3xl font-semibold mb-4">Controle financeiro tão fácil quanto enviar uma mensagem</h2>
        <p className="text-gray-600 mb-10">Registre despesas, receitas e contas diretamente pelo WhatsApp — em texto ou voz.</p>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div>
            <h3 className="font-bold text-xl mb-2">📱 Registro por WhatsApp</h3>
            <p>Envie mensagens e registre suas transações instantaneamente.</p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">📊 Relatórios automáticos</h3>
            <p>Visualize entradas, saídas e gráficos atualizados em tempo real.</p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">🔐 Segurança bancária</h3>
            <p>Seus dados são protegidos com criptografia de nível bancário.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-100 py-16 px-10 text-center">
        <h2 className="text-3xl font-semibold mb-8">Planos para todos os perfis</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <p className="text-gray-500 mb-4">Ideal para autônomos e MEIs</p>
            <p className="text-4xl font-bold mb-4">R$29<span className="text-lg">/mês</span></p>
            <button className="bg-blue-600 text-white w-full">Assinar</button>
          </div>
          <div className="bg-blue-600 text-white shadow-md p-6 rounded-lg transform scale-105">
            <h3 className="text-2xl font-bold mb-2">Essentials</h3>
            <p className="mb-4">O mais popular, com 7 dias grátis</p>
            <p className="text-4xl font-bold mb-4">R$59<span className="text-lg">/mês</span></p>
            <button className="bg-white text-blue-600 font-semibold w-full">Testar grátis</button>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-gray-500 mb-4">Para empresas em crescimento</p>
            <p className="text-4xl font-bold mb-4">R$99<span className="text-lg">/mês</span></p>
            <button className="bg-blue-600 text-white w-full">Assinar</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <p>© 2025 GranaIA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
