import { useLayoutEffect, useRef } from "react";
import { DIFFERENTIALS } from "@/constants/content";
import { SectionHeading } from "@/components/SectionHeading";
import { useReveal } from "@/hooks/useReveal";
import { gsap, POINTER_FINE } from "@/utils/gsap";

export function Differentials() {
  const ref = useReveal<HTMLElement>();
  const glowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = ref.current;
    const glow = glowRef.current;
    if (!section || !glow) return;

    const mm = gsap.matchMedia();

    /**
     * Brilho que acompanha o cursor.
     *
     * Esta é a única seção da página sem foto, card colorido ou ícone
     * grande — só texto em colunas. O halo dá a ela algo vivo para
     * responder ao leitor, sem acrescentar nenhum elemento que dispute
     * atenção com o conteúdo: ele é rosa da marca em opacidade baixíssima,
     * mais percebido como uma variação de luz do que como uma forma.
     *
     * A perseguição é lenta de propósito (1,1s). Um halo que gruda no
     * ponteiro vira cursor customizado; atrasado, lê como iluminação.
     */
    mm.add(POINTER_FINE, () => {
      const xTo = gsap.quickTo(glow, "x", { duration: 1.1, ease: "power3.out" });
      const yTo = gsap.quickTo(glow, "y", { duration: 1.1, ease: "power3.out" });

      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;

      const track = () => {
        frame = 0;
        const box = section.getBoundingClientRect();
        xTo(pointerX - box.left);
        yTo(pointerY - box.top);
      };

      const onPointerMove = (event: PointerEvent) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!frame) frame = requestAnimationFrame(track);
      };

      const onPointerEnter = (event: PointerEvent) => {
        // Posiciona sem transição antes de acender, senão o halo entra
        // deslizando desde o canto superior esquerdo da seção.
        const box = section.getBoundingClientRect();
        gsap.set(glow, { x: event.clientX - box.left, y: event.clientY - box.top });
        gsap.to(glow, { autoAlpha: 1, duration: 0.9, ease: "power2.out" });
      };

      const onPointerLeave = () => {
        gsap.to(glow, { autoAlpha: 0, duration: 1, ease: "power2.out" });
      };

      section.addEventListener("pointermove", onPointerMove, { passive: true });
      section.addEventListener("pointerenter", onPointerEnter);
      section.addEventListener("pointerleave", onPointerLeave);

      return () => {
        section.removeEventListener("pointermove", onPointerMove);
        section.removeEventListener("pointerenter", onPointerEnter);
        section.removeEventListener("pointerleave", onPointerLeave);
        if (frame) cancelAnimationFrame(frame);
        gsap.set(glow, { autoAlpha: 0, x: 0, y: 0 });
      };
    });

    return () => mm.revert();
  }, [ref]);

  return (
    <section
      ref={ref}
      id="diferenciais"
      aria-labelledby="diferenciais-titulo"
      className="section-y surface-cream relative overflow-hidden"
    >
      {/* As margens negativas valem metade do tamanho: é o que centraliza o
          halo no cursor sem usar `translate`, que o GSAP sobrescreveria ao
          animar `x`/`y` neste mesmo elemento. */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 -mt-[16rem] -ml-[16rem] size-[32rem] rounded-full bg-[radial-gradient(circle,rgb(248_168_197_/_0.4)_0%,rgb(248_168_197_/_0.22)_32%,rgb(248_168_197_/_0.08)_58%,rgb(248_168_197_/_0)_76%)] opacity-0 blur-3xl"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="Por que a Aline"
          title="Um cuidado que une **técnica e afeto**"
          description="Mais do que uma abordagem, um jeito de olhar para cada pessoa, com respeito, ciência e presença."
        />

        <ul className="mt-12 grid gap-x-8 gap-y-9 sm:mt-14 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-10 lg:grid-cols-3 xl:gap-x-14">
          {DIFFERENTIALS.map((item, index) => (
            <li key={item.title} data-reveal className="group relative pl-6">
              {/* No hover a linha escurece em vez de ficar rosa: o halo
                  que segue o cursor já cobre a seção de rosa, e uma
                  segunda marca na mesma cor se perderia dentro dele. O
                  contraste é o que sinaliza o item sob o mouse. */}
              <span
                aria-hidden="true"
                className="absolute top-1 left-0 h-full w-px bg-gradient-to-b from-mist-300 via-mist-300 to-transparent transition-colors duration-500 group-hover:from-ink-900 group-hover:via-ink-700"
              />
              <span
                aria-hidden="true"
                className="tabular font-alt text-[0.6875rem] font-semibold tracking-[0.22em] text-blush-500"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2.5 font-display text-lg font-semibold tracking-[-0.012em] text-ink-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-[1.75] text-ink-500">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
