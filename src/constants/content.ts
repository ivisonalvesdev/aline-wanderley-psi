import {
  Wind,
  Zap,
  Infinity as InfinityIcon,
  Waves,
  Sprout,
  Sunrise,
  Video,
  MapPin,
  Clock,
  CalendarDays,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";

/* ---------------------------------- */
/*  Hero                              */
/* ---------------------------------- */
/**
 * ✍️ Marcação de destaque: o que estiver entre `**asteriscos**` é
 * renderizado na cor de destaque da marca, com meio passo a mais de peso
 * (ver `utils/rich.tsx`). Serve para dar respiro visual às frases longas
 * — a vista pousa no trecho que carrega a ideia. Use com parcimônia:
 * um destaque por frase, no máximo dois por bloco.
 */
export const HERO = {
  // O selo de texto acima do título deu lugar à logo da marca.
  headline: "Por trás de cada **comportamento,** existe uma **emoção** precisando de **acolhimento.**",
  subheadline:
    "Psicoterapia fundamentada na **Terapia Cognitivo-Comportamental (TCC)**. Um espaço seguro e acolhedor em Recife e online para todo o Brasil.",
  badges: ["CRP 02/25892", "Abordagem TCC", "Online para todo o Brasil", "Presencial em Recife"],
} as const;

/**
 * Texto dos botões de agendamento — muda aqui, muda no site inteiro.
 *
 * A versão curta existe só para o header, onde a barra é estreita e o
 * rótulo completo quebraria a linha. Mesma voz, menos palavras.
 */
export const CTA_LABEL = "Falar com a Aline no WhatsApp";
export const CTA_LABEL_SHORT = "Falar no WhatsApp";

/* ---------------------------------- */
/*  Sobre                             */
/* ---------------------------------- */
export const ABOUT = {
  eyebrow: "Quem cuida",
  title: "Prazer, eu sou a **Aline Wanderley.**",
  paragraphs: [
    "Psicóloga clínica e acredito que **a infância é o lugar onde nascem as emoções que levamos para a vida inteira**. Por isso, dedico meu trabalho a acolher crianças, adolescentes, adultos e também as famílias que caminham ao lado deles.",
    "Minha prática é fundamentada na **Terapia Cognitivo-Comportamental (TCC)**, uma abordagem com ampla base científica, que une técnica e sensibilidade para compreender como pensamentos, emoções e comportamentos se conectam.",
    "Atendo presencialmente em Boa Viagem, no Recife, e online para todo o Brasil. Em cada encontro, meu compromisso é o mesmo: oferecer **um espaço seguro, sem julgamentos**, onde cada história possa ser ouvida com o cuidado que merece.",
  ],
  highlights: [
    { value: "TCC", label: "Base científica" },
    { value: "02/25892", label: "Registro CRP" },
    { value: "Recife + Online", label: "Atendimento" },
  ],
} as const;

/* ---------------------------------- */
/*  Especialidades                    */
/* ---------------------------------- */
export interface Specialty {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Assunto que já vai escrito na conversa do WhatsApp ao clicar no card. */
  topic: string;
}

/**
 * Seis cards, em grade de 3×2 no desktop e 2×3 no tablet — fila cheia em
 * qualquer largura, sem o buraco que sobra quando o número não fecha com
 * a quantidade de colunas.
 *
 * "Birras e comportamento" e "Orientação parental" saíram daqui porque a
 * seção *Para pais* trata dos dois com muito mais espaço: repetir como
 * card diluía a lista clínica sem acrescentar informação.
 *
 * O `topic` de cada card vira a mensagem já escrita na conversa do
 * WhatsApp — a pessoa chega com o contexto pronto em vez de precisar
 * formular o pedido do zero, que é onde a maioria desiste.
 */
export const SPECIALTIES: Specialty[] = [
  {
    icon: Wind,
    title: "Ansiedade",
    description:
      "Compreender os gatilhos e desenvolver recursos para viver com mais leveza e presença.",
    topic: "ansiedade",
  },
  {
    icon: Zap,
    title: "TDAH",
    description:
      "Estratégias práticas para atenção, organização e autoestima na infância e na vida adulta.",
    topic: "TDAH",
  },
  {
    icon: InfinityIcon,
    title: "TEA Nível 1",
    description:
      "Acompanhamento respeitoso às particularidades de cada pessoa, com suporte à família.",
    topic: "TEA nível 1",
  },
  {
    icon: Waves,
    title: "Autorregulação emocional",
    description:
      "Aprender a reconhecer, nomear e atravessar emoções intensas com mais segurança.",
    topic: "autorregulação emocional",
  },
  {
    icon: Sprout,
    title: "Desenvolvimento infantil",
    description:
      "Acompanhar cada fase do crescimento, estimulando habilidades emocionais e sociais.",
    topic: "desenvolvimento infantil",
  },
  {
    icon: Sunrise,
    title: "Depressão",
    description:
      "Um caminho cuidadoso para reencontrar sentido, energia e conexão com a própria vida.",
    topic: "depressão",
  },
];

/* ---------------------------------- */
/*  TCC                               */
/* ---------------------------------- */
export const TCC_STEPS = [
  {
    number: "01",
    title: "O que é",
    description:
      "A Terapia Cognitivo-Comportamental é uma das abordagens mais estudadas da psicologia. Ela parte de um princípio simples: **a forma como interpretamos as situações influencia o que sentimos e como agimos.**",
  },
  {
    number: "02",
    title: "Como funciona",
    description:
      "Em sessões estruturadas e acolhedoras, identificamos juntos padrões de pensamento e comportamento. A partir daí, construímos **estratégias práticas que você leva para a vida**, muito além do consultório.",
  },
  {
    number: "03",
    title: "Por que funciona",
    description:
      "Por ser objetiva e **baseada em evidências**, a TCC é recomendada internacionalmente para ansiedade, depressão, TDAH e muitas outras demandas com resultados consistentes documentados pela ciência.",
  },
] as const;

/* ---------------------------------- */
/*  Orientação para pais              */
/* ---------------------------------- */
export const PARENTS = {
  eyebrow: "Orientação parental",
  title: "Cuidar de quem cuida **também é terapia.**",
  description:
    "Você não precisa passar pelos desafios da maternidade ou paternidade sem apoio. A orientação parental oferece **ferramentas práticas** para lidar com birras, rotina e emoções, fortalecendo o vínculo com seu filho.",
  benefits: [
    "Compreender o que o comportamento do seu filho está comunicando",
    "Estratégias práticas para lidar com birras e desregulação",
    "Rotinas mais leves, com menos conflito e mais conexão",
    "Fortalecimento do vínculo entre pais e filhos",
    "Alinhamento entre família, escola e terapia",
    "Um espaço seguro para as suas próprias dúvidas e angústias",
  ],
} as const;

/* ---------------------------------- */
/*  Modalidades                       */
/* ---------------------------------- */
export interface Modality {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  features: string[];
}

export const MODALITIES: Modality[] = [
  {
    icon: Video,
    title: "Online",
    subtitle: "Para todo o Brasil",
    features: [
      "Sessões por videochamada em plataforma segura",
      "Mesmo cuidado e sigilo do atendimento presencial",
      "Flexibilidade de horários e sem deslocamento",
      "Ideal para adultos e adolescentes",
    ],
  },
  {
    icon: MapPin,
    title: "Presencial",
    subtitle: "Boa Viagem · Recife – PE",
    features: [
      "Consultório acolhedor e reservado",
      "Ambiente preparado para o atendimento infantil",
      "Recursos lúdicos para crianças e adolescentes",
      "Fácil acesso na zona sul do Recife",
    ],
  },
];

/**
 * O operacional que costuma travar a decisão de quem nunca fez terapia.
 * Deixar isso à vista evita que a dúvida vire desistência.
 *
 * Duração e frequência confirmadas com a Aline.
 */
export const MODALITY_FACTS = [
  {
    icon: Clock,
    label: "Duração",
    value: "Sessões de 40 a 50 minutos",
  },
  {
    icon: CalendarDays,
    label: "Frequência",
    value: "Semanal, ajustável ao caso",
  },
  {
    icon: ReceiptText,
    label: "Reembolso",
    value: "Recibo para o seu plano de saúde",
  },
] as const;

/* ---------------------------------- */
/*  Diferenciais                      */
/* ---------------------------------- */
export const DIFFERENTIALS = [
  {
    title: "Escuta sem julgamentos",
    description:
      "Cada pessoa chega com uma história única. Aqui, ela é ouvida sem pressa e sem julgamentos.",
  },
  {
    title: "Prática baseada em evidências (TCC)",
    description:
      "A TCC é uma das abordagens com maior respaldo científico da psicologia contemporânea.",
  },
  {
    title: "Olhar especializado na infância e juventude",
    description:
      "Especialização no universo infantojuvenil porque criança não é um adulto em miniatura.",
  },
  {
    title: "Parceria ativa com a família",
    description:
      "Pais e cuidadores recebem orientação e participam ativamente do processo terapêutico.",
  },
  {
    title: "Plano terapêutico claro e transparente",
    description:
      "Objetivos definidos em conjunto e acompanhados ao longo da jornada, com transparência.",
  },
  {
    title: "Sigilo e rigor ético",
    description:
      "Atendimento conduzido com rigor ético, seguindo as diretrizes do Conselho Federal de Psicologia.",
  },
] as const;

/* ---------------------------------- */
/*  Formação — timeline               */
/*  TODO: revisar/completar com dados reais da Aline  */
/* ---------------------------------- */
/**
 * Certificados reais, conferidos no diploma físico.
 *
 * A versão anterior desta seção era uma linha do tempo de quatro entradas
 * genéricas, escritas antes de haver documento em mãos. Foram removidas de
 * propósito: numa página de profissional de saúde, formação declarada sem
 * comprovante é exatamente o tipo de alegação que o visitante desconta.
 *
 * O segundo espaço já existe no layout mesmo sem o diploma ter chegado —
 * quando a Unibra emitir, é só preencher `image` e trocar `pending` para
 * `false`, sem mexer no componente.
 */
export const EDUCATION = {
  eyebrow: "Formação",
  title: "Uma trajetória dedicada ao **cuidado**",
  description:
    "Estudo contínuo para oferecer uma prática clínica atual, ética e baseada em evidências.",
  certificates: [
    {
      id: "psicologia",
      course: "Bacharelado em Psicologia",
      institution: "Centro Universitário FBV Wyden",
      place: "Recife, PE",
      /* Colação de grau em 30/11/2021; diploma expedido em 08/12/2021. */
      year: "2021",
      pending: false,
    },
    {
      id: "tcc",
      course: "Especialização em Terapia Cognitivo-Comportamental",
      institution: "Unibra",
      place: "Recife, PE",
      year: "Em breve",
      pending: true,
    },
  ],
} as const;

/* ---------------------------------- */
/*  FAQ                               */
/* ---------------------------------- */

/* As perguntas moram em `constants/faq.ts` — arquivo sem dependências,
   porque o build também as lê para gerar o JSON-LD do index.html. */
export { FAQ_ITEMS, type FaqItem } from "./faq";

/* ---------------------------------- */
/*  CTA final                         */
/* ---------------------------------- */
export const FINAL_CTA = {
  title:
    "O primeiro passo costuma ser o mais difícil. Ele também pode ser **o mais transformador.**",
  description:
    "Se algo dentro de você, ou na vida de quem você ama, está pedindo cuidado, estou aqui para acolher essa história. Vamos conversar?",
  buttonLabel: CTA_LABEL,
} as const;
