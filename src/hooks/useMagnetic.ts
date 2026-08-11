import { useLayoutEffect, useRef, type RefObject } from "react";
import { gsap, POINTER_FINE } from "@/utils/gsap";

interface MagneticOptions {
  /** Fração da distância do cursor que o elemento percorre (0–1). */
  strength?: number;
  /** Folga, em px, além da própria caixa em que o elemento já reage. */
  reach?: number;
  /** Giro máximo, em graus, acompanhando o lado para onde é puxado. */
  tilt?: number;
}

/**
 * Atração magnética pelo cursor.
 *
 * O elemento se desloca uma fração da distância até o ponteiro, com a
 * intensidade caindo conforme o cursor se afasta — perto, ele "cola";
 * longe, volta sozinho ao lugar. O `quickTo` do GSAP faz a perseguição
 * amortecida, então o movimento nunca acompanha o mouse em linha reta
 * (o que pareceria um arrastar, e não uma atração).
 *
 * O listener é global, e não um `mouseenter` no próprio elemento: a peça
 * precisa começar a reagir *antes* de o cursor chegar nela, e além disso
 * as peças aqui são decorativas (`pointer-events: none`) e nunca
 * receberiam eventos próprios.
 *
 * Só roda com mouse e sem `prefers-reduced-motion`.
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 0.3,
  reach = 140,
  tilt = 5,
}: MagneticOptions = {}): RefObject<T | null> {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(POINTER_FINE, () => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.85, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.85, ease: "power3.out" });
      const rotateTo = gsap.quickTo(el, "rotation", { duration: 1.2, ease: "power3.out" });

      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;

      /* A medição fica no rAF, não no evento: `getBoundingClientRect`
         força o navegador a recalcular o layout, e o ponteiro dispara
         dezenas de eventos por segundo. Assim medimos uma vez por quadro,
         no momento em que o navegador já ia desenhar de qualquer forma. */
      const settle = () => {
        frame = 0;
        const box = el.getBoundingClientRect();
        const dx = pointerX - (box.left + box.width / 2);
        const dy = pointerY - (box.top + box.height / 2);
        const distance = Math.hypot(dx, dy);
        const limit = Math.max(box.width, box.height) / 2 + reach;

        if (distance > limit) {
          xTo(0);
          yTo(0);
          rotateTo(0);
          return;
        }

        // Queda suave da intensidade em vez de linear: o elemento reage
        // de leve na borda do alcance e com força só bem perto.
        const pull = (1 - distance / limit) ** 1.6;
        xTo(dx * strength * pull);
        yTo(dy * strength * pull);
        rotateTo((dx / limit) * tilt * pull);
      };

      const onPointerMove = (event: PointerEvent) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!frame) frame = requestAnimationFrame(settle);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });

      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        if (frame) cancelAnimationFrame(frame);
        gsap.set(el, { x: 0, y: 0, rotation: 0 });
      };
    });

    return () => mm.revert();
  }, [strength, reach, tilt]);

  return ref;
}
