import { useState } from "react";
import whats from "../assets/whats.png";
import logo from "../assets/logo.png";
import dash from "../assets/dash.png";
import nomelogo from "../assets/granaianomelogo.png";
import logogranaia from "../assets/logogranaia.png";
import logonome from "../assets/logonomegranaia.png";

export default function Home() {
  const [count, setCount] = useState(0);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    {
      question: "Preciso entender de finanças para usar?",
      answer:
        "Não! O GranaIA foi criado para ser simples. Basta falar ou digitar no WhatsApp como você já faz todos os dias. Por exemplo: 'Recebi 500 da cliente Maria' ou envie um áudio dizendo 'Paguei 150 de luz hoje'.",
    },
    {
      question: "E se eu não gostar?",
      answer:
        "Sem problemas! Você pode testar gratuitamente por 7 dias e cancelar quando quiser, sem taxas e sem compromisso.",
    },
    {
      question: "Funciona no celular?",
      answer:
        "Sim! Todo o controle é feito diretamente pelo WhatsApp, sem precisar baixar aplicativos adicionais.",
    },
    {
      question: "Meus dados ficam seguros?",
      answer:
        "Sim. Utilizamos criptografia AES-256 — o mesmo padrão usado por bancos — para garantir a segurança das suas informações.",
    },
    {
      question: "Como faço para registrar uma transação?",
      answer:
        "Basta enviar uma mensagem ou áudio com o valor e descrição, como 'Paguei 300 de aluguel'. O sistema entende e registra automaticamente.",
    },
    {
      question: "Posso consultar meu saldo a qualquer hora?",
      answer:
        "Pode sim! É só perguntar no WhatsApp: 'Qual meu saldo?' que o GranaIA responde instantaneamente com suas finanças atualizadas.",
    },
    {
      question: "E se eu precisar de ajuda?",
      answer:
        "Nosso suporte está disponível 24 horas por dia via WhatsApp, sempre pronto para te ajudar.",
    },
  ];

  return (
    <div className="relative bg-[#fafaf7] text-gray-900 scroll-smooth overflow-x-hidden">
      {/* ===== BOTÃO LOGIN FIXO ===== */}
      <button
        className="fixed top-6 right-8 bg-white border border-gray-200 shadow-md text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 hover:shadow-lg transition-all duration-300 z-50"
      >
        Login
      </button>

      {/* ===== HERO SECTION (100% VIEWPORT) ===== */}
      <section className="h-screen flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto px-6 md:px-12">
        {/* Logo */}
        <img
          src={logonome}
          alt="Logo GranaIA"
          className="w-280 md:w-320 mx-auto mb-2"
        />

        {/* Título principal */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
          Controle seu financeiro <br />
          <span className="text-green-600">direto do WhatsApp</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-lg text-gray-600 max-w-2xl">
          Simples, rápido e sem planilhas. Registre receitas, despesas e
          consulte sua saúde financeira pelo WhatsApp.
        </p>

        {/* CTA principal */}
        <button className="bg-green-600 hover:bg-green-700 transition-all duration-200 text-white px-10 py-4 rounded-xl font-semibold shadow-lg">
          Teste grátis por 7 dias
        </button>

        {/* Destaques */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mt-4">
          <div className="flex items-center gap-2">
            <span>🔒</span> <p>Segurança bancária AES-256</p>
          </div>
          <div className="flex items-center gap-2">
            <span>💬</span> <p>100% pelo WhatsApp</p>
          </div>
          <div className="flex items-center gap-2">
            <span>⚙️</span> <p>Configuração em 2 minutos</p>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO 2 - COMO FUNCIONA ===== */}
      <section className="h-screen bg-gray-50 flex flex-col md:flex-row items-center justify-center px-8 md:px-16 lg:px-24 gap-12">
        {/* Texto (lado esquerdo) */}
        <div className="flex-1 text-center md:text-left space-y-8 max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1 rounded-full text-sm font-medium shadow-sm">
            <span>💬</span>
            <span>Como funciona</span>
          </div>

          {/* Título */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Controle financeiro tão fácil quanto{" "}
            <span className="text-green-600">enviar uma mensagem</span>
          </h2>

          {/* Subtítulo */}
          <p className="text-gray-600 text-lg">
            Lance suas despesas, receitas e contas usando voz ou texto pelo WhatsApp.
            O GranaIA processa tudo automaticamente e organiza suas finanças em segundos.
          </p>

          {/* Itens explicativos */}
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 p-2 rounded-full text-lg">🎙️</div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Áudio ou texto, você escolhe
                </h3>
                <p className="text-gray-600 text-sm">
                  Registre transações do jeito mais rápido e prático para você.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 p-2 rounded-full text-lg">⚡</div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Confirmação instantânea
                </h3>
                <p className="text-gray-600 text-sm">
                  Receba feedback automático de cada lançamento em segundos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 p-2 rounded-full text-lg">💰</div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Contas a pagar e receber
                </h3>
                <p className="text-gray-600 text-sm">
                  Gerencie tudo que entra e sai do seu caixa diretamente pelo chat.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Imagem (lado direito) */}
        <div className="flex-1 flex justify-center">
          <img
            src={whats}
            alt="Exemplo de conversa no WhatsApp"
            className="w-[90%] md:w-[85%] lg:w-[75%] rounded-3xl shadow-2xl border border-gray-200 object-contain"
          />
        </div>
      </section>

      {/* ===== SEÇÃO 3 - ANÁLISES INTELIGENTES / DASHBOARD ===== */}
      <section className="h-screen bg-white flex flex-col md:flex-row items-center justify-center px-8 md:px-16 lg:px-24 gap-12">
        {/* Imagem da Dash (lado esquerdo) */}
        <div className="flex-1 flex justify-center">
          <img
            src={dash}
            alt="Dashboard financeiro"
            className="w-[90%] md:w-[85%] lg:w-[80%] rounded-3xl shadow-2xl border border-gray-100 object-contain"
          />
        </div>

        {/* Texto e destaques (lado direito) */}
        <div className="flex-1 text-center md:text-left space-y-8 max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1 rounded-full text-sm font-medium shadow-sm">
            <span>📈</span>
            <span>Análises Inteligentes</span>
          </div>

          {/* Título e subtítulo */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Visualize o caixa da sua empresa{" "}
            <span className="text-green-600">em tempo real</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Acesse relatórios completos, gráficos intuitivos e análises detalhadas do
            seu fluxo de caixa — tudo organizado e sempre atualizado.
          </p>

          {/* Destaques */}
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 p-2 rounded-full text-lg">✅</div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Fluxo de caixa detalhado
                </h3>
                <p className="text-gray-600 text-sm">
                  Visualize entradas, saídas e saldo em tempo real.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 p-2 rounded-full text-lg">🧠</div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Categorização automática
                </h3>
                <p className="text-gray-600 text-sm">
                  Entenda para onde seu dinheiro está indo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 p-2 rounded-full text-lg">📊</div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Relatórios profissionais
                </h3>
                <p className="text-gray-600 text-sm">
                  Dados prontos para tomada de decisão e apresentações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO 4 - BENEFÍCIOS PRINCIPAIS ===== */}
      <section className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-20">
        {/* Título e subtítulo */}
        <div className="text-center mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Por que escolher o <span className="text-green-600">GranaIA?</span>
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Simplifique sua gestão financeira com a tecnologia que já está no seu bolso.
          </p>
        </div>

        {/* Cards de Benefícios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
          {/* Card 1 */}
          <div className="bg-white shadow-md rounded-2xl p-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="bg-green-100 text-green-600 w-14 h-14 mx-auto flex items-center justify-center rounded-xl text-3xl mb-4">
              🎙️
            </div>
            <h3 className="font-semibold text-xl text-gray-900 mb-2">
              Registro por voz ou texto no WhatsApp
            </h3>
            <p className="text-gray-600 text-base">
              Lance transações em segundos — incluindo contas a pagar e receber.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white shadow-md rounded-2xl p-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="bg-green-100 text-green-600 w-14 h-14 mx-auto flex items-center justify-center rounded-xl text-3xl mb-4">
              📊
            </div>
            <h3 className="font-semibold text-xl text-gray-900 mb-2">
              Fluxo de caixa no bolso
            </h3>
            <p className="text-gray-600 text-base">
              Consulte saldo, entradas e saídas direto pelo WhatsApp, sem abrir planilhas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white shadow-md rounded-2xl p-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="bg-green-100 text-green-600 w-14 h-14 mx-auto flex items-center justify-center rounded-xl text-3xl mb-4">
              ⚡
            </div>
            <h3 className="font-semibold text-xl text-gray-900 mb-2">
              Mais tempo para vender e crescer
            </h3>
            <p className="text-gray-600 text-base">
              Elimine tarefas manuais e foque no crescimento do seu negócio.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white shadow-md rounded-2xl p-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="bg-green-100 text-green-600 w-14 h-14 mx-auto flex items-center justify-center rounded-xl text-3xl mb-4">
              🔒
            </div>
            <h3 className="font-semibold text-xl text-gray-900 mb-2">
              Segurança bancária
            </h3>
            <p className="text-gray-600 text-base">
              Criptografia AES-256 garante a proteção dos seus dados financeiros.
            </p>
          </div>
        </div>

        {/* CTA Secundário */}
        <div className="mt-16 text-center">
          <p className="text-gray-700 text-lg mb-4">
            Planos a partir de <span className="text-green-600 font-semibold">R$29/mês</span>
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-full shadow-md transition duration-300">
            Testar Essentials grátis por 7 dias
          </button>
        </div>
      </section>

      {/* ===== SEÇÃO 5 - PLANOS ===== */}
<section className="min-h-screen bg-white flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-10">
  {/* Título */}
  <div className="text-center mb-10">
    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
      Escolha o plano ideal para seu{" "}
      <span className="text-green-600">negócio</span>
    </h2>
    <p className="text-gray-600 mt-3 text-base md:text-lg">
      Teste grátis por 7 dias. Sem compromisso, sem cartão de crédito.
    </p>
  </div>

  {/* Planos */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl items-stretch">
    {[
      {
        name: "GranaIA Starter",
        price: "R$5,99",
        period: "/mês",
        description:
          "Foco em autônomos e microempreendedores que querem praticidade pelo WhatsApp.",
        benefits: [
          "Registre receitas e despesas diretamente pelo WhatsApp",
          "Controle seu fluxo de caixa sem precisar de planilhas",
          "Receba confirmação automática de cada transação",
          "Acesso completo ao bot inteligente do GranaIA",
          "Suporte básico via WhatsApp",
        ],
        button: "Assinar Starter",
        popular: false,
      },
      {
        name: "GranaIA Premium",
        price: "R$9,99",
        period: "/mês",
        description:
          "Tudo o que você precisa para automatizar seu controle financeiro.",
        benefits: [
          "Dashboard personalizada com visão em tempo real",
          "Edição e exclusão de transações",
          "Lembretes automáticos de contas a pagar e receber",
          "Relatórios inteligentes com gráficos interativos",
          "Categorização automática de despesas e receitas",
          "IA para análise financeira personalizada",
          "Exportação de dados (CSV, Excel e PDF)",
          "Suporte dedicado via WhatsApp",
        ],
        button: "Testar grátis por 7 dias",
        popular: true,
      },
      {
        name: "GranaIA Vitalício",
        price: "R$99,99",
        period: "/pagamento único",
        description:
          "Pague uma vez e tenha acesso completo ao GranaIA para sempre.",
        benefits: [
          "Todos os recursos do plano Premium",
          "Acesso vitalício com atualizações inclusas",
          "Suporte prioritário",
          "Sem mensalidades ou taxas extras",
        ],
        button: "Adquirir Vitalício",
        popular: false,
      },
    ].map((plan, index) => (
      <div
        key={index}
        className={`relative bg-white rounded-2xl border-2 flex flex-col justify-between transition-all duration-300 cursor-pointer transform hover:scale-[1.03] ${
          plan.popular
            ? "border-green-500 shadow-xl scale-[1.03]"
            : "border-gray-200 shadow-md hover:shadow-lg"
        }`}
      >
        {/* Selo de popular */}
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
            MAIS POPULAR
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-6 text-center flex-grow flex flex-col justify-start">
          <h3 className="text-lg md:text-xl font-extrabold text-gray-900 mb-2">
            {plan.name}
          </h3>
          <p className="text-green-600 text-3xl md:text-4xl font-extrabold mb-1">
            {plan.price}
            <span className="text-base font-semibold text-gray-500">
              {plan.period}
            </span>
          </p>

          {/* Subtexto extra apenas para o plano vitalício */}
          {plan.name === "GranaIA Vitalício" && (
            <p className="text-green-600 text-sm font-semibold mb-4">
              (Acesso Vitalício)
            </p>
          )}
          <p className="text-gray-600 text-sm md:text-base font-medium mb-5">
            {plan.description}
          </p>

          <div className="text-left space-y-2 mb-6">
            {plan.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-green-600 font-bold text-lg leading-none mt-[1px]">
                  ✓
                </span>
                <p className="text-gray-700 text-sm">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botão fixado na base */}
        <div className="px-6 pb-6 mt-auto">
          <button
            className={`w-full py-3 rounded-full font-semibold transition duration-300 ${
              plan.popular
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {plan.button}
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* Rodapé da seção */}
  <p className="text-gray-500 text-xs mt-8 text-center">
    Plano Premium com 7 dias gratuitos • Sem taxa de setup • Cancelamento a qualquer momento
  </p>
</section>


      {/* ===== SEÇÃO 6 - DEPOIMENTOS ===== */}
      <section className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-20">
        {/* Título e subtítulo */}
        <div className="text-center max-w-4xl mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Empreendedores como você estão{" "}
            <span className="text-green-600">simplificando suas finanças.</span>
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Veja o que nossos usuários estão dizendo sobre a experiência.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 mb-16 text-center">
          <div>
            <p className="text-4xl font-extrabold text-green-600">98%</p>
            <p className="text-gray-600 text-base">Taxa de satisfação</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-green-600">5min</p>
            <p className="text-gray-600 text-base">Tempo médio de setup</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-green-600">24/7</p>
            <p className="text-gray-600 text-base">Disponível no WhatsApp</p>
          </div>
        </div>

        {/* Depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">
          {/* Depoimento 1 */}
          <div className="bg-white shadow-md rounded-2xl p-8 flex flex-col justify-between hover:shadow-lg transition duration-300">
            <div>
              <div className="flex mb-4 text-green-600 text-lg">★★★★★</div>
              <p className="text-gray-700 italic mb-6">
                "Antes eu perdia horas organizando planilhas. Agora registro tudo por áudio no WhatsApp em segundos. Revolucionou minha gestão financeira!"
              </p>
            </div>
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                MS
              </div>
              <div>
                <p className="font-semibold text-gray-900">Marina Silva</p>
                <p className="text-sm text-gray-500">Consultora Freelancer</p>
              </div>
            </div>
          </div>

          {/* Depoimento 2 */}
          <div className="bg-white shadow-md rounded-2xl p-8 flex flex-col justify-between hover:shadow-lg transition duration-300">
            <div>
              <div className="flex mb-4 text-green-600 text-lg">★★★★★</div>
              <p className="text-gray-700 italic mb-6">
                "O GranaIA me deu controle total das contas a pagar e receber. Consigo ver meu fluxo de caixa instantaneamente pelo WhatsApp."
              </p>
            </div>
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                CM
              </div>
              <div>
                <p className="font-semibold text-gray-900">Carlos Mendes</p>
                <p className="text-sm text-gray-500">MEI – Serviços de Marketing</p>
              </div>
            </div>
          </div>

          {/* Depoimento 3 */}
          <div className="bg-white shadow-md rounded-2xl p-8 flex flex-col justify-between hover:shadow-lg transition duration-300">
            <div>
              <div className="flex mb-4 text-green-600 text-lg">★★★★★</div>
              <p className="text-gray-700 italic mb-6">
                "Simples, eficiente e barato. Em uma semana já estava organizando todas as finanças da empresa sem esforço. Recomendo!"
              </p>
            </div>
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                AR
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ana Rodrigues</p>
                <p className="text-sm text-gray-500">Pequena Empresa de Design</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO 7 - FAq */}
      <section className="min-h-screen bg-white flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-20">
      {/* ===== TÍTULO ===== */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
          Dúvidas <span className="text-green-600">frequentes</span>
        </h2>
        <p className="text-gray-600 mt-4 text-lg">
          Respondemos às principais perguntas sobre o GranaIA
        </p>
      </div>

      {/* ===== ACORDEÕES ===== */}
      <div className="w-full max-w-3xl space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border border-gray-200 rounded-xl shadow-sm transition-all duration-300 ${
              openIndex === index ? "bg-gray-50 shadow-md" : "bg-white"
            }`}
          >
            <button
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="w-full flex justify-between items-center text-left px-6 py-5 font-semibold text-gray-800 hover:bg-gray-50 rounded-xl transition"
            >
              {faq.question}

              {/* Ícone minimalista (SVG setinha) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openIndex === index && (
              <div className="px-6 pb-5 text-gray-600 border-t border-gray-100 text-base leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>

    {/* ===== SEÇÃO 8 - CTA FINAL + RODAPÉ ===== */}
    <section className="h-screen flex flex-col">
      {/* ===== 60% - CHAMADA FINAL ===== */}
      <div className="flex-1 bg-gradient-to-br from-[#0a5b7a] via-[#0e8a63] to-[#00a884] flex flex-col items-center justify-center text-center text-white px-8 md:px-16">
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
          Chega de perder tempo em planilhas. <br />
          <span className="text-green-200">
            Organize suas finanças no WhatsApp
          </span>{" "}
          agora mesmo.
        </h2>

        <p className="text-lg md:text-xl text-green-100 max-w-2xl mb-10">
          Junte-se aos negócios que já simplificaram sua gestão financeira com o
          <span className="font-semibold text-white"> GranaIA</span>.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-green-100 mb-8">
          <div className="flex items-center gap-2">
            🚀 <p>Setup em 5 minutos</p>
          </div>
          <div className="flex items-center gap-2">
            🎁 <p>7 dias grátis (Premium)</p>
          </div>
          <div className="flex items-center gap-2">
            💳 <p>Sem cartão de crédito</p>
          </div>
          <div className="flex items-center gap-2">
            🔒 <p>Dados 100% seguros</p>
          </div>
        </div>

        <button className="bg-white text-green-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-50 transition duration-300">
          Testar GranaIA grátis agora
        </button>

        <p className="text-green-100 mt-4 text-sm">
          R$9,99/mês após o período gratuito • Cancele quando quiser
        </p>
      </div>

      {/* ===== 40% - RODAPÉ ===== */}
      <footer className="bg-[#1b1b1b] text-gray-300 py-14 px-8 md:px-20 flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
        {/* Logo e descrição */}
        <div className="max-w-sm text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <img
              src={logo}
              alt="Logo GranaIA"
              className="w-10 h-10 rounded-lg shadow-sm"
            />
            <span className="text-white font-bold text-xl">GranaIA</span>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Gestão financeira inteligente pelo WhatsApp. Simplifique o controle das
            suas finanças e foque no que realmente importa: fazer seu negócio
            crescer.
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <span>🔒 Seguro</span>
            <span>🇧🇷 Feito no Brasil</span>
            <span>💬 WhatsApp</span>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex gap-16 text-center md:text-left">
          <div>
            <h4 className="text-white font-semibold mb-3">Navegação</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-green-400">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-green-400">Benefícios</a></li>
              <li><a href="#" className="hover:text-green-400">Preços</a></li>
              <li><a href="#" className="hover:text-green-400">Depoimentos</a></li>
              <li><a href="#" className="hover:text-green-400">Perguntas Frequentes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-green-400">Privacidade</a></li>
              <li><a href="#" className="hover:text-green-400">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-green-400">LGPD</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* ===== Direitos autorais ===== */}
      <div className="bg-[#141414] text-center py-4 text-gray-500 text-xs border-t border-gray-800">
        © 2025 <span className="text-green-400 font-semibold">GranaIA</span>. Todos os direitos reservados.
      </div>
    </section>

    </div>
  );
}
