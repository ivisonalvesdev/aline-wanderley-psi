import { ArrowUpRight } from "lucide-react";
import { SPECIALTIES } from "@/constants/content";
import { whatsappUrl } from "@/constants/site";
import { SectionHeading } from "@/components/SectionHeading";
import { useReveal } from "@/hooks/useReveal";

export function Specialties() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="especialidades"
      aria-labelledby="especialidades-titulo"
      className="section-y surface-cream relative"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="Especialidades"
          title="Um cuidado para **cada fase da vida**"
          description="Da infância à vida adulta, cada demanda recebe um olhar atento, técnico e profundamente humano."
        />

        {/*
          Cada card é um link para o WhatsApp com o assunto já escrito.
          A pessoa chega na conversa com o contexto pronto, em vez de
          precisar formular o pedido do zero — que é onde a maioria
          desiste.
        */}
        <ul className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {SPECIALTIES.map(({ icon: Icon, title, description, topic }) => (
            <li key={title} data-reveal-scale>
              <a
                href={whatsappUrl(
                  `Olá, Aline! Encontrei o seu site e gostaria de saber mais sobre atendimento para ${topic}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Falar no WhatsApp sobre ${title}`}
                className="group card-soft relative flex h-full flex-col overflow-hidden p-6 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_64px_-24px_rgb(196_64_95_/_0.22)] sm:p-7"
              >
                {/* Brilho suave no hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blush-100/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:from-blush-100/80 group-hover:opacity-100"
                />

                <span className="relative flex size-12 items-center justify-center rounded-2xl bg-blush-100 text-blush-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-blush-600 group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>

                <h3 className="relative mt-5 font-display text-lg font-semibold tracking-[-0.012em] text-ink-900">
                  {title}
                </h3>
                <p className="relative mt-2 text-sm leading-[1.7] text-ink-500">{description}</p>

                {/* Sempre visível: no toque não existe hover, e esconder a
                    ação deixaria o card parecendo texto morto. O `mt-auto`
                    alinha a linha no rodapé de todos os cards, independente
                    do tamanho da descrição. */}
                <span className="relative mt-auto inline-flex items-center gap-1.5 pt-5 font-alt text-[0.8125rem] font-semibold tracking-[0.01em] text-blush-600">
                  Conversar sobre isso
                  <ArrowUpRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
