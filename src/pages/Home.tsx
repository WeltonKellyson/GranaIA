import { useState, useEffect } from 'react';
import cvs from '../assets/cvs1.png';
import dash from '../assets/dash.png';
import granianomelogo from '../assets/logogranaia1.png';
import logonomegranaia from '../assets/logonomegranaia1.png';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Home() {
  const [count, setCount] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'Preciso entender de finanças para usar?',
      answer:
        "Não! O GranaIA foi criado para ser simples. Basta falar ou digitar no WhatsApp como você já faz todos os dias. Por exemplo: 'Recebi 500 da cliente Maria' ou envie um áudio dizendo 'Paguei 150 de luz hoje'.",
    },
    {
      question: 'E se eu não gostar?',
      answer:
        'Sem problemas! Você pode testar gratuitamente por 7 dias e cancelar quando quiser, sem taxas e sem compromisso.',
    },
    {
      question: 'Funciona no celular?',
      answer:
        'Sim! Todo o controle é feito diretamente pelo WhatsApp, sem precisar baixar aplicativos adicionais.',
    },
    {
      question: 'Meus dados ficam seguros?',
      answer:
        'Sim. Utilizamos criptografia AES-256 — o mesmo padrão usado por bancos — para garantir a segurança das suas informações.',
    },
    {
      question: 'Como faço para registrar uma transação?',
      answer:
        "Basta enviar uma mensagem ou áudio com o valor e descrição, como 'Paguei 300 de aluguel'. O sistema entende e registra automaticamente.",
    },
    {
      question: 'Posso consultar meu saldo a qualquer hora?',
      answer:
        "Pode sim! É só perguntar no WhatsApp: 'Qual meu saldo?' que o GranaIA responde instantaneamente com suas finanças atualizadas.",
    },
    {
      question: 'E se eu precisar de ajuda?',
      answer:
        'Nosso suporte está disponível 24 horas por dia via WhatsApp, sempre pronto para te ajudar.',
    },
  ];

  const [typedText, setTypedText] = useState("");
  const fullText = "WhatsApp";

  const [isDeleting, setIsDeleting] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(120);

  useEffect(() => {
    const handleTyping = () => {
      const current = fullText.substring(0, loopIndex);

      if (!isDeleting) {
        setTypedText(fullText.substring(0, typedText.length + 1));
        setTypingSpeed(120);

        if (typedText === fullText) {
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        setTypedText(fullText.substring(0, typedText.length - 1));
        setTypingSpeed(60);

        if (typedText === "") {
          setIsDeleting(false);
        }
      }

      setLoopIndex((prev) =>
        isDeleting ? prev - 1 : prev + 1
      );
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting]);

  const [satisfaction, setSatisfaction] = useState(0);
  const [setupTime, setSetupTime] = useState(0);

  useEffect(() => {
    let start = 0;

    // contador para 98%
    const endSatisfaction = 98;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / endSatisfaction));

    const timer1 = setInterval(() => {
      start += 1;
      setSatisfaction(start);
      if (start >= endSatisfaction) clearInterval(timer1);
    }, stepTime);

    // contador para 5 min
    let start2 = 0;
    const endSetup = 5;
    const duration2 = 1200;

    const stepTime2 = Math.abs(Math.floor(duration2 / endSetup));

    const timer2 = setInterval(() => {
      start2 += 1;
      setSetupTime(start2);
      if (start2 >= endSetup) clearInterval(timer2);
    }, stepTime2);

    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
    };
  }, []);


  return (
    <div className="relative bg-[#fafaf7] text-gray-900 scroll-smooth overflow-x-hidden">
      {/* ===== BOTÃO LOGIN FIXO ===== */}
      <button
        onClick={() => navigate('/login')}
        className="fixed top-6 right-8 bg-white border border-gray-200 shadow-md text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 hover:shadow-lg transition-all duration-300 z-50"
      >
        Login
      </button>

      {/* ===== SEÇÂO 1 ===== */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto px-6 md:px-12">
        {/* Logo */}
        <img
          src={logonomegranaia}
          alt="Logo GranaIA"
          className="w-280 md:w-320 mx-auto mb-2 transition-transform duration-300 hover:scale-110"
        />

        {/* Título principal */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
          Controle seu financeiro <br />
          <span className="text-green-600">
            direto do {typedText}
            <span className="border-r-2 border-green-600 ml-1 animate-pulse"></span>
          </span>
        </h1>

        {/* Subtítulo em destaque */}
        <p className="text-xl md:text-2xl font-bold text-gray-900">
          Simples, rápido e sem planilhas.
        </p>

        {/* Texto descritivo */}
        <p className="text-gray-600 max-w-2xl">
          No <span className="font-semibold text-gray-800">GranaIA</span>, você
          registra receitas, despesas, contas a pagar e a receber por texto ou
          áudio e consulta sua saúde financeira direto pelo WhatsApp.{' '}
          <span className="text-green-600 font-semibold">
            Planos a partir de R$5,99/mês.
          </span>
        </p>

        {/* CTA principal */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() =>
              window.open("https://granaia.weltonkellyson.com.br/register", "_blank")
            }
            className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 
                      hover:from-green-600 hover:via-green-700 hover:to-green-800 
                      transform hover:scale-105 
                      transition-all duration-300 ease-in-out 
                      text-white px-10 py-4 rounded-xl font-semibold 
                      shadow-md hover:shadow-lg"
          >
            Teste grátis GranaIA Starter por 7 dias
          </button>
        </div>

        {/* Destaques */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mt-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://img.icons8.com/?size=100&id=2862&format=png&color=25D366"
              alt="Cadeado de segurança"
              className="w-5 h-5"
            />
            <p>Segurança bancária AES-256</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://img.icons8.com/?size=100&id=964RahB4l606&format=png&color=25D366"
              alt="Ícone do WhatsApp"
              className="w-5 h-5"
            />
            <p>100% pelo WhatsApp</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://img.icons8.com/?size=100&id=53420&format=png&color=25D366"
              alt="Ícone de Configuração"
              className="w-5 h-5"
            />
            <p>Configuração em 2 minutos</p>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO 2 - COMO FUNCIONA ===== */}
      <section id="funcionalidades" className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center px-8 md:px-16 lg:px-24 gap-12 py-20">
        {/* Texto (lado esquerdo) */}
        <div className="flex-1 text-center md:text-left space-y-8 max-w-xl">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-medium shadow-sm w-fit mx-auto md:mx-0">
            <img
              src="https://img.icons8.com/?size=100&id=964RahB4l606&format=png&color=25D366"
              alt="WhatsApp"
              className="w-5 h-5 object-contain"
            />
            <span>Como funciona</span>
          </div>

          {/* Título */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Controle financeiro tão fácil quanto{' '}
            <span className="text-green-600">enviar uma mensagem</span>
          </h2>

          {/* Subtítulo */}
          <p className="text-gray-600 text-lg">
            Lance suas despesas, receitas e contas usando voz, imagem ou texto pelo
            WhatsApp. O GranaIA processa tudo automaticamente e organiza suas
            finanças em segundos.
          </p>

          {/* Itens explicativos */}
          <div className="flex flex-col gap-6 mt-6">
            {[
              {
                title: "Áudio, imagem ou texto, você escolhe",
                desc: "Registre transações do jeito mais rápido e prático para você.",
              },
              {
                title: "Confirmação instantânea",
                desc: "Receba feedback automático de cada lançamento em segundos.",
              },
              {
                title: "Contas a pagar e receber",
                desc: "Gerencie tudo que entra e sai do seu caixa diretamente pelo chat.",
              },
            ].map((item, index) => {
              const { ref, inView } = useInView({
                triggerOnce: true,
                threshold: 0.2,
              });

              return (
                <motion.div
                  key={index}
                  ref={ref}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.25 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-5 h-5 mt-1 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </span>

                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Imagem (lado direito) */}
        <div className="flex-1 flex justify-center">
          <img
            src={cvs}
            alt="Exemplo de conversa no WhatsApp"
            className="w-[80%] md:w-[75%] lg:w-[65%] rounded-3xl transition-transform duration-300 hover:scale-110"
          />
        </div>
      </section>

      {/* ===== SEÇÃO 3 - ANÁLISES INTELIGENTES / DASHBOARD ===== */}
      <section className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center px-8 md:px-16 lg:px-24 gap-12">
        {/* Imagem da Dash (lado esquerdo) */}
        <div className="flex-1 flex justify-center">
          <img
            src={dash}
            alt="Dashboard financeiro"
            className="w-[95%] md:w-[95%] lg:w-[95%] rounded-3xl transition-transform duration-300 hover:scale-110"
          />
        </div>

        {/* Texto e destaques (lado direito) */}
        <div className="flex-1 text-center md:text-left space-y-8 max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1 rounded-full text-sm font-medium shadow-sm">
            <img
              src="https://img.icons8.com/?size=100&id=ALrL90O362w9&format=png&color=25D366"
              alt="Ícone de Análises"
              className="w-4 h-4"
            />
            <span>Análises Inteligentes</span>
          </div>

          {/* Título e subtítulo */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Acompanhe suas finanças{' '}
            <span className="text-green-600">em tempo real</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Acesse relatórios completos, gráficos intuitivos e análises
            detalhadas do seu fluxo de caixa — tudo organizado e sempre
            atualizado.
          </p>

          {/* Destaques */}
          <div className="flex flex-col gap-6 mt-6">
            {[
              {
                title: "Fluxo de caixa detalhado",
                desc: "Visualize entradas, saídas e saldo em tempo real.",
                delay: 0.2,
              },
              {
                title: "Categorização automática",
                desc: "Entenda para onde seu dinheiro está indo.",
                delay: 0.4,
              },
              {
                title: "Relatórios profissionais",
                desc: "Dados prontos para tomada de decisão e apresentações.",
                delay: 0.6,
              },
            ].map((item, index) => {
              const { ref, inView } = useInView({
                triggerOnce: true,
                threshold: 0.2,
              });

              return (
                <motion.div
                  key={index}
                  ref={ref}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: item.delay }}
                  className="flex items-start gap-3"
                >
                  {/* Bolinha */}
                  <span className="w-5 h-5 mt-1 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </span>

                  {/* Texto */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO 4 - BENEFÍCIOS PRINCIPAIS ===== */}
      <section id="beneficios" className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-20">
        {/* Título e subtítulo */}
        <div className="text-center mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Por que escolher o <span className="text-green-600">GranaIA?</span>
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Simplifique sua gestão financeira com a tecnologia que já está no
            seu bolso.
          </p>
        </div>

        {/* Cards de Benefícios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
          {[
            {
              icon: "https://img.icons8.com/?size=100&id=8XhS2MrAHUXV&format=png&color=25D366",
              title: "Registro por voz ou texto no WhatsApp",
              desc: "Lance transações em segundos — incluindo contas a pagar e receber.",
              delay: 0.2,
            },
            {
              icon: "https://img.icons8.com/?size=100&id=ALrL90O362w9&format=png&color=25D366",
              title: "Fluxo de caixa no bolso",
              desc: "Consulte saldo, entradas e saídas direto pelo WhatsApp, sem abrir planilhas.",
              delay: 0.4,
            },
            {
              icon: "https://img.icons8.com/?size=100&id=16421&format=png&color=25D366",
              title: "Mais tempo para vender e crescer",
              desc: "Elimine tarefas manuais e foque no crescimento do seu negócio.",
              delay: 0.6,
            },
            {
              icon: "https://img.icons8.com/?size=100&id=2862&format=png&color=25D366",
              title: "Segurança bancária",
              desc: "Criptografia AES-256 garante a proteção dos seus dados financeiros.",
              delay: 0.8,
            },
          ].map((item, index) => {
            const { ref, inView } = useInView({
              triggerOnce: true,
              threshold: 0.2,
            });

            return (
              <motion.div
                key={index}
                ref={ref}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: item.delay }}
                className="bg-white shadow-md rounded-2xl p-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="bg-green-100 w-14 h-14 mx-auto flex items-center justify-center rounded-xl mb-4">
                  <img src={item.icon} alt={item.title} className="w-8 h-8" />
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-base">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Secundário */}
        <div className="mt-16 text-center">
          <p className="text-gray-700 text-lg mb-4">
            Planos a partir de{' '}
            <span className="text-green-600 font-semibold">R$5,99/mês</span>
          </p>
          <button
            onClick={() =>
              window.open("https://granaia.weltonkellyson.com.br/register", "_blank")
            }
            className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 
                      hover:from-green-600 hover:via-green-700 hover:to-green-800 
                      transform hover:scale-105 
                      transition-all duration-300 ease-in-out 
                      text-white px-10 py-4 rounded-xl font-semibold 
                      shadow-md hover:shadow-lg"
          >
            Testar GranaIA Starter grátis por 7 dias
          </button>
        </div>
      </section>

      {/* ===== SEÇÃO 5 - PLANOS ===== */}
      <section id="precos" className="min-h-screen bg-white flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-10">
        {/* Título */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Escolha o plano ideal para seu{' '}
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
              name: 'GranaIA Starter',
              price: 'R$5,99',
              original: 'R$7,99',
              period: '/mês',
              link: "https://pay.kirvano.com/be9147a1-addd-4d1e-bc6b-ce77886be90d",
              description:
                'Ideal para quem está começando. Controle seus gastos e receitas diretamente pelo sistema GranaIA.',
              benefits: [
                'Crie, edite e exclua gastos e receitas com facilidade',
                'Visualize relatórios completos de receitas e despesas',
                'Acompanhe seu fluxo de caixa em tempo real pela dashboard',
                'Exporte relatórios diretamente em PDF, Excel ou CSV',
                'Acesso completo à plataforma web GranaIA',
              ],
              button: 'Assinar Starter',
              popular: false,
            },
            {
              name: 'GranaIA Premium',
              price: 'R$10,99',
              original: 'R$14,99',
              period: '/mês',
              link: "https://pay.kirvano.com/a7458233-e00c-4747-8c2f-2789512e91da",
              description:
                'Tudo do plano Starter e mais: controle total das suas finanças também pelo WhatsApp.',
              benefits: [
                'Todos os recursos do plano Starter',
                'Crie, edite e exclua gastos e receitas pelo WhatsApp',
                'Solicite relatórios diretamente pelo WhatsApp',
                'Receba alertas e lembretes financeiros automáticos',
                'Suporte dedicado via WhatsApp',
              ],
              button: 'Assinar Premium',
              popular: true,
            },
            {
              name: 'GranaIA Pro',
              price: 'R$79,99',
              original: 'R$106,99',
              period: '/ano',
              link: "https://pay.kirvano.com/579a78ff-13c4-4ba9-80e2-d782b67c8488",
              description:
                'Tudo do plano Premium, mas com desconto exclusivo no pagamento anual.',
              benefits: [
                'Todos os recursos do plano Premium',
                'Desconto exclusivo por pagamento anual',
                'Acesso contínuo à plataforma e ao bot do WhatsApp',
                'Suporte prioritário via WhatsApp',
                'Atualizações incluídas durante o ano',
              ],
              button: 'Assinar Pro Anual',
              popular: false,
            },
          ].map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border-2 flex flex-col justify-between transition-all duration-300 cursor-pointer transform hover:scale-[1.03] ${
                plan.popular
                  ? 'border-green-500 shadow-xl scale-[1.03]'
                  : 'border-gray-200 shadow-md hover:shadow-lg'
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
                {/* Preços promocionais */}
                <div className="mb-3">
                  {/* Preço original riscado */}
                  <p className="text-sm text-gray-500 line-through">
                    {plan.original}
                  </p>

                  {/* Preço atual */}
                  <p className="text-green-600 text-3xl md:text-4xl font-extrabold">
                    {plan.price}
                    <span className="text-base font-semibold text-gray-500">
                      {plan.period}
                    </span>
                  </p>
                </div>

                {/* Badge de desconto */}
                <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto mb-4">
                  25% OFF
                </div>

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
                  onClick={() => window.open(plan.link, "_blank")}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  {plan.button}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé da seção */}
        <p className="text-gray-500 text-xs mt-8 text-center">
          7 dias de acesso gratuito ao GranaIA Starter dentro da plataforma • Nenhuma cobrança durante o período de teste •{" "}
          <a
            href="https://granaia.weltonkellyson.com.br/register"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 font-semibold underline hover:text-green-700 transition"
          >
            Clique aqui para testar
          </a>
        </p>
      </section>

      {/* ===== SEÇÃO 6 - DEPOIMENTOS ===== */}
      <section id="depoimentos" className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-20">
        {/* Título e subtítulo */}
        <div className="text-center max-w-4xl mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Pessoas como você estão{' '}
            <span className="text-green-600">simplificando suas finanças.</span>
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Veja o que nossos usuários estão dizendo sobre a experiência.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 mb-16 text-center">
          <div>
            <p className="text-4xl font-extrabold text-green-600">
              {satisfaction}%
            </p>
            <p className="text-gray-600 text-base">Taxa de satisfação</p>
          </div>

          <div>
            <p className="text-4xl font-extrabold text-green-600">
              {setupTime}min
            </p>
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
                "Antes eu perdia horas organizando planilhas. Agora registro
                tudo por áudio no WhatsApp em segundos. Revolucionou minha
                gestão financeira!"
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
                "O GranaIA me deu controle total das contas a pagar e receber.
                Consigo ver meu fluxo de caixa instantaneamente pelo WhatsApp."
              </p>
            </div>
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                CM
              </div>
              <div>
                <p className="font-semibold text-gray-900">Carlos Mendes</p>
                <p className="text-sm text-gray-500">
                  MEI – Serviços de Marketing
                </p>
              </div>
            </div>
          </div>

          {/* Depoimento 3 */}
          <div className="bg-white shadow-md rounded-2xl p-8 flex flex-col justify-between hover:shadow-lg transition duration-300">
            <div>
              <div className="flex mb-4 text-green-600 text-lg">★★★★★</div>
              <p className="text-gray-700 italic mb-6">
                "Simples, eficiente e barato. Em uma semana já estava
                organizando todas as finanças sem esforço. Recomendo!"
              </p>
            </div>
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                AR
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ana Rodrigues</p>
                <p className="text-sm text-gray-500">
                  Pequena Empresa de Design
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO 7 - FAq */}
      <section id="faq" className="min-h-screen bg-white flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-20">
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
                openIndex === index ? 'bg-gray-50 shadow-md' : 'bg-white'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center text-left px-6 py-5 font-semibold text-gray-800 hover:bg-gray-50 rounded-xl transition"
              >
                {faq.question}

                {/* Ícone minimalista (SVG setinha) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : 'rotate-0'
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
            </span>{' '}
            agora mesmo.
          </h2>

          <p className="text-lg md:text-xl text-green-100 max-w-2xl mb-10">
            Junte-se aos negócios que já simplificaram sua gestão financeira com
            o<span className="font-semibold text-white"> GranaIA</span>.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-green-100 mb-8">
            <div className="flex items-center gap-1">
              🚀 <p>Setup em 5 minutos</p>
            </div>
            <div className="flex items-center gap-1">
              🎁 <p>7 dias grátis (GranaIA Starter)</p>
            </div>
            <div className="flex items-center gap-1">
              💳 <p>Sem cartão de crédito</p>
            </div>
            <div className="flex items-center gap-1">
              🔒 <p>Dados 100% seguros</p>
            </div>
          </div>

          <button
            onClick={() =>
              window.open("https://granaia.weltonkellyson.com.br/register", "_blank")
            }
            className="bg-white text-green-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-50 transition duration-300"
          >
            Testar GranaIA grátis agora
          </button>

          <p className="text-green-100 mt-4 text-sm">
            7 dias de acesso gratuito ao GranaIA Starter dentro da plataforma • Nenhuma cobrança durante o período de teste.
          </p>
        </div>

        {/* ===== 40% - RODAPÉ ===== */}
        <footer className="bg-[#1b1b1b] text-gray-300 py-14 px-8 md:px-20 flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          {/* Logo e descrição */}
          <div className="max-w-sm text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <img
                src={granianomelogo}
                alt="Logo GranaIA"
                className="w-10 h-10 rounded-lg shadow-sm"
              />
              <span className="text-white font-bold text-xl">GranaIA</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Gestão financeira inteligente pelo WhatsApp. Simplifique o
              controle das suas finanças e foque no que realmente importa: fazer
              seu negócio crescer.
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span>🔒 Seguro</span>
              <span>🇧🇷 Feito no Brasil</span>
              <span className="inline-flex items-center gap-2">
                <img
                  src="https://img.icons8.com/?size=100&id=964RahB4l606&format=png&color=25D366"
                  alt="Ícone do WhatsApp"
                  className="w-5 h-5"
                />
                <span>WhatsApp</span>
              </span>
            </div>
          </div>

          {/* Navegação */}
          <div className="flex gap-16 text-center md:text-left">
            <div>
              <h4 className="text-white font-semibold mb-3">Navegação</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#funcionalidades" className="hover:text-green-400">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#beneficios" className="hover:text-green-400">
                    Benefícios
                  </a>
                </li>
                <li>
                  <a href="#precos" className="hover:text-green-400">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#depoimentos" className="hover:text-green-400">
                    Depoimentos
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-green-400">
                    Perguntas Frequentes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="javascript:void(0)" className="hover:text-green-400">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0)" className="hover:text-green-400">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0)" className="hover:text-green-400">
                    LGPD
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>

        {/* ===== Direitos autorais ===== */}
        <div className="bg-[#141414] text-center py-4 text-gray-500 text-xs border-t border-gray-800">
          © 2025{" "}
          <a
            href="https://www.instagram.com/we_tech.oficial?igsh=Nng2czAxNnIwbWow&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 font-semibold underline hover:text-green-300 transition"
          >
            WeTech
          </a>
          . Todos os direitos reservados.
        </div>
      </section>
    </div>
  );
}
