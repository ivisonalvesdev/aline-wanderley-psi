import { useLayoutEffect, useRef } from "react";
import { GraduationCap } from "lucide-react";
import { EDUCATION } from "@/constants/content";
import { SectionHeading } from "@/components/SectionHeading";
import { useReveal } from "@/hooks/useReveal";
import { gsap, MOTION_OK } from "@/utils/gsap";

export function Education() {
  const ref = useReveal<HTMLElement>();
  const timelineRef = useRef<HTMLOListElement>(null);

  useLayoutEffect(() => {
    const list = timelineRef.current;
    if (!list) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const progress = list.querySelector<HTMLElement>("[data-timeline-progress]");
      const items = list.querySelectorAll<HTMLElement>("[data-timeline-item]");
      if (!progress) return;

      /**
       * Cada marca guarda em que ponto do trajeto ela está (0 a 1), medido
       * do próprio DOM. É isso que sincroniza o acendimento com a ponta da
       * linha rosa: a bolinha não acende porque entrou na tela, e sim
       * porque a linha chegou nela.
       */
      const dots = Array.from(items).map((item) => ({
        shell: item.querySelector<HTMLElement>("[data-dot-shell]"),
        core: item.querySelector<HTMLElement>("[data-dot-core]"),
        rings: item.querySelectorAll<HTMLElement>("[data-dot-ring]"),
        at: 0,
        lit: false,
      }));

      const measure = () => {
        const listBox = list.getBoundingClientRect();
        if (listBox.height === 0) return;
        for (const dot of dots) {
          if (!dot.shell) continue;
          const box = dot.shell.getBoundingClientRect();
          dot.at = (box.top + box.height / 2 - listBox.top) / listBox.height;
        }
      };

      const light = (dot: (typeof dots)[number]) => {
        dot.lit = true;
        if (dot.shell) dot.shell.dataset.active = "true";
        if (dot.core) dot.core.dataset.active = "true";

        // Dois anéis defasados, como o halo do botão do WhatsApp — mas uma
        // vez só, no instante em que a linha alcança o ponto. Lá o pulso é
        // um convite permanente; aqui, repetir transformaria a trajetória
        // inteira num painel piscante.
        gsap
          .timeline()
          .fromTo(dot.core, { scale: 0.72 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" })
          .fromTo(
            dot.rings,
            { scale: 1, opacity: 0.5 },
            { scale: 1.95, opacity: 0, duration: 1.4, ease: "power2.out", stagger: 0.3 },
            0,
          );
      };

      const dim = (dot: (typeof dots)[number]) => {
        dot.lit = false;
        if (dot.shell) delete dot.shell.dataset.active;
        if (dot.core) delete dot.core.dataset.active;
        gsap.killTweensOf(dot.rings);
        gsap.set(dot.rings, { opacity: 0 });
      };

      /**
       * A linha é desenhada pelo scroll, ao longo do percurso mais longo
       * que a seção permite: da entrada da lista na tela (`top 92%`) até
       * quase a saída dela (`bottom 15%`). Numa viewport de 900px isso dá
       * cerca de 1.400px de rolagem para quatro marcas — devagar o
       * bastante para a linha ser vista se formando, que é o ponto.
       */
      gsap.fromTo(
        progress,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list,
            start: "top 92%",
            end: "bottom 15%",
            scrub: 1.2,
            invalidateOnRefresh: true,
            onRefresh: measure,
            onUpdate: (self) => {
              for (const dot of dots) {
                // A folga de 0.015 evita que a marca fique piscando quando
                // o scroll para exatamente em cima do ponto de virada.
                if (!dot.lit && self.progress >= dot.at) light(dot);
                else if (dot.lit && self.progress < dot.at - 0.015) dim(dot);
              }
            },
          },
        },
      );

      measure();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={ref}
      id="formacao"
      aria-labelledby="formacao-titulo"
      className="section-y surface-soft"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="Formação"
          title="Uma trajetória dedicada ao **cuidado**"
          description="Estudo contínuo para oferecer uma prática clínica atual, ética e baseada em evidências."
        />

        {/* Timeline vertical */}
        <ol ref={timelineRef} className="relative mx-auto mt-12 max-w-3xl sm:mt-16">
          {/* Trilho: o cinza marca o caminho inteiro desde o começo, o rosa
              o percorre. A máscara dissolve as duas pontas — uma linha que
              começa e termina em corte seco pesa mais do que precisa. */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-3 w-px -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(180deg,transparent_0%,#000_7%,#000_86%,transparent_100%)]"
          >
            <span className="absolute inset-0 bg-mist-200" />
            <span
              data-timeline-progress
              className="absolute inset-0 origin-top scale-y-0 bg-gradient-to-b from-blush-300 via-blush-400 to-blush-500"
            />
          </span>

          {EDUCATION.map((item) => (
            <li
              key={item.title}
              data-timeline-item
              className="relative pb-10 pl-10 last:pb-0 sm:pb-12 sm:pl-12"
            >
              {/*
                A marca fica fora do bloco que faz o reveal: ela pertence à
                linha, e deslizar junto com o texto a descolaria do trilho.
                Ela acende primeiro, o texto entra depois.
              */}
              <span
                data-dot-shell
                aria-hidden="true"
                className="absolute top-1 left-0 flex size-6 items-center justify-center rounded-full border border-mist-300 bg-white shadow-sm transition-colors duration-1000 ease-out data-[active=true]:border-blush-300"
              >
                <span
                  data-dot-ring
                  className="pointer-events-none absolute inset-0 rounded-full bg-blush-400 opacity-0"
                />
                <span
                  data-dot-ring
                  className="pointer-events-none absolute inset-0 rounded-full bg-blush-400 opacity-0"
                />
                <span
                  data-dot-core
                  className="relative size-2 rounded-full bg-mist-300 transition-colors duration-1000 ease-out data-[active=true]:bg-blush-500"
                />
              </span>

              <div data-reveal="slow">
                <p className="eyebrow inline-flex items-center gap-2 text-blush-600">
                  <GraduationCap className="size-3.5" aria-hidden="true" />
                  {item.period}
                </p>
                <h3 className="mt-2.5 font-display text-lg font-semibold tracking-[-0.012em] text-ink-900 sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-[1.75] text-ink-500 sm:text-base">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
