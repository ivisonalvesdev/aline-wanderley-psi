/** Dados centrais do site — atualizar aqui reflete em toda a página. */
export const SITE = {
  name: "Aline Wanderley",
  role: "Psicóloga Clínica",
  crp: "CRP 02/25892",
  approach: "Terapia Cognitivo-Comportamental",
  approachShort: "TCC",
  city: "Recife",
  region: "PE",
  neighborhood: "Boa Viagem",
  /** Endereço do consultório. Sem número/sala por decisão da Aline, por segurança. */
  street: "Avenida Engenheiro Domingos Ferreira",
  postalCode: "51020-040",
  /* TODO: substituir pelo domínio definitivo */
  url: "https://alinewanderley.com.br",
  /** DDI + DDD + número, só dígitos: +55 (81) 9 9698-2391 */
  whatsappNumber: "5581996982391",
  /** O mesmo número, como se lê. Vizinho do original de propósito: são
      duas formas do mesmo dado e precisam ser corrigidas juntas. */
  whatsappDisplay: "(81) 99698-2391",
  whatsappMessage:
    "Olá, Aline! Encontrei o seu site e gostaria de saber mais sobre o atendimento.",
  instagramHandle: "@psialinewandeerley",
  instagramUrl: "https://www.instagram.com/psialinewandeerley",
  email: "alinee.swanderley@gmail.com",
  linktreeUrl: "https://linktr.ee/alineswanderley",
  /* Link de agendamento direto enviado pela social media */
  schedulingUrl: "https://tr.ee/zfo8A1pF73",
} as const;

/**
 * Monta o link do WhatsApp já com a mensagem escrita.
 *
 * Passar o assunto por card/seção reduz o atrito: a pessoa chega na
 * conversa com o contexto pronto, em vez de ter que formular o pedido.
 */
export function whatsappUrl(message: string = SITE.whatsappMessage): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = whatsappUrl();

/** Endereço em uma linha — usado no rodapé, no mapa e nos links externos. */
export const FULL_ADDRESS = `${SITE.street}, ${SITE.neighborhood}, ${SITE.city} – ${SITE.region}, ${SITE.postalCode}`;

/**
 * Mapa do consultório.
 *
 * O `output=embed` é a incorporação pública do Google Maps: não exige
 * chave de API nem cota, ao contrário da Maps Embed API. Em troca, não
 * aceita marcador estilizado — só a busca pelo endereço.
 */
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  `${FULL_ADDRESS}, Brasil`,
)}&z=16&hl=pt-BR&output=embed`;

/** Mesmo endereço, para abrir o app/site do Google Maps em nova aba. */
export const MAP_LINK_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${FULL_ADDRESS}, Brasil`,
)}`;

export const NAV_LINKS = [
  { label: "Especialidades", href: "#especialidades" },
  { label: "Sobre", href: "#sobre" },
  { label: "Como funciona", href: "#tcc" },
  { label: "Para pais", href: "#para-pais" },
  { label: "Dúvidas", href: "#faq" },
] as const;
