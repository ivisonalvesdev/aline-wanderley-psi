/**
 * Perguntas frequentes — fonte única.
 *
 * Este arquivo é lido por dois consumidores diferentes:
 *
 * 1. A seção FAQ da página (`sections/Faq.tsx`).
 * 2. O `vite.config.ts`, que monta o bloco `FAQPage` do JSON-LD e o injeta
 *    no `index.html` durante o build — é esse bloco que o Google usa para
 *    montar o resultado rico na busca.
 *
 * Por isso ele não importa nada: precisa ser carregável pelo Node, no
 * build, sem arrastar React ou ícones junto.
 *
 * Antes, as mesmas perguntas viviam copiadas no `index.html`. Editar uma
 * resposta e esquecer a outra cópia fazia o que o Google indexa divergir
 * do que a página mostra — exatamente o tipo de divergência que derruba o
 * resultado rico. Agora só existe uma versão: esta.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Como funciona a primeira sessão?",
    answer:
      "A primeira sessão é um espaço de acolhimento e escuta. Conversamos sobre o que motivou a busca pela terapia, a história de vida e as expectativas. No caso de crianças, esse primeiro encontro costuma acontecer com os pais ou responsáveis, para compreender o contexto familiar.",
  },
  {
    question: "A partir de qual idade as crianças podem ser atendidas?",
    answer:
      "O atendimento infantil é adaptado a cada fase do desenvolvimento, com recursos lúdicos adequados à idade. Na primeira conversa, avaliamos juntos a demanda e o formato mais indicado para a criança e a família.",
  },
  {
    // A dúvida nº 1 de quem procura psicólogo particular. Deixá-la sem
    // resposta é o que mais faz a pessoa fechar a página.
    // TODO: confirmar com a Aline como ela prefere tratar o valor.
    question: "Qual o valor da sessão? Consigo reembolso pelo plano?",
    answer:
      "O valor é informado na primeira conversa, junto com a frequência sugerida para o seu caso. Assim você decide com todas as informações em mãos. Ao final de cada sessão você recebe recibo com o número do CRP, aceito pela maioria dos planos de saúde para reembolso. Pode perguntar sem compromisso pelo WhatsApp.",
  },
  {
    question: "A terapia online funciona mesmo?",
    answer:
      "Sim. Estudos mostram que a psicoterapia online tem eficácia comparável à presencial para a maioria das demandas. As sessões acontecem por videochamada, em plataforma segura, com o mesmo sigilo e estrutura do atendimento no consultório.",
  },
  {
    question: "Quanto tempo dura o processo terapêutico?",
    answer:
      "Cada pessoa tem seu ritmo. A TCC é uma abordagem focada e estruturada, com objetivos definidos em conjunto e o tempo do processo varia conforme a demanda, a frequência das sessões e a singularidade de cada história.",
  },
  {
    question: "Os pais participam do atendimento infantil?",
    answer:
      "Sim. A participação da família é parte importante do cuidado com a criança. Além das sessões individuais, são realizados encontros de orientação parental para alinhar estratégias e acompanhar a evolução do processo.",
  },
  {
    question: "As informações compartilhadas são sigilosas?",
    answer:
      "Absolutamente. O sigilo é um princípio ético fundamental da psicologia, garantido pelo Código de Ética Profissional. Tudo o que é compartilhado em sessão é tratado com total confidencialidade.",
  },
  {
    question: "Como agendar uma consulta?",
    answer:
      "Basta clicar em qualquer botão de WhatsApp do site. Você será direcionado para uma conversa direta, onde poderá tirar dúvidas sobre horários, valores e modalidades de atendimento, sem compromisso.",
  },
];
