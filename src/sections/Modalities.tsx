import { Check, ArrowUpRight, MapPin, Mail } from "lucide-react";
import { MODALITIES, MODALITY_FACTS } from "@/constants/content";
import {
  whatsappUrl,
  WHATSAPP_URL,
  FULL_ADDRESS,
  MAP_EMBED_URL,
  MAP_LINK_URL,
  SITE,
} from "@/constants/site";
import { SectionHeading } from "@/components/SectionHeading";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/utils/cn";

/**
 * Canais de contato do cartão de informações práticas.
 *
 * Cada item repete a estrutura dos fatos logo acima — chip de ícone,
 * rótulo miúdo, valor — e não por economia de código: as duas fileiras
 * dividem o mesmo cartão, e formatos diferentes lado a lado leriam como
 * dois blocos colados por engano. Com a mesma grade de três colunas, o
 * conjunto vira uma tabela só, de operação em cima e contato embaixo.
 *
 * O valor é o dado real (número, arroba, endereço) em vez de um rótulo
 * como "Chamar agora": quem está decidindo quer ver com o que está
 * lidando antes de clicar.
 *
 * As cores são as das próprias marcas, escritas como valor literal em vez
 * de token da paleta: elas não pertencem à identidade da Aline e não devem
 * acompanhar uma eventual mudança de paleta — se o rosa da marca mudar, o
 * verde do WhatsApp continua sendo o verde do WhatsApp.
 */
const CONTACT_CHANNELS = [
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: SITE.whatsappDisplay,
    href: WHATSAPP_URL,
    tint: "bg-[#25D366]",
    external: true,
  },
  {
    icon: InstagramIcon,
    label: "Instagram",
    value: SITE.instagramHandle,
    href: SITE.instagramUrl,
    /*
      O gradiente do Instagram é radial, e não linear — a marca não tem cor
      chapada nem rampa reta. A origem fica embaixo e à esquerda, fora do
      quadrado (30% 107%), que é o que põe o amarelo no canto inferior e
      leva o azul para a diagonal oposta. A versão linear de 45° que estava
      aqui atravessava do laranja ao roxo em linha reta: as cores eram da
      marca, mas o desenho lia como vermelho, sem o amarelo nem o azul que
      tornam o ícone reconhecível de relance.
    */
    tint: "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285aeb_90%)]",
    external: true,
  },
  {
    icon: Mail,
    label: "E-mail",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    /*
      Ficou o vermelho da marca do Gmail (#EA4335) por um tempo, seguindo a
      mesma lógica do WhatsApp e do Instagram acima — mas ao lado dos dois
      ele lia como saturado demais, destoando do restante pastel do
      cartão. Aqui o e-mail é só um canal genérico (o glifo já é o
      envelope do Lucide, não o "M" do Gmail), então volta a vestir a cor
      da própria identidade: `blush-600`, e não o `blush-500` do resto do
      site, porque é o tom que mantém contraste AA com o ícone branco por
      cima (ver nota em `index.css`).
    */
    tint: "bg-blush-600",
    external: false,
  },
] as const;

