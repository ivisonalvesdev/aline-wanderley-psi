import { useLayoutEffect } from "react";
import { Check } from "lucide-react";
import { PARENTS } from "@/constants/content";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { useReveal } from "@/hooks/useReveal";
import { rich } from "@/utils/rich";
import { gsap } from "@/utils/gsap";

export function Parents() {
  const ref = useReveal<HTMLElement>();

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    /**
     * Entrada da lista, item a item, vinda da direita.
     *
     * `stagger: 0.55` contra `duration: 1` deixa as entradas se
     * sobrepondo pela metade: uma peça ainda está chegando quando a
     * seguinte parte, o que dá continuidade ao conjunto em vez de seis
     * animações isoladas em fila.
     */
    const buildEntrance = (scrollTrigger: gsap.TimelineVars["scrollTrigger"]) => {
      const items = section.querySelectorAll<HTMLElement>("[data-parent-item]");
      if (items.length === 0) return;

      gsap.timeline({ scrollTrigger }).fromTo(
        items,
        { autoAlpha: 0, x: 96 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 1,
          ease: "power2.out",
          stagger: 0.55,
        },
      );
    };

    /**
     * A seção trava e a lista se escreve com a página parada, em qualquer
     * tela — mesma lógica de ancoragem do Sobre (ver a nota lá): cabendo
     * na tela, para centralizada; não cabendo, alinha o fim, que é onde a
     * lista fica no empilhamento de mobile.
     *
     * O percurso é dimensionado por item, e não em bloco: cada benefício
     * ganha uma fração de tela para entrar, o que separa "aparecendo
     * devagar" de "travado esperando". No celular a fração é menor —
     * rolar com o dedo custa mais do que girar a roda do mouse.
     */
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      buildEntrance({
        trigger: section,
        start: () =>
          section.offsetHeight > window.innerHeight * 0.96 ? "bottom bottom" : "center center",
        end: () => {
          const perItem = window.innerWidth < 640 ? 0.24 : 0.35;
          return `+=${window.innerHeight * perItem * PARENTS.benefits.length}`;
        },
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        // Ver a nota em About.tsx: pins são medidos primeiro para que o
        // resto da página já considere o espaço que criam.
        refreshPriority: 1,
      });
    });

    return () => mm.revert();
  }, [ref]);

  return (
    <section
      ref={ref}
      id="para-pais"
      aria-labelledby="pais-titulo"
      className="section-y surface-blush relative overflow-hidden"
    >
      <div className="container-page grid items-center gap-12 sm:gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div className="lg:max-w-xl xl:max-w-2xl">
          <p data-reveal="fast" className="eyebrow mb-4 text-blush-600">
            {PARENTS.eyebrow}
          </p>
          <h2
            id="pais-titulo"
            data-reveal
            className="heading-section font-display font-medium text-ink-900 text-balance"
          >
            {rich(PARENTS.title)}
          </h2>
          <p data-reveal className="lede mt-6 text-ink-700 [--rich-weight:500]">
            {rich(PARENTS.description)}
          </p>
          <div data-reveal className="mt-8">
            <WhatsAppCta ariaLabel="Conversar sobre orientação parental pelo WhatsApp">
              Quero conversar sobre meu filho
            </WhatsAppCta>
          </div>
        </div>

        {/* A lista não usa `data-reveal`: sua entrada é conduzida pela
            timeline acima, que precisa dos seis itens em uma sequência
            única para escaloná-los. */}
        <ul className="grid gap-3 sm:gap-3.5 lg:ml-auto lg:w-full lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
          {PARENTS.benefits.map((benefit) => (
            <li
              key={benefit}
              data-parent-item
              className="flex items-start gap-3.5 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur-sm transition-colors duration-300 hover:bg-white sm:gap-4 sm:p-5"
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blush-100 text-blush-600">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <p className="text-sm leading-relaxed text-ink-700 sm:text-base">{benefit}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
