import { SITE, FULL_ADDRESS } from "./site";

/**
 * Política de Privacidade.
 *
 * O texto descreve o que este site faz de fato, e não um modelo genérico.
 * O levantamento que o originou: não há analytics, pixel de rastreamento,
 * gerenciador de tags, formulário, `localStorage` nem cookie próprio; as
 * fontes são servidas do próprio domínio (`@fontsource`), e o único
 * terceiro embutido é o mapa do Google. Se qualquer uma dessas coisas
 * mudar — em especial a entrada de um formulário ou de uma ferramenta de
 * medição —, este arquivo precisa mudar junto, porque a declaração deixa
 * de ser verdadeira no mesmo instante.
 *
 * Dois pontos merecem atenção de quem for editar:
 *
 * 1. Psicoterapia produz **dado pessoal sensível** (LGPD, art. 5º, II).
 *    O tratamento não se apoia em consentimento genérico, e sim nas
 *    hipóteses do art. 11 — daí a distinção, ao longo do texto, entre o
 *    que acontece no site e o que acontece no atendimento.
 *
 * 2. Boa parte do público é criança e adolescente, o que traz o art. 14
 *    (melhor interesse, consentimento de quem detém a guarda) para o
 *    centro, não para uma nota de rodapé.
 */

/** Exibida no topo do documento. Atualizar a cada revisão do texto. */
export const PRIVACY_UPDATED_AT = "13 de agosto de 2026";

export interface PrivacySection {
  title: string;
  /** Aceita `**destaque**` — ver `utils/rich.tsx`. */
  body: string[];
  /** Itens de lista, quando o conteúdo é uma enumeração. */
  items?: string[];
}

