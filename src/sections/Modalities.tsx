import { Check, ArrowUpRight, MapPin } from "lucide-react";
import { MODALITIES, MODALITY_FACTS } from "@/constants/content";
import { whatsappUrl, FULL_ADDRESS, MAP_EMBED_URL, MAP_LINK_URL, SITE } from "@/constants/site";
import { SectionHeading } from "@/components/SectionHeading";
import { useReveal } from "@/hooks/useReveal";

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
        {/* Único destaque da página fora do rosa: aqui as palavras marcadas
            são os dois formatos de atendimento, e o azul da marca é o que
            os liga aos ícones dos cards logo abaixo — que já usam essa cor.
            Em rosa, o título apontaria para um lado e os cards para outro. */}
        <SectionHeading
          eyebrow="Modalidades"
          title="**Presencial** no Recife ou **online,** no seu ritmo"
          description="O mesmo cuidado, a mesma escuta — no formato que faz mais sentido para a sua rotina."
          className="[--rich-accent:var(--color-cloud-500)]"
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
        <dl
          data-reveal
          className="mx-auto mt-6 grid max-w-5xl gap-4 rounded-3xl border border-mist-200 bg-white/70 p-6 backdrop-blur-sm sm:mt-6 sm:grid-cols-3 sm:gap-6 sm:p-8"
        >
          {MODALITY_FACTS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cloud-100 text-cloud-500">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <div>
                <dt className="eyebrow text-[10px] text-ink-500">{label}</dt>
                <dd className="mt-1.5 text-sm font-medium text-ink-900">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

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
