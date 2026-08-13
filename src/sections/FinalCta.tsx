import { FINAL_CTA } from "@/constants/content";
import { SITE } from "@/constants/site";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { BubbleField } from "@/components/BubbleField";
import { useReveal } from "@/hooks/useReveal";
import { rich } from "@/utils/rich";

export function FinalCta() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="contato"
      aria-labelledby="cta-titulo"
      className="section-y-lg relative overflow-hidden"
    >
      {/* Fundo emocional — ver `surface-cta` no CSS */}
      <div aria-hidden="true" className="surface-cta absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        data-parallax="0.1"
        className="absolute -top-24 left-1/2 -z-10 size-[340px] -translate-x-1/2 rounded-full bg-blush-100/80 blur-3xl sm:size-[560px]"
      />

      {/*
        Bolhas do fechamento.

        Depois dos fundos e antes do conteúdo: todos estão em `-z-10`, então
        quem decide a ordem de pintura é a posição no DOM — as bolhas
        cobrem o degradê e passam por baixo do texto.

        O `overflow-hidden` da seção é o que as mantém presas aqui: o campo
        é `absolute inset-0`, e nenhuma bolha escapa para as seções acima.
      */}
      <BubbleField containerRef={ref} />

      <div className="container-page text-center">
        <p data-reveal="fast" className="eyebrow mb-5 text-blush-600">
          Vamos começar?
        </p>
        <h2
          id="cta-titulo"
          data-reveal
          className="mx-auto max-w-3xl font-display text-[1.75rem] leading-[1.12] font-medium tracking-[-0.022em] text-ink-900 text-balance sm:text-4xl lg:text-5xl"
        >
          {rich(FINAL_CTA.title)}
        </h2>
        <p data-reveal className="lede mx-auto mt-6 max-w-xl text-ink-700">
          {FINAL_CTA.description}
        </p>

        <div data-reveal className="mt-10">
          <WhatsAppCta size="lg" ariaLabel="Agendar pelo WhatsApp (CTA final)">
            {FINAL_CTA.buttonLabel}
          </WhatsAppCta>
        </div>

        <p data-reveal className="mt-6 font-alt text-xs tracking-[0.01em] text-ink-500">
          {SITE.name} · {SITE.crp} · Atendimento presencial em {SITE.neighborhood},{" "}
          {SITE.city} e online para todo o Brasil
        </p>
      </div>
    </section>
  );
}