export function Modalities() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="modalidades"
      aria-labelledby="modalidades-titulo"
      className="section-y surface-soft"
    >
      <div className="container-page">
        {/* O rosa aqui é o `blush-500`, não o `blush-600` padrão dos
            destaques: sobre branco ele fica em ~3,2:1, suficiente para
            texto grande como este título e mais próximo do pastel da
            identidade. Em corpo de texto o mesmo tom reprovaria. */}
        <SectionHeading
          eyebrow="Modalidades"
          title="**Presencial** no Recife ou **online,** no seu ritmo"
          description="O mesmo cuidado, a mesma escuta, no formato que faz mais sentido para a sua rotina."
          className="[--rich-accent:var(--color-blush-500)]"
        />

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2">
          {MODALITIES.map(({ icon: Icon, title, subtitle, features }) => (
            <article
              key={title}
              data-reveal-scale
              className="group card-soft relative overflow-hidden p-6 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_64px_-24px_rgb(92_134_173_/_0.3)] sm:p-8"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cloud-100 text-cloud-500 transition-all duration-500 group-hover:scale-110 group-hover:bg-cloud-500 group-hover:text-white sm:size-12">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
                    {title}
                  </h3>
                  <p className="text-sm text-ink-500">{subtitle}</p>
                </div>
              </div>

              <ul className="border-soft-t mt-6 space-y-3 pt-6">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-[1.6] text-ink-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-blush-500" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/*
          Mapa do consultório.

          Quem escolhe o presencial decide, na prática, por dois critérios:
          se dá para chegar e quanto tempo leva. Um endereço em texto exige
          que a pessoa saia da página para descobrir isso — o mapa responde
          ali mesmo.

          O iframe é o embed público do Google Maps: `loading="lazy"` evita
          que ele custe qualquer coisa até chegar perto da tela, e a leve
          dessaturação impede que o verde/amarelo do mapa brigue com a
          paleta da marca.
        */}
        <div data-reveal className="card-soft mx-auto mt-6 max-w-5xl overflow-hidden">
          <iframe
            src={MAP_EMBED_URL}
            title={`Mapa do consultório em ${SITE.neighborhood}, ${SITE.city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="block h-56 w-full border-0 saturate-[0.88] sm:h-72 lg:h-80"
          />

          <div className="border-soft-t flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="flex items-start gap-3 text-sm text-ink-700">
              <MapPin className="mt-0.5 size-4 shrink-0 text-blush-500" aria-hidden="true" />
              <span>
                <span className="eyebrow block text-[10px] text-ink-500">Consultório</span>
                <span className="mt-1 block">{FULL_ADDRESS}</span>
              </span>
            </p>
            <a
              href={MAP_LINK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-mist-200 px-4 py-2 font-alt text-[0.8125rem] font-semibold text-blush-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-blush-300 hover:bg-blush-50 sm:self-auto"
            >
              Traçar rota
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/*
          O operacional que trava a decisão de quem nunca fez terapia:
          quanto dura, de quanto em quanto tempo e se dá para pedir
          reembolso. Deixar isso à vista evita que a dúvida vire
          desistência silenciosa.
        */}
        <div
          data-reveal
          className="mx-auto mt-6 max-w-5xl rounded-3xl border border-mist-200 bg-white/70 p-6 backdrop-blur-sm sm:mt-6 sm:p-8"
        >
          {/*
            Contatos diretos, no mesmo cartão do operacional — e acima dele.

            A ordem é intencional: a seção inteira vem tratando de "como
            funciona", e o cartão fecha esse assunto. Pôr o canal de contato
            primeiro faz a leitura terminar no operacional, que é
            informação de apoio; com o contato no topo, a última coisa lida
            antes de rolar é o convite para falar.

            Cada marca fica na sua própria cor, e não no rosa da paleta:
            ícone de rede social é reconhecido pela cor antes de ser lido,
            e recolorir o Instagram de rosa custaria justamente a
            identificação instantânea que ele carrega.
          */}
          {/* `blush-400` é o rosa pastel da rampa: sobre o branco do cartão
              ele fica claro sem sumir, porque o `eyebrow` é caixa alta com
              tracking largo — desenho que aguenta pouco contraste melhor
              que texto corrido. */}
          <p className="eyebrow text-blush-400">Entre em contato</p>

          <ul className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {CONTACT_CHANNELS.map(({ icon: Icon, label, value, href, tint, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group -m-2 flex items-start gap-3.5 rounded-2xl p-2 transition-colors duration-300 hover:bg-blush-50/70"
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:scale-105",
                      tint,
                    )}
                  >
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="eyebrow block text-[10px] text-ink-500">{label}</span>
                    {/* `break-words` porque o e-mail é a linha mais longa
                        das seis e, num terço da largura, seria o único
                        item a estourar a coluna. */}
                    <span className="mt-1.5 block text-sm font-medium break-words text-ink-900 transition-colors duration-300 group-hover:text-blush-600">
                      {value}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/*
            O operacional que trava a decisão de quem nunca fez terapia:
            quanto dura, de quanto em quanto tempo e se dá para pedir
            reembolso. Deixar isso à vista evita que a dúvida vire
            desistência silenciosa.
          */}
          <dl className="border-soft-t mt-6 grid gap-4 pt-6 sm:grid-cols-3 sm:gap-6">
            {MODALITY_FACTS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blush-100 text-blush-500">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <div>
                  <dt className="eyebrow text-[10px] text-ink-500">{label}</dt>
                  <dd className="mt-1.5 text-sm font-medium text-ink-900">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <p data-reveal className="mx-auto mt-5 max-w-5xl text-center text-sm text-ink-500">
          Ainda com dúvida sobre qual formato combina com a sua rotina?{" "}
          <a
            href={whatsappUrl(
              "Olá, Aline! Gostaria de entender qual modalidade de atendimento faz mais sentido para mim.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blush-600 underline decoration-blush-300 underline-offset-4 transition-colors hover:text-blush-700"
          >
            Pergunte pelo WhatsApp
          </a>
          .
        </p>
      </div>
    </section>
  );
}
