import { useLayoutEffect, useRef, type RefObject } from "react";
import { gsap, EASE, MOTION_OK, SCRUB } from "@/utils/gsap";

/**
 * Hook central de animações on-scroll de uma seção.
 *
 * Dentro do elemento referenciado, anima automaticamente:
 * - `[data-reveal]`        → fade + slide up amarrado ao scroll
 * - `[data-reveal-scale]`  → fade + scale suave, também amarrado ao scroll
 * - `[data-parallax]`      → parallax leve (valor = intensidade, ex. "0.12";
 *                            negativo inverte o sentido do movimento)
 *
 * Os reveals usam `scrub` em vez de disparar de uma vez: o elemento
 * atravessa o fade no ritmo da roda do mouse, e não em um tempo fixo que
 * ignora o que a pessoa está fazendo. É a diferença entre a página
 * "responder" ao scroll e apenas "tocar uma animação".
 *
 * A velocidade sai do valor do atributo — `data-reveal="slow"` alonga a
 * janela, `data-reveal="fast"` encurta:
 *
 *   <li data-reveal="slow">  → completa em 38% da altura da tela
 *
 * Passando `{ scrub: false }`, a seção volta ao reveal clássico: o bloco
 * inteiro entra de uma vez, com stagger em tempo fixo, ao cruzar a linha.
 * É o certo para conteúdo que a pessoa vai *operar* em vez de percorrer —
 * o FAQ, por exemplo, onde abrir uma pergunta muda a altura das que estão
 * abaixo e o progresso amarrado ao scroll ficaria brigando com o clique.
 *
 * Com `prefers-reduced-motion`, nada é animado e o conteúdo
 * permanece visível — acessibilidade em primeiro lugar.
 */

/** Janela de scroll de cada ritmo, em % da altura da viewport. */
const PACE = {
  fast: { start: 90, span: 18 },
  "": { start: 92, span: 26 },
  slow: { start: 96, span: 38 },
} as const;

type Pace = keyof typeof PACE;

function paceOf(value: string | undefined): (typeof PACE)[Pace] {
  return PACE[(value ?? "") as Pace] ?? PACE[""];
}

interface RevealOptions {
  /** `false` volta ao reveal clássico: tudo de uma vez, em tempo fixo. */
  scrub?: boolean;
}

export function useReveal<T extends HTMLElement>({
  scrub = true,
}: RevealOptions = {}): RefObject<T | null> {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const reveals = root.querySelectorAll<HTMLElement>("[data-reveal]");
      const scales = root.querySelectorAll<HTMLElement>("[data-reveal-scale]");
      const parallaxEls = root.querySelectorAll<HTMLElement>("[data-parallax]");

      // O parallax é independente do modo de reveal: ele acompanha a
      // passagem da seção pela tela, não a entrada de cada elemento.
      parallaxEls.forEach((el) => {
        const intensity = parseFloat(el.dataset.parallax ?? "0.1");
        gsap.fromTo(
          el,
          { y: () => intensity * 120 },
          {
            y: () => intensity * -120,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              // Lag maior = o elemento "persegue" o scroll com inércia,
              // em vez de grudar nele. Deixa o percurso longo sem parecer
              // acelerado.
              scrub: 1,
            },
          },
        );
      });

      if (!scrub) {
        const batch = (
          targets: NodeListOf<HTMLElement>,
          from: gsap.TweenVars,
          to: gsap.TweenVars,
        ) => {
          if (targets.length === 0) return;
          gsap.fromTo(targets, from, {
            ...to,
            ease: EASE,
            scrollTrigger: { trigger: root, start: "top 78%", once: true },
          });
        };

        batch(
          reveals,
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.09 },
        );
        batch(
          scales,
          { autoAlpha: 0, scale: 0.94, y: 24 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, stagger: 0.1 },
        );
        return;
      }

      /**
       * Cada elemento ganha o próprio gatilho — é o que faz um bloco
       * empilhado revelar em cascata sem stagger programado: quem está
       * mais abaixo simplesmente cruza a linha depois.
       *
       * O desvio por índice existe só para as grades: cards lado a lado
       * compartilham a mesma altura e entrariam em bloco, o que parece
       * mecânico. Atrasar cada coluna em 1,8% da tela cria a diagonal.
       */
      const revealWindow = (el: HTMLElement, index: number) => {
        const { start, span } = paceOf(el.dataset.reveal || el.dataset.revealScale);
        const offset = (index % 3) * 1.8;
        return {
          start: `top ${start - offset}%`,
          end: `top ${start - span - offset}%`,
          scrub: SCRUB,
        };
      };

      reveals.forEach((el, index) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 38 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: el, ...revealWindow(el, index) },
          },
        );
      });

      scales.forEach((el, index) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, scale: 0.94, y: 26 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: el, ...revealWindow(el, index) },
          },
        );
      });

    });

    return () => mm.revert();
  }, [scrub]);

  return ref;
}