export const PRIVACY_INTRO =
  "Esta política explica quais dados pessoais são tratados quando você visita este site ou entra em contato, com que finalidade e quais são os seus direitos. Ela foi escrita em linguagem direta, e descreve exatamente o funcionamento deste site, não um modelo padrão.";

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: "Quem é responsável pelos seus dados",
    body: [
      `O tratamento é feito por **${SITE.name}**, ${SITE.role.toLowerCase()}, inscrita no ${SITE.crp}, com consultório em ${FULL_ADDRESS}.`,
      `Para qualquer assunto relacionado a esta política, inclusive para exercer os direitos descritos abaixo, o contato é **${SITE.email}**. Esse mesmo endereço responde pelo papel de encarregado de dados previsto no art. 41 da LGPD.`,
    ],
  },
  {
    title: "O que este site coleta",
    body: [
      "**Nada.** Navegar por estas páginas não gera cadastro, não cria conta e não deixa dados com a psicóloga.",
      "Em termos concretos, este site **não possui** formulários, campos de cadastro ou newsletter; **não utiliza** cookies próprios, `localStorage` ou qualquer armazenamento no seu navegador; e **não emprega** ferramentas de analytics, pixels de rastreamento ou gerenciadores de tag. As fontes tipográficas são servidas pelo próprio domínio, e não por serviços externos.",
      "Como acontece com qualquer site, o servidor que hospeda estas páginas pode registrar dados técnicos de acesso (endereço IP, data e hora, navegador) em registros mantidos por prazo curto, com a finalidade de segurança e funcionamento, conforme obriga o Marco Civil da Internet (Lei 12.965/2014, art. 15).",
    ],
  },
  {
    title: "O mapa do consultório",
    body: [
      "A seção **Modalidades** exibe um mapa incorporado do Google Maps. Ao carregar, esse mapa comunica-se diretamente com servidores do Google, que pode receber seu endereço IP e utilizar cookies próprios. Isso ocorre dentro do serviço do Google, fora do controle deste site.",
      "É o único conteúdo de terceiros embutido nestas páginas. Se preferir evitá-lo, o endereço do consultório também está escrito por extenso, em texto, logo abaixo do mapa.",
    ],
  },
  {
    title: "Quando você entra em contato",
    body: [
      "Os botões de WhatsApp, Instagram e e-mail levam você para fora deste site. A conversa passa a acontecer na plataforma escolhida, e cada uma tem a própria política de privacidade. WhatsApp e Instagram são operados pela Meta.",
      "A partir daí, os dados que você enviar (nome, telefone, e-mail e o que escrever na mensagem) são tratados para responder ao contato, avaliar a demanda e, se for o caso, agendar atendimento. A base legal é o interesse em atender ao seu próprio pedido (LGPD, art. 7º, V e IX).",
    ],
  },
  {
    title: "Dados do atendimento psicológico",
    body: [
      "Informações reveladas em psicoterapia são **dados pessoais sensíveis** (LGPD, art. 5º, II) e recebem proteção reforçada.",
      "Esses dados são tratados exclusivamente para a tutela da saúde, por profissional de saúde, nos termos do art. 11, II, alínea “f”, da LGPD, e ficam cobertos pelo **sigilo profissional** previsto no Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005). O sigilo é a regra; a quebra é exceção estrita, admitida apenas em situações de risco à vida ou por determinação legal, e sempre restrita ao mínimo necessário.",
      "O registro documental do atendimento (prontuário) é obrigatório pela Resolução CFP nº 001/2009 e guardado pelo prazo mínimo de cinco anos ali previsto. Atendimentos on-line seguem a Resolução CFP nº 011/2018.",
      "**Nada do que é dito em sessão é utilizado para divulgação, marketing ou qualquer finalidade comercial**, e não há venda ou compartilhamento de dados com anunciantes ou parceiros.",
    ],
  },
  {
    title: "Crianças e adolescentes",
    body: [
      "Parte do atendimento é dirigida a crianças e adolescentes. Nesses casos, o tratamento de dados observa o art. 14 da LGPD: é realizado no **melhor interesse** do menor e depende do consentimento específico de ao menos um dos pais ou do responsável legal.",
      "O adolescente é informado, em linguagem adequada à sua idade, sobre o que é registrado e sobre os limites do sigilo, inclusive sobre o que pode e o que não pode ser compartilhado com os responsáveis.",
      "Este site não é dirigido à coleta de dados de menores e, como descrito acima, não coleta dados de visitante algum.",
    ],
  },
  {
    title: "Seus direitos",
    body: [
      "A LGPD (art. 18) garante a você, a qualquer momento e sem custo:",
    ],
    items: [
      "confirmar se existe tratamento de dados seus e acessá-los;",
      "corrigir dados incompletos, inexatos ou desatualizados;",
      "solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei;",
      "solicitar a portabilidade a outro prestador;",
      "obter informação sobre com quem os dados foram compartilhados;",
      "revogar o consentimento, quando o tratamento se apoiar nele.",
    ],
  },
  {
    title: "Como exercer esses direitos",
    body: [
      `Basta escrever para **${SITE.email}**. O pedido é respondido em até 15 dias.`,
      "Um limite honesto: o direito de eliminação **não alcança** o prontuário psicológico enquanto durar o prazo legal de guarda, porque nesse caso a conservação é uma obrigação da profissional (LGPD, art. 16, I), e não uma escolha.",
      "Se entender que a resposta foi insuficiente, você pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).",
    ],
  },
  {
    title: "Segurança",
    body: [
      "O site é servido por conexão criptografada (HTTPS). Registros de atendimento são mantidos em ambiente de acesso restrito à profissional, protegido por senha, e as ferramentas usadas em atendimento on-line empregam comunicação criptografada.",
      "Nenhuma medida de segurança elimina completamente o risco. Caso ocorra um incidente capaz de gerar risco relevante a você, a comunicação será feita a você e à ANPD, conforme o art. 48 da LGPD.",
    ],
  },
  {
    title: "Alterações nesta política",
    body: [
      "Mudanças no funcionamento do site ou na legislação podem exigir revisão deste texto. A data de atualização no topo do documento sempre indica a versão vigente, e alterações relevantes são sinalizadas nesta página.",
    ],
  },
];
